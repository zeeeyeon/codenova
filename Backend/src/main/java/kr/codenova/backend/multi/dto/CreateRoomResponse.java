package kr.codenova.backend.multi.dto;

import kr.codenova.backend.multi.room.Room;
import lombok.Data;

@Data
public class CreateRoomResponse {

    private String roomId;
    public CreateRoomResponse(Room newRoom) {
        this.roomId = newRoom.getRoomId();
    }
}
