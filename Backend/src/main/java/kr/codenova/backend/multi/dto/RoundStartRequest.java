package kr.codenova.backend.multi.dto;

import lombok.Data;

@Data
public class RoundStartRequest {
    private String roomId;
    private String nickname;
}
