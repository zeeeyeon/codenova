package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.dto.request.GameResultRequest;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class GameResultBroadcast {
    private String roomId;
    private List<UserResultStatus> results;

    @Data
    @AllArgsConstructor
    public static class UserResultStatus {
        private String nickname;
        private Double typingSpeed;
        private LocalDateTime finishTime;
        private Integer rank;  // ✅ 순위 추가!

        public UserResultStatus(String nickname, Double typingSpeed, LocalDateTime finishTime) {
            this.nickname = nickname;
            this.typingSpeed = typingSpeed;
            this.finishTime = finishTime;
        }
    }
}
