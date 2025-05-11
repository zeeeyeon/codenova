package kr.codenova.backend.multi.exception;

public class UserNotInRoomException extends Throwable {
    public UserNotInRoomException(String message) {
        super(message);
    }
}
