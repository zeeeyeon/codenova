package kr.codenova.backend.meteor.dto.response;

import lombok.Builder;
import lombok.Data;
import kr.codenova.backend.meteor.entity.user.UserInfo;

import java.util.List;

@Data
@Builder
public class GameReadyResponse {
    private boolean allReady;
    private final List<UserInfo> players;
}
