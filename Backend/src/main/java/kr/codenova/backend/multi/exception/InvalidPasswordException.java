package kr.codenova.backend.multi.exception;

// 비밀번호 불일치 예외 클래스
public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}
