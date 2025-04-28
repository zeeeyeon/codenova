package kr.codenova.backend.meteor.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PlayerResult {
    private String nickname;
    private int correctCount;
}
