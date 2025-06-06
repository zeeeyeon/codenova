package kr.codenova.backend.single.dto;

import kr.codenova.backend.common.enums.Language;

public record VerifiedScorePayload(
        Integer memberId,
        Integer codeId,
        Language language,
        double typingSpeed
) {}
