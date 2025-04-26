package kr.codenova.backend.meteor;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import jakarta.annotation.PostConstruct;
import kr.codenova.backend.meteor.dto.request.CreateRoomRequest;
import kr.codenova.backend.meteor.dto.request.JoinSecretRoomRequest;
import kr.codenova.backend.meteor.dto.request.RandomMatchRequest;
import kr.codenova.backend.meteor.dto.response.CreateRoomResponse;
import kr.codenova.backend.meteor.dto.response.JoinRoomResponse;
import kr.codenova.backend.meteor.dto.response.ErrorResponse;
import kr.codenova.backend.meteor.dto.response.RandomMatchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.user.UserInfo;


import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class MeteorEventHandler {
    private final SocketIOServer server;
    private final RoomManager roomManager;



    @PostConstruct
    public void init() {
        server.addConnectListener(listenConnected());
        server.addDisconnectListener(listenDisconnected());

        // 방 생성 이벤트
        server.addEventListener("createRoom", CreateRoomRequest.class, (client, data, ack) -> handleCreateRoom(client, data));
        // 방 참가 이벤트
        server.addEventListener("joinSecretRoom", JoinSecretRoomRequest.class, (client, data, ack) -> handleJoinSecretRoom(client, data));
        // 랜덤 매칭 이벤트
        server.addEventListener("randomMatch", RandomMatchRequest.class, (client, data, ack) -> handleRandomMatch(client, data));
    }

    private void handleCreateRoom(SocketIOClient client, CreateRoomRequest data) {
        String nickname = data.getNickname();

        if (nickname == null || nickname.isBlank()) {
            client.sendEvent("roomCreate",
                    new ErrorResponse("INVALID_NICKNAME", "닉네임을 입력해주세요."));
            return;
        }

        boolean isPrivate = data.isPrivate();
        String roomId = UUID.randomUUID().toString();
        String roomCode = generateRoomCode();


        GameRoom room;
        boolean isHost;
        try {
            room = new GameRoom(roomId, isPrivate, roomCode, 4);
            room.addPlayer(new UserInfo(client.getSessionId().toString(), nickname));
            roomManager.addRoom(room);
            isHost = true;
        } catch (Exception e) {
            log.error("방 생성 실패", e);
            client.sendEvent("roomCreate",
                    new ErrorResponse("ROOM_CREATE_FAILED", "서버 오류로 방 생성에 실패했습니다."));
            return;
        }

        try {
            client.joinRoom(roomId);
        } catch (Exception e) {
            log.error("소켓 방 가입 실패", e);
            client.sendEvent("roomCreate",
                    new ErrorResponse("JOIN_ROOM_FAILED", "방에 입장하는 데 실패했습니다."));
            return;
        }

        CreateRoomResponse response = CreateRoomResponse.builder()
                .roomId(roomId)
                .isPrivate(isPrivate)
                .isHost(isHost)
                .roomCode(roomCode)
                .build();

        client.sendEvent("roomCreate", response);

    }
    private void handleJoinSecretRoom(SocketIOClient client, JoinSecretRoomRequest data) {
        String code = data.getRoomCode();
        String nickname = data.getNickname();

        GameRoom room = roomManager.findByCode(code)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방 코드입니다."));


        // 같은 세션 아이디 중복 입장 못하게 하기
        boolean alreadyIn = room.getPlayers().stream()
                .anyMatch(u -> u.getSessionId().equals(client.getSessionId().toString()));
        if (alreadyIn) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("ALREADY_IN_ROOM", "이미 이 방에 참여 중입니다."));
            return;
        }

        if (room.isFull()) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("ROOM_FULL", "방이 가득 차서 입장할 수 없습니다."));
            return;
        }

        client.joinRoom(room.getRoomId());

        UserInfo newUser = new UserInfo(client.getSessionId().toString(), nickname);
        room.addPlayer(newUser);

        // 1. 본인에게 입장 성공 응답
        client.sendEvent("secretRoomJoin", new JoinRoomResponse(room.getRoomId(), room.getPlayers()));

        // 2. 같은 방에 있는 다른 유저에게 알림
        server.getRoomOperations(room.getRoomId()).sendEvent("newUserJoined", client,newUser);
    }


    private void handleRandomMatch(SocketIOClient client, RandomMatchRequest data) {
        String nickname = data.getNickname();
        if (nickname == null || nickname.isBlank()) {
            client.sendEvent("matchRandom",
                    new ErrorResponse("INVALID_NICKNAME", "닉네임을 입력해주세요."));
            return;
        }

        // 1️ 방 조회+생성 → 생성 여부까지 RandomRoomResult 로 받는다
        RoomManager.RandomRoomResult result = roomManager.findOrCreateRandomRoom(
                () -> UUID.randomUUID().toString(),
                roomId -> new UserInfo(client.getSessionId().toString(), nickname)
        );

        GameRoom room  = result.getRoom();
        boolean isHost = result.isCreated();

        // 2️ 소켓 방에 조인
        client.joinRoom(room.getRoomId());

        // 3️ non-host 는 players 에 추가하면서 단일 예외 처리
        if (!isHost) {
            UserInfo user = new UserInfo(client.getSessionId().toString(), nickname);
            try {
                room.addPlayer(user);  // 여기가 유일한 가득 참 체크 지점
            } catch (IllegalStateException e) {
                // 동시성으로 찬 경우도 여기서 처리
                client.sendEvent("matchRandom",
                        new ErrorResponse("ROOM_FULL", "방이 가득 차서 입장할 수 없습니다."));
                return;
            }
            // 4️ 브로드캐스트
            server.getRoomOperations(room.getRoomId())
                    .sendEvent("newUserJoined", client ,user);
        }

        // 5️ 최종 응답
        RandomMatchResponse resp =
                new RandomMatchResponse(room.getRoomId(), isHost, room.getPlayers());
        client.sendEvent("matchRandom", resp);
    }




    public ConnectListener listenConnected() {
        return (client) -> {
            Map<String, List<String>> params = client.getHandshakeData().getUrlParams();
            log.info("connect:" + params.toString());
        };
    }

    public DisconnectListener listenDisconnected() {
        return client -> {
            String sessionId = client.getSessionId().toString();
            log.info("disconnect: " + sessionId);
            client.disconnect();
        };
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
