package kr.codenova.backend.meteor;import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.corundumstudio.socketio.SocketIOServer;


@Configuration
public class SocketConfig {

    @Value("${socketio.server.hostname}")
    private String hostname;

    @Value("${socketio.server.port}")
    private int port;


    /*
     * Tomcat 서버와 별도로 돌아가는 netty 서버를 생성
     * */

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(hostname);
        config.setPort(port);

        // 타임아웃 설정
        config.setPingTimeout(60000);
        config.setPingInterval(25000);
        config.setFirstDataTimeout(10000); // 업그레이드 타임아웃 대신 사용


        // 스레드 풀 설정
        config.setBossThreads(1);
        config.setWorkerThreads(8);

        return new SocketIOServer(config);
    }
}
