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
    INACTIVE_ACCOUNT(403, HttpStatus.FORBIDDEN, "비활성화된 계정입니다."),
    EXISTED_USER_ID(400, HttpStatus.OK, "아미 존재하는 아이디입니다."),
    EXISTED_USER_NICKNAME(400, HttpStatus.OK, "해당 닉네임은 이미 존재하는 닉네임 입니다."),
    NOT_FOUND_USER(400, HttpStatus.OK, "해당 사용자를 찾지 못하였습니다."),
    GET_USER_PROFILE(200, HttpStatus.OK, "프로필 조회 성공했습니다."),
    AVAILABLE_ID(200,HttpStatus.OK, "사용가능한 아이디입니다"),
    AVAILABLE_NICKNAME(200,HttpStatus.OK, "사용가능한 닉네임입니다"),
    SUCCESS_CHANGE_PROFILE(200, HttpStatus.OK, "프로필 수정에 성공했습니다."),
    GET_SESSION_KEY(200, HttpStatus.OK, "세션 키가 정상적으로 발급되었습니다."),

    // single
    GET_LANGUAGE_CATEGORIES_SUCCESS(200, HttpStatus.OK, "언어 카테고리 조회에 성공했습니다."),
    GET_CS_CATEGORIES_SUCCESS(200, HttpStatus.OK, "CS 카테고리 조회에 성공했습니다."),
    GET_SINGLE_BATTLE_CODE_BY_LANGUAGE(200, HttpStatus.OK, "선택한 언어에 맞는 싱글 배틀 코드입니다."),
    CODE_RESULT_SUCCESS(200, HttpStatus.OK, "싱글 코드배틀 결과입니다."),
    CODE_RESULT_HIGHEST_UPDATE(200, HttpStatus.OK, "최고 기록이 갱신되었습니다!"),
    GET_CS_CODE_BY_CATEGORY(200, HttpStatus.OK, "CS 문제 5개가 정상적으로 조회되었습니다."),
    CS_REPORT_CREATED(200, HttpStatus.OK, "CS 리포트가 정상적으로 생성되었습니다."),
    GET_REPORTS_SUCCESS(200, HttpStatus.OK, "리포트 목록 조회에 성공했습니다."),
    GET_REPORT_DETAIL_SUCCESS(200, HttpStatus.OK, "리포트 상세 조회에 성공했습니다."),
    GET_RANKING_SUCCESS(200, HttpStatus.OK, "랭킹 조회에 성공했습니다."),
    GET_CODE_DESCRIPTION(200, HttpStatus.OK, "선택한 코드의 설명입니다."),
    GET_CHATBOT_RESPONSE(200, HttpStatus.OK, "챗봇의 답변입니다."),
    INTERNAL_SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 에러입니다."),

    KEYLOG_TOO_SHORT(400, HttpStatus.BAD_REQUEST, "입력 기록이 부족합니다."),
    KEYLOG_INVALID_ORDER(400, HttpStatus.BAD_REQUEST, "입력 시간 순서가 올바르지 않습니다."),
    CODE_RESULT_INVALID_INPUT(400, HttpStatus.BAD_REQUEST, "입력 값이 잘못되었습니다"),
    CODE_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 언어에 대한 코드가 존재하지 않습니다."),
    FORBIDDEN_SAVE_RESULT_FOR_GUEST(403, HttpStatus.FORBIDDEN, "비회원은 기록을 저장할 수 없습니다."),
    GPT_RESPONSE_FAIL(502, HttpStatus.BAD_GATEWAY, "GPT 응답 처리에 실패했습니다."),
    REPORT_NOT_FOUND(404, HttpStatus.NOT_FOUND, "해당 리포트를 찾을 수 없습니다."),
    CODE_RESULT_FAIL(500, HttpStatus.INTERNAL_SERVER_ERROR, "점수 저장 실패"),
    SESSION_KEY_EXPIRED(401, HttpStatus.UNAUTHORIZED, "세션키가 만료되었습니다. 다시 시도해 주세요."),
    SESSION_KEY_DECRYPT_FAIL(400, HttpStatus.BAD_REQUEST, "데이터 복호화에 실패했습니다. 세션키를 다시 받아주세요."),


    INVALID_TOKEN_FORMAT(401, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰 형식입니다."),
    MISSING_MANDATORY_CLAIMS(400, HttpStatus.BAD_REQUEST, "토큰에 필수 클레임이 없습니다."),
    SUCCESS_CREATE_ROOM(201, HttpStatus.CREATED, "성공적으로 방이 생성되었습니다."),
    EXPIRED_VERIFIED_TOKEN(400, HttpStatus.BAD_REQUEST, "토큰이 만료되었습니다."),
    INVALID_VERIFIED_TOKEN(400, HttpStatus.BAD_REQUEST, "토큰이 유효하지 않습니다."),
    DUPLICATION_ROOM(400, HttpStatus.MULTI_STATUS, "이미 참여 중인 방이 있습니다. 먼저 기존 방에서 나가주세요."),


    BINDING_ERROR(2000, HttpStatus.BAD_REQUEST, "입력값 중 검증에 실패한 값이 있습니다."),
    BAD_REQUEST(2001, HttpStatus.BAD_REQUEST, "올바르지 않은 요청입니다."),
    ENTITY_NOT_FOUND(404, HttpStatus.NOT_FOUND, "요청하신 데이터를 찾을 수 없습니다."),
    SERVER_ERROR(500, HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.");

    private int code;
    private HttpStatus httpStatus;
    private String message;
}
