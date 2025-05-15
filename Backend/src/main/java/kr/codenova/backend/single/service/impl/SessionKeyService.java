package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.single.dto.response.SessionKeyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SessionKeyService {

    private static final long SESSION_KEY_EXPIRE_SECONDS = 3600L;
    private final StringRedisTemplate redisTemplate;

    public SessionKeyResponse generateSessionKey(Integer memberId) {
        String cacheKey = "sessionKey:" + memberId;
        String sessionKey = redisTemplate.opsForValue().get(cacheKey);

        if (sessionKey != null) return new SessionKeyResponse(sessionKey, LocalDateTime.now().plusSeconds(SESSION_KEY_EXPIRE_SECONDS));

        sessionKey = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        redisTemplate.opsForValue().set(cacheKey, sessionKey, SESSION_KEY_EXPIRE_SECONDS, TimeUnit.SECONDS);

        return new SessionKeyResponse(sessionKey, LocalDateTime.now().plusSeconds(SESSION_KEY_EXPIRE_SECONDS));
    }

    public String getSessionKey(Integer memberId) {
        return redisTemplate.opsForValue().get("sessionKey:" + memberId);
    }
}
