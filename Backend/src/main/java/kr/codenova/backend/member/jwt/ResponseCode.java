package kr.codenova.backend.member.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ResponseCode {

    SUCCESS_LOGIN(400, HttpStatus.OK, "로그인이 성공적으로 완료되었습니다."),
    FAIL_LOGIN(400, HttpStatus.BAD_REQUEST, "로그인에 실패했습니다."),
    EXISTED_USER_ID(200, HttpStatus.OK, "아미 존재하는 아이디입니다."),
    EXISTED_USER_NICKNAME(400, HttpStatus.BAD_REQUEST, "해당 닉네임은 이미 존재하는 닉네임 입니다."),
    GET_USER_PROFILE(200, HttpStatus.OK, "프로필 조회 성공했습니다.");
    private int code;
    private HttpStatus httpStatus;
    private String message;
}
