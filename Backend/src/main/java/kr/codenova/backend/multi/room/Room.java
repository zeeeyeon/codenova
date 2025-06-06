package kr.codenova.backend.multi.room;

import kr.codenova.backend.multi.dto.request.FixRoomRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
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

    @Builder.Default
    private boolean isRoundEnded = true; // ✅ 라운드 중복 종료 방지 플래그

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


    private int roundNumber; // 현재 라운드
    private String firstFinisherNickname; // 첫 도착 유저 닉네임
    private Double firstFinishTime; // 첫 도착 유저 시간
    @Builder.Default
    private Map<String, Double> finishTimeMap = new ConcurrentHashMap<>(); // 도착 시간
    @Builder.Default
    private Map<String, Integer> typoCountMap = new ConcurrentHashMap<>(); // 오타 횟수
    @Builder.Default
    private Map<String, Integer> totalScoreMap = new ConcurrentHashMap<>(); // 누적 점수
    @Builder.Default
    private Map<String, Integer> roundScoreMap = new ConcurrentHashMap<>(); // 현재 라운드 점수


    public void changeRoomStatus(FixRoomRequest request) {
        if(!userStatusMap.get(request.getNickname()).isHost) {
            log.info("방장이 아니면 방 상태 수정 불가능");
            return;
        }
        this.roomTitle = request.getRoomTitle();
        this.language = request.getLanguage();
        this.isLocked = request.getIsLocked();
        this.maxCount = request.getMaxCount();
        if(request.getIsLocked()) {
            if(this.roomCode == null) {
                this.roomCode = generatedRoomCode();
            }
        } else {
            this.roomCode = null;
        }
    }

    public String generatedRoomCode() {
        return UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

    public void setFirstFinisher(String nickname, Integer time) {
        this.firstFinisherNickname = nickname;
        this.firstFinishTime = (double) (time / 1000);
    }

    public void addRoundScore(String nickname, int score) {
        roundScoreMap.put(nickname, score);
    }

    public void addToTotalScore(String nickname, int score) {
        totalScoreMap.merge(nickname, score, Integer::sum);
    }

    public Double getFinishTime(String nickname) {
        return finishTimeMap.get(nickname);
    }

    public int getTypoCount(String nickname) {
        return typoCountMap.getOrDefault(nickname, 0);
    }

    public void setUserFinishTime(String nickname, Double time) {
        finishTimeMap.putIfAbsent(nickname, time);
    }
}

