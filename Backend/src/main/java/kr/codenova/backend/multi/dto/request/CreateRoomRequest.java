package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String title;
    private String nickname;
    private String language;
    private Integer maxNum;
//    @JsonProperty("isPrivate")
    private Boolean isLocked;
}
