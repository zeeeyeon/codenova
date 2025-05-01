package kr.codenova.backend.multi.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
    private LocalDateTime createdAt;

    private String ownerNickname; // ✅ 방장 닉네임

    @Builder.Default
    private Map<String, Boolean> userReadyStatus = new HashMap<>(); // ✅ 참가자 닉네임 → 준비 상태

    // 유저 입장 시간을 기록하는 맵 ( 닉네임 -> 입장 시간(밀리초))
    private Map<String, Long> userJoinTimes; // 유저 입장 시간 기록
}
