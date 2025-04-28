package kr.codenova.backend.multi.exception;

public class RoomFullException extends RuntimeException {

    public RoomFullException(String message) {
        super(message);
    }
}
