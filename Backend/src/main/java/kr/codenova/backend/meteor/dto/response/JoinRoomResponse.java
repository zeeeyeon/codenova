package kr.codenova.backend.meteor.dto.response;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;


@Getter
@AllArgsConstructor
public class JoinRoomResponse {
    private final String roomId;
    private final List<UserInfo> players;
}