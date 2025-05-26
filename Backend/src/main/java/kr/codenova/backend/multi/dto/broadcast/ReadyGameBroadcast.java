package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadyGameBroadcast {
    private String roomId;
    private List<UserReadyStatus> users;

    @Data
    public static class UserReadyStatus {
        private String nickname;
        private Boolean isReady;
        private Boolean isHost;

        public UserReadyStatus(String nickname, Room.UserStatus status) {
            this.nickname = nickname;
            this.isReady = status.isReady();
            this.isHost = status.isHost();
        }
    }
}

