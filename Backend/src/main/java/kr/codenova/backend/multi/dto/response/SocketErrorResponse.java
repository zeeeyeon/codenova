package kr.codenova.backend.multi.dto.response;

import lombok.Data;

@Data
public class SocketErrorResponse {
    private String message;

    public SocketErrorResponse(String message) {
        this.message = message;
    }
}
