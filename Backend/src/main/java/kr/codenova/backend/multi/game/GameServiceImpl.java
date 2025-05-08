package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.multi.dto.RoundScoreBroadcast;
import kr.codenova.backend.multi.dto.broadcast.*;
import kr.codenova.backend.multi.dto.request.ProgressUpdateRequest;
import kr.codenova.backend.multi.dto.request.ReadyGameRequest;
import kr.codenova.backend.multi.dto.request.StartGameRequest;
import kr.codenova.backend.multi.dto.response.RoomStatusResponse;
import kr.codenova.backend.multi.exception.InvalidGameStartException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.multi.exception.UserNotFoundException;
import kr.codenova.backend.multi.room.Room;
import kr.codenova.backend.multi.room.RoomService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static kr.codenova.backend.multi.dto.RoundScoreBroadcast.*;
import static kr.codenova.backend.multi.dto.broadcast.GameResultBroadcast.*;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final RoomService roomService;
    private final CodeRepository codeRepository;

    private final Logger log = LoggerFactory.getLogger(getClass());

    private SocketIOServer getServer() {
        return SocketIOServerProvider.getServer();
    }

    // ✅ 방의 참가자 수 저장 (필요함)
    private final Map<String, Integer> roomUserCounts = new ConcurrentHashMap<>();


    // 1. 사용자 준비 토글
    public void toggleReady(ReadyGameRequest request) {
        Room room = roomService.getRoom(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        // ✅ 준비 상태 토글
        Room.UserStatus userStatus = room.getUserStatusMap().get(request.getNickname());
        if (userStatus == null) {
            throw new UserNotFoundException("해당 유저는 방에 존재하지 않습니다.");
        }



        userStatus.setReady(!userStatus.isReady());

        ReadyGameBroadcast broadcast = buildReadyBroadcast(request.getRoomId());
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("ready_status_update", broadcast);

        // ✅ 모두 준비 완료됐는지 체크
        boolean allReady = room.getUserStatusMap().values().stream().allMatch(Room.UserStatus::isReady);

        if (allReady) {
            // ✅ 모두 준비 완료 -> ready_all 브로드캐스트
            getServer().getRoomOperations(request.getRoomId())
                    .sendEvent("ready_all", new ReadyAllBroadcast("모든 참가자가 준비를 완료했습니다!"));
        }
    }

    // 2. 게임 시작 시 totalScoreMap 초기화 수정 - startGame 메서드
    public void startGame(StartGameRequest request) throws InterruptedException {
        Room room = roomService.getRoom(request.getRoomId());
        validateStartGame(request.getRoomId(), request.getNickname());

        // ✅ 시작 직전에 참가자 수 저장
        setRoomUserCount(request.getRoomId(), room.getCurrentCount());

        GameCountdownBroadcast countdown = new GameCountdownBroadcast(
                request.getRoomId(),
                "모두 준비되었습니다. 곧 시작합니다.",
                3
        );
        room.setIsStarted(true);
        room.setRoundNumber(1);
        resetRoundData(room);

        // 게임 시작 시 totalScoreMap 확실하게 초기화
        room.setTotalScoreMap(new ConcurrentHashMap<>());

        // 모든 플레이어의 초기 점수를 0으로 설정
        for (String nickname : room.getUserStatusMap().keySet()) {
            room.getTotalScoreMap().put(nickname, 0);
        }

        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("game_started", countdown);

        delayedTypingStart(request.getRoomId());
    }

    // 게임 시작 전 검증 (방장 여부 + 모든 준비 완료)
    public void validateStartGame(String roomId, String nickname) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        if (!room.getUserStatusMap().get(nickname).isHost()) {
            throw new InvalidGameStartException("방장만 게임을 시작할 수 있습니다.");
        }

        if (room.getCurrentCount() < 2) {
            throw new InvalidGameStartException("2명 이상이어야 게임을 시작할 수 있습니다.");
        }

        for (Room.UserStatus status : room.getUserStatusMap().values()) {
            if (!status.isReady()) {
                throw new InvalidGameStartException("모든 참가자가 준비 완료되어야 게임을 시작할 수 있습니다.");
            }
        }
    }
    // 5. 3초 뒤에 타이핑 시작 알림
    @Async
    public void delayedTypingStart(String roomId) throws InterruptedException {

        Thread.sleep(3000);

        Room room = roomService.getRoom(roomId);
        if (room == null) {
            return; // ✅ 3초 대기하는 동안 방이 없어졌으면 아무것도 안 함
        }
        log.info("roomId : " + roomId);

        TypingStartBroadcast typingStart = new TypingStartBroadcast(
                roomId,
                LocalDateTime.now(),
                getGameContent(room.getLanguage()) // 게임 본문 가져오기
        );
        log.info("typingStart : " + typingStart);

        getServer().getRoomOperations(roomId)
                .sendEvent("typing_start", typingStart);

    }


    // 6. 게임 진행률 업데이트
    public void updateProgress(ProgressUpdateRequest request) {
        Room room = roomService.getRoom(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        String nickname = request.getNickname();
        int progress = request.getProgressPercent();
        Integer time = request.getTime(); // 밀리초 기준

        // ✅ 유효한 시간인지 검사 (null 또는 0 이하 방지)
        if (progress >= 100 && time != null && time > 0) {
            double seconds = time / 1000.0;

            // ✅ 1등 유저라면 기록 + 종료 타이머 시작
            if (!room.hasFirstFinisher()) {
                room.setFirstFinisher(nickname, time);
                room.getFinishTimeMap().putIfAbsent(nickname, seconds);

                FinishNoticeBroadcast broadcast = new FinishNoticeBroadcast(request.getRoomId(), nickname);
                getServer().getRoomOperations(request.getRoomId())
                        .sendEvent("finish_notice", broadcast);

                // ✅ 서버 타이머로 종료 제어
                startCountDownTimer(request.getRoomId());
            } else {
                // ✅ 이미 1등이 있으면 도착 시간만 기록
                room.getFinishTimeMap().putIfAbsent(nickname, seconds);
            }
        }

        // ✅ 현재 진행 상황 브로드캐스트
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("progress_update", request);
    }

    @Async
    public void startCountDownTimer(String roomId) {
        try {
            for (int i = 10; i >= 1; i--) {
                CountDownBroadcast countDown = new CountDownBroadcast(roomId, i);
                getServer().getRoomOperations(roomId)
                        .sendEvent("count_down", countDown);
                Thread.sleep(1000); // 1초 간격
            }

            endRound(roomId); // ⏰ 10초 후 라운드 종료 (단 한 번만)
        } catch (InterruptedException e) {
            log.error("카운트다운 중단됨", e);
            Thread.currentThread().interrupt();
        }
    }

    // 7. 라운드 종료
    public void endRound(String roomId) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        synchronized (room) {
            // ✅ 중복 호출 방지
            if (room.isRoundEnded()) {
                return;
            }
            room.setRoundEnded(true);

            calculateScores(room);

            // ✅ 라운드 결과는 무조건 전송
            RoundScoreBroadcast broadcast = buildRoundScoreBroadcast(room);
            getServer().getRoomOperations(roomId)
                    .sendEvent("round_score", broadcast);

            // ✅ 라운드 수에 따라 자동 종료 또는 다음 라운드
            int MAX_ROUND = 3;
            if (room.getRoundNumber() >= MAX_ROUND) {
                endGame(roomId); // 🎯 자동 게임 종료
            } else {
                room.setRoundNumber(room.getRoundNumber() + 1);
                resetRoundData(room);
            }
        }
    }

    public void endGame(String roomId) {
        Room room = roomService.getRoom(roomId);

        // 게임 결과 생성 전에 총합 점수가 올바르게 계산되었는지 로그로 확인
        log.info("게임 종료 - 총합 점수 맵: {}", room.getTotalScoreMap());

        GameResultBroadcast result = buildGameResultBroadcast(room);
        getServer().getRoomOperations(roomId)
                .sendEvent("game_result", result);

        // ✅ 방 완전 초기화 (참가 인원은 유지, 방장은 준비 상태 유지)
        synchronized (room) {
            room.setIsStarted(false);
            room.setRoundNumber(0);
            room.setRoundEnded(false);
            room.setFirstFinisherNickname(null);
            room.setFirstFinishTime(null);

            // 라운드 관련 정보 초기화
            room.setFinishTimeMap(new ConcurrentHashMap<>());
            room.setTypoCountMap(new ConcurrentHashMap<>());
            room.setRoundScoreMap(new ConcurrentHashMap<>());
            // 게임 종료 후 총합 점수도 초기화
            room.setTotalScoreMap(new ConcurrentHashMap<>());

            // ✅ 준비 상태 초기화 (방장은 true 유지)
            room.getUserStatusMap().forEach((nickname, status) -> {
                if (status.isHost()) {
                    status.setReady(true);
                } else {
                    status.setReady(false);
                }
            });
        }

        RoomStatusResponse broadcast = new RoomStatusResponse(room);
        getServer().getRoomOperations(roomId)
                .sendEvent("room_status", broadcast);
    }


    public void startRound(String roomId) {
        Room room = roomService.getRoom(roomId);
        calculateScores(room);

        TypingStartBroadcast broadcast = new TypingStartBroadcast(
                roomId,
                LocalDateTime.now(),
                getGameContent(room.getLanguage()) // 게임 본문 가져오기
        );

        getServer().getRoomOperations(roomId)
                .sendEvent("typing_start", broadcast);

        room.setRoundNumber(room.getRoundNumber());
        resetRoundData(room);
    }

    // 9. 오타 발생
    public void addTypo(String roomId, String nickname) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            log.warn("[addTypo] 방이 존재하지 않음: " + roomId);
            return;
        }

        Map<String, Integer> typoCountMap = room.getTypoCountMap();
        if (typoCountMap == null) {
            log.warn("[addTypo] typoCountMap이 null입니다. 초기화 누락 가능성");
            return;
        }

        typoCountMap.merge(nickname, 1, Integer::sum);
        log.info("[addTypo] {}의 오타 횟수: {}", nickname, typoCountMap.get(nickname));
    }

    // 2. 현재 방 준비 상태 정보 생성
    public ReadyGameBroadcast buildReadyBroadcast(String roomId) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        List<ReadyGameBroadcast.UserReadyStatus> users = new ArrayList<>();
        for (Map.Entry<String, Room.UserStatus> entry : room.getUserStatusMap().entrySet()) {
            users.add(new ReadyGameBroadcast.UserReadyStatus(entry.getKey(), entry.getValue()));
        }

        return new ReadyGameBroadcast(roomId, users);
    }

    public RoundScoreBroadcast buildRoundScoreBroadcast(Room room) {
        List<UserRoundResult> results = new ArrayList<>();

        for (String nickname : room.getUserStatusMap().keySet()) {
            Double finishTime = room.getFinishTimeMap().get(nickname);
            int typo = room.getTypoCountMap().getOrDefault(nickname, 0);
            int score = room.getRoundScoreMap().getOrDefault(nickname, 0);

            boolean isRetire = (finishTime == null || finishTime - room.getFirstFinishTime() > 10.0);

            results.add(new UserRoundResult(
                    nickname,
                    score,
                    typo,
                    isRetire ? null : finishTime,
                    isRetire
            ));
        }

        return new RoundScoreBroadcast(room.getRoomId(), room.getRoundNumber(), results);
    }

    // 3. buildGameResultBroadcast 메서드 수정 - 총합 점수 표시
    public GameResultBroadcast buildGameResultBroadcast(Room room) {
        List<UserResultStatus> results = new ArrayList<>();

        for (String nickname : room.getUserStatusMap().keySet()) {
            // 총합 점수를 가져옴 (없으면 0)
            int totalScore = room.getTotalScoreMap().getOrDefault(nickname, 0);

            // UserResultStatus 객체 생성 시 averageScore 대신 totalScore 필드를 사용
            // 만약 UserResultStatus 클래스가 averageScore 필드만 가지고 있다면,
            // 그 필드에 totalScore 값을 임시로 사용
            results.add(UserResultStatus.builder()
                    .nickname(nickname)
                    .averageScore(totalScore) // totalScore로 변경하거나 기존 averageScore 필드에 totalScore 값 사용
                    .build());
        }

        // 총점 기준으로 정렬 (높은 점수가 상위에 오도록)
        results.sort((a, b) -> Double.compare(b.getAverageScore(), a.getAverageScore()));

        // 순위 설정
        for (int i = 0; i < results.size(); i++) {
            results.get(i).setRank(i + 1);
        }

        return new GameResultBroadcast(room.getRoomId(), results);
    }


    // 라운드별 점수 계산
    // 1. calculateScores 메서드 수정 - 점수 계산 및 누적 로직 수정
    public void calculateScores(Room room) {
        Map<String, Integer> roundScoreMap = room.getRoundScoreMap();

        Double firstFinishTime = room.getFirstFinishTime();
        if (firstFinishTime == null) {
            // 안전하게 기본값 설정 (예: 모두 탈락했거나 지연된 경우)
            firstFinishTime = 0.0;
            room.setFirstFinishTime(firstFinishTime);
        }

        for (String nickname : room.getUserStatusMap().keySet()) {
            Double finishTime = room.getFinishTimeMap().get(nickname);
            int typo = room.getTypoCountMap().getOrDefault(nickname, 0);

            boolean isRetire = (finishTime == null || finishTime - firstFinishTime > 10.0);
            double timeDiff = isRetire ? 25.0 : Math.max(0, finishTime - firstFinishTime);

            int score = (int) Math.max(0, 100 - (timeDiff * 2.0) - typo * 1.0);
            roundScoreMap.put(nickname, score);

            // 총합 점수 맵에 현재 라운드 점수 추가 (없으면 생성)
            if (room.getTotalScoreMap() == null) {
                room.setTotalScoreMap(new ConcurrentHashMap<>());
            }
            room.getTotalScoreMap().merge(nickname, score, Integer::sum);

            // ✅ finishTime이 null일 경우만 추가 → putIfAbsent로 안전하게
            room.getFinishTimeMap().putIfAbsent(nickname, firstFinishTime + 25.0);
        }

        room.setRoundScoreMap(roundScoreMap);
        // 중복 설정 제거 (중복 코드 제거)
        // room.setRoundScoreMap(roundScoreMap);
    }


    private void resetRoundData(Room room) {
        // ✅ 라운드별 Map을 새로운 인스턴스로 교체 (동시성 안전)
        room.setFinishTimeMap(new ConcurrentHashMap<>());
        room.setTypoCountMap(new ConcurrentHashMap<>());
        room.setRoundScoreMap(new HashMap<>());
        // ✅ 첫 도착자 정보 초기화
        room.setFirstFinishTime(null);
        room.setFirstFinisherNickname(null);
        room.setRoundEnded(false);
    }


    // 11. 방 별 유저 수 저장
    public void setRoomUserCount(String roomId, int userCount) {
        roomUserCounts.put(roomId, userCount);
    }

    // 12. 게임 본문 가져오기
    public String getGameContent(String language) {
        Code randomCode = codeRepository.findRandomByLanguage(language).orElseThrow(() -> new CustomException(ResponseCode.CODE_NOT_FOUND));
        if (randomCode != null) {
            return randomCode.getContent();
        } else {
            return "기본 문장입니다. (DB에 내용이 없습니다)";
        }
    }

}
