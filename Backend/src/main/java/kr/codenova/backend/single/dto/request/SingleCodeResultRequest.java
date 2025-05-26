package kr.codenova.backend.single.dto.request;

import kr.codenova.backend.common.enums.Language;

public record SingleCodeResultRequest(
        Integer codeId,
        Language language,
        double speed,
        int time
) {
}
