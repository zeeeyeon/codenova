package kr.codenova.backend.single.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.VerifiedScorePayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class VerifiedScoreTokenProvider {

    @Value("${jwt.verified-secret}")
    private String secret;

    private Key signingKey;

    private static final long EXPIRATION_MILLIS = 3 * 60 * 1000;

    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(VerifiedScorePayload payload) {
        return Jwts.builder()
                .setSubject("verified-score")
                .claim("memberId", payload.memberId())
                .claim("codeId", payload.codeId())
                .claim("language", payload.language().name())
                .claim("typingSpeed", payload.typingSpeed())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MILLIS))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public VerifiedScorePayload parseToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return new VerifiedScorePayload(
                    claims.get("memberId", Integer.class),
                    claims.get("codeId", Integer.class),
                    Language.valueOf(claims.get("language", String.class)),
                    claims.get("typingSpeed", Double.class)
            );

        } catch (ExpiredJwtException e) {
            throw new CustomException(ResponseCode.EXPIRED_VERIFIED_TOKEN);
        } catch (Exception e) {
            throw new CustomException(ResponseCode.INVALID_VERIFIED_TOKEN);
        }
    }
}
