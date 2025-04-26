package kr.codenova.backend.meteor.entity.room;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.Getter;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
@Getter
public class GameRoom {
    private final String roomId;
    private final boolean isPrivate;
    private GameStatus status = GameStatus.WAITING;
    private final String roomCode;
    private final int maxPlayers;
    private final List<UserInfo> players = new CopyOnWriteArrayList<>();


    public GameRoom(String roomId, boolean isPrivate, String roomCode, int maxPlayers) {
        this.roomId = roomId;
        this.isPrivate = isPrivate;
        this.roomCode = roomCode;
        this.maxPlayers = maxPlayers;
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public void addPlayer(UserInfo user) {
        if (isFull()) {
            throw new IllegalStateException("방이 가득 찼습니다.");
        }
        players.add(user);
        if (players.size() == maxPlayers) {
            status = GameStatus.PLAYING;
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
