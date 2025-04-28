package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class StartGameRequest {
    private String roomId;
    private String nickname;
}
