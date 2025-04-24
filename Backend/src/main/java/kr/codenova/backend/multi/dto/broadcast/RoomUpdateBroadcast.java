package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomUpdateBroadcast {

    private String roomId;
    private String roomTitle;
    private Integer limitCount;
    private Integer currentCount;
    private String status; // "waiting", "playing"
    private Boolean isPrivate; // true = 비공개, false = 공개

    public RoomUpdateBroadcast(Room room) {
        this.roomId = room.getRoomId();
        this.roomTitle = room.getRoomTitle();
        this.limitCount = room.getLimitCount();
        this.currentCount = room.getCurrentCount();
        this.status = room.getStatus();
        this.isPrivate = room.getIsPrivate();
    }
}
