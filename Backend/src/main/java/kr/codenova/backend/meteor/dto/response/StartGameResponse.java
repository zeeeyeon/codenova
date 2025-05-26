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
    private int initialLives;
    private long initialDropInterval; // 새로운 단어 스폰 간격(밀리초 단위)
    private long initialFallDuration; // 한 단어가 바닥까지 도달하는게 걸리는 시간
    private String message;
}
