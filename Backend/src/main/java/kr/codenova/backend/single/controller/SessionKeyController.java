package kr.codenova.backend.single.controller;

import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.response.SessionKeyResponse;
import kr.codenova.backend.single.service.impl.SessionKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.GET_SESSION_KEY;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionKeyController {

    private final SessionKeyService sessionKeyService;

    @GetMapping("/session-key")
    public ResponseEntity<?> getSessionKey(@AuthenticationPrincipal CustomMemberDetails memberDetails) {
        if (memberDetails == null || memberDetails.getMember() == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Integer memberId = memberDetails.getMember().getMemberId();
        SessionKeyResponse response = sessionKeyService.generateSessionKey(memberId);

        return new ResponseEntity<>(Response.create(GET_SESSION_KEY, response), GET_SESSION_KEY.getHttpStatus());
    }
}