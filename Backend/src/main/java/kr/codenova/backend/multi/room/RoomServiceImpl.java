package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.multi.dto.broadcast.NoticeBroadcast;
import kr.codenova.backend.multi.dto.broadcast.RoomUpdateBroadcast;
import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.response.CreateRoomResponse;
import kr.codenova.backend.multi.dto.response.RoomListResponse;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomServiceImpl implements RoomService {

    private final Map<String, Room> roomMap = new ConcurrentHashMap<>();
    private final Logger log = LoggerFactory.getLogger(getClass());

    private SocketIOServer getServer() {
        return SocketIOServerProvider.getServer();
    }

    // 방 생성
    public void createRoom(SocketIOClient client, CreateRoomRequest request, AckRequest ackSender) {
        String roomId = UUID.randomUUID().toString();
        String roomCode = request.getIsLocked() ? generatedRoomCode() : null;

        Room room = Room.builder()
                .roomId(roomId)
                .roomTitle(request.getTitle())
                .language(request.getLanguage())
                .maxCount(request.getMaxNum())
                .currentCount(1)
                .isLocked(request.getIsLocked())
                .isStarted(false)
                .roomCode(roomCode)
                .build();

        log.info("방 생성 : " + room.toString());

        RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(room);
        CreateRoomResponse response = new CreateRoomResponse(room);

        // ✅ 클라이언트 방 입장시키기
        client.joinRoom(roomId);

        // 응답으로 roomId, roomCode 전달
        ackSender.sendAckData(response);


        room.setOwnerNickname(request.getNickname());
        roomMap.put(roomId, room);

        log.info("방 생성 : " + request.getTitle());
        getServer().getBroadcastOperations().sendEvent("room_update", broadcast);
    }

    // 방 조회
    public Room getRoom(String roomId) {
        return roomMap.get(roomId);
    }

    // 방 입장
    public void joinRoom(JoinRoomRequest request, SocketIOClient client, AckRequest ackSender) {
        Room room = roomMap.get(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        if (room.getCurrentCount() >= room.getMaxCount()) {
            throw new RoomFullException("방이 가득 찼습니다.");
        }

        room.setCurrentCount(room.getCurrentCount() + 1);
        room.getUserReadyStatus().put(request.getNickname(), false);
        roomMap.put(room.getRoomId(), room);

        // ✅ 클라이언트 방 조인
        client.joinRoom(room.getRoomId());

        // ✅ 응답
        ackSender.sendAckData("joined");

        // ✅ 방 정보 브로드캐스트
        RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(room);
        getServer().getBroadcastOperations().sendEvent("room_updated", broadcast);

        // ✅ [추가] 입장 알림 브로드캐스트
        getServer().getRoomOperations(request.getRoomId()).sendEvent("join_notice",
                new NoticeBroadcast(
                        request.getRoomId(),
                        request.getNickname(),
                        request.getNickname() + "님이 입장했습니다."
                )
        );
    }

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }

    // 방 퇴장
    public void leaveRoom(LeaveRoomRequest request, SocketIOClient client) {
        Room room = roomMap.get(request.getRoomId());
        if (room == null) {
            log.warn("존재하지 않는 방입니다: {}", request.getRoomId());
            return;
        }

        // ✅ [추가] 퇴장 알림 브로드캐스트 (퇴장 전)
        getServer().getRoomOperations(request.getRoomId()).sendEvent("leave_notice",
                new NoticeBroadcast(
                        request.getRoomId(),
                        request.getNickname(),
                        request.getNickname() + "님이 퇴장했습니다."
                )
        );

        // ✅ 현재 인원 감소
        room.setCurrentCount(Math.max(room.getCurrentCount() - 1, 0));

        // ✅ 클라이언트 방 나가기
        client.leaveRoom(request.getRoomId());

        // ✅ 방 삭제 or 업데이트 브로드캐스트
        if (room.getCurrentCount() == 0) {
            roomMap.remove(request.getRoomId());
            getServer().getBroadcastOperations().sendEvent("room_removed", request.getRoomId());
        } else {
            RoomUpdateBroadcast updated = RoomUpdateBroadcast.from(room);
            getServer().getBroadcastOperations().sendEvent("room_update", updated);
        }
    }

    public String generatedRoomCode() {
        return UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

    public Boolean existsRoom(String roomId) {
        Room room = roomMap.get(roomId);
        return room != null && room.getCurrentCount() > 0;
    }

    public List<RoomListResponse> getRoomList() {
        Collection<Room> rooms = getAllRooms();
         return rooms.stream()
                .map(room -> new RoomListResponse(
                        room.getRoomId(),
                        room.getRoomTitle(),
                        room.getCurrentCount(),
                        room.getMaxCount(),
                        room.getLanguage(),
                        room.getIsLocked(),
                        room.getIsStarted()))
                .toList();

    }
}
