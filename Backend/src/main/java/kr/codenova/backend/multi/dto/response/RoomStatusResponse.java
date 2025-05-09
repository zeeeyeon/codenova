package kr.codenova.backend.multi.dto.response;

import kr.codenova.backend.multi.dto.broadcast.JoinRoomBroadcast;
import kr.codenova.backend.multi.room.Room;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class RoomStatusResponse {

    private String roomId;
    private String roomTitle;
    private String language;
    private Boolean isLocked;
    private String roomCode;
    private Integer maxCount;
    private Integer currentCount;
    private List<UserStatus> users;

    @Data
    public class UserStatus {
        private String nickname;
        private Boolean isHost;
        private Boolean isReady;
        public UserStatus(String nickname, Boolean isHost, Boolean isReady) {
            this.nickname = nickname;
            this.isHost = isHost;
            this.isReady = isReady;
        }
    }

    public RoomStatusResponse(Room room) {
        this.roomId = room.getRoomId();
        this.roomCode = room.getIsLocked() ? room.getRoomCode() : null; // ✅ 조건부 포함
        this.roomTitle = room.getRoomTitle();
        this.language = room.getLanguage();
        this.isLocked = room.getIsLocked();
        this.maxCount = room.getMaxCount();
        this.currentCount = room.getCurrentCount();
        List<UserStatus> status = new ArrayList<>();
        ConcurrentHashMap<String, Room.UserStatus> userStatusMap = room.getUserStatusMap();
        for (Map.Entry<String, Room.UserStatus> entry : userStatusMap.entrySet()) {
            UserStatus userStatus = new UserStatus(entry.getKey(), entry.getValue().isHost(), entry.getValue().isReady());
            status.add(userStatus);
        }
        this.users = status;
    }
}

/**
 * "roomId": "1234",
 *   "roomTitle": "아무나",
 *   "language": "Python",
 *   "isLocked": false,
 *   "roomCode": null,
 *   "maxCount": 4,
 *   "currentCount": 2,
 *   "users": [
 *     {
 *       "nickname": "동현갈비",
 *       "isHost": true,
 *       "isReady": true
 *     },
 *     {
 *       "nickname": "TIMMY이지연",
 *       "isHost": false,
 *       "isReady": false
 *     }
 *   ]
 */