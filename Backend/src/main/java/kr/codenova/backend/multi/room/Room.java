package kr.codenova.backend.multi.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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

    // ✅ 사용자 상태 관리 (nickname → UserStatus)
    @Builder.Default
    private ConcurrentHashMap<String, UserStatus> userStatusMap = new ConcurrentHashMap<>();

    // ✅ 유저 입장 시간 기록
    @Builder.Default
    private Map<String, Long> userJoinTimes = new ConcurrentHashMap<>();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserStatus {
        private boolean isHost;
        private boolean isReady;
    }
    public boolean hasFirstFinisher() {
        return firstFinisherNickname != null;
    }

    public void setFirstFinisher(String nickname, double time) {
        this.firstFinisherNickname = nickname;
        this.firstFinishTime = time;
    }
}

