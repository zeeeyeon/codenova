package kr.codenova.backend.member.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.entity.Member;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.regex.Pattern;


public class JwtProcess {
    private static final Logger log = LoggerFactory.getLogger(JwtProcess.class);
    private static final Pattern COOKIE_VALUE_PATTERN = Pattern.compile("[\\x00-\\x20\\x7F\\(\\)<>@,;:\\\"/\\[\\]\\?=\\{\\}]");

    // 토큰 생성 및 쿠키에 저장
    public static void createAndSetJwtCookie(HttpServletResponse response, CustomMemberDetails loginMember) {
        try {
            log.debug("디버그 : JwtProcess create() 시작");

            String jwtToken = JWT.create()
                    .withSubject(loginMember.getUsername())
                    .withIssuedAt(new Date()) // 토큰 발급 시간
                    .withExpiresAt(new Date(System.currentTimeMillis() + JwtVO.EXPIRATION_TIME))
                    .withClaim("memberId", loginMember.getMember().getMemberId())
                    .withClaim("id", loginMember.getUsername())
                    .withClaim("nickname", loginMember.getNickname())
                    .sign(Algorithm.HMAC512(JwtVO.SECRET));

            // 생성된 토큰에서 혹시 모를 공백 및 제어 문자 제거 + RFC 6265  Value 검사
            jwtToken = removeInvalidCharacters(jwtToken.trim());
            if (COOKIE_VALUE_PATTERN.matcher(jwtToken).find()) {
                throw new IllegalArgumentException("Invalid character in cookie value");
            }

            log.debug("디버그 : 생성된 토큰 = {}", jwtToken);

            // 쿠키에 저장
            ResponseCookie cookie = ResponseCookie.from("Authorization", jwtToken) // JwtVO.TOKEN_PREFIX 제거
                    .httpOnly(true) // JavaScript에서 접근 방지
                    .secure(true)  // HTTPS에서만 전송
                    .path("/")   // 쿠키 유효 경로
                    .maxAge(JwtVO.EXPIRATION_TIME / 1000) // 초 단위 (예: 60 * 60 * 24 * 7)
                    .sameSite("Strict") // CSRF 방지
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // return JwtVO.TOKEN_PREFIX + jwtToken; // 반환값 제거

        } catch (Exception e) {
            log.error("JWT 토큰 생성 실패: ", e);
            throw new RuntimeException("JWT Access Token 생성 실패");
        }
    }

    // 토큰 검증 및 쿠키에서 추출
    public static CustomMemberDetails verifyAndGetDetailsFromCookie(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        String token = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("Authorization".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) { // JwtVO.TOKEN_PREFIX 검사 제거
            log.error("쿠키에서 토큰을 찾을 수 없습니다.");
            throw new CustomException(ResponseCode.INVALID_TOKEN_FORMAT);
        }

        return verifyToken(token);
    }

    // 토큰 검증 로직 (기존 verify 메서드 추출)
    private static CustomMemberDetails verifyToken(String token) {
        try {
            // 입력된 토큰 로깅
            log.debug("검증할 원본 토큰: {}", token);

            // Bearer 제거된 토큰 로깅
            // String jwtToken = token.replace(JwtVO.TOKEN_PREFIX, ""); // 제거
            String jwtToken = token;
            log.debug("Bearer 제거된 토큰: {}", jwtToken);

            // 사용되는 시크릿 키 로깅 (개발환경에서만 사용)
            log.debug("사용되는 시크릿 키 길이: {}", JwtVO.SECRET.length());

            // JWT 검증 시도
            log.debug("JWT 검증 시작...");
            DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC512(JwtVO.SECRET))
                    .acceptLeeway(5) // 5초의 시간 오차 허용
                    .build()
                    .verify(jwtToken);

            // 검증 성공 시 토큰 내용 로깅
            log.debug("JWT 검증 성공. 발행일: {}, 만료일: {}",
                    decodedJWT.getIssuedAt(),
                    decodedJWT.getExpiresAt());

            Integer memberId = decodedJWT.getClaim("memberId").asInt();
            String id = decodedJWT.getClaim("id").asString();
            String nickname = decodedJWT.getClaim("nickname").asString();

            log.debug("토큰에서 추출된 정보 - id: {}", memberId);

            if (memberId == null || id == null) {
                throw new CustomException(ResponseCode.MISSING_MANDATORY_CLAIMS);
            }

            Member member = Member.builder()
                    .memberId(memberId)
                    .id(id)
                    .nickname(nickname)
                    .build();

            return new CustomMemberDetails(member);

        } catch (TokenExpiredException e) {
            log.error("토큰이 만료됨. 만료시간: {}", e.getExpiredOn());
            throw new RuntimeException("만료된 토큰입니다.");

        } catch (SignatureVerificationException e) {
            log.error("JWT 서명 검증 실패. 원인: {}", e.getMessage());
            throw new RuntimeException("토큰 서명이 유효하지 않습니다.");

        } catch (JWTDecodeException e) {
            log.error("JWT 디코딩 실패. 유효하지 않은 토큰 형식. 원인: {}", e.getMessage());
            throw new RuntimeException("유효하지 않은 토큰 형식입니다.");

        } catch (JWTVerificationException e) {
            log.error("JWT 검증 실패. 원인: {}", e.getMessage());
            throw new RuntimeException("토큰 검증에 실패했습니다: " + e.getMessage());

        } catch (Exception e) {
            log.error("예상치 못한 에러 발생: ", e);
            throw new RuntimeException("토큰 처리 중 오류가 발생했습니다.");
        }
    }

    // 토큰 생성 (기존 create 메서드 - 필요하다면 남겨두거나 삭제)
    public static String create(CustomMemberDetails loginMember) {
        try {
            log.debug("디버그 : JwtProcess create() 시작");

            String jwtToken = JWT.create()
                    .withSubject(loginMember.getUsername())
                    .withIssuedAt(new Date()) // 토큰 발급 시간
                    .withExpiresAt(new Date(System.currentTimeMillis() + JwtVO.EXPIRATION_TIME))
                    .withClaim("memberId", loginMember.getMember().getMemberId())
                    .withClaim("id", loginMember.getUsername())
                    .withClaim("nickname", loginMember.getNickname())
                    .sign(Algorithm.HMAC512(JwtVO.SECRET));

            log.debug("디버그 : 생성된 토큰 = {}", jwtToken);
            return JwtVO.TOKEN_PREFIX + jwtToken;

        } catch (Exception e) {
            log.error("JWT 토큰 생성 실패: ", e);
            throw new RuntimeException("JWT Access Token 생성 실패");
        }
    }

    // 토큰 검증 (기존 verify 메서드 - 필요하다면 남겨두거나 삭제)
    public static CustomMemberDetails verify(String token) {
        if (token == null || !token.startsWith(JwtVO.TOKEN_PREFIX)) {
            log.error("토큰이 null이거나 Bearer로 시작하지 않습니다. token: {}", token);
            throw new CustomException(ResponseCode.INVALID_TOKEN_FORMAT);
        }

        try {
            // 입력된 토큰 로깅
            log.debug("검증할 원본 토큰: {}", token);

            // Bearer 제거된 토큰 로깅
            String jwtToken = token.replace(JwtVO.TOKEN_PREFIX, "");
            log.debug("Bearer 제거된 토큰: {}", jwtToken);

            // 사용되는 시크릿 키 로깅 (개발환경에서만 사용)
            log.debug("사용되는 시크릿 키 길이: {}", JwtVO.SECRET.length());

            // JWT 검증 시도
            log.debug("JWT 검증 시작...");
            DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC512(JwtVO.SECRET))
                    .acceptLeeway(5) // 5초의 시간 오차 허용
                    .build()
                    .verify(jwtToken);

            // 검증 성공 시 토큰 내용 로깅
            log.debug("JWT 검증 성공. 발행일: {}, 만료일: {}",
                    decodedJWT.getIssuedAt(),
                    decodedJWT.getExpiresAt());

            Integer memberId = decodedJWT.getClaim("memberId").asInt();
            String id = decodedJWT.getClaim("id").asString();
            String nickname = decodedJWT.getClaim("nickname").asString();

            log.debug("토큰에서 추출된 정보 - id: {}", memberId);

            if (memberId == null || id == null) {
                throw new CustomException(ResponseCode.MISSING_MANDATORY_CLAIMS);
            }

            Member member = Member.builder()
                    .memberId(memberId)
                    .id(id)
                    .nickname(nickname)
                    .build();

            return new CustomMemberDetails(member);

        } catch (TokenExpiredException e) {
            log.error("토큰이 만료됨. 만료시간: {}", e.getExpiredOn());
            throw new RuntimeException("만료된 토큰입니다.");

        } catch (SignatureVerificationException e) {
            log.error("JWT 서명 검증 실패. 원인: {}", e.getMessage());
            throw new RuntimeException("토큰 서명이 유효하지 않습니다.");

        } catch (JWTDecodeException e) {
            log.error("JWT 디코딩 실패. 유효하지 않은 토큰 형식. 원인: {}", e.getMessage());
            throw new RuntimeException("유효하지 않은 토큰 형식입니다.");

        } catch (JWTVerificationException e) {
            log.error("JWT 검증 실패. 원인: {}", e.getMessage());
            throw new RuntimeException("토큰 검증에 실패했습니다: " + e.getMessage());

        } catch (Exception e) {
            log.error("예상치 못한 에러 발생: ", e);
            throw new RuntimeException("토큰 처리 중 오류가 발생했습니다.");
        }
    }

    private static String removeInvalidCharacters(String value) {
        //  return value.replaceAll("[\\x00-\\x20\\x7F\\(\\)<>@,;:\\\"/\\[\\]\\?=\\{\\}]", "");
        StringBuilder cleanValue = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (!COOKIE_VALUE_PATTERN.matcher(String.valueOf(c)).matches()) {
                cleanValue.append(c);
            }
        }
        return cleanValue.toString();
    }
}