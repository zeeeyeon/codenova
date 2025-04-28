package kr.codenova.backend.meteor.dto.response;


import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StartGameResponse {
    private String roomId;
    private List<UserInfo> players;
    private List<String> fallingWords;
    private String message;
}
