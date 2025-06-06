package kr.codenova.backend.member.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.annotation.Loggable;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.member.dto.GuestLoginDto;
import kr.codenova.backend.member.dto.ProfileUpdateDto;
import kr.codenova.backend.member.dto.SignupDto;
import kr.codenova.backend.member.dto.MemberProfileDto;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.member.service.MemberService;
import kr.codenova.backend.member.util.CustomResponseUtil;
import kr.codenova.backend.single.entity.TypingSpeed;
import kr.codenova.backend.single.repository.TypingSpeedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

import static kr.codenova.backend.global.response.ResponseCode.*;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final TypingSpeedRepository typingSpeedRepository;
    private final StringRedisTemplate redisTemplate;
    private static final Logger log = LoggerFactory.getLogger(CustomResponseUtil.class);

    // 일반 사용자 회원가입
    @Loggable(event = "user_signup")
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody @Valid SignupDto signupDto, HttpServletRequest request) {
        memberService.signUp(signupDto);

        log.info("회원_가입,ID:{},닉네임:{},IP:{}",
                signupDto.getId(),
                signupDto.getNickname(),
                request.getRemoteAddr());

        return new ResponseEntity<>(Response.create(SUCCESS_SIGNUP, null), SUCCESS_SIGNUP.getHttpStatus());
    }

    @Loggable(event = "user_visit")
    @GetMapping("/profile")
    public ResponseEntity<?> findUserProfile(@AuthenticationPrincipal CustomMemberDetails memberDetails) {
        String id = memberDetails.getMember().getId();
        System.out.println("🔥 요청된 ID: " + id);
        Member member = memberRepository.findByIdColumn(id).orElseThrow(
                () -> new IllegalArgumentException("존재하지 않는 회원입니다: " + id)
        );

        // 각 언어별 TypingSpeed 가져오기
        // null 이면 0점으로 처리하기
        List<TypingSpeed> typingSpeeds = typingSpeedRepository.findAllByMemberId(member.getMemberId());
        Map<Language, Double> scoreMap = typingSpeeds.stream()
                .collect(Collectors.toMap(TypingSpeed::getLanguage, TypingSpeed::getTypingSpeed));

        List<MemberProfileDto.UserScore> scoreList = new ArrayList<>();
        for (String langStr : Language.toLanguageList()) {
            Language lang = Language.valueOf(langStr);
            scoreList.add(new MemberProfileDto.UserScore(lang, scoreMap.getOrDefault(lang, 0.0)));
        }

        MemberProfileDto responseDto = new MemberProfileDto(member, scoreList);
        return new ResponseEntity<>(Response.create(GET_USER_PROFILE, responseDto), GET_USER_PROFILE.getHttpStatus());
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updatePhoneNum(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody ProfileUpdateDto dto) {
        Member findMember = memberRepository.findByIdColumn(memberDetails.getMember().getId())
                .orElseThrow(() -> new CustomException(NOT_FOUND_USER));

        String beforeNickname = findMember.getNickname();
        findMember.updateProfile(dto);
        memberRepository.save(findMember);

        if (!beforeNickname.equals(findMember.getNickname())) {
            String memberIdStr = String.valueOf(findMember.getMemberId());
            redisTemplate.opsForHash().put("user:nickname", memberIdStr, findMember.getNickname());
        }
        return new ResponseEntity<>(
                Response.create(ResponseCode.SUCCESS_CHANGE_PROFILE, findMember), SUCCESS_CHANGE_PROFILE.getHttpStatus()
        );
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
        boolean available = memberService.isNicknameAvailable(nickname);
        ResponseCode code = available ? ResponseCode.AVAILABLE_NICKNAME : ResponseCode.EXISTED_USER_NICKNAME;
        return new ResponseEntity<>(
                Response.create(code, null),
                code.getHttpStatus()
        );
    }

    @Loggable(event = "user_visit")
    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin(HttpServletResponse response, HttpServletRequest request) {
        String guestId = UUID.randomUUID().toString();
        String token = "Bearer " + guestId;
        GuestLoginDto guestInfo = memberService.guestLogin();
        response.addHeader("Authorization", token);

        log.info("비회원 로그인: nickname={}, ip={}, 시간={}",
                guestInfo.getNickname(),
                request.getRemoteAddr(),
                new Date());

        return new ResponseEntity<>(Response.create(SUCCESS_LOGIN, guestInfo), SUCCESS_LOGIN.getHttpStatus());
    }
}

