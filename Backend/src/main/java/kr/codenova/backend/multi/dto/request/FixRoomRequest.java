package kr.codenova.backend.multi.dto.request;

import kr.codenova.backend.multi.room.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FixRoomRequest {

    private String roomId;
    private String nickname;
    private String roomTitle;
    private String language;
    private Boolean isLocked;
    private Integer maxCount;


}
