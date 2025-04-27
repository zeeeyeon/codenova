package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.broadcast.GameResultBroadcast;
import kr.codenova.backend.multi.dto.request.*;
import kr.codenova.backend.multi.dto.broadcast.GameCountdownBroadcast;
import kr.codenova.backend.multi.dto.broadcast.ReadyGameBroadcast;
import kr.codenova.backend.multi.dto.broadcast.TypingStartBroadcast;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.multi.socket.SocketEventHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class GameSocketHandler implements SocketEventHandler {

    private final GameService gameService;

    @Override
    public void registerListeners(SocketIOServer server) {

        // 1. 게임 준비 상태 갱신
        server.addEventListener("ready", ReadyGameRequest.class, (client, request, ackSender) -> {
            try {
                gameService.toggleReady(request);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("게임 준비 중 오류 발생"));
            }
        });

        // 2. 게임 시작
        server.addEventListener("start_game", StartGameRequest.class, (client, request, ackSender) -> {
            try {
                gameService.startGame(request);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("게임 시작 중 오류 발생"));
            }
        });

        // 3. 게임 진행률 전송
        server.addEventListener("progress_update", ProgressUpdateRequest.class, (client, request, ackSender) -> {
            try {
                gameService.updateProgress(request); // ✅ 서버가 직접 브로드캐스트
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("게임 진행률 업데이트 오류 발생"));
            }
        });

        // 4. 게임 종료
        server.addEventListener("finish_game", FinishGameRequest.class, (client, request, ackSender) -> {
            try {
                gameService.finishGame(request); // ✅ Service에 위임
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("게임 종료 처리 중 오류 발생"));
            }
        });
    }
}

