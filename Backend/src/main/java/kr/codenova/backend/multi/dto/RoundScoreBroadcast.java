package kr.codenova.backend.multi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoundScoreBroadcast {
    private String roomId;
    private int round;
    private List<UserRoundResult> scores;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserRoundResult {
        private String nickname;
        private int score;
        private int typoCount;
        private Double time; // null if retire
        private boolean isRetire;
    }
}
