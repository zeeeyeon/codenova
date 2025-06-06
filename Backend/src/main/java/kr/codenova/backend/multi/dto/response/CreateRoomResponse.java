package kr.codenova.backend.multi.dto.response;

import kr.codenova.backend.multi.room.Room;
import lombok.Data;

@Data
public class CreateRoomResponse {

    private String roomId;
    private String roomCode;
    public CreateRoomResponse(Room newRoom) {
        this.roomId = newRoom.getRoomId();
        this.roomCode = newRoom.getRoomCode();
    }
}
