package kr.codenova.backend.multi.chat;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.multi.dto.broadcast.SendChatBroadcast;
import kr.codenova.backend.multi.socket.SocketEventHandler;
import kr.codenova.backend.multi.dto.request.SendChatRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatSocketHandler implements SocketEventHandler {

    private final ChatService chatService;

    @Override
    public void registerListeners(SocketIOServer server) {
        server.addEventListener("send_chat", SendChatRequest.class,  (client, request, ackSender) -> {

            SendChatBroadcast broadcast = new SendChatBroadcast(request.getRoomId(), request.getNickname(), request.getMessage());
            server
                    .getRoomOperations(request.getRoomId())
                    .sendEvent("send_chat", broadcast);
        });
    }
}
