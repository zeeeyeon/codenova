package kr.codenova.backend.member.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.dto.LoginDto;
import kr.codenova.backend.member.dto.LoginResDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;

import static kr.codenova.backend.global.response.ResponseCode.FAIL_LOGIN;
import static kr.codenova.backend.global.response.ResponseCode.SUCCESS_LOGIN;

public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private Logger log = LoggerFactory.getLogger(getClass());
    private final AuthenticationManager authenticationManager;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        this.objectMapper = new ObjectMapper();
        setFilterProcessesUrl("/api/member/login");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        log.debug("디버그 : attemptAuthentication 시작");

        try {
            LoginDto loginDto = objectMapper.readValue(request.getInputStream(), LoginDto.class);

            // 기본 유효성 검사
            if (loginDto.getId() == null || loginDto.getPassword() == null) {
                throw new BadCredentialsException("아이디와 비밀번호를 모두 입력해주세요.");
            }

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    loginDto.getId(),
                    loginDto.getPassword()
            );

            // 추가 요청 데이터 설정
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            try {
                return authenticationManager.authenticate(authenticationToken);
            } catch (BadCredentialsException e) {
                throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
            }
        } catch (IOException e) {
            log.error("로그인 요청 처리 중 오류 발생: ", e);
            throw new InternalAuthenticationServiceException("로그인 처리 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authResult) throws IOException, ServletException {

        CustomMemberDetails userDetails = (CustomMemberDetails) authResult.getPrincipal();
        log.info("로그인 성공: memberId={}, id={}, nickname={}",
                userDetails.getMember().getMemberId(),
                userDetails.getMember().getId(),
                userDetails.getMember().getNickname());

        String token = JwtProcess.create(userDetails);
        LoginResDto dto = new LoginResDto(userDetails.getNickname());

        Response<?> responseBody = Response.create(SUCCESS_LOGIN, dto);

        response.addHeader("Authorization", token);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(SUCCESS_LOGIN.getHttpStatus().value());

        objectMapper.writeValue(response.getWriter(), responseBody);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                              AuthenticationException failed) throws IOException {
        Response<?> errorResponse = Response.create(FAIL_LOGIN, null);

        response.setStatus(FAIL_LOGIN.getHttpStatus().value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
