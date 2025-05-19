package kr.codenova.backend.single.service.impl;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.single.entity.TypingSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3LogUploader {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public void uploadLogToS3(TypingSession session, String requestId, Integer memberId, Integer codeId, Language language) {
        String today = LocalDate.now().toString();
        String time = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = String.format("member-%s-%s-code-%s-%s.json", memberId, language.name(), codeId, time);
        String s3Key = String.format("keyLog/%s/logs/%s", today, fileName);

        String jsonBody = session.createLogToJson(requestId, memberId, codeId, language);

        try {
            byte[] contentAsBytes = jsonBody.getBytes(StandardCharsets.UTF_8);
            ByteArrayInputStream inputStream = new ByteArrayInputStream(contentAsBytes);

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("application/json");
            metadata.setContentLength(contentAsBytes.length);

            amazonS3.putObject(bucket, s3Key, inputStream, metadata);
            log.info("S3 로그 업로드 완료 key={}", s3Key);
        } catch (Exception e) {
            log.warn("S3 로그 업로드 실패 - memberId={} codeId={} error={}", memberId, codeId, e.getMessage());
        }
    }

}