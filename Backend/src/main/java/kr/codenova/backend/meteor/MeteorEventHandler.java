package kr.codenova.backend.meteor;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import jakarta.annotation.PostConstruct;
import kr.codenova.backend.meteor.dto.request.*;
import kr.codenova.backend.meteor.dto.request.CreateRoomRequest;
import kr.codenova.backend.meteor.dto.response.*;
import kr.codenova.backend.meteor.service.GameEndService;
import kr.codenova.backend.meteor.service.WordDropScheduler;
import kr.codenova.backend.meteor.service.WordService;
import kr.codenova.backend.meteor.entity.room.GameStatus;

import kr.codenova.backend.multi.dto.request.SendChatRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import kr.codenova.backend.meteor.entity.room.GameRoom;
import kr.codenova.backend.meteor.entity.user.UserInfo;
import kr.codenova.backend.global.socket.SocketEventHandler;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class MeteorEventHandler implements SocketEventHandler {

    private final RoomManager roomManager;
    private final WordService wordService;
    private final WordDropScheduler wordDropScheduler;
    private final GameEndService gameEndService;
    private final TaskScheduler taskScheduler;


    private SocketIOServer server() {
        return SocketIOServerProvider.getServer();
    }

    @Override
    public void registerListeners(SocketIOServer server) {
        server().addConnectListener(listenConnected());
        server().addDisconnectListener(listenDisconnected());

        // 방 생성 이벤트
        server().addEventListener("createRoom", CreateRoomRequest.class, (client, data, ack) -> handleCreateRoom(client, data));
        // 방 참가 이벤트
        server().addEventListener("joinSecretRoom", JoinSecretRoomRequest.class, (client, data, ack) -> handleJoinSecretRoom(client, data));
        // 랜덤 매칭 이벤트
        server().addEventListener("randomMatch", RandomMatchRequest.class, (client, data, ack) -> handleRandomMatch(client, data));
        // 게임 시작 이벤트
        server().addEventListener("startGame", StartGameRequest.class, (client, data, ack) -> handleGameStart(client, data));
        // 대기방 나가기 이벤트
        server().addEventListener("exitRoom", ExitRoomRequest.class, (client, data, ack) -> handleExitRoom(client, data));
        // 실시간 입력 텍스트 전송 이벤트
        server().addEventListener("inputText", InputTextRequest.class, (client, data, ack) -> handleInputText(client, data));
        // 단어 정답 확인 이벤트
        server().addEventListener("checkText", InputTextRequest.class, (client, data, ack) -> handleCheckText(client, data));
        // 채팅 이벤트
        server().addEventListener("sendChat", SendChatRequest.class, (client, data, ack) -> handleSendChat(client, data));
        // 목숨 차감 이벤트
        server().addEventListener("lifeLost", RemoveWordRequest.class, (client, data, ack) -> handleRemoveWord(client, data));
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
        String hostSessionId = client.getSessionId().toString();


        GameRoom room;
        boolean isHost;
        try {
            room = new GameRoom(roomId, isPrivate, roomCode, 4, hostSessionId);
            room.addPlayer(new UserInfo(hostSessionId, nickname,true));
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

        // 방 존재 여부 체크
        Optional<GameRoom> optRoom = roomManager.findByCode(code);
        if (optRoom.isEmpty()) {
            client.sendEvent("codeError",
                    new ErrorResponse("ROOM_NOT_FOUND", "존재하지 않는 방 코드입니다."));
            return;
        }
        GameRoom room = optRoom.get();


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

        UserInfo newUser = new UserInfo(client.getSessionId().toString(), nickname, false);
        room.addPlayer(newUser);

        // 전체 사용자에게 방에 있는 사용자 리스트 브로드캐스트
        server().getRoomOperations(room.getRoomId()).sendEvent("secretRoomJoin", new JoinRoomResponse(room.getRoomId(), room.getPlayers()));

    }


    private void handleRandomMatch(SocketIOClient client, RandomMatchRequest data) {
        String nickname = data.getNickname();
        if (nickname == null || nickname.isBlank()) {
            client.sendEvent("matchRandom",
                    new ErrorResponse("INVALID_NICKNAME", "닉네임을 입력해주세요."));
            return;
        }

        // 1️. 방 조회+생성 → 생성 여부까지 RandomRoomResult 로 받는다
        RoomManager.RandomRoomResult result = roomManager.findOrCreateRandomRoom(
                () -> UUID.randomUUID().toString(),
                roomId -> new UserInfo(client.getSessionId().toString(), nickname,true)
        );

        GameRoom room  = result.getRoom();
        boolean isHost = result.isCreated();

        // 2️. 소켓 방에 조인
        client.joinRoom(room.getRoomId());

        // 3️. non-host 는 players 에 추가하면서 단일 예외 처리
        if (!isHost) {
            UserInfo user = new UserInfo(client.getSessionId().toString(), nickname, false);
            try {
                room.addPlayer(user);  // 여기가 유일한 가득 참 체크 지점
            } catch (IllegalStateException e) {
                // 동시성으로 찬 경우도 여기서 처리
                client.sendEvent("matchRandom",
                        new ErrorResponse("ROOM_FULL", "방이 가득 차서 입장할 수 없습니다."));
                return;
            }
        }

        // 5️. 방에 있는 사람들에게 사용자 리스트 브로드캐스트
        RandomMatchResponse resp =
                new RandomMatchResponse(room.getRoomId(), room.getPlayers());
        server().getRoomOperations(room.getRoomId()).sendEvent("matchRandom", resp);

    }

    private void handleGameStart(SocketIOClient client, StartGameRequest data) {
        
        String roomId = data.getRoomId();
        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));

        if (room.getStatus() == GameStatus.PLAYING) {
            client.sendEvent("gameStart",
                    new ErrorResponse("ALREADY_STARTED", "이미 게임이 시작된 방입니다."));
            return;
        }

        // 1. 방장인지 확인
        String requester = client.getSessionId().toString();
        UserInfo host = room.getPlayers().get(0);
        if (!host.getSessionId().equals(requester)) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NOT_HOST", "방장만 게임을 시작할 수 있습니다."));
            return;
        }

        // 2️. 플레이어 수 확인 (4명일 때만)
        if (room.getPlayers().size() < room.getMaxPlayers()) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NOT_ENOUGH_PLAYERS", "플레이어가 아직 4명 모이지 않았습니다."));
            return;
        }

        // 3️. 단어 리스트 조회
        List<String> fallingWords = wordService.getRandomWords();
        if (fallingWords == null || fallingWords.isEmpty()) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NO_WORDS", "게임을 시작할 단어가 부족합니다."));
            return;
        }
        room.initFallingwords(fallingWords);
        room.start();

        // 4️. 3초 뒤에 모든 사용자에게 게임 시작 알림
        taskScheduler.schedule(() -> {
            StartGameResponse resp = StartGameResponse.builder()
                    .roomId(roomId)
                    .players(room.getPlayers())
                    .fallingWords(fallingWords)
                    .initialLives(5)
                    .initialDropInterval(2000)
                    .initialFallDuration(10000)
                    .message("게임이 시작되었습니다.")
                    .build();

            server().getRoomOperations(roomId)
                    .sendEvent("gameStart", resp);

            wordDropScheduler.startDrooping(
                    roomId,
                    resp.getInitialDropInterval(),
                    resp.getInitialFallDuration()
            );
        }, Instant.now().plusSeconds(3));  // ← here
    }

    private void handleExitRoom(SocketIOClient client, ExitRoomRequest data) {
        String roomId = data.getRoomId();
        String nickname = data.getNickname();
        String sessionId = client.getSessionId().toString();

        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."))
                ;
        //
        boolean wasHost = sessionId.equals(room.getHostSessionId());

        // 1. 사용자 제거
        room.removePlayer(sessionId);
        client.leaveRoom(roomId);

        // 만약 모든 사용자가 나갔다면 방 삭제
        if (room.getPlayers().isEmpty()) {
            roomManager.removeRoom(roomId);
            return;
        }

        // 2. 새로운 방장 세션 ID 조회
        String newHostSessionId = room.getHostSessionId();

        // 3. isHost가 업데이트 된 플레이어 목록
        List<UserInfo> updatedPlayers = room.getPlayers().stream()
                .map(u -> new UserInfo(
                        u.getSessionId(),
                        u.getNickname(),
                        u.getSessionId().equals(newHostSessionId)
                ))
                .collect(Collectors.toList());

        // 4. 퇴장한 플레이어 정보
        UserInfo leftUser = new UserInfo(sessionId, nickname, wasHost);

        // 5. 새 방장 정보
        UserInfo newHost = null;
        if (wasHost && !room.getPlayers().isEmpty()) {
                 newHost = updatedPlayers.stream()
                    .filter(UserInfo::getIsHost)
                    .findFirst()
                    .orElse(null);
        }

        // 3. 사용자들에게 브로드캐스트
        ExitRoomResponse response = new ExitRoomResponse(
                roomId,
                leftUser,
                newHost,
                updatedPlayers
        );
        server().getRoomOperations(roomId)
                .sendEvent("roomExit", response);

        // 나간 유저에게도 응답이 필요하면 추가



    }

    private void handleInputText(SocketIOClient client, InputTextRequest data) {
        String text = data.getText();
        String nickname = data.getNickname();
        String roomId = data.getRoomId();
//        String sessionId = client.getSessionId().toString();

        if (text == null || text.isBlank()) {
            log.warn("handleInputText: text를 입력해주세요 ");
            return;
        }
        InputTextResponse response = new InputTextResponse(text, nickname);
        // 클라이언트가 속한 방 ID 찾기
        //    getAllRooms()에는 세션ID(=client.getSessionId().toString())도 포함되므로, 이를 제외하고 방 ID를 꺼냄.
//        String roomId = client.getAllRooms().stream()
//                .filter(r -> !r.equals(sessionId))
//                .findFirst()
//                .orElse(null);


        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));

        if (room.getStatus() != GameStatus.PLAYING) {
            return;
        }
        if (roomId != null) {
            // 해당 방에 이벤트 브로드캐스트
            server().getRoomOperations(roomId)
                    .sendEvent("textInput", client, response);
        } else {
            log.warn("handleInputText: 클라이언트가 어느 방에도 속해있지 않습니다. sessionId={}", client.getSessionId());
        }
    }


    private void handleCheckText(SocketIOClient client, InputTextRequest data) {
        String text = data.getText();
        String nickname = data.getNickname();
        String roomId = data.getRoomId();
        String sessionId = client.getSessionId().toString();
        if (text == null || text.isBlank()) {
            log.warn("handleInputText: text를 입력해주세요 ");
            client.sendEvent("textCheck",
                    new ErrorResponse("NONE_TEXT", "글자를 입력해주세요."));
            return;
        }


        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));
        if (room.getStatus() != GameStatus.PLAYING) {
            return;
        }
        // 1. 맞았는지 체크 & activeWords에서 제거
        boolean isCorrect = room.removeActiveWord(text);
        //  2. 누적 점수 계산
        int updatedScore;
        if (isCorrect) {
            // incrementScore 내부에서 점수를 1 올린 후, 올린 뒤의 누적 점수를 리턴
            updatedScore = room.incrementScore(sessionId);
        } else {
            // 오답인 경우에도, 기존 누적 점수는 유지
            updatedScore = room.getScoreMap().getOrDefault(sessionId, 0);
        }

        CheckTextResponse response = new CheckTextResponse(
                nickname,
                text,
                isCorrect,
                updatedScore
        );
        server().getRoomOperations(roomId).sendEvent("textCheck", response);


    }
    private void handleSendChat(SocketIOClient client, SendChatRequest data) {
        String message = data.getMessage();
        String nickname = data.getNickname();
        String roomId   = data.getRoomId();

        if(message == null || message.trim().isEmpty()) {
            client.sendEvent("chatSend", new ErrorResponse("NONE_CHAT", "메시지를 입력해주세요."));
            return;
        }

        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));

        SendChatResponse response = new SendChatResponse(
                nickname,
                message
        );
        server().getRoomOperations(roomId).sendEvent("chatSend", client, response);

    }

    private void handleRemoveWord(SocketIOClient client, RemoveWordRequest data) {
        String roomId = data.getRoomId();
        String word = data.getWord();

        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));
        // 1. 낙하중인 리스트에서 단어 삭제
        room.removeActiveWord(word);

        // 2. 목숨 하나 삭제하고 남은 목숨 반환
        int currentLife = room.loseLife();
        RemoveWordResponse response = new RemoveWordResponse(
                currentLife
        );
        server().getRoomOperations(roomId).sendEvent("lostLife", response);
        // 3. 목숨이 0이면 게임 종료
        if (currentLife <= 0 ) {
            wordDropScheduler.cancel(roomId);
            gameEndService.endGame(roomId,false);
        }
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

            // 1) 연결 끊긴 세션을 가진 유저를 방에서 제거
            roomManager.findAllRooms().forEach(room -> {
                boolean wasInRoom = room.getPlayers().stream()
                        .anyMatch(u -> u.getSessionId().equals(sessionId));
                if (!wasInRoom) return;

                // 2) 나간 사용자 정보 찾아두기
                UserInfo exitingUser = room.getPlayers().stream()
                        .filter(u -> u.getSessionId().equals(sessionId))
                        .findFirst()
                        .orElse(new UserInfo(sessionId, "Unknown", false ));

                // 3) 방에서 플레이어 제거 (호스트 변경 포함)
                room.removePlayer(sessionId);
                client.leaveRoom(room.getRoomId());



                // 4) 방에 아무도 없으면 방 삭제
                if (room.getPlayers().isEmpty()) {
                    roomManager.removeRoom(room.getRoomId());
                    return;
                }

                UserInfo newHost = room.getPlayers().stream()
                        .filter(u -> u.getSessionId().equals(room.getHostSessionId()))
                        .findFirst()
                        .orElse(null);

                // 5) 나머지 사람들에게 퇴장 알림
                ExitRoomResponse response = new ExitRoomResponse(
                        room.getRoomId(),
                        exitingUser,
                        newHost, // 새 방장
                        room.getPlayers()
                );
                server().getRoomOperations(room.getRoomId())
                        .sendEvent("playerDisconnected", response);
            });
        };
    }


    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }


}
