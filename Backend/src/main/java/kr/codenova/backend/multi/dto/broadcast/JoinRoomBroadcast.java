package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JoinRoomBroadcast {
    private String roomId;
    private String roomCode;
    private List<UserStatus> status;
    private String roomTitle;
    private String language;
    private Boolean isLocked;
    private Integer maxCount;
    private Integer currentCount;
    /**
     *   "roomId": "1234",
     *   "roomTitle": "아무나",
     *   "language": "Python",
     *   "isLocked": false,
     *   "roomCode": null,
     *   "maxCount": 4,
     *   "currentCount": 2,
     */

    @Data
    public static class UserStatus {
        private String nickname;
        private Boolean isHost;
        private Boolean isReady;

        public UserStatus(String nickname, Room.UserStatus status) {
            this.nickname = nickname;
            this.isHost = status.isHost();
            this.isReady = status.isReady();
        }
    }

    public JoinRoomBroadcast(Room room) {
        this.roomId = room.getRoomId();
        this.roomTitle = room.getRoomTitle();
        this.roomCode = room.getIsLocked() ? room.getRoomCode() : null; // ✅ 조건부 포함
        this.language = room.getLanguage();
        this.maxCount = room.getMaxCount();
        this.isLocked = room.getIsLocked();
        this.currentCount = room.getCurrentCount();
        List<UserStatus> status = new ArrayList<>();
        ConcurrentHashMap<String, Room.UserStatus> userStatusMap = room.getUserStatusMap();
        for (Map.Entry<String, Room.UserStatus> entry : userStatusMap.entrySet()) {
            UserStatus userStatus = new UserStatus(entry.getKey(), entry.getValue());
            status.add(userStatus);
        }
        this.status = status;
    }
}
