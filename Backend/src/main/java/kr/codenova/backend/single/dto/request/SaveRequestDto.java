package kr.codenova.backend.single.dto.request;

public record SaveRequestDto(
        String verifiedToken,
        String requestId
) {}
