package kr.codenova.backend.multi.dto.broadcast;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomUpdateBroadcast {

    private String roomId;
    private String title;
    private Integer maxCount;
    private Integer currentCount;
    private String language;
    private String roomCode;
    private Boolean isStarted;
    private Boolean isLocked; // true = 비공개, false = 공개

    public static RoomUpdateBroadcast from(Room room) {
        return RoomUpdateBroadcast.builder()
                .roomId(room.getRoomId())
                .title(room.getRoomTitle())
                .maxCount(room.getMaxCount())
                .currentCount(room.getCurrentCount())
                .language(room.getLanguage())
                .isStarted(room.getIsStarted())
                .isLocked(room.getIsLocked())
                .roomCode(room.getRoomCode())
                .build();
    }
}
