package kr.codenova.backend.multi.room;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private String roomId;
    private String roomTitle;
    private String language;
    private Integer limitCount;
    private Integer currentCount;
    private Boolean isPrivate;
    private String status; // "waiting", "playing"
    private String roomCode;
}
