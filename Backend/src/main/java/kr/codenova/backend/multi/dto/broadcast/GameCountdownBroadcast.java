package kr.codenova.backend.multi.dto.broadcast;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameCountdownBroadcast {
    private String roomId;
    private String message;
    private Integer countdownSec;
}
