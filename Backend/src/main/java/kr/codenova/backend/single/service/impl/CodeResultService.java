package kr.codenova.backend.single.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.VerifiedScorePayload;
import kr.codenova.backend.single.dto.VerifyResponseDto;
import kr.codenova.backend.single.dto.request.CodeResultRequest;
import kr.codenova.backend.single.dto.request.EncryptedRequest;
import kr.codenova.backend.single.dto.response.CodeResultResponse;
import kr.codenova.backend.single.dto.response.ScoreResult;
import kr.codenova.backend.single.dto.response.SingleTypingResultResponse;
import kr.codenova.backend.single.entity.TypingSession;
import kr.codenova.backend.single.service.VerifiedScoreTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;


import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static kr.codenova.backend.global.response.ResponseCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeResultService {

    private final TypingSpeedService typingSpeedService;
    private final CodeRepository codeRepository;
    private final VerifiedScoreTokenProvider tokenProvider;
    private final StringRedisTemplate redisTemplate;

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
        String correctCode = getCorrectCode(request.codeId());
        TypingSession session = TypingSession.createFrom(request.keyLogs(), correctCode);
        String requestId = request.requestId();

        boolean isSuspicious = session.isSuspicious();
        ScoreResult result = session.result();

        String keyLogsJson = session.keyLogsToJsonString();

        log.info("event=macro_detection_summary requestId={} memberId={} codeId={} language={} totalKeys={} durationMs={} wpm={} isSuspicious={} tooFast={} tooConsistent={} insaneSpeed={} flawlessFast={} accuracySuspicious={} hasSimultaneousInput={} backspaceCount={} keyLogs={}",
                requestId, memberId, request.codeId(), request.language(),
                session.getKeyLogs().size(), session.getTotalMillis(), session.getWpm(), isSuspicious,
                session.isTooFast(), session.isTooConsistent(), session.isInsaneSpeed(), session.isFlawlessFast(),
                session.isAccuracySuspicious(), session.isHasSimultaneousInput(), session.getBackspaceCount(),
                keyLogsJson);

        if (isSuspicious) {
            throw new CustomException(CODE_RESULT_INVALID_INPUT);
        }

        if (memberId == null) {
            return new VerifyResponseDto(result.typingSpeed(), null);
        }

        VerifiedScorePayload payload = new VerifiedScorePayload(memberId, request.codeId(), request.language(), result.typingSpeed());
        String token = tokenProvider.generateToken(payload);

        return new VerifyResponseDto(result.typingSpeed(), token);
    }

    public CodeResultRequest decryptPayload(EncryptedRequest encryptedData, Integer memberId) {
        String cacheKey = "sessionKey:" + memberId;
        String sessionKey = redisTemplate.opsForValue().get(cacheKey);

        if (sessionKey == null) {
            log.warn("event=session_key_expired userId={}", memberId);
            throw new CustomException(ResponseCode.SESSION_KEY_EXPIRED);
        }

        try {
            Cipher cipher = Cipher.getInstance("AES");
            SecretKeySpec secretKeySpec = new SecretKeySpec(sessionKey.getBytes(StandardCharsets.UTF_8), "AES");

            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(String.valueOf(encryptedData)));

            String decryptedJson = new String(decryptedBytes, StandardCharsets.UTF_8);

            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(decryptedJson, CodeResultRequest.class);

        } catch (Exception e) {
            log.error("event=session_key_decrypt_fail memberId={} error={} encryptedData={}", memberId, e.getMessage(), encryptedData, e);
            throw new CustomException(ResponseCode.SESSION_KEY_DECRYPT_FAIL);
        }
    }

    private String getCorrectCode(Integer codeId) {
        return codeRepository.findByCodeId(codeId)
                .orElseThrow(() -> new CustomException(CODE_NOT_FOUND)).getContent();
    }
}
