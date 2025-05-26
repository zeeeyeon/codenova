package kr.codenova.backend.meteor.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FallingWordResponse {
    private String word;
    private long fallDuration;
    private String timestamp;
}
