package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.request.*;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.multi.exception.InvalidPasswordException;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.global.socket.SocketEventHandler;
import kr.codenova.backend.multi.exception.UserNotInRoomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomSocketHandler implements SocketEventHandler {

    private final RoomService roomService;
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Override
    public void registerListeners(SocketIOServer server) {

        // 방 목록 조회
        server.addEventListener("room_list", Void.class, (client, request, ackSender) -> {
            try {
                log.info("room_list request received client");
                ackSender.sendAckData(roomService.getRoomList());
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 목록 조회 실패"));
            }
        });

        // 방 생성
        server.addEventListener("create_room", CreateRoomRequest.class, (client, request, ackSender) -> {
            try {
                roomService.createRoom(client, request, ackSender);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 생성 실패"));
            }
        });

        // 방 입장
        server.addEventListener("join_room", JoinRoomRequest.class, (client, request, ackSender) -> {
            try {
                roomService.joinRoom(request, client, ackSender);
            } catch (RoomNotFoundException e) {
                client.sendEvent("error", new SocketErrorResponse("방을 찾을 수 없습니다."));
            } catch (RoomFullException e) {
                client.sendEvent("error", new SocketErrorResponse("방이 가득 찼습니다."));
            } catch (InvalidPasswordException e) {
                client.sendEvent("error", new SocketErrorResponse("비밀번호가 일치하지 않습니다."));
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 입장 실패"));
            }
        });

        // 방 퇴장
        server.addEventListener("leave_room", LeaveRoomRequest.class, (client, request, ackSender) -> {
            try {
                roomService.leaveRoom(request, client, false);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 퇴장 실패"));
            } catch (UserNotInRoomException e) {
                throw new RuntimeException(e);
            }
        });

        // 방 상태 보기
        server.addEventListener("room_status", RoomStatusRequest.class, (client, request, ackSender) -> {
            try {
                roomService.getRoomStatus(request, client);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 퇴장 실패"));
            }
        });

        server.addDisconnectListener(client -> {
            try {
                log.info("Socket disconnected: {}", client.getSessionId());
                // RoomServiceImpl의 onDisconnect 메서드호출
                roomService.onDisconnect(client);
            } catch (Exception e) {
                log.error("Disconnect event handling failed", e);
            }
        });

        // 방 퇴장
        server.addEventListener("exit_room", LeaveRoomRequest.class, (client, request, ackSender) -> {
            try {
                roomService.leaveRoom(request, client, false);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 퇴장 실패"));
            } catch (UserNotInRoomException e) {
                throw new RuntimeException(e);
            }
        });

        // 방 수정하기
        server.addEventListener("fix_room", FixRoomRequest.class, (client, request, ackSender) -> {
            try {
                log.info("fix_room 시작");
                roomService.updateRoomStataus(request, client);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 퇴장 실패"));
            }
        });


    }

}
