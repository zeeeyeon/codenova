package kr.codenova.backend.meteor.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomResponse {
    private String roomId;
    @JsonProperty("isPrivate") // 명시적으로 Json에선 isPrivate으로 직렬화
    private boolean isPrivate;
    @JsonProperty("isHost")
    private boolean isHost;
    private String roomCode;
}
