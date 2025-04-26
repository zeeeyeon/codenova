package kr.codenova.backend.meteor;

import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.user.UserInfo;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Supplier;

@Component
public class RoomManager {
    private final Map<String, GameRoom> roomsById   = new ConcurrentHashMap<>();
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

    /**
     * findOrCreateRandomRoom 의 결과를 담을 DTO
     */
    public static class RandomRoomResult {
        private final GameRoom room;
        private final boolean created;
        public RandomRoomResult(GameRoom room, boolean created) {
            this.room = room;
            this.created = created;
        }
        public GameRoom  getRoom()    { return room; }
        public boolean   isCreated()  { return created; }
    }

    /**
     * 대기중인 랜덤방을 찾고, 없으면 생성까지 한 뒤
     * 결과와 “생성여부”를 함께 리턴한다.
     */
    public RandomRoomResult findOrCreateRandomRoom(
            Supplier<String> idSupplier,
            Function<String, UserInfo> hostFactory
    ) {
        synchronized(this) {
            // 기존에 대기중인 방이 있으면 그걸 사용
            Optional<GameRoom> opt = roomsById.values().stream()
                    .filter(GameRoom::isWaitingRandom)
                    .findAny();
            if (opt.isPresent()) {
                return new RandomRoomResult(opt.get(), false);
            }
            // 없으면 새로 만들고 “created=true” 로
            String roomId = idSupplier.get();
            GameRoom room = new GameRoom(roomId, false, null, 4);
            // 방장 등록
            room.addPlayer(hostFactory.apply(roomId));
            addRoom(room);
            return new RandomRoomResult(room, true);
        }
    }
}
