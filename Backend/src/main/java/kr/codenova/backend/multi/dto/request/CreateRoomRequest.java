package kr.codenova.backend.multi.dto.request;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String roomTitle;
    private String language;
    private Integer limit;
//    @JsonProperty("isPrivate")
    private Boolean isPrivate;
}
