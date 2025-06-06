package kr.codenova.backend.member.service.impl;

import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.member.dto.GuestLoginDto;
import kr.codenova.backend.member.dto.SignupDto;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.member.service.MemberService;
import kr.codenova.backend.member.util.GenerateGuestNickname;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void signUp(SignupDto signupDto) {
        // 1) 해당 사용자의 입력 아이디가 이미 존재하는 계정인지 확인
        Optional<Member> existedMember = memberRepository.findByIdColumn(signupDto.getId());
        if(existedMember.isPresent()) {
            throw new CustomException(ResponseCode.EXISTED_USER_ID);
        }
        // 2) 해당 사용자의 입력 닉네임이 이미 존재하는 계정인지 확인
        Optional<Member> existedUserNickname = memberRepository.findByNickname(signupDto.getNickname());
        if(existedUserNickname.isPresent()) {
            throw new CustomException(ResponseCode.EXISTED_USER_NICKNAME);
        }

        // 1, 2 해당 사항이 없다면 정상적으로 회원가입 진행
        memberRepository.save(signupDto.toUserEntity(passwordEncoder));

    }
    @Override
    public boolean isIdExist(String idColumn) {
        return memberRepository.findByIdColumn(idColumn).isEmpty();
    }

    @Override
    public boolean isNicknameAvailable(String nickname) {
        return memberRepository.findByNickname(nickname).isEmpty();
    }

    @Override
    public GuestLoginDto guestLogin() {
        String nickname = new GenerateGuestNickname().guestNickname();
        String userType = "guest";
        return new GuestLoginDto(nickname, userType);
    }
}
