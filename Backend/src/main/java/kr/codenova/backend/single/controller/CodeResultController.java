package kr.codenova.backend.single.controller;

import jakarta.servlet.http.HttpServletRequest;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.VerifyResponseDto;
import kr.codenova.backend.single.dto.request.CodeResultRequest;
import kr.codenova.backend.single.service.impl.CodeResultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.CODE_RESULT_SUCCESS;

@Slf4j
@RestController
@RequestMapping("/api/single/code")
@RequiredArgsConstructor
public class CodeResultController {

    private final CodeResultService codeResultService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCodeResult(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody CodeResultRequest request, HttpServletRequest httpServletRequest) {
        Integer memberId = (memberDetails != null) ? memberDetails.getMember().getMemberId() : null;
        VerifyResponseDto response = codeResultService.verifyAndGenerateToken(request, memberId);

        String userType = "회원";


        log.info("게임_완료,유형:{},ID:{},닉네임:{},모드:{},언어:{},WPM:{},소요시간:{}ms,IP:{}",
                userType, memberId, memberDetails.getMember().getNickname(), "single", request.language(),
                response.typingSpeed(), httpServletRequest.getRemoteAddr());


        return new ResponseEntity<>(Response.create(CODE_RESULT_SUCCESS, response), CODE_RESULT_SUCCESS.getHttpStatus());
    }
}