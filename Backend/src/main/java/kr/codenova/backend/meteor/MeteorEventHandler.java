package kr.codenova.backend.meteor;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

import kr.codenova.backend.meteor.dto.request.*;
import kr.codenova.backend.meteor.dto.request.CreateRoomRequest;
import kr.codenova.backend.meteor.dto.response.*;
import kr.codenova.backend.meteor.service.GameEndService;
import kr.codenova.backend.meteor.service.ReadyCheckService;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
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
    private final ReadyCheckService readyCheckService;
    private final Map<String, ScheduledFuture<?>> hostKickTimers = new ConcurrentHashMap<>();

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
//        server().addEventListener("lifeLost", RemoveWordRequest.class, (client, data, ack) -> handleRemoveWord(client, data));
        // 게임 준비 이벤트
        server().addEventListener("gameReady", GameReadyRequest.class, (client, data, ack) -> handleReadyGame(client, data));
        // 게임 종료 후 대기방으로 복귀 이벤트
        server().addEventListener("goWaitingRoom", GoWaitingRoomRequest.class, (client, data, ack) -> handleGoWaitingRoom(client, data));
        server().addEventListener("exitGame", ExitRoomRequest.class, (client, data, ack) -> handleExitGame(client, data));

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
            room.addPlayer(new UserInfo(hostSessionId, nickname,true,true,false));
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

        if (room.getStatus() == GameStatus.PLAYING) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("ALREADY_PLAYING", "게임중인 방입니다."));
            return;
        }

        // 같은 세션 아이디 중복 입장 못하게 하기
        boolean alreadyIn = room.getPlayers().stream()
                .anyMatch(u -> u.getSessionId().equals(client.getSessionId().toString()));
        if (alreadyIn) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("ALREADY_IN_ROOM", "이미 이 방에 참여 중입니다."));
            return;
        }

        boolean nicknameExists = room.getPlayers().stream()
                .anyMatch(u -> u.getNickname().equals(nickname));
        if (nicknameExists) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("DUPLICATE_NICKNAME", "이미 방에 동일한 닉네임의 사용자가 있습니다."));
            return;
        }

        if (room.isFull()) {
            client.sendEvent("secretRoomJoin",
                    new ErrorResponse("ROOM_FULL", "방이 가득 차서 입장할 수 없습니다."));
            return;
        }

        client.joinRoom(room.getRoomId());

        UserInfo newUser = new UserInfo(client.getSessionId().toString(), nickname, false,false,false);
        room.addPlayer(newUser);

        if (!newUser.getIsHost()) {
            readyCheckService.startReadyCheck(room.getRoomId(), newUser.getSessionId(), nickname);
        }

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
                roomId -> new UserInfo(client.getSessionId().toString(), nickname,true,true,false)
        );

        GameRoom room  = result.getRoom();
        boolean isHost = result.isCreated();

        // 2️. 소켓 방에 조인
        client.joinRoom(room.getRoomId());

        // 3️. non-host 는 players 에 추가하면서 단일 예외 처리
        if (!isHost) {
            UserInfo user = new UserInfo(client.getSessionId().toString(), nickname, false,false,false);
            try {
                room.addPlayer(user);  // 여기가 유일한 가득 참 체크 지점
                readyCheckService.startReadyCheck(room.getRoomId(), user.getSessionId(), nickname);
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
        String host = room.getHostSessionId();
        if (!requester.equals(host)) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NOT_HOST", "방장만 게임을 시작할 수 있습니다."));
            return;
        }

        // 2. 플레이어 수 확인 ( 최소 2명이 있어야 시작 가능)
        if (room.getPlayers().size() < 2) {
            client.sendEvent("gameStart",
                    new ErrorResponse("MIN_PLAYER", "게임을 시작하려면 2명 이상의 플레이어가 필요합니다."));
            return;
        }
        // 3. 모든 플레이어가 준비 완료 상태인지 확인
        if (!room.isAllReady()) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NOT_ALL_READY", "모든 플레이어가 준비 완료 상태여야 합니다."));
            return;
        }


        // 4. 단어 리스트 조회
        List<String> fallingWords = wordService.getRandomWords();
        if (fallingWords == null || fallingWords.isEmpty()) {
            client.sendEvent("gameStart",
                    new ErrorResponse("NO_WORDS", "게임을 시작할 단어가 부족합니다."));
            return;
        }
        log.info("게임 시작으로 인한 모든 준비 타이머 취소: roomId={}", roomId);
        cancelHostKickTimer(roomId);
        readyCheckService.cancelAllReadyChecks(roomId);
        room.initFallingwords(fallingWords);
        room.start();



        StartGameResponse resp = StartGameResponse.builder()
                .roomId(roomId)
                .players(room.getPlayers())
                .fallingWords(fallingWords)
                .initialLives(5)
                .initialDropInterval(1800)
                .initialFallDuration(8000)
                .message("게임이 시작되었습니다.")
                .build();

        server().getRoomOperations(roomId)
                .sendEvent("gameStart", resp);
        taskScheduler.schedule(() -> {
            wordDropScheduler.startDrooping(
                    roomId,
                    resp.getInitialDropInterval(),
                    resp.getInitialFallDuration()
            );
        }, Instant.now().plusSeconds(4));


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
        readyCheckService.cancelReadyCheck(roomId, sessionId);
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
                        u.getSessionId().equals(newHostSessionId),
                        u.getIsReady(),
                        u.getIsWaiting()
                ))
                .collect(Collectors.toList());

        // 4. 퇴장한 플레이어 정보
        UserInfo leftUser = new UserInfo(sessionId, nickname, wasHost,false,false);

        // 5. 새 방장 정보
        UserInfo newHost = null;
        if (wasHost && !room.getPlayers().isEmpty()) {
                 newHost = updatedPlayers.stream()
                    .filter(UserInfo::getIsHost)
                    .findFirst()
                    .orElse(null);
        }

        // 6. 사용자들에게 브로드캐스트

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
    private void handleExitGame(SocketIOClient client, ExitRoomRequest data) {
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
        readyCheckService.cancelReadyCheck(roomId, sessionId);
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
                        u.getSessionId().equals(newHostSessionId),
                        u.getIsReady(),
                        u.getIsWaiting()
                ))
                .collect(Collectors.toList());

        // 4. 퇴장한 플레이어 정보
        UserInfo leftUser = new UserInfo(sessionId, nickname, wasHost,false,false);

        // 5. 새 방장 정보
        UserInfo newHost = null;
        if (wasHost && !room.getPlayers().isEmpty()) {
            newHost = updatedPlayers.stream()
                    .filter(UserInfo::getIsHost)
                    .findFirst()
                    .orElse(null);
        }

        // 6. 사용자들에게 브로드캐스트

        ExitRoomResponse response = new ExitRoomResponse(
                roomId,
                leftUser,
                newHost,
                updatedPlayers
        );
        server().getRoomOperations(roomId)
                .sendEvent("gameLeave", response);



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
        InputTextResponse response = new InputTextResponse(nickname,text);
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
        boolean isCorrect = room.checkWordAndUpdateScore(text, sessionId);

        // 맞은 경우 단어 임팩트 타이머 취소
        if (isCorrect) {
            wordDropScheduler.cancelWordImpact(roomId, text);
        }

        // 2. 누적 점수 계산
        int updatedScore = room.getScoreMap().getOrDefault(sessionId, 0);

        CheckTextResponse response = new CheckTextResponse(
                nickname,
                text,
                isCorrect,
                updatedScore
        );
        server().getRoomOperations(roomId).sendEvent("textCheck", response);

        // 3) 승리 조건 검사
        if (isCorrect
                && !room.hasMoreFallingWords()
                && !room.hasActiveWords()
        ) {
            // 남은 단어도 없고, 화면에도 떠 있는 단어가 없을 때
            wordDropScheduler.cancel(roomId);
            gameEndService.endGame(roomId, true);
        }
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
        server().getRoomOperations(roomId).sendEvent("chatSend", response);

    }


    private void handleReadyGame(SocketIOClient client, GameReadyRequest data) {
        String nickname = data.getNickname();
        String roomId = data.getRoomId();
        String sessionId = client.getSessionId().toString();

        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));

        UserInfo player = room.getPlayers().stream()
                .filter(p -> p.getSessionId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("방에 해당 사용자가 없습니다."));

        // 현재 준비 상태의 반대 값으로 토글
        boolean newReadyState = !(player.getIsReady() != null && player.getIsReady());

        boolean allReady = room.setReady(sessionId, newReadyState);
        if (allReady) {
            log.info("모두 준비 완료 - 방장 강퇴 타이머 시작: roomId={}", roomId);
            cancelHostKickTimer(roomId);

            ScheduledFuture<?> warningFuture = taskScheduler.schedule(() -> {
                sendHostKickWarning(roomId);
            }, Instant.now().plusSeconds(15));
            ScheduledFuture<?> future = taskScheduler.schedule(() -> {
                kickHost(roomId);
            }, Instant.now().plusSeconds(20));
            hostKickTimers.put(roomId + "_warning", warningFuture);
            hostKickTimers.put(roomId, future);
        }else {
            log.info("준비 취소 - 방장 강퇴 타이머 취소: roomId={}", roomId);
            cancelHostKickTimer(roomId);
        }

        readyCheckService.manageReadyTimer(roomId, sessionId, nickname, newReadyState, player.getIsHost());


        GameReadyResponse response = GameReadyResponse.builder()
                .allReady(allReady)
                .players(room.getPlayers())
                .build();



        server().getRoomOperations(roomId).sendEvent("readyGame", response);
    }
    // 방장 강퇴 타이머 취소 메소드
    private void cancelHostKickTimer(String roomId) {
        ScheduledFuture<?> warningFuture = hostKickTimers.get(roomId + "_warning");
        if (warningFuture != null && !warningFuture.isDone() && !warningFuture.isCancelled()) {
            warningFuture.cancel(false);
            hostKickTimers.remove(roomId + "_warning");
            log.info("방장 강퇴 경고 타이머 취소: roomId={}", roomId);
        }


        ScheduledFuture<?> future = hostKickTimers.get(roomId);
        if (future != null && !future.isDone() && !future.isCancelled()) {
            future.cancel(false);
            hostKickTimers.remove(roomId);
            log.info("방장 강퇴 타이머 취소: roomId={}", roomId);
        }
    }

    private void handleGoWaitingRoom(SocketIOClient client, GoWaitingRoomRequest data) {
        String nickname = data.getNickname();
        String roomId = data.getRoomId();
        String sessionId = client.getSessionId().toString();
        if(nickname == null || nickname.isBlank()) {
            client.sendEvent("waitingRoomGo",
                    new ErrorResponse("INVALID_NICKNAME", "닉네임을 입력해주세요."));
            return;
        }
        GameRoom room = roomManager.findById(roomId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방입니다."));

        // 현재 사용자를 찾아서 대기 상태로 설정
        UserInfo currentUser = room.getPlayers().stream()
                .filter(p -> p.getSessionId().equals(sessionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        // 이 사용자를 대기 상태로 표시
        currentUser.setIsWaiting(true);
        if (currentUser.getIsHost()) {
            currentUser.setIsReady(true);
        }else{
            currentUser.setIsReady(false);
            readyCheckService.startReadyCheck(roomId,sessionId,nickname);
        }
        // 대기 상태인 사용자들만 필터링
        List<UserInfo> waitingPlayers = room.getPlayers().stream()
                .filter(player -> Boolean.TRUE.equals(player.getIsWaiting()))
                .collect(Collectors.toList());


        GoWaitingRoomResponse response = new GoWaitingRoomResponse(room.getRoomId(), room.getRoomCode(),waitingPlayers);
        server().getRoomOperations(roomId).sendEvent("waitingRoomGo", response);


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

                readyCheckService.cancelReadyCheck(room.getRoomId(), sessionId);

                // 2) 나간 사용자 정보 찾아두기
                UserInfo exitingUser = room.getPlayers().stream()
                        .filter(u -> u.getSessionId().equals(sessionId))
                        .findFirst()
                        .orElse(new UserInfo(sessionId, "Unknown", false, false,false));

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

    private void kickHost(String roomId) {
        log.info("방장 강퇴 처리 시작: roomId={}", roomId);

        Optional<GameRoom> optRoom = roomManager.findById(roomId);
        if (optRoom.isEmpty()) {
            log.info("방장 강퇴 취소 - 방 없음: roomId={}", roomId);
            return;
        }

        GameRoom room = optRoom.get();

        // 게임 중이면 취소
        if (room.getStatus() == GameStatus.PLAYING) {
            log.info("방장 강퇴 취소 - 게임 중: roomId={}", roomId);
            cancelHostKickTimer(roomId);
            return;
        }

        // 모든 사용자가 준비 상태가 아니면 취소
        if (!room.isAllReady()) {
            log.info("방장 강퇴 취소 - 모든 사용자가 준비 상태가 아님: roomId={}", roomId);
            cancelHostKickTimer(roomId);
            return;
        }

        String hostSessionId = room.getHostSessionId();

        // 방장 정보 찾기
        Optional<UserInfo> hostUserOpt = room.getPlayers().stream()
                .filter(u -> u.getSessionId().equals(hostSessionId))
                .findFirst();

        if (hostUserOpt.isEmpty()) {
            log.info("방장 강퇴 취소 - 방장 정보 없음: roomId={}", roomId);
            cancelHostKickTimer(roomId);
            return;
        }

        UserInfo hostUser = hostUserOpt.get();
        String hostNickname = hostUser.getNickname();

        // 방장 강퇴 처리
        log.info("방장 강퇴 실행: roomId={}, hostSessionId={}", roomId, hostSessionId);

        // 방장 제거
        room.removePlayer(hostSessionId);
        readyCheckService.cancelReadyCheck(roomId, hostSessionId);


        // 방이 비었으면 삭제
        if (room.getPlayers().isEmpty()) {
            roomManager.removeRoom(roomId);
            return;
        }

        // 새 방장 세션 ID 조회
        String newHostSessionId = room.getHostSessionId();

        // isHost가 업데이트 된 플레이어 목록
        List<UserInfo> updatedPlayers = room.getPlayers().stream()
                .map(u -> new UserInfo(
                        u.getSessionId(),
                        u.getNickname(),
                        u.getSessionId().equals(newHostSessionId),
                        u.getIsReady(),
                        u.getIsWaiting()
                ))
                .collect(Collectors.toList());

        // 새 방장 정보
        UserInfo newHost = updatedPlayers.stream()
                .filter(UserInfo::getIsHost)
                .findFirst()
                .orElse(null);

        // 퇴장한 방장 정보
        UserInfo leftUser = new UserInfo(hostSessionId, hostNickname, true, true, false);

        // 사용자들에게 브로드캐스트
        ExitRoomResponse response = new ExitRoomResponse(
                roomId,
                leftUser,
                newHost,
                updatedPlayers
        );

        // 다른 플레이어들에게 알림 (방장이 강퇴되었음을 나타내는 이벤트 이름)
        server().getRoomOperations(roomId)
                .sendEvent("roomExit", response);
    }

    // 방장 강퇴 5초 전 경고 메서드
    private void sendHostKickWarning(String roomId) {
        log.info("방장 강퇴 5초 전 경고 전송: roomId={}", roomId);

        Optional<GameRoom> optRoom = roomManager.findById(roomId);
        if (optRoom.isEmpty()) {
            log.info("경고 취소 - 방 없음: roomId={}", roomId);
            return;
        }

        GameRoom room = optRoom.get();

        // 게임 중이면 취소
        if (room.getStatus() == GameStatus.PLAYING) {
            log.info("경고 취소 - 게임 중: roomId={}", roomId);
            cancelHostKickTimer(roomId);
            return;
        }

        // 모든 사용자가 준비 상태가 아니면 취소
        if (!room.isAllReady()) {
            log.info("경고 취소 - 모든 사용자가 준비 상태가 아님: roomId={}", roomId);
            cancelHostKickTimer(roomId);
            return;
        }

        String hostSessionId = room.getHostSessionId();

        // 방장에게 경고 메시지 전송
        SocketIOClient hostClient = server().getClient(UUID.fromString(hostSessionId));
        if (hostClient != null) {
            log.info("5초전 방장에게 경고");
            hostClient.sendEvent("hostKickWarning");
        }else {
            log.info("방장이 존재하지 않음");
        }


    }




}
