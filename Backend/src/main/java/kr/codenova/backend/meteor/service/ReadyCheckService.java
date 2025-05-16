package kr.codenova.backend.meteor.service;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.meteor.RoomManager;
import kr.codenova.backend.meteor.dto.response.ErrorResponse;
import kr.codenova.backend.meteor.dto.response.ExitRoomResponse;
import kr.codenova.backend.meteor.dto.response.ReadyWarningResponse;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.room.GameStatus;
import kr.codenova.backend.meteor.entity.user.UserInfo;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReadyCheckService {

    private final RoomManager roomManager;
    private final TaskScheduler taskScheduler;

    private final Map<String, ScheduledFuture<?>> warningTimers = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> kickTimers = new ConcurrentHashMap<>();
    private String getTimerKey(String roomId, String sessionId) {
        return roomId + ":" + sessionId;
    }
    // 준비 체크 타이머 시작
    public void startReadyCheck(String roomId, String sessionId, String nickname) {
        log.info("타이머 시작: roomId={}, sessionId={}, nickname={}, 시간={}",
                roomId, sessionId, nickname, Instant.now());

        // 유저 입장 시간 기록
        roomManager.recordUserJoinTime(roomId, sessionId);
        cancelExistingTimers(roomId, sessionId);
        // 20초 후 경고 메시지 전송
        // 20초 후 경고 메시지 전송 - 타이머 객체 저장
        String timerKey = getTimerKey(roomId, sessionId);
        ScheduledFuture<?> warningTask = taskScheduler.schedule(() -> {
            sendReadyWarning(roomId, sessionId, nickname);
        }, Instant.now().plusSeconds(20));

        // 타이머 저장
        warningTimers.put(timerKey, warningTask);
    }

    private void cancelExistingTimers(String roomId, String sessionId) {
        String timerKey = getTimerKey(roomId, sessionId);

        // 경고 타이머 취소
        ScheduledFuture<?> warningTask = warningTimers.remove(timerKey);
        if (warningTask != null) {
            boolean cancelResult = warningTask.cancel(true);
            log.info("경고 타이머 취소: roomId={}, sessionId={}, 결과={}",
                    roomId, sessionId, cancelResult ? "성공" : "실패");
        }

        // 강퇴 타이머 취소
        ScheduledFuture<?> kickTask = kickTimers.remove(timerKey);
        if (kickTask != null) {
            boolean cancelResult = kickTask.cancel(true);
            log.info("강퇴 타이머 취소: roomId={}, sessionId={}, 결과={}",
                    roomId, sessionId, cancelResult ? "성공" : "실패");
        }
    }

    // 준비 체크 타이머 취소
    public void cancelReadyCheck(String roomId, String sessionId) {
        log.info("타이머 취소: roomId={}, sessionId={}", roomId, sessionId);
        roomManager.removeUserJoinTime(roomId, sessionId);
        cancelExistingTimers(roomId, sessionId);
    }

    // 방의 모든 타이머 취소
    public void cancelAllReadyChecks(String roomId) {
        log.info("방의 모든 타이머 취소: roomId={}", roomId);
        roomManager.cancelAllTimers(roomId);
    }

    // 준비 상태에 따른 타이머 관리
    public void manageReadyTimer(String roomId, String sessionId, String nickname, boolean isReady, boolean isHost) {
        if (isReady || isHost) {
            // 준비 완료 또는 방장인 경우 타이머 취소
            log.info("준비 완료로 인한 타이머 취소: roomId={}, sessionId={}", roomId, sessionId);
            cancelReadyCheck(roomId, sessionId);
        } else {
            // 준비 취소 상태로 변경된 경우 타이머 재설정
            log.info("준비 취소로 인한 타이머 재설정: roomId={}, sessionId={}", roomId, sessionId);
            startReadyCheck(roomId, sessionId, nickname);
        }
    }

    // 경고 메시지 전송
    private void sendReadyWarning(String roomId, String sessionId, String nickname) {
        Optional<GameRoom> optRoom = roomManager.findById(roomId);
        if (optRoom.isEmpty()) {
            log.info("경고 메시지 취소 - 방 없음: roomId={}, sessionId={}", roomId, sessionId);
            return;
        }

        GameRoom room = optRoom.get();

        if (room.getStatus() == GameStatus.PLAYING) {
            log.info("경고 메시지 취소 - 게임 중: roomId={}, sessionId={}", roomId, sessionId);
            cancelReadyCheck(roomId, sessionId);
            return;
        }

        Optional<UserInfo> userOpt = room.getPlayers().stream()
                .filter(u -> u.getSessionId().equals(sessionId))
                .findFirst();

        // 유저가 아직 방에 있고 준비 상태가 아니면 경고 메시지 전송
        if (userOpt.isPresent() && !userOpt.get().getIsReady()) {
            SocketIOClient userClient = getServer().getClient(UUID.fromString(sessionId));
            if (userClient != null) {
                log.info("경고 메시지 전송: roomId={}, sessionId={}, nickname={}", roomId, sessionId, nickname);

                // 경고 메시지 전송
                userClient.sendEvent("readyWarning",
                        new ReadyWarningResponse("10초 내에 준비하지 않으면 방에서 퇴장됩니다."));

                // 10초 후 확인 및 강퇴 스케줄링
                log.info("강퇴 체크 타이머 시작: roomId={}, sessionId={}, nickname={}", roomId, sessionId, nickname);

                String timerKey = getTimerKey(roomId, sessionId);
                ScheduledFuture<?> kickTask = taskScheduler.schedule(() -> {
                    kickIfNotReady(roomId, sessionId, nickname);
                }, Instant.now().plusSeconds(10));
                kickTimers.put(timerKey, kickTask);
            }
        } else {
            log.info("경고 메시지 취소 - 이미 준비 완료 또는 방 퇴장: roomId={}, sessionId={}", roomId, sessionId);
            cancelReadyCheck(roomId, sessionId);
        }
    }

    // 준비 안된 유저 강퇴
    private void kickIfNotReady(String roomId, String sessionId, String nickname) {
        log.info("강퇴 체크 시점: roomId={}, sessionId={}, nickname={}", roomId, sessionId);

        Optional<GameRoom> optRoom = roomManager.findById(roomId);
        if (optRoom.isEmpty()) {
            log.info("강퇴 취소 - 방 없음: roomId={}, sessionId={}", roomId, sessionId);
            return;
        }

        GameRoom room = optRoom.get();
        if (room.getStatus() == GameStatus.PLAYING) {
            log.info("강퇴 취소 - 게임 중: roomId={}, sessionId={}", roomId, sessionId);
            cancelReadyCheck(roomId, sessionId);
            return;
        }

        Optional<UserInfo> userOpt = room.getPlayers().stream()
                .filter(u -> u.getSessionId().equals(sessionId))
                .findFirst();

        if (userOpt.isPresent() && !userOpt.get().getIsReady()) {
            // 아직도 준비가 안 된 사용자 찾음
            UserInfo user = userOpt.get();
            log.info("강퇴 처리: roomId={}, sessionId={}, nickname={}", roomId, sessionId, nickname);

            // 강제 퇴장 처리


            // 퇴장당한 사용자에게 알림
            SocketIOClient userClient = getServer().getClient(UUID.fromString(sessionId));
            if (userClient != null) {
                userClient.sendEvent("youWereKicked",
                        new ErrorResponse("READY_TIMEOUT", "준비 시간이 초과되어 방에서 퇴장되었습니다."));
                userClient.leaveRoom(roomId);
            }
            room.removePlayer(sessionId);
            cancelReadyCheck(roomId, sessionId);

            // 방에 남은 유저들에게 알림
            boolean wasHost = sessionId.equals(room.getHostSessionId());
            UserInfo newHost = null;
            if (wasHost && !room.getPlayers().isEmpty()) {
                newHost = room.getPlayers().stream()
                        .filter(UserInfo::getIsHost)
                        .findFirst()
                        .orElse(null);
            }

            // 퇴장 정보를 방의 다른 사용자들에게 전송
            ExitRoomResponse response = new ExitRoomResponse(
                    roomId,
                    new UserInfo(sessionId, nickname, wasHost, false, false), // 퇴장한 유저 정보
                    newHost,
                    room.getPlayers()
            );
            getServer().getRoomOperations(roomId)
                    .sendEvent("roomExit", response);
            log.info("강퇴 완료");
        } else {
            log.info("강퇴 취소 - 이미 준비 완료 또는 방 퇴장: roomId={}, sessionId={}", roomId, sessionId);
            cancelReadyCheck(roomId, sessionId);
        }
    }

    private SocketIOServer getServer() {
        return SocketIOServerProvider.getServer();
    }
}