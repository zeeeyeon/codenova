package kr.codenova.backend.meteor.service;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.meteor.RoomManager;
import kr.codenova.backend.meteor.dto.response.FallingWordResponse;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.multi.room.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;


@Component
@RequiredArgsConstructor
public class WordDropScheduler {
    private final RoomManager roomManager;
    private final TaskScheduler taskScheduler;
    private SocketIOServer server() {
        return SocketIOServerProvider.getServer();
    }

    private final Map<String, ScheduledFuture<?>> futures = new ConcurrentHashMap<>();


    public void startDrooping(String roomId, long spawnInterval, long initialFallDuration) {
        GameRoom room = roomManager.findById(roomId).orElseThrow();
        AtomicLong fallDuration = new AtomicLong(initialFallDuration);
        AtomicLong elapsed      = new AtomicLong(0);

        // 기존에 스케줄이 있으면 취소
        cancel(roomId);

        ScheduledFuture<?> spawnFuture = taskScheduler.scheduleAtFixedRate(() ->{
            String word = room.pollNextWord();
            if (word == null) {
                cancel(roomId);
                return;
            }
            room.addActiveWord(word);

            server().getRoomOperations(roomId)
                    .sendEvent("wordFalling", new FallingWordResponse(word, fallDuration.get()));
            // 3. 경과 시간 갱신
            long newElapsed = elapsed.addAndGet(spawnInterval);
            // 20초(20_000 ms) 마다 fallDuration 10% 줄이기
            if (newElapsed >= 20_000 && newElapsed % 20_000 < spawnInterval) {
                long next = Math.max(2_000, (long)(fallDuration.get() * 0.9));
                fallDuration.set(next);
            }
        }, spawnInterval);

        futures.put(roomId, spawnFuture);
    }

    public void cancel(String roomId) {
        ScheduledFuture<?> f = futures.remove(roomId);
        if (f != null) f.cancel(false);
    }
}
