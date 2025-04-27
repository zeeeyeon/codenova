package kr.codenova.backend.multi.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Room {
    private String roomId;
    private String roomTitle;
    private String language;
    private Integer maxCount;
    private Integer currentCount;
    private Boolean isLocked;
    private Boolean isStarted;
    private String roomCode;

    private String ownerNickname; // ✅ 방장 닉네임
    private Map<String, Boolean> userReadyStatus = new HashMap<>(); // ✅ 참가자 닉네임 → 준비 상태

}
