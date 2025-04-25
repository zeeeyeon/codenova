package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.CloseRoomRequest;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.broadcast.JoinRoomBroadcast;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.socket.SocketEventHandler;
import kr.codenova.backend.multi.dto.broadcast.RoomUpdateBroadcast;
import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
@RequiredArgsConstructor
public class RoomSocketHandler implements SocketEventHandler {

    private final RoomServiceImpl roomService;
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Override
    public void registerListeners(SocketIOServer server) {

        server.addEventListener("room_list", Void.class, (client, request, ackSender) -> {
            Collection<Room> rooms = roomService.getAllRooms();
            client.sendEvent("room_list", rooms);
        });

        server.addEventListener("create_room", CreateRoomRequest.class, (client, request, ackSender) -> {

            Room newRoom = roomService.createRoom(request);

            log.info("방 생성 : " + newRoom.toString());

            RoomUpdateBroadcast broadcast = new RoomUpdateBroadcast(newRoom);

            // 응답으로 roomId 전달
            ackSender.sendAckData(newRoom.getRoomId());

            System.out.println("Room Created: " + request.getRoomTitle());
            server.getBroadcastOperations().sendEvent("room_update", broadcast);
        });

        server.addEventListener("join_room", JoinRoomRequest.class, (client, request, ackSender) -> {
            boolean success = roomService.joinRoom(request.getRoomId());

            if(success) {
                client.joinRoom(request.getRoomId());

                JoinRoomBroadcast broadcast = new JoinRoomBroadcast(
                        request.getMemberId(),
                        roomService.getRoom(request.getRoomId()).getCurrentCount()
                );

                server.getRoomOperations(request.getRoomId()).sendEvent("room_joined", broadcast);

                Room room = roomService.getRoom(request.getRoomId());
                RoomUpdateBroadcast updated = new RoomUpdateBroadcast(room);
                server.getBroadcastOperations().sendEvent("room_update", updated);

                // 응답으로 현재 인원 수 반환
                ackSender.sendAckData(room.getCurrentCount());
            }
        });

        server.addEventListener("leave_room", LeaveRoomRequest.class, (client, request, ackSender) -> {
            roomService.leaveRoom(request.getRoomId());
            client.leaveRoom(request.getRoomId());

            if (roomService.isRoomEmpty(request.getRoomId())) {
                server.getBroadcastOperations().sendEvent("room_removed", request.getRoomId());
            } else {
                Room room = roomService.getRoom(request.getRoomId());
                RoomUpdateBroadcast updated = new RoomUpdateBroadcast(room);
                server.getBroadcastOperations().sendEvent("room_update", updated);
            }
        });

        server.addEventListener("close_room", CloseRoomRequest.class, (client, request, ackSender) -> {
            roomService.closeRoom(request.getRoomId());
            client.leaveRoom(request.getRoomId());

            if (roomService.isRoomEmpty(request.getRoomId())) {
                server.getBroadcastOperations().sendEvent("close_room", request.getRoomId());
            } else {
                Room room = roomService.getRoom(request.getRoomId());
                RoomUpdateBroadcast updated = new RoomUpdateBroadcast(room);
                server.getBroadcastOperations().sendEvent("room_update", updated);
            }
        });

    }

}
