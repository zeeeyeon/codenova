package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.single.dto.response.SessionKeyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SessionKeyService {

    private static final long SESSION_KEY_EXPIRE_SECONDS = 3600L;
    private final StringRedisTemplate redisTemplate;

    public SessionKeyResponse generateSessionKey(Integer memberId) {
        String cacheKey = "sessionKey:" + memberId;
        String existingSessionKey = redisTemplate.opsForValue().get(cacheKey);

        if (existingSessionKey != null) {
            byte[] decoded = Base64.getDecoder().decode(existingSessionKey);
            if (decoded.length != 16) {
                redisTemplate.delete(cacheKey);
            } else {
                return new SessionKeyResponse(existingSessionKey, LocalDateTime.now().plusSeconds(SESSION_KEY_EXPIRE_SECONDS));
            }
        }

        String rawKey = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String encodedKey = Base64.getEncoder().encodeToString(rawKey.getBytes(StandardCharsets.UTF_8));
        redisTemplate.opsForValue().set(cacheKey, encodedKey, SESSION_KEY_EXPIRE_SECONDS, TimeUnit.SECONDS);

        return new SessionKeyResponse(encodedKey, LocalDateTime.now().plusSeconds(SESSION_KEY_EXPIRE_SECONDS));
    }



    public String getSessionKey(Integer memberId) {
        return redisTemplate.opsForValue().get("sessionKey:" + memberId);
    }
}
