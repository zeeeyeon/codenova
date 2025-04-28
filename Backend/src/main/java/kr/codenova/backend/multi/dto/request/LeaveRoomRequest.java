package kr.codenova.backend.multi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRoomRequest {
    private String roomId;
    private String nickname;
}
