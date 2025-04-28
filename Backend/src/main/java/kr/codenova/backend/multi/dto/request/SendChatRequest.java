package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class SendChatRequest {
    private String roomId;
    private String nickname;
    private String message;
}
