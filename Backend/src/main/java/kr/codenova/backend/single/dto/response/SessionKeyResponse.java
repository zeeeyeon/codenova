package kr.codenova.backend.single.dto.response;

import java.time.LocalDateTime;

public record SessionKeyResponse(
        String sessionKey,
        LocalDateTime expireAt
) {}