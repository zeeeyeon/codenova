package kr.codenova.backend.single.dto.request;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.single.dto.KeyLog;

import java.util.List;

public record CodeResultRequest(
        Integer codeId,
        Language language,
        List<KeyLog> keyLogs,
        String requestId
) {}

