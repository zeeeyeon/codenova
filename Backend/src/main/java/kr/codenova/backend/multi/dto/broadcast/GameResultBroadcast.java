package kr.codenova.backend.multi.dto.broadcast;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameResultBroadcast {
    private String roomId;
    private List<UserResultStatus> results;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserResultStatus {
        private String nickname;
        private Integer totalScore;
        private int rank;
    }
}