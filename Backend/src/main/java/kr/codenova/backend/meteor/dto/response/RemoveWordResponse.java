package kr.codenova.backend.meteor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RemoveWordResponse {
    private String word;
    private Integer lifesLeft;
}
