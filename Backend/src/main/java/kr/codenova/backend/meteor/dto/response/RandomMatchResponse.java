package kr.codenova.backend.meteor.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import kr.codenova.backend.meteor.entity.user.UserInfo;
import java.util.List;

@Getter
@AllArgsConstructor
public class RandomMatchResponse {
    private String roomId;
    private List<UserInfo> players;
}
