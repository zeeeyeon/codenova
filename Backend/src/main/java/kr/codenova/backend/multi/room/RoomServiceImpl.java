package kr.codenova.backend.multi.room;

import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomServiceImpl implements RoomService {

    private final Map<String, Room> roomMap = new ConcurrentHashMap<>();
    private final Logger log = LoggerFactory.getLogger(getClass());


    // 방 만들기
    public Room createRoom(CreateRoomRequest request) {
        String roomId = UUID.randomUUID().toString();
        String roomCode = request.getIsPrivate() ? generatedRoomCode() : null;
        Room room = new Room(
                roomId,
                request.getRoomTitle(),
                request.getLanguage(),
                request.getLimit(),
                0,
                request.getIsPrivate(),
                "waiting",
                roomCode
                );
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
            int newCount = room.getCurrentCount() - 1;
            room.setCurrentCount(Math.max(newCount, 0)); // 음수 방지
            if (newCount <= 0) {
                roomMap.remove(roomId);
            }
        } else {
            log.warn("존재하지 않는 방입니다: " + roomId); // 로그 추가 (선택)
        }
    }

    // 방 해산 처리
    public void closeRoom(String roomId) {
        if (roomMap.containsKey(roomId)) {
            roomMap.remove(roomId);
        }
    }

    public String generatedRoomCode() {
        return UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

}
