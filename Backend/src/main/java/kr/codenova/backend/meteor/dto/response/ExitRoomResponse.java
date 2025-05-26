package kr.codenova.backend.meteor.dto.response;


import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExitRoomResponse {
    private String roomId;                   // 방 ID
    private UserInfo leftUser;               // 나간 사람
    private UserInfo newHost;                // (방장이 나갔을 때만) 새 호스트, 아니면 null
    private List<UserInfo> currentPlayers;   // 현재 남아있는 플레이어 목록
}
