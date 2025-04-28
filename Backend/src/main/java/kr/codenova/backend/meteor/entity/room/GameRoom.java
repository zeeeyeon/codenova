package kr.codenova.backend.meteor.entity.room;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.Getter;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
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
    // 현재 사용자들의 점수 관리
    private final Map<String, Integer> scoreMap = new ConcurrentHashMap<>();
    // 현재 화면에 낙하중인 단어 목록
    private final List<String> activeFallingWords = new CopyOnWriteArrayList<>();

    private final Queue<String> fallingWords = new ConcurrentLinkedQueue<>();

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
        scoreMap.put(user.getSessionId(), 0);
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
    // 단어 올바르게 맞혔을 때 호출해서 score 증가

    public int incrementScore(String sessionId) {
        int newScore = scoreMap.merge(sessionId, 1, Integer::sum);
        return newScore;
    }
    // 게임 종료시 전체 점수 조회

    public Map<String, Integer> getScoreMap() {
        return Collections.unmodifiableMap(scoreMap);
    }

    // 낙하하는 단어 등록
    public void addActiveWord(String word) {
        activeFallingWords.add(word);
    }
    // 단어 맞출 경우 제거
    public boolean removeActiveWord(String word) {
        return activeFallingWords.remove(word);
    }
    // 현재 낙하중인 단어 리스트 조회
    public List<String> getActiveFallingWords() {
        return Collections.unmodifiableList(activeFallingWords);
    }
    // 게임 시작 시 50단어를 큐에 담아두기
    public void initFallingwords(List<String> words) {
        fallingWords.clear();
        if (words != null) {
            fallingWords.addAll(words);
        }
    }
    // 다음에 떨어질 단어 하나를 꺼내기
    public String pollNextWord() {
        return fallingWords.poll();
    }

}
