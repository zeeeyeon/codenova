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
public class ExitGameResponse {
    private String roomId;                   // 방 ID
    private UserInfo leftUser;               // 나간 사람
    private List<UserInfo> currentPlayers;   // 현재 남아있는 플레이어 목록
}
