package kr.codenova.backend.single.dto.response;

import kr.codenova.backend.global.response.ResponseCode;

public record CodeResultResponse(
        ResponseCode responseCode,
        SingleTypingResultResponse responseData
) {}