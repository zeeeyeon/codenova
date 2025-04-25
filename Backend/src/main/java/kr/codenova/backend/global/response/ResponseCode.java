package kr.codenova.backend.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ResponseCode {

    SUCCESS_LOGIN(200, HttpStatus.OK, "로그인이 성공적으로 완료되었습니다."),
    SUCCESS_SIGNUP(200, HttpStatus.OK, "회원가입이 성공적으로 완료되었습니다."),
    FAIL_LOGIN(400, HttpStatus.OK, "로그인에 실패했습니다."),
    EXISTED_USER_ID(400, HttpStatus.OK, "아미 존재하는 아이디입니다."),
    EXISTED_USER_NICKNAME(400, HttpStatus.OK, "해당 닉네임은 이미 존재하는 닉네임 입니다."),
    GET_USER_PROFILE(200, HttpStatus.OK, "프로필 조회 성공했습니다."),

    // single
    GET_LANGUAGE_CATEGORIES_SUCCESS(200, HttpStatus.OK, "언어 카테고리 조회에 성공했습니다."),
    GET_CS_CATEGORIES_SUCCESS(200, HttpStatus.OK, "CS 카테고리 조회에 성공했습니다."),



    INVALID_TOKEN_FORMAT(401, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰 형식입니다."),
    MISSING_MANDATORY_CLAIMS(400, HttpStatus.BAD_REQUEST, "토큰에 필수 클레임이 없습니다."),


    BINDING_ERROR(2000, HttpStatus.BAD_REQUEST, "입력값 중 검증에 실패한 값이 있습니다."),
    BAD_REQUEST(2001, HttpStatus.BAD_REQUEST, "올바르지 않은 요청입니다."),
    ENTITY_NOT_FOUND(404, HttpStatus.NOT_FOUND, "요청하신 데이터를 찾을 수 없습니다.");
    private int code;
    private HttpStatus httpStatus;
    private String message;
}
