package kr.codenova.backend.meteor.entity.user;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserInfo {
    private final String sessionId;
    private final String nickname;
}
