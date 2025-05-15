package kr.codenova.backend.meteor.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReadyWarningResponse {
    private final String message;

    public ReadyWarningResponse(String message) {
        this.message = message;
    }
}
