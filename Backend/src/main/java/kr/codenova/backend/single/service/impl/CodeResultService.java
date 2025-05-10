package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.single.dto.VerifiedScorePayload;
import kr.codenova.backend.single.dto.VerifyResponseDto;
import kr.codenova.backend.single.dto.request.CodeResultRequest;
import kr.codenova.backend.single.dto.response.CodeResultResponse;
import kr.codenova.backend.single.dto.response.ScoreResult;
import kr.codenova.backend.single.dto.response.SingleTypingResultResponse;
import kr.codenova.backend.single.entity.TypingSession;
import kr.codenova.backend.single.service.VerifiedScoreTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import static kr.codenova.backend.global.response.ResponseCode.*;

@Service
@RequiredArgsConstructor
public class CodeResultService {

    private final TypingSpeedService typingSpeedService;
    private final CodeRepository codeRepository;
    private final VerifiedScoreTokenProvider tokenProvider;

    public CodeResultResponse processCodeResult(Integer memberId, CodeResultRequest request) {
        String correctCode = getCorrectCode(request.codeId());
        TypingSession session = TypingSession.createFrom(request.keyLogs(), correctCode);

        if (session.isSuspicious()) throw new CustomException(CODE_RESULT_INVALID_INPUT);

        ScoreResult result = session.result();
        boolean isNew = false;
        if (memberId != null) isNew = typingSpeedService.saveIfNewRecord(memberId, request.language(), result.typingSpeed());

        return new CodeResultResponse(isNew ? CODE_RESULT_HIGHEST_UPDATE : CODE_RESULT_SUCCESS, new SingleTypingResultResponse(isNew, result.typingSpeed()));
    }

    public ScoreResult calculateOnly(CodeResultRequest request) {
        String correctCode = getCorrectCode(request.codeId());
        TypingSession session = TypingSession.createFrom(request.keyLogs(), correctCode);

        if (session.isSuspicious()) throw new CustomException(CODE_RESULT_INVALID_INPUT);
        return session.result();
    }

    public VerifyResponseDto verifyAndGenerateToken(CodeResultRequest request, Integer memberId) {
        CodeResultResponse result = processCodeResult(memberId, request);

        if (memberId == null) return new VerifyResponseDto(result.responseData().typingSpeed(), null);
        VerifiedScorePayload payload = new VerifiedScorePayload(memberId, request.codeId(), request.language(), result.responseData().typingSpeed());
        String token = tokenProvider.generateToken(payload);

        return new VerifyResponseDto(result.responseData().typingSpeed(), token);
    }

    private String getCorrectCode(Integer codeId) {
        return codeRepository.findByCodeId(codeId)
                .orElseThrow(() -> new CustomException(CODE_NOT_FOUND)).getContent();
    }
}
