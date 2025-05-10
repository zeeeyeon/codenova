package kr.codenova.backend.single.dto;

public record VerifyResponseDto(
        double typingSpeed,
        String verifiedToken
) {}
