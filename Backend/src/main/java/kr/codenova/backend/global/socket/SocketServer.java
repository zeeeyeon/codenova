package kr.codenova.backend.global.socket;

import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * SocketServer
 * 소켓 서버를 관리하는 역할
 * 소켓 서버 실행 / 종료 담당 ( server.start(), server.stop() )
 */
@Component
@RequiredArgsConstructor
public class SocketServer {

    private final SocketIOServer server;

    @PostConstruct
    public void start() {
        server.start();
    }

    @PreDestroy
    public void stop() {
        server.stop();
    }
}
