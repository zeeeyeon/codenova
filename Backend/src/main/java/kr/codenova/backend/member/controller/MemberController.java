package kr.codenova.backend.member.controller;

import jakarta.validation.Valid;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.dto.SignupDto;
import kr.codenova.backend.member.dto.MemberProfileDto;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.member.jwt.Response;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static kr.codenova.backend.member.jwt.ResponseCode.GET_USER_PROFILE;

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
        return new ResponseEntity<>(HttpStatus.OK);
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

}

