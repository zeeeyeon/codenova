package kr.codenova.backend.multi.room;

import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomService {

    private final Map<String, Room> roomMap = new ConcurrentHashMap<>();

    // 방 만들기
    public Room createRoom(CreateRoomRequest request) {
        String roomId = UUID.randomUUID().toString();
        Room room = new Room(
                roomId,
                request.getRoomTitle(),
                request.getLanguage(),
                request.getLimit(),
                0,
                request.getIsPrivate(),
                "waiting");
        roomMap.put(roomId, room);
        return room;
    }

    // 방 조회
    public Room getRoom(String roomId) {
        return roomMap.get(roomId);
    }

    // 방에 접속하기
    public Boolean joinRoom(String roomId) {
        Room room = roomMap.get(roomId);
        if(room == null || room.getCurrentCount() >= room.getLimitCount()) {
            return false;
        }
        room.setCurrentCount(room.getCurrentCount() + 1);
        return true;
    }

    // 빈 방 확인하기
    public Boolean isRoomEmpty(String roomId) {
        Room room = roomMap.get(roomId);
        return room != null && room.getCurrentCount() <= 0;
    }

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }

    // 방 나가기 처리
    public void leaveRoom(String roomId) {
        Room room = roomMap.get(roomId);
        if (room != null) {
            room.setCurrentCount(room.getCurrentCount() - 1);
            if(room.getCurrentCount() <= 0) {
                roomMap.remove(roomId);
            }
        }
    }

}
