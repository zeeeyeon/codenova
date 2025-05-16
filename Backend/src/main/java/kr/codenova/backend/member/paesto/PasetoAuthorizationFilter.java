package kr.codenova.backend.member.paesto;

import ch.qos.logback.core.subst.Token;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.entity.Member;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class PasetoAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PasetoAuthorizationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(PasetoVO.HEADER);

        if (header == null || !header.startsWith(PasetoVO.TOKEN_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.replace(PasetoVO.TOKEN_PREFIX, "");

        try {
            Token parsedToken = PasetoUtil.parseToken(token);

//            Integer userId = parsedToken.getClaim("memberId", Integer.class);
//            String nickname = parsedToken.getClaim("nickname", String.class);
//            String username = parsedToken.getClaim("id", String.class);

            // 권한 없으면 ROLE_USER 기본 설정
//            CustomMemberDetails userDetails = new CustomMemberDetails(
//                    Member.builder()
//                            .(userId, username, nickname), List.of(new SimpleGrantedAuthority("ROLE_USER"))
//            );

//            Authentication auth = new UsernamePasswordAuthenticationToken(
//                    userDetails, null, userDetails.getAuthorities()
//            );

//            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.warn("PASETO 토큰 검증 실패: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
