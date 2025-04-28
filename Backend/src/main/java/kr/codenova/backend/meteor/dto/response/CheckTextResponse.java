package kr.codenova.backend.meteor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CheckTextResponse {
    private String nickname;
    private String text;
    private boolean isCorrect;
    private int score;
}
