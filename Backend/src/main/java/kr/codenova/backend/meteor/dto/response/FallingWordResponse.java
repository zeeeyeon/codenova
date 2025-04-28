package kr.codenova.backend.meteor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FallingWordResponse {
    private String word;
    private long fallDuration;
}
