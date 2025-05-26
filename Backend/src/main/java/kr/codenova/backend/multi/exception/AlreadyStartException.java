package kr.codenova.backend.multi.exception;

public class AlreadyStartException extends RuntimeException {
    public AlreadyStartException(String message) {
        super(message);
    }
}
