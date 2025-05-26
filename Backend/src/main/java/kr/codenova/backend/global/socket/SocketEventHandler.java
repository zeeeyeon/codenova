package kr.codenova.backend.global.socket;

import com.corundumstudio.socketio.SocketIOServer;

/**
 * 이벤트 리스너 등록 (room, chat, game 등 각 도메인에 맞게)
 */
public interface SocketEventHandler {
    void registerListeners(SocketIOServer server);
}
