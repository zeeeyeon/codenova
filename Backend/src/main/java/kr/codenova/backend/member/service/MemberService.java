package kr.codenova.backend.member.service;

import kr.codenova.backend.member.dto.GuestLoginDto;
import kr.codenova.backend.member.dto.SignupDto;

public interface MemberService {
    void signUp(SignupDto signupDto);
    boolean isIdExist(String id);
    boolean isNicknameAvailable(String nickname);
    GuestLoginDto guestLogin();
}
