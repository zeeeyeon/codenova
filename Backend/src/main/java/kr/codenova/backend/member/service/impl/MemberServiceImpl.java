package kr.codenova.backend.member.service.impl;

import kr.codenova.backend.member.dto.SignupDto;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.member.jwt.ResponseCode;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
            throw new RuntimeException(String.valueOf(ResponseCode.EXISTED_USER_ID));
        }
        // 2) 해당 사용자의 입력 닉네임이 이미 존재하는 계정인지 확인
        Optional<Member> existedUserNickname = memberRepository.findByNickname(signupDto.getNickname());
        if(existedUserNickname.isPresent()) {
            throw new RuntimeException(String.valueOf(ResponseCode.EXISTED_USER_NICKNAME));
        }

        // 1, 2 해당 사항이 없다면 정상적으로 회원가입 진행
        memberRepository.save(signupDto.toUserEntity(passwordEncoder));

    }
}
