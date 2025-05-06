package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.multi.dto.broadcast.*;
import kr.codenova.backend.multi.dto.request.FinishGameRequest;
import kr.codenova.backend.multi.dto.request.ProgressUpdateRequest;
import kr.codenova.backend.multi.dto.request.ReadyGameRequest;
import kr.codenova.backend.multi.dto.request.StartGameRequest;
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

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final RoomService roomService;
    private final CodeRepository codeRepository;

    private final Logger log = LoggerFactory.getLogger(getClass());

    private SocketIOServer getServer() {
        return SocketIOServerProvider.getServer();
    }

    // 방 별로 완료한 유저들의 결과 저장
    private final Map<String, List<GameResultBroadcast.UserResultStatus>> finishedUserResults = new ConcurrentHashMap<>();

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

    // 3. 게임 시작 요청 처리
    public void startGame(StartGameRequest request) {
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

        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("game_started", countdown);

        delayedTypingStart(request.getRoomId());
    }

    // 4. 게임 시작 전 검증 (방장 여부 + 모든 준비 완료)
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
    public void delayedTypingStart(String roomId) {
        try {
            Thread.sleep(3000); // 3초 대기

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

        } catch (InterruptedException e) {
            // 필요하면 로그 찍기
            System.err.println("게임 시작 대기 중 오류 발생: " + e.getMessage());
        }
    }

    // 6. 게임 진행률 업데이트
    public void updateProgress(ProgressUpdateRequest request) {
        Room room = roomService.getRoom(request.getRoomId());
        String nickname = request.getNickname();
        int progress = request.getProgressPercent();
        double time = request.getTime();

        // 1등 유저라면 1등으로 기록
        if(!room.hasFirstFinisher() && progress >= 100) {
            room.setFirstFinisher(nickname, time);
        }
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("progress_update", request);
    }

    // 7. 게임 종료
    public void finishGame(FinishGameRequest request) {
        saveUserResult(request.getRoomId(), request.getNickname(), request.getTypingSpeed(), request.getFinishTime());

    // 7. 라운드 종료
    public void endRound(String roomId) {
        Room room = roomService.getRoom(roomId);
        calculateScores(room);
        room.setRoundNumber(room.getRoundNumber() + 1);
        resetRoundData(room);
        getServer().getRoomOperations(roomId)
                    .sendEvent("round_score", getRoundScoreBoard(room));
    }

        Room room = roomService.getRoom(request.getRoomId());
        room.setIsStarted(false);
    }

    // 8. 게임 종료 시 유저 결과 저장
    public void saveUserResult(String roomId, String nickname, Double typingSpeed, LocalDateTime finishTime) {
        finishedUserResults.computeIfAbsent(roomId, k -> new ArrayList<>())
                .add(new GameResultBroadcast.UserResultStatus(nickname, typingSpeed, finishTime));
    }

    // 9. 방 참가자 전원이 게임 완료 체크
    public boolean isAllUsersFinished(String roomId) {
        return finishedUserResults.getOrDefault(roomId, Collections.emptyList()).size()
                >= roomUserCounts.getOrDefault(roomId, Integer.MAX_VALUE);
    }

    // 10. 게임 결과 요약
    public GameResultBroadcast summarizeGameResult(String roomId) {
        List<GameResultBroadcast.UserResultStatus> results = finishedUserResults.getOrDefault(roomId, new ArrayList<>());

        // ✅ finishTime 기준으로 정렬
        results.sort(Comparator.comparing(GameResultBroadcast.UserResultStatus::getFinishTime));

        // ✅ 순위 매기기 (리스트 순서 그대로 rank 부여)
        int rank = 1;
        for (GameResultBroadcast.UserResultStatus userResult : results) {
            userResult.setRank(rank++);
        }

        GameResultBroadcast broadcast = new GameResultBroadcast();
        broadcast.setRoomId(roomId);
        broadcast.setResults(results);

        // ✅ 다 끝나면 데이터 초기화
        finishedUserResults.remove(roomId);
        roomUserCounts.remove(roomId);

        return broadcast;
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




    // 라운드별 점수 계산
    public void calculateScores(Room room) {

        HashMap<String, Integer> roundScoreMap = new HashMap<>();

        for (String nickname : room.getFinishTimeMap().keySet()) {
            Double userTime = room.getFinishTimeMap().get(nickname);

            // 10초 초과 시 retire 간주 -> 시간 차는 무조건 15초로 고정
            double timeDiff = (userTime - room.getFirstFinishTime() > 10.0) ? 15.0 : Math.max(0, userTime - room.getFirstFinishTime());

            int typo = room.getTypoCountMap().getOrDefault(nickname, 0);
            int score = (int) Math.max(0, 100 - (timeDiff * 2.0) - typo * (4.0));

            roundScoreMap.put(nickname, score);
            room.getScoreMap().put(nickname, room.getScoreMap().getOrDefault(nickname, 0) + score);
        }

        room.setRoundScoreMap(roundScoreMap);
    }

    private void resetRoundData(Room room) {
        room.setFirstFinishTime(null);
        room.setFirstFinisherNickname(null);
        room.getFinishTimeMap().clear();
        room.getTypoCountMap().clear();
        room.getRoundScoreMap().clear();
    }

    // 라운드별 점수 응답
    public Map<String, Integer> getRoundScoreBoard(Room room) {
        return new HashMap<>(room.getRoundScoreMap());
    }

    // 최종 점수 응답
    public Map<String, Integer> getFinalScoreBoard(Room room) {
        return new HashMap<>(room.getScoreMap());
    }

}
