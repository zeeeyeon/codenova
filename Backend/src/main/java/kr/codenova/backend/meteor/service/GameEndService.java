package kr.codenova.backend.meteor.service;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.meteor.RoomManager;
import kr.codenova.backend.meteor.dto.response.GameOverResponse;
import kr.codenova.backend.meteor.dto.response.PlayerResult;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameEndService {
    private final RoomManager roomManager;
    private SocketIOServer server() {
        return SocketIOServerProvider.getServer();
    }

    public GameEndService(RoomManager roomManager) {
        this.roomManager = roomManager;
    }

    public void endGame(String roomId, boolean isSuccess) {
        GameRoom room = roomManager.findById(roomId).orElseThrow();
        Map<String,Integer> scoreMap = room.getScoreMap();
        List<PlayerResult> results = room.getPlayers().stream()
                .map(u -> new PlayerResult(u.getNickname(), scoreMap.getOrDefault(u.getSessionId(),0)))
                .sorted(Comparator.comparingInt(PlayerResult::getCorrectCount).reversed())
                .collect(Collectors.toList());

        GameOverResponse resp = new GameOverResponse(isSuccess, results);
        server().getRoomOperations(roomId).sendEvent("gameEnd", resp);
        // 게임 종료 되고 방 정리
        roomManager.removeRoom(roomId);
    }
}

