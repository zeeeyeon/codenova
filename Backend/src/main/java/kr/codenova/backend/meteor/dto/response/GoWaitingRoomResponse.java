package kr.codenova.backend.meteor.dto.response;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class GoWaitingRoomResponse {
    private String roomId;
    private String roomCode;
    private List<UserInfo> players;
}
