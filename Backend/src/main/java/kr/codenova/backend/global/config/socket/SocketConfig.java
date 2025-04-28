package kr.codenova.backend.global.config.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.Transport;
import kr.codenova.backend.global.socket.SocketEventHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SocketConfig {

    private final List<SocketEventHandler> socketEventHandlers;

    @Value("${socketio.server.hostname}")
    private String hostname;

    @Value("${socketio.server.port}")
    private int port;


    /**
     * Tomcat 서버와 별도로 돌아가는 netty 서버를 생성
     */
    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("0.0.0.0");
        config.setPort(9092);
        config.setOrigin("*");
        config.setAuthorizationListener(handshakeData -> true);  // ✅ 무조건 허용
        config.setTransports(Transport.WEBSOCKET); // Only WebSocket

        config.setBossThreads(1);
        config.setWorkerThreads(8);


        SocketIOServer server = new SocketIOServer(config);

        // ✅ 서버 생성 후 Provider에 등록
        SocketIOServerProvider.setServer(server);

        // ✅ 모든 핸들러 리스너 등록
        for (SocketEventHandler handler : socketEventHandlers) {
            handler.registerListeners(server);
        }

        return server;
    }
}
