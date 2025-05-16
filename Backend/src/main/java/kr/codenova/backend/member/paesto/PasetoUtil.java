package kr.codenova.backend.member.paesto;

import ch.qos.logback.core.subst.Token;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import dev.paseto.jpaseto.Paseto;
import dev.paseto.jpaseto.PasetoV2LocalBuilder;
import dev.paseto.jpaseto.Pasetos;
import io.jsonwebtoken.io.Decoders;
import kr.codenova.backend.member.auth.CustomMemberDetails;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

public class PasetoUtil {


    private static final SecretKey secretKey = new SecretKeySpec(
            Decoders.BASE64.decode(PasetoVO.SECRET_KEY), "AES");

    public static String createToken(CustomMemberDetails loginMember) {
        PasetoV2LocalBuilder builder = Pasetos.V2.LOCAL.builder();

        return builder
                .setSharedSecret(secretKey) // 반드시 필요
                .setIssuedAt(new Date().toInstant())
                .setExpiration(new Date(System.currentTimeMillis() + PasetoVO.EXPIRATION_TIME).toInstant())
                .setSubject(loginMember.getUsername())
                .claim("memberId", loginMember.getMember().getMemberId())
                .claim("id", loginMember.getUsername())
                .claim("nickname", loginMember.getNickname())
                .compact();
    }


    public static Token parseToken(String token) {
        try {
            return (Token) Pasetos.parserBuilder() // PasetoParserBuilder 생성
                    .setSharedSecret(secretKey) // 대칭키 설정
                    .build()                   // PasetoParser 생성
                    .parse(token);            // 실제 복호화 및 검증 수행
        } catch (Exception e) {
            throw new RuntimeException("PASETO 토큰 파싱 실패", e);
        }
    }
}
