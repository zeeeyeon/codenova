package kr.codenova.backend.meteor.entity.room;

import kr.codenova.backend.meteor.entity.user.UserInfo;
import lombok.Getter;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Getter
public class GameRoom {
    private final String roomId;
    private final boolean isPrivate;
    private String hostSessionId;
    private GameStatus status = GameStatus.WAITING;
    private final String roomCode;
    private final int maxPlayers;
    private Date finishedAt;
    private final List<UserInfo> players = new CopyOnWriteArrayList<>();
    // 현재 사용자들의 점수 관리
    private final Map<String, Integer> scoreMap = new ConcurrentHashMap<>();
    // 현재 화면에 낙하중인 단어 목록
    private final List<String> activeFallingWords = new CopyOnWriteArrayList<>();
    // 낙하시킬 단어 리스트
    private final Queue<String> fallingWords = new ConcurrentLinkedQueue<>();

    // 재도전 인원
    private final Set<String> readyForRetryPlayers = ConcurrentHashMap.newKeySet();

    // 팀 목숨 관리
    private AtomicInteger life = new AtomicInteger();

    private static final int INITIAL_LIVES = 5;

    // 목적별 락 객체 추가
    private final Object playersLock = new Object(); // 사용자들 관리
    private final Object gameLock = new Object(); // 게임 상태 관리
    private final Object wordLock = new Object(); // 단어 관리
    private final Object scoreLock = new Object(); // 점수 관리

    public GameRoom(String roomId, boolean isPrivate, String roomCode, int maxPlayers, String hostSessionId) {
        this.roomId = roomId;
        this.hostSessionId = hostSessionId;
        this.isPrivate = isPrivate;
        this.roomCode = roomCode;
        this.maxPlayers = maxPlayers;
    }

    public boolean isFull() {
        return players.size() >= maxPlayers;
    }

    public void addPlayer(UserInfo user) {
        synchronized (playersLock) {
            if (isFull()) {
                throw new IllegalStateException("방이 가득 찼습니다.");
            }
            boolean isDuplicateNickname = players.stream()
                    .anyMatch(p -> p.getNickname().equals(user.getNickname()));

            if (isDuplicateNickname) {
                throw new IllegalStateException("이미 같은 닉네임의 사용자가 존재합니다.");
            }
            players.add(user);
            scoreMap.put(user.getSessionId(), 0);
        }
    }

    public void removePlayer(String sessionId) {
        synchronized (playersLock) {
            boolean isHost = sessionId.equals(hostSessionId);

            // 플레이어 제거
            players.removeIf(u -> u.getSessionId().equals(sessionId));

            // 방장이었고 다른 플레이어가 아직 남아있다면 새 방장 지정
            if (isHost && !players.isEmpty()) {
                // 새 방장 랜덤 선택
                UserInfo newHost = players.get(new Random().nextInt(players.size()));
                hostSessionId = newHost.getSessionId();

                // 새 방장의 isHost 플래그 업데이트
                for (UserInfo player : players) {
                    if (player.getSessionId().equals(hostSessionId)) {
                        player.setIsHost(true);
                    } else {
                        player.setIsHost(false);
                    }
                }
            }
        }
    }

    public void start() {
        synchronized (gameLock) {
            if (players.size() < maxPlayers) {
                throw new IllegalStateException("플레이어가 모두 모이지 않았습니다.");
            }
            this.status = GameStatus.PLAYING;
            this.life.set(INITIAL_LIVES);

        }
    }
    public void finish() {
        synchronized (gameLock) {
            this.status = GameStatus.FINISHED;
            this.finishedAt = new Date();
        }
    }


    /**
     * 랜덤방인지 아닌지 체크하고 4명이 아직 안찼고 대기중인 방 탐색
     */
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
        synchronized (wordLock) {
            activeFallingWords.add(word);
        }
    }

    // 단어 맞출 경우 제거
//    public boolean removeActiveWord(String word) {
//        return activeFallingWords.remove(word);
//    }

    // 현재 낙하중인 단어 리스트 조회
    public List<String> getActiveFallingWords() {
        return Collections.unmodifiableList(activeFallingWords);
    }
    // 게임 로직 메서드(복합 연산)
    public boolean checkWordAndUpdateScore(String word, String sessionId) {
        // 단어 제거와 점수 업데이트는 동시성을 위해 원자적으로 수행되어야함
        synchronized (wordLock) {
            synchronized (scoreLock) {
                boolean isCorrect = activeFallingWords.remove(word);
                if (isCorrect) {
                    incrementScore(sessionId);
                }
                return isCorrect;
            }
        }
    }

    // 게임 종료 체크 메서드
    public boolean handleWordMissAndCheckGameOver(String word){
        synchronized (wordLock) {
            synchronized (scoreLock) {
                activeFallingWords.remove(word);
                int currentLife = life.decrementAndGet();
                return currentLife <= 0;
            }
        }
    }


    // 게임 시작 시 50단어를 큐에 담아두기
    public void initFallingwords(List<String> words) {
        fallingWords.clear();
        if (words != null) {
            fallingWords.addAll(words);
        }
    }

    public boolean hasMoreFallingWords() {
        return !fallingWords.isEmpty();
    }

    public boolean hasActiveWords(){
        return !activeFallingWords.isEmpty();
    }


    // 다음에 떨어질 단어 하나를 꺼내기
    public String pollNextWord() {
        return fallingWords.poll();
    }

    // 목숨 하나 삭제하고 남은 목숨 수 반환
    public int loseLife() {
        return life.decrementAndGet();
    }

    // 현재 남아 있는 목숨 수 반환
    public int getLife() {
        return life.get();
    }

    // 목숨이 0인지 확인
    public boolean isGameOver() {
        return life.get() <= 0;
    }

    // 재도전 준비
    public synchronized boolean isReady(String sessionId) {
        synchronized (playersLock) {
            // 현재 방에 있는 플레이어인지 확인
            boolean isInRoom = players.stream().anyMatch(u -> u.getSessionId().equals(sessionId));

            if (!isInRoom) {
                return false;
            }

            readyForRetryPlayers.add(sessionId);

            return readyForRetryPlayers.size() == players.size();

        }
    }

    // 재도전 플레이어 수
    public int retryCount(){
        return readyForRetryPlayers.size();
    }

    // 재도전 준비 상태 초기화
    public void resetRetryState() {
        readyForRetryPlayers.clear();
    }
}
