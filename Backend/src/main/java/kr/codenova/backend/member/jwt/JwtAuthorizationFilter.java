package kr.codenova.backend.member.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.io.IOException;

public class JwtAuthorizationFilter extends BasicAuthenticationFilter {
    private final Logger log = LoggerFactory.getLogger(getClass());
    private final ObjectMapper objectMapper = new ObjectMapper();


    public JwtAuthorizationFilter(AuthenticationManager authenticationManager) {
        super(authenticationManager);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        log.debug("디버그 : JwtAuthorizationFilter doFilterInternal()");

        // 1. 쿠키에서 토큰 검증 후 임시 세션 생성
        if (isCookieVerify(request, response)) { // 토큰이 존재한다.
            log.debug("디버그 : Jwt 토큰 검증 성공");
            // 토큰 파싱하기 (Bearer 없애기)
            String token = getTokenFromCookie(request);
            CustomMemberDetails loginUser = JwtProcess.verify(token); // 토큰 검증

            // 임시 세션 (UserDetails 타입 or username(현재 null이라 넣을 수 없음))
            Authentication authentication = new UsernamePasswordAuthenticationToken(loginUser,
                    null, loginUser.getAuthorities()/* 권한 */);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        // 2. 세션이 있는 경우와 없는 경우로 나뉘어서 컨트롤러로 진입함
        chain.doFilter(request, response);
    }

    private boolean isCookieVerify(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return false;

        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("Authorization") && cookie.getValue().startsWith(JwtVO.TOKEN_PREFIX)) {
                return true;
            }
        }
        return false;
    }

    private String getTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("Authorization")) {
                    return cookie.getValue().replace(JwtVO.TOKEN_PREFIX, "");
                }
            }
        }
        return null;
    }
}
