package kr.codenova.backend.multi.dto.broadcast;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JoinRoomBroadcast {
    private Integer memberId;
    private Integer currentCount;
}
