package kr.codenova.backend.single.dto.response;

public record SingleTypingResultResponse(
        boolean isNewRecord,
        double typingSpeed
) {
}
