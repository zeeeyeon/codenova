package kr.codenova.backend.meteor.dto.request;

import lombok.Data;

@Data
public class GoWaitingRoomRequest {
    private String nickname;
    private String roomId;
}
