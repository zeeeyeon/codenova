package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.multi.dto.RoundScoreBroadcast;
import kr.codenova.backend.multi.dto.RoundStartRequest;
import kr.codenova.backend.multi.dto.broadcast.*;
import kr.codenova.backend.multi.dto.request.ProgressUpdateRequest;
import kr.codenova.backend.multi.dto.request.ReadyGameRequest;
import kr.codenova.backend.multi.dto.request.StartGameRequest;
import kr.codenova.backend.multi.dto.response.RoomStatusResponse;
import kr.codenova.backend.multi.exception.InvalidGameStartException;
import kr.codenova.backend.multi.exception.IsNotHostException;
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

import static kr.codenova.backend.common.enums.Language.RANDOM;
import static kr.codenova.backend.multi.dto.RoundScoreBroadcast.*;
import static kr.codenova.backend.multi.dto.broadcast.GameResultBroadcast.*;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private static final  int START_COUNT_DOWN = 5;
    private static final int END_COUNT_DOWN = 10;

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

        synchronized (room) {
            // 준비 상태 토글
            Room.UserStatus userStatus = room.getUserStatusMap().get(request.getNickname());
            if (userStatus == null) {
                throw new UserNotFoundException("해당 유저는 방에 존재하지 않습니다.");
            }

            userStatus.setReady(!userStatus.isReady());

            // 모두 준비 완료됐는지 체크 (동기화 블록 내에서 검사)
            boolean allReady = room.getUserStatusMap().values().stream().allMatch(Room.UserStatus::isReady);

            // 브로드캐스트 객체 생성
            ReadyGameBroadcast broadcast = buildReadyBroadcast(request.getRoomId());

            // 브로드캐스트 전송은 블록 외부로 빼는 것이 좋지만
            // allReady 상태에 따른 추가 브로드캐스트가 있어 내부에 유지
            getServer().getRoomOperations(request.getRoomId())
                    .sendEvent("ready_status_update", broadcast);

            if (allReady) {
                // 모두 준비 완료 -> ready_all 브로드캐스트
                getServer().getRoomOperations(request.getRoomId())
                        .sendEvent("ready_all", new ReadyAllBroadcast("모든 참가자가 준비를 완료했습니다!"));
            }
        }
    }

    // 2. 게임 시작 요청 처리
    public void startGame(StartGameRequest request) throws InterruptedException {
        Room room = roomService.getRoom(request.getRoomId());
        validateStartGame(request.getRoomId(), request.getNickname());

        synchronized (room) {

            room.setRoundEnded(false); // 라운드 시작
            // 시작 직전에 참가자 수 저장
            setRoomUserCount(request.getRoomId(), room.getCurrentCount());

            room.setIsStarted(true);
            room.setRoundNumber(1);
            resetRoundData(room);
            room.setTotalScoreMap(new ConcurrentHashMap<>());
        }

        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("game_started", new RoomIdBroadcast(request.getRoomId()));

        log.info("✅ 게임 시작: roomId = {}", request.getRoomId());

        delayedTypingStart(request.getRoomId());
        // 타이머와 같은 비동기 처리는 동기화 블록 외부에서
        startCountDownTimer(request.getRoomId(), START_COUNT_DOWN);

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

        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }
        log.info("🖋️ Typing Start 준비 완료: roomId = {}", roomId);

        TypingStartBroadcast typingStart = new TypingStartBroadcast(
                roomId,
                LocalDateTime.now(),
                getGameContent(room.getLanguage()) // 게임 본문 가져오기
        );
        log.info("📤 typing_start 이벤트 전송: {}", typingStart);

        getServer().getRoomOperations(roomId)
                .sendEvent("typing_start", typingStart);

        RoomUpdateBroadcast bro = RoomUpdateBroadcast.from(room);
        getServer().getBroadcastOperations().sendEvent("room_update", bro);
    }


    // 6. 게임 진행률 업데이트
    public void updateProgress(ProgressUpdateRequest request) {
        Room room = roomService.getRoom(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        String nickname = request.getNickname();
        int progress = request.getProgressPercent();
        Integer time = request.getTime();

        // 진행 상황 브로드캐스트 (동기화 외부에서 처리 가능)
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("progress_update", request);

        if (progress >= 100 && time != null && time > 0) {
            double seconds = time / 1000.0;

            // 첫 완주자와 관련된 로직은 동기화 블록으로 보호
            synchronized (room) {
                if (room.getFirstFinisherNickname() != null) {
                    // 이미 1등 있음 → 기록만 저장하고 끝
                    room.getFinishTimeMap().putIfAbsent(nickname, seconds);
                    return;
                }

                // 1등 처리: 상태 설정
                room.setFirstFinisher(nickname, time);
                room.getFinishTimeMap().putIfAbsent(nickname, seconds);

            }

            FinishNoticeBroadcast broadcast = new FinishNoticeBroadcast(request.getRoomId(), nickname);
            getServer().getRoomOperations(request.getRoomId())
                    .sendEvent("finish_notice", broadcast);

            // 카운트다운 시작은 동기화 블록 내에서 호출해도 됨
            // 비동기 메서드이므로 블록 외부로 빼는 것도 고려
            startCountDownTimer(request.getRoomId(), END_COUNT_DOWN);
        }
    }

    @Async
    public void startCountDownTimer(String roomId, int seconds) {

        log.info("🕒 타이머 시작: roomId = {}, seconds = {}", roomId, seconds);

        int clientCount = getServer().getRoomOperations(roomId).getClients().size();
        log.info("📡 연결된 클라이언트 수: {}", clientCount);
        String eventName = seconds == START_COUNT_DOWN ? "start_count_down" : "end_count_down";
        try {
            for (int i = seconds; i >= 1; i--) {

                log.info("⏳ " + eventName + " {}초 전송", i);

                CountDownBroadcast countDown = new CountDownBroadcast(roomId, i);
                getServer().getRoomOperations(roomId)
                        .sendEvent(eventName, countDown);
                Thread.sleep(1000); // 1초 간격
            }
            if(eventName.equals("end_count_down")) {
                log.info("⏰ 타이머 종료. 라운드 종료 트리거 실행.");
                endRound(roomId); // ⏰ 10초 후 라운드 종료 (단 한 번만)
            }
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
                log.warn("⛔ 이미 종료된 라운드입니다. 중복 종료 방지: roomId={}", roomId);
                return;
            }

            room.setRoundEnded(true);

            calculateScores(room);

            RoundScoreBroadcast broadcast = buildRoundScoreBroadcast(room);
            getServer().getRoomOperations(roomId)
                    .sendEvent("round_score", broadcast);
            // ✅ 라운드 수에 따라 자동 종료 또는 다음 라운드
            int MAX_ROUND = 3;
            if (room.getRoundNumber() >= MAX_ROUND) {
                endGame(roomId); // 🎯 자동 게임 종료
            } else {
                resetRoundData(room);
            }
        }
    }

    // 8. 게임 종료
    public void endGame(String roomId) {
        Room room = roomService.getRoom(roomId);
        GameResultBroadcast result = buildGameResultBroadcast(room);
        getServer().getRoomOperations(roomId)
                .sendEvent("game_result", result);

        // ✅ 방 완전 초기화 (참가 인원은 유지, 방장은 준비 상태 유지)
        synchronized (room) {
            room.setIsStarted(false);
            room.setRoundNumber(0);
            room.setRoundEnded(true);
            room.setFirstFinisherNickname(null);
            room.setFirstFinishTime(null);

            // 라운드 관련 정보 초기화
            room.setFinishTimeMap(new ConcurrentHashMap<>());
            room.setTypoCountMap(new ConcurrentHashMap<>());
            room.setRoundScoreMap(new ConcurrentHashMap<>());

            // ✅ 준비 상태 초기화 (방장은 true 유지)
            room.getUserStatusMap().forEach((nickname, status) -> {
                if (status.isHost()) {
                    status.setReady(true);
                } else {
                    status.setReady(false);
                }
            });

            room.setIsStarted(false);
        }

        RoomStatusResponse broadcast = new RoomStatusResponse(room);
        getServer().getRoomOperations(roomId)
                .sendEvent("room_status", broadcast);

        RoomUpdateBroadcast bro = RoomUpdateBroadcast.from(room);
        getServer().getBroadcastOperations().sendEvent("room_update", bro);
    }


    public void startRound(RoundStartRequest request) throws IsNotHostException {
        Room room = roomService.getRoom(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        if (!room.getUserStatusMap().get(request.getNickname()).isHost()) {
            throw new InvalidGameStartException("방장만 게임을 시작할 수 있습니다.");
        }

        synchronized (room) {

            if (!room.isRoundEnded()) {
                log.warn("⛔ 라운드가 아직 끝나지 않았습니다. 중복 라운드 시작 방지: roomId={}", request.getRoomId());
                return;
            }
            room.setRoundEnded(false);
            calculateScores(room);

            // 방 상태 리셋 및 다음 라운드 설정
            room.setRoundNumber(room.getRoundNumber()+1);
            resetRoundData(room);

            // 이벤트 발송은 동기화 블록 외부로 빼는 것이 좋으나,
            // 여기서는 게임 콘텐츠를 가져오는 로직이 함께 있어 내부에 유지
            TypingStartBroadcast broadcast = new TypingStartBroadcast(
                    request.getRoomId(),
                    LocalDateTime.now(),
                    getGameContent(room.getLanguage())
            );

            getServer().getRoomOperations(request.getRoomId())
                    .sendEvent("typing_start", broadcast);

            // 타이머와 같은 비동기 처리는 동기화 블록 외부에서
            startCountDownTimer(request.getRoomId(), START_COUNT_DOWN);
        }
    }

    // 9. 오타 발생
    public void addTypo(String roomId, String nickname) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        synchronized (room) {
            Map<String, Integer> typoCountMap = room.getTypoCountMap();
            if (typoCountMap == null) {
                log.warn("[addTypo] typoCountMap이 null입니다. 초기화 누락 가능성");
                return;
            }

            typoCountMap.merge(nickname, 1, Integer::sum);
            log.info("[addTypo] {}의 오타 횟수: {}", nickname, typoCountMap.get(nickname));
        }
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

        // ✅ score 기준으로 내림차순 정렬
        results.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        return new RoundScoreBroadcast(room.getRoomId(), room.getRoundNumber(), results);
    }

    public GameResultBroadcast buildGameResultBroadcast(Room room) {
        List<UserResultStatus> results = new ArrayList<>();

        for (String nickname : room.getUserStatusMap().keySet()) {
            int totalScore = room.getTotalScoreMap().getOrDefault(nickname, 0);

            results.add(UserResultStatus.builder()
                    .nickname(nickname)
                    .totalScore(totalScore)
                    .build());
        }

        results.sort((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore()));
        for (int i = 0; i < results.size(); i++) {
            results.get(i).setRank(i + 1);
        }

        return new GameResultBroadcast(room.getRoomId(), results);
    }


    // 라운드별 점수 계산

    /**
     * @param room
     * room의 라운드별 점수를 저장할 Map
     * 해당 라운드의 첫 완주 시간이 null인 경우, 0으로 지정
     *
     */
    public void calculateScores(Room room) {
        // firstFinishTime이 null인 경우 (첫 완주자가 없는 경우)
        Double firstFinishTime = room.getFirstFinishTime();

        if (firstFinishTime == null) {
            // 모든 사용자에게 0점 부여
            for (String nickname : room.getUserStatusMap().keySet()) {
                room.addRoundScore(nickname, 0);
                room.addToTotalScore(nickname, 0);
                // 모든 사용자를 retire 처리
                if (room.getFinishTime(nickname) == null) {
                    room.setUserFinishTime(nickname, Double.MAX_VALUE);
                }
            }
        } else {
            // 게임 시작한 사용자들의 완주시간과 오타횟수를 순차적으로 조회한다.
            for (String nickname : room.getUserStatusMap().keySet()) {
                Double finishTime = room.getFinishTime(nickname);
                int typo = room.getTypoCount(nickname);

                // finishTime이 null이면 0점 부여
                if (finishTime == null) {
                    room.addRoundScore(nickname, 0);
                    room.addToTotalScore(nickname, 0);
                    room.setUserFinishTime(nickname, Double.MAX_VALUE); // retire 처리
                } else {
                    // 완주한 사용자의 경우 시간 차이와 오타에 따라 점수 계산
                    boolean isRetire = (finishTime - firstFinishTime > 10.0);
                    double timeDiff = isRetire ? 25.0 : Math.max(0, finishTime - firstFinishTime);

                    int score = (int) Math.max(0, 100 - (timeDiff * 2.0) - typo * 1.0);
                    room.addRoundScore(nickname, score);
                    room.addToTotalScore(nickname, score);
                }
            }
        }
    }

    private void resetRoundData(Room room) {
        // ✅ 라운드별 Map을 새로운 인스턴스로 교체 (동시성 안전)
        room.setFinishTimeMap(new ConcurrentHashMap<>());
        room.setTypoCountMap(new ConcurrentHashMap<>());
        room.setRoundScoreMap(new HashMap<>());
        // ✅ 첫 도착자 정보 초기화
        room.setFirstFinishTime(null);
        room.setFirstFinisherNickname(null);
    }

    // 11. 방 별 유저 수 저장
    public void setRoomUserCount(String roomId, int userCount) {
        roomUserCounts.put(roomId, userCount);
    }

    // 12. 게임 본문 가져오기
    public String getGameContent(String language) {
        Code randomCode = Objects.equals(language, RANDOM.toString())
                ? codeRepository.findRandom().orElseThrow(() -> new CustomException(ResponseCode.CODE_NOT_FOUND))
                : codeRepository.findRandomByLanguage(language).orElseThrow(() -> new CustomException(ResponseCode.CODE_NOT_FOUND));

        if (randomCode != null) {
            return randomCode.getContent();
        } else {
            return "기본 문장입니다. (DB에 내용이 없습니다)";
        }
    }

}
