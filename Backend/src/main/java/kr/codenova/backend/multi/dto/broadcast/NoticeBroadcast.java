package kr.codenova.backend.multi.dto.broadcast;

import com.corundumstudio.socketio.SocketIOClient;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoticeBroadcast {
    private String roomId;
    private String nickname;
    private String message; // 입장/퇴장 알림 텍스트
}
