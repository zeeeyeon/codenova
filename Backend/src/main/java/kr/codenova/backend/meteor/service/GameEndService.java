package kr.codenova.backend.meteor.service;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.meteor.RoomManager;
import kr.codenova.backend.meteor.dto.response.GameOverResponse;
import kr.codenova.backend.meteor.dto.response.PlayerResult;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.room.GameStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameEndService implements WordDropScheduler.GameEndListener {
    private final RoomManager roomManager;

    public GameEndService(RoomManager roomManager, WordDropScheduler wordDropScheduler) {
        this.roomManager = roomManager;
        // 리스너로 등록
        wordDropScheduler.addGameEndListener(this);
    }
    private SocketIOServer server() {
        return SocketIOServerProvider.getServer();
    }

    @Override
    public void onGameEnd(String roomId, boolean isSuccess) {
        endGame(roomId, isSuccess);
    }


    public void endGame(String roomId, boolean isSuccess) {
        GameRoom room = roomManager.findById(roomId).orElseThrow();
        synchronized (room.getGameLock()) {
//            if (room.getStatus() == GameStatus.WAITING) {
//                // 이미 종료된 게임은 다시 처리하지 않음
//                return;
//            }
            room.finish();
            roomManager.cancelAllTimers(roomId);
        }
        Map<String,Integer> scoreMap = room.getScoreMap();
        List<PlayerResult> results = room.getPlayers().stream()
                .map(u -> new PlayerResult(u.getNickname(), scoreMap.getOrDefault(u.getSessionId(),0)))
                .sorted(Comparator.comparingInt(PlayerResult::getCorrectCount).reversed())
                .collect(Collectors.toList());

        GameOverResponse resp = new GameOverResponse(isSuccess, results);
        server().getRoomOperations(roomId).sendEvent("gameEnd", resp);

    }
}

