package kr.codenova.backend.meteor;

import kr.codenova.backend.meteor.entity.room.GameRoom;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomManager {
    private final Map<String, GameRoom> roomsById = new ConcurrentHashMap<>();
    private final Map<String, GameRoom> roomsByCode = new ConcurrentHashMap<>();

    public void addRoom(GameRoom room) {
        roomsById.put(room.getRoomId(), room);
        if (room.getRoomCode() != null) {
            roomsByCode.put(room.getRoomCode(), room);
        }
    }

    public Optional<GameRoom> findByCode(String roomCode) {
        return Optional.ofNullable(roomsByCode.get(roomCode));
    }
}
