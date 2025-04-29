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
        Map<String, Boolean> readyStatus = room.getUserReadyStatus();
        Boolean current = readyStatus.getOrDefault(request.getNickname(), false);
        readyStatus.put(request.getNickname(), !current);

        ReadyGameBroadcast broadcast = buildReadyBroadcast(request.getRoomId());
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("ready_status_update", broadcast);

        // ✅ 모두 준비 완료됐는지 체크
        boolean allReady = readyStatus.values().stream().allMatch(Boolean::booleanValue);

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
        for (Map.Entry<String, Boolean> entry : room.getUserReadyStatus().entrySet()) {
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

        if (!room.getOwnerNickname().equals(nickname)) {
            throw new InvalidGameStartException("방장만 게임을 시작할 수 있습니다.");
        }

        if (room.getCurrentCount() < 2) {
            throw new InvalidGameStartException("2명 이상이어야 게임을 시작할 수 있습니다.");
        }

        for (Boolean ready : room.getUserReadyStatus().values()) {
            if (!ready) {
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
        getServer().getRoomOperations(request.getRoomId())
                .sendEvent("progress_update", request);
    }

    // 7. 게임 종료
    public void finishGame(FinishGameRequest request) {
        saveUserResult(request.getRoomId(), request.getNickname(), request.getTypingSpeed(), request.getFinishTime());

        if (isAllUsersFinished(request.getRoomId())) {
            GameResultBroadcast broadcast = summarizeGameResult(request.getRoomId());
            getServer().getRoomOperations(request.getRoomId())
                    .sendEvent("game_result", broadcast);
        }
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

}
