package kr.codenova.backend.single.controller;

import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.VerifyResponseDto;
import kr.codenova.backend.single.dto.request.CodeResultRequest;
import kr.codenova.backend.single.service.impl.CodeResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.CODE_RESULT_SUCCESS;

@RestController
@RequestMapping("/api/single/code")
@RequiredArgsConstructor
public class CodeResultController {

    private final CodeResultService codeResultService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCodeResult(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody CodeResultRequest request) {
        Integer memberId = (memberDetails != null) ? memberDetails.getMember().getMemberId() : null;
        VerifyResponseDto response = codeResultService.verifyAndGenerateToken(request, memberId);
        return new ResponseEntity<>(Response.create(CODE_RESULT_SUCCESS, response), CODE_RESULT_SUCCESS.getHttpStatus());
    }
}
