package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class ReadyGameRequest {

    private String roomId;
    private String nickname;
}
