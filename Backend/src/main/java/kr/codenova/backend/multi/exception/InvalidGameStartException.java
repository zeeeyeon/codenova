package kr.codenova.backend.multi.exception;

public class InvalidGameStartException extends RuntimeException {

    public InvalidGameStartException(String message) {
        super(message);
    }
}
