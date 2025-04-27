package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.response.CreateRoomResponse;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.dto.response.RoomListResponse;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.multi.socket.SocketEventHandler;
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

    private final RoomServiceImpl roomService;
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Override
    public void registerListeners(SocketIOServer server) {

        // 방 목록 조회
        server.addEventListener("room_list", Void.class, (client, request, ackSender) -> {
            Collection<Room> rooms = roomService.getAllRooms();
            List<RoomListResponse> responseList = rooms.stream()
                            .map(room -> new RoomListResponse(
                                    room.getRoomId(),
                                    room.getRoomTitle(),
                                    room.getCurrentCount(),
                                    room.getMaxCount(),
                                    room.getLanguage(),
                                    room.getIsLocked(),
                                    room.getIsStarted()))
                                    .toList();
            ackSender.sendAckData(responseList); // 요청한 클라이언트에게 응답
        });

        // 방 생성
        server.addEventListener("create_room", CreateRoomRequest.class, (client, request, ackSender) -> {

            Room newRoom = roomService.createRoom(request);

            log.info("방 생성 : " + newRoom.toString());

            RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(newRoom);
            CreateRoomResponse response = new CreateRoomResponse(newRoom);
            // 응답으로 roomId 전달
            ackSender.sendAckData(response);
            log.info("방 생성 : " + request.getTitle());
            server.getBroadcastOperations().sendEvent("room_update", broadcast);
        });

        // 방 입장
        server.addEventListener("join_room", JoinRoomRequest.class, (client, request, ackSender) -> {
            try {
                Room room = roomService.joinRoom(request);

                client.joinRoom(room.getRoomId());

                ackSender.sendAckData("joined");

                RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(room);
                server.getBroadcastOperations().sendEvent("room_updated", broadcast);
            } catch (RoomNotFoundException | RoomFullException e) {
                // 소켓 클라이언트에 에러 전송
                client.sendEvent("error", new SocketErrorResponse(e.getMessage()));
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("알 수 없는 오류가 발생했습니다."));
            }
        });

        // 방 퇴장
        server.addEventListener("leave_room", LeaveRoomRequest.class, (client, request, ackSender) -> {
            roomService.leaveRoom(request.getRoomId());
            client.leaveRoom(request.getRoomId());

            if (roomService.isRoomEmpty(request.getRoomId())) {
                server.getBroadcastOperations().sendEvent("room_removed", request.getRoomId());
            } else {
                Room room = roomService.getRoom(request.getRoomId());
                RoomUpdateBroadcast updated = RoomUpdateBroadcast.from(room);
                server.getBroadcastOperations().sendEvent("room_update", updated);
            }
        });



    }

}
