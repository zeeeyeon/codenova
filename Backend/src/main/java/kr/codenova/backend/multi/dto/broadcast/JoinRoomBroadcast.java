package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JoinRoomBroadcast {
    private String roomId;
    private String roomCode;
    private List<UserStatus> status;

    @Data
    public static class UserStatus {
        private String nickname;
        private Boolean isReady;

        public UserStatus(String nickname, Boolean isReady) {
            this.nickname = nickname;
            this.isReady = isReady;
        }
    }

    public JoinRoomBroadcast(Room room) {
        this.roomId = room.getRoomId();
        this.roomCode = room.getIsLocked() ? room.getRoomCode() : null; // ✅ 조건부 포함
        List<UserStatus> status = new ArrayList<>();
        Map<String, Boolean> userReadyStatus = room.getUserReadyStatus();
        for (Map.Entry<String, Boolean> entry : userReadyStatus.entrySet()) {
            status.add(new UserStatus(entry.getKey(), entry.getValue()));
        }
        this.status = status;
    }
}
