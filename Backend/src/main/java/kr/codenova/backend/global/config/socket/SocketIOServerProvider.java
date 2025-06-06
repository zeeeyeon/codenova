package kr.codenova.backend.global.config.socket;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.Setter;

public class SocketIOServerProvider {

    @Setter
    private static SocketIOServer server;

    public static SocketIOServer getServer() {
        if (server == null) {
            throw new IllegalStateException("SocketIOServer has not been initialized yet.");
        }
        return server;
    }
}
