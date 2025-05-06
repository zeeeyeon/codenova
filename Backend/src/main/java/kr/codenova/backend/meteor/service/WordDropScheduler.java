package kr.codenova.backend.meteor.service;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.meteor.RoomManager;
import kr.codenova.backend.meteor.dto.response.FallingWordResponse;
import kr.codenova.backend.meteor.dto.response.RemoveWordResponse;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.room.GameStatus;
import kr.codenova.backend.multi.room.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;


import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;


@Component
@RequiredArgsConstructor
public class WordDropScheduler {
    private final RoomManager roomManager;
    private final TaskScheduler taskScheduler;

    public interface GameEndListener {
        void onGameEnd(String roomId, boolean isSuccess);
    }
    private final List<GameEndListener> gameEndListeners = new ArrayList<>();

    public void addGameEndListener(GameEndListener listener) {
        gameEndListeners.add(listener);
    }

    private void notifyGameEnd(String roomId, boolean isSuccess) {
        for (GameEndListener listener : gameEndListeners) {
            listener.onGameEnd(roomId, isSuccess);
        }
    }
    private SocketIOServer server() {
        return SocketIOServerProvider.getServer();
    }

    private final Map<String, ScheduledFuture<?>> futures = new ConcurrentHashMap<>();
    private final Map<String, Map<String, ScheduledFuture<?>>> wordImpactFutures = new ConcurrentHashMap<>();
    // 게임 종료 상태 추적
    private final Set<String> endedGameRooms = ConcurrentHashMap.newKeySet();

    public void startDrooping(String roomId, long spawnInterval, long initialFallDuration) {
        // 기존에 스케줄이 있으면 취소
        cancel(roomId);

        // 게임 종료 상태 초기화
        endedGameRooms.remove(roomId);

        AtomicLong fallDuration = new AtomicLong(initialFallDuration);
        AtomicLong elapsed = new AtomicLong(0);

        ScheduledFuture<?> spawnFuture = taskScheduler.scheduleAtFixedRate(() -> {
            GameRoom room = roomManager.findById(roomId).orElse(null);
            // 0. 이미 종료된 게임이면 처리 안함
            if (endedGameRooms.contains(roomId)) {
                return;
            }

            // 1. 빈 방이면 스케줄 취소
            if (room == null || room.getStatus() != GameStatus.PLAYING) {
                cancel(roomId);
                return;
            }

            // 2. 다음 단어 꺼내기
            String word = room.pollNextWord();
            if (word == null) {
                cancel(roomId);
                return;
            }
            room.addActiveWord(word);

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String timestamp = dateFormat.format(new Date());

            server().getRoomOperations(roomId)
                    .sendEvent("wordFalling", new FallingWordResponse(word, fallDuration.get(), timestamp));

            scheduleWordImpact(roomId, word, fallDuration.get());
            // 3. 경과 시간 갱신
            long newElapsed = elapsed.addAndGet(spawnInterval);
            // 20초(20_000 ms) 마다 fallDuration 10% 줄이기
            if (newElapsed >= 10_000 && newElapsed % 10_000 < spawnInterval) {
                long next = Math.max(1_000, (long) (fallDuration.get() * 0.8));
                fallDuration.set(next);
            }
        }, spawnInterval);

        futures.put(roomId, spawnFuture);
    }

    // 단어 임팩트 타이머 스케줄링 메서드
    private void scheduleWordImpact(String roomId, String word, long fallDuration) {

        Date executionTime = new Date(System.currentTimeMillis() + fallDuration);
        ScheduledFuture<?> future = taskScheduler.schedule(() -> {
            if (endedGameRooms.contains(roomId)) {
                return;
            }

            GameRoom room = roomManager.findById(roomId).orElse(null);
            if (room == null) return;

            // 단어가 활성화 상태인지 확인
            if (room.getActiveFallingWords().contains(word)) {

                synchronized (this) {
                    if (endedGameRooms.contains(roomId)) {
                        return;
                    }

                    boolean isGameOver = room.handleWordMissAndCheckGameOver(word);

                    int remainingLives = room.getLife();

                    RemoveWordResponse response = new RemoveWordResponse(word, remainingLives);
                    server().getRoomOperations(roomId).sendEvent("lostLife", response);

                    if (isGameOver) {
                        endedGameRooms.add(roomId);
                        cancel(roomId);
                        notifyGameEnd(roomId, false);
                    } else {
                        if (!room.hasActiveWords() && !room.hasMoreFallingWords()) {
                            endedGameRooms.add(roomId);
                            cancel(roomId);
                            notifyGameEnd(roomId, true);
                        }
                    }

                }
                if (wordImpactFutures.containsKey(roomId)) {
                    wordImpactFutures.get(roomId).remove(word);
                }
            }

        }, executionTime);

        wordImpactFutures
                .computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                .put(word, future);
    }

    // 단어 임팩트 타이머 취소 메서드 (단어가 플레이어에 의해 맞춰졌을 때 호출)
    public void cancelWordImpact(String roomId, String word) {
        Map<String, ScheduledFuture<?>> roomWordFutures = wordImpactFutures.get(roomId);
        if (roomWordFutures != null) {
            ScheduledFuture<?> future = roomWordFutures.remove(word);
            if (future != null) {
                future.cancel(false);
            }
        }
    }

    // 방 취소 메서드 업데이트
    public void cancel(String roomId) {
        endedGameRooms.add(roomId);
        ScheduledFuture<?> f = futures.remove(roomId);
        if (f != null) f.cancel(false);

        // 모든 단어 임팩트 타이머도 취소
        Map<String, ScheduledFuture<?>> roomWordFutures = wordImpactFutures.remove(roomId);
        if (roomWordFutures != null) {
            roomWordFutures.values().forEach(future -> future.cancel(false));
        }
    }

}