package kr.codenova.backend.single.controller;

import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.VerifiedScorePayload;
import kr.codenova.backend.single.dto.request.SaveRequestDto;
import kr.codenova.backend.single.dto.response.SingleTypingResultResponse;
import kr.codenova.backend.single.service.VerifiedScoreTokenProvider;
import kr.codenova.backend.single.service.impl.TypingSpeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.*;

@RestController
@RequestMapping("/api/single/code")
@RequiredArgsConstructor
public class ScoreSavingController {

    private final VerifiedScoreTokenProvider tokenProvider;
    private final TypingSpeedService typingSpeedService;

    @PostMapping("/save")
    public ResponseEntity<?> saveCodeResult(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody SaveRequestDto request) {
        if (memberDetails == null || memberDetails.getMember() == null) throw new CustomException(FORBIDDEN_SAVE_RESULT_FOR_GUEST);
        VerifiedScorePayload payload = tokenProvider.parseToken(request.verifiedToken());
        int memberId = memberDetails.getMember().getMemberId();
        boolean isNew = typingSpeedService.saveIfNewRecord(memberId, payload.language(), payload.typingSpeed());
        return new ResponseEntity<>(Response.create(isNew ? CODE_RESULT_HIGHEST_UPDATE : CODE_RESULT_SUCCESS, new SingleTypingResultResponse(isNew, payload.typingSpeed())), (isNew ? CODE_RESULT_HIGHEST_UPDATE : CODE_RESULT_SUCCESS).getHttpStatus());
    }
}
