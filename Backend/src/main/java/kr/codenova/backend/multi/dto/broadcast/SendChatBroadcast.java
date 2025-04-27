package kr.codenova.backend.multi.dto.broadcast;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SendChatBroadcast {
    private String roomId;
    private String nickname;
    private String message;
    private LocalDateTime timestamp;
}
