package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.response.CreateRoomResponse;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.dto.response.RoomListResponse;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.global.socket.SocketEventHandler;
import kr.codenova.backend.multi.dto.broadcast.RoomUpdateBroadcast;
import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

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
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 입장 실패"));
            }
        });

        // 방 퇴장
        server.addEventListener("leave_room", LeaveRoomRequest.class, (client, request, ackSender) -> {
            try {
                roomService.leaveRoom(request, client);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("방 퇴장 실패"));
            }
        });
    }

}
