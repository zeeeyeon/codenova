package kr.codenova.backend.meteor.entity.room;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.Getter;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;
@Getter
public class GameRoom {
    private final String roomId;
    private final boolean isPrivate;
    private String hostSessionId;
    private GameStatus status = GameStatus.WAITING;
    private final String roomCode;
    private final int maxPlayers;
    private final List<UserInfo> players = new CopyOnWriteArrayList<>();


    public GameRoom(String roomId, boolean isPrivate, String roomCode, int maxPlayers, String hostSessionId) {
        this.roomId = roomId;
        this.hostSessionId  = hostSessionId;
        this.isPrivate = isPrivate;
        this.roomCode = roomCode;
        this.maxPlayers = maxPlayers;
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }
    public void start() {
        if (players.size() < maxPlayers) {
            throw new IllegalStateException("플레이어가 모두 모이지 않았습니다.");
        }
        this.status = GameStatus.PLAYING;
    }
    public void addPlayer(UserInfo user) {
        if (isFull()) {
            throw new IllegalStateException("방이 가득 찼습니다.");
        }
        players.add(user);
    }
    public void removePlayer(String sessionId) {
        players.removeIf(u -> u.getSessionId().equals(sessionId));
        if (sessionId.equals(hostSessionId) && !players.isEmpty()) {
            // 방장이 나가면 새 호스트를 랜덤으로 선정
            UserInfo newHost = players.get(new Random().nextInt(players.size()));
            hostSessionId = newHost.getSessionId();
        }
    }

    /**
     * 랜덤방인지 아닌지 체크하고 4명이 아직 안찼고 대기중인 방 탐색
     * */
    public boolean isWaitingRandom() {
        return !isPrivate
                && status == GameStatus.WAITING
                && players.size() < 4;
    }
}
