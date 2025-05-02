package kr.codenova.backend.multi.dto.response;

import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JoinRoomResponse {

    private String roomId;
    private String roomCode;
    private String nickname;

    public JoinRoomResponse(JoinRoomRequest request) {
        this.roomId = request.getRoomId();
        this.roomCode = request.getRoomCode();
        this.nickname = request.getNickname();
    }
}
