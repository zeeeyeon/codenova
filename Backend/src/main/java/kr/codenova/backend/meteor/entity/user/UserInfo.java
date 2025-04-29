package kr.codenova.backend.meteor.entity.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserInfo {
    private final String sessionId;
    private final String nickname;
    private final boolean isHost;
}
