package kr.codenova.backend.multi.dto.broadcast;

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

        public UserReadyStatus(String nickname, Boolean isReady) {
            this.nickname = nickname;
            this.isReady = isReady;
        }
    }
}

