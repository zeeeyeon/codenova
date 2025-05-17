package kr.codenova.backend.single.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final S3AsyncClient s3AsyncClient;

    public CompletableFuture<Void> uploadKeyLog(String bucket, String key, String body) {
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("application/json")
                .build();

        return s3AsyncClient.putObject(putRequest, AsyncRequestBody.fromString(body))
                .thenAccept(response -> log.info("✅ S3 Upload 완료: {}", response.eTag()))
                .exceptionally(ex -> {
                    log.error("S3 Upload 실패: {}", ex.getMessage());
                    return null;
                });
    }
}
