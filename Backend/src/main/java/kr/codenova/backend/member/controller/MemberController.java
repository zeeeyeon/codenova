package kr.codenova.backend.member.controller;

import jakarta.validation.Valid;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.dto.GuestLoginDto;
import kr.codenova.backend.member.dto.SignupDto;
import kr.codenova.backend.member.dto.MemberProfileDto;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static kr.codenova.backend.global.response.ResponseCode.*;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;

    // 일반 사용자 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody @Valid SignupDto signupDto) {
        memberService.signUp(signupDto);
        return new ResponseEntity<>(Response.create(SUCCESS_SIGNUP, null), SUCCESS_SIGNUP.getHttpStatus());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> findUserProfile(@AuthenticationPrincipal CustomMemberDetails memberDetails) {
        String id = memberDetails.getMember().getId();
        System.out.println("🔥 요청된 ID: " + id);
        Member member = memberRepository.findByIdColumn(id).orElseThrow(
                () -> new IllegalArgumentException("존재하지 않는 회원입니다: " + id)
        );
        MemberProfileDto responseDto = new MemberProfileDto(member);
        return new ResponseEntity<>(Response.create(GET_USER_PROFILE, responseDto), GET_USER_PROFILE.getHttpStatus());
    }

    @GetMapping("/check-id/{id}")
    public ResponseEntity<?> checkId(@PathVariable String id) {
        boolean available = memberService.isIdExist(id);
        ResponseCode code = available ? ResponseCode.AVAILABLE_ID : ResponseCode.EXISTED_USER_ID;
        return new ResponseEntity<>(
                Response.create(code, null),
                code.getHttpStatus()
        );
    }

    @GetMapping("/check-nickname/{nickname}")
    public ResponseEntity<?> checkNickname(@PathVariable String nickname) {
        boolean available = memberService.isNicknameExist(nickname);
        ResponseCode code = available ? ResponseCode.AVAILABLE_NICKNAME : ResponseCode.EXISTED_USER_NICKNAME;
        return new ResponseEntity<>(
                Response.create(code, null),
                code.getHttpStatus()
        );
    }
    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        GuestLoginDto guestInfo = memberService.guestLogin();
        return new ResponseEntity<>(Response.create(SUCCESS_LOGIN, guestInfo), SUCCESS_LOGIN.getHttpStatus());
    }
}

