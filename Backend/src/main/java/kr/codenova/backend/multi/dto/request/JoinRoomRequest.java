package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class JoinRoomRequest {

    private String roomId;
    private Integer memberId;
}
