package kr.codenova.backend.multi.dto.broadcast;

import lombok.Data;

@Data
public class CountDownBroadcast {
    private String roomId;
    private int seconds;
    public CountDownBroadcast(String roomId, int seconds) {
        this.roomId = roomId;
        this.seconds = seconds;
    }
}
