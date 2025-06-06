package kr.codenova.backend.global.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {
    private String errorCode;     // 에러 코드 (예: "NO_EXIST_USER")
    private String message;       // 에러 메시지
    private String field;         // 어떤 필드에서 오류가 났는지 등
    private LocalDateTime timestamp; // 발생 시각 등 부가 정보
}
