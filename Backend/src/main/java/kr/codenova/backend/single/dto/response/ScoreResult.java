package kr.codenova.backend.single.dto.response;

public record ScoreResult(
        int charCount,
        long durationMillis,
        double typingSpeed,
        double accuracy
) {}