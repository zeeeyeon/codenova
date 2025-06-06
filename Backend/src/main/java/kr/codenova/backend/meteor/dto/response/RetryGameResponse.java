package kr.codenova.backend.meteor.dto.response;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.Builder;
import lombok.Getter;


import java.util.List;

@Getter
@Builder
public class RetryGameResponse {
    private String roomId;
    private List<UserInfo> players;
    private int readyCount;
    private boolean allReady;

}
