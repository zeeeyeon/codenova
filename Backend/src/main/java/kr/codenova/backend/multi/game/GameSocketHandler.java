package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.EndGameRequest;
import kr.codenova.backend.multi.dto.RoundEndRequest;
import kr.codenova.backend.multi.dto.RoundStartRequest;
import kr.codenova.backend.multi.dto.TypoRequest;
import kr.codenova.backend.multi.dto.request.*;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.global.socket.SocketEventHandler;
import kr.codenova.backend.multi.exception.IsNotHostException;
import kr.codenova.backend.multi.room.Room;
import kr.codenova.backend.multi.room.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GameSocketHandler implements SocketEventHandler {

    private final GameService gameService;
    private final RoomService roomService;

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

        // 5. 라운드 시작
        server.addEventListener("round_start", RoundStartRequest.class, (client, request, ackSender) -> {
            try {
                gameService.startRound(request);
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("라운드 시작 처리 오류"));
            } catch (IsNotHostException e) {
                throw new RuntimeException(e);
            }
        });

        // 6. 오타 발생 시
        server.addEventListener("typo_occurred", TypoRequest.class, (client, request, ackSender) -> {
            try {
                gameService.addTypo(request.getRoomId(), request.getNickname());
            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("오타 처리 오류"));
            }
        });
    }
}

