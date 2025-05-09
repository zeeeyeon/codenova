package kr.codenova.backend.meteor.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GameReadyResponse {
    private String nickname;
    private int readyCount;
    private boolean ready;
    private boolean allReady;
}
