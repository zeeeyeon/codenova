package kr.codenova.backend.multi.chat;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.broadcast.SendChatBroadcast;
import kr.codenova.backend.multi.dto.response.SocketErrorResponse;
import kr.codenova.backend.multi.room.RoomService;
import kr.codenova.backend.global.socket.SocketEventHandler;
import kr.codenova.backend.multi.dto.request.SendChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ChatSocketHandler implements SocketEventHandler {

    private final RoomService roomService;

    @Override
    public void registerListeners(SocketIOServer server) {

        server.addEventListener("send_chat", SendChatRequest.class,  (client, request, ackSender) -> {
            try {

                // 메시지 유효성 검사
                if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                    client.sendEvent("error", new SocketErrorResponse("메시지를 입력해주세요."));
                    return;
                }

                // 방 존재 여부 검사
                if(!roomService.existsRoom(request.getRoomId())) {
                    client.sendEvent("error", new SocketErrorResponse("방이 존재하지 않습니다."));
                    return;
                }
                SendChatBroadcast broadcast = new SendChatBroadcast(
                        request.getRoomId(),
                        request.getNickname(),
                        request.getMessage(),
                        LocalDateTime.now());

                server
                        .getRoomOperations(request.getRoomId())
                        .sendEvent("send_chat", broadcast);

            } catch (Exception e) {
                client.sendEvent("error", new SocketErrorResponse("채팅 전송 중 오류가 발생했습니다."));
            }
        });

    }
}
