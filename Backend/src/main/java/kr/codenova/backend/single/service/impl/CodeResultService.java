package kr.codenova.backend.single.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.codenova.backend.common.enums.Language;
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
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;


import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
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
    private final S3AsyncClient s3AsyncClient;

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

        if (isSuspicious || session.getWpm() > 200) uploadLogToS3(session, requestId, memberId, request.codeId(), request.language());

        if (isSuspicious) throw new CustomException(CODE_RESULT_INVALID_INPUT);
        if (memberId == null) return new VerifyResponseDto(result.typingSpeed(), null);


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
            byte[] keyBytes = Base64.getDecoder().decode(sessionKey);
            byte[] combined = Base64.getDecoder().decode(encryptedData.data());

            if (keyBytes.length != 16) {
                throw new CustomException(SESSION_KEY_EXPIRED);
            }

            byte[] ivBytes = Arrays.copyOfRange(combined, 0, 16);
            byte[] cipherBytes = Arrays.copyOfRange(combined, 16, combined.length);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(ivBytes);

            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivSpec);

            byte[] decryptedBytes = cipher.doFinal(cipherBytes);
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

    private void uploadLogToS3(TypingSession session, String requestId, Integer memberId, Integer codeId, Language language) {
        String s3Key = String.format("keyLog/%s/member-%s-code-%s.json", LocalDate.now(), memberId, codeId);
        String jsonBody = session.createLogToJson(requestId, memberId, codeId, language);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket("code-nova")
                .key(s3Key)
                .contentType("application/json")
                .build();

        s3AsyncClient.putObject(request, AsyncRequestBody.fromString(jsonBody))
                .thenAccept(response -> log.info("S3 업로드 완료 key={} ETag={}", s3Key, response.eTag()))
                .exceptionally(ex -> {
                    log.warn("S3 업로드 실패 - memberId={} codeId={} error={}",
                            memberId, codeId, ex.getMessage());
                    return null;
                });
    }
}
