package kr.codenova.backend.multi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomListResponse {

    private String roomId;
    private String title;
    private Integer currentCount;
    private Integer maxCount;
    private String language;
    private Boolean isLocked;
    private Boolean isStarted;
}
