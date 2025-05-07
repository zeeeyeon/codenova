package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.multi.dto.broadcast.ChangeHostBroadcast;
import kr.codenova.backend.multi.dto.broadcast.JoinRoomBroadcast;
import kr.codenova.backend.multi.dto.broadcast.NoticeBroadcast;
import kr.codenova.backend.multi.dto.broadcast.RoomUpdateBroadcast;
import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.request.RoomStatusRequest;
import kr.codenova.backend.multi.dto.response.CreateRoomResponse;
import kr.codenova.backend.multi.dto.response.RoomListResponse;
import kr.codenova.backend.multi.dto.response.RoomStatusResponse;
import kr.codenova.backend.multi.exception.AlreadyStartException;
import kr.codenova.backend.multi.exception.InvalidPasswordException;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.multi.room.Room.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomServiceImpl implements RoomService {

    private final Map<String, Room> roomMap = new ConcurrentHashMap<>();
    private final Map<String, String> userRoomMap = new ConcurrentHashMap<>();

    private final Logger log = LoggerFactory.getLogger(getClass());

    private SocketIOServer getServer() {
        return SocketIOServerProvider.getServer();
    }

    /**
     * 방 생성
     * 1. 방 생성 시 즉시 방장 지정
     * 2. 유저-방 매핑 정보 저장 (userRoomMap 활용)
     * 3. 유저 입장 시간 기록 (자동 방장 위임에 필요)
     *
     * 이 userRoomMap은 나중에 방장이 나갔을 때 해당 유저가 어떤 방에 있었는지 빠르게 찾는 데 사용할 수 있으며,
     * 특히 연결 해제 이벤트 처리 시에도 유용합니다.
     */
    public void createRoom(SocketIOClient client, CreateRoomRequest request, AckRequest ackSender) {
        String roomId = UUID.randomUUID().toString();
        String roomCode = request.getIsLocked() ? generatedRoomCode() : null;
        String sessionId = client.getSessionId().toString();

        Room room = Room.builder()
                .roomId(roomId)
                .roomTitle(request.getTitle())
                .language(request.getLanguage())
                .maxCount(request.getMaxNum())
                .currentCount(1)
                .isLocked(request.getIsLocked())
                .isStarted(false)
                .roomCode(roomCode)
                .createdAt(LocalDateTime.now())
                .build();
        roomMap.put(roomId, room);
        log.info("방 생성 : " + room.toString());

        // 유저 준비 상태 초기화
        room.getUserStatusMap().put(request.getNickname(), new UserStatus(true, true));

        // 유저 입장 시간 기록 (자동 방장 위임에 필요)
        room.getUserJoinTimes().put(request.getNickname(), System.currentTimeMillis());

        // 유저-방 매핑 정보 저장
        userRoomMap.put(sessionId, roomId);

        // 클라이언트 방 입장시키기
        client.joinRoom(roomId);

        // 응답 생성 및 전송
        CreateRoomResponse response = new CreateRoomResponse(room);
        ackSender.sendAckData(response);

        // 방 정보 저장 및 브로드캐스트

        RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(room);
        getServer().getBroadcastOperations().sendEvent("room_update", broadcast);

        log.info("방 생성 완료: " + request.getTitle() + ", 방장: " + request.getNickname() + ", 세션ID: " + sessionId);
        log.info("roomMap 저장 확인: " + roomId + " → " + roomMap.containsKey(roomId));
    }

    // 방 조회
    public Room getRoom(String roomId) {
        return roomMap.get(roomId);
    }

    // 방 현재 상태 조회
    public void getRoomStatus(RoomStatusRequest request, SocketIOClient client) {
        Room room = roomMap.get(request.getRoomId());
        RoomStatusResponse response = new RoomStatusResponse(room);
        client.sendEvent("room_status", response);


        JoinRoomBroadcast broadcast = new JoinRoomBroadcast(room);
        getServer().getBroadcastOperations().sendEvent("join_room", broadcast);

    }

    // 공개방 입장
    public void joinRoom(JoinRoomRequest request, SocketIOClient client, AckRequest ackSender) {
        Room room = roomMap.get(request.getRoomId());
        if (room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        // 게임중인 방 확인 로직 추가
        if (room.getIsStarted()) {
            throw new AlreadyStartException("이미 게임이 시작된 방입니다.");
        }

        // 비밀방 확인 로직 추가
        if (room.getIsLocked()) {
            // 비밀방인데 코드가 없거나 일치하지 않으면 예외 발생
            if (request.getRoomCode() == null || !request.getRoomCode().equals(room.getRoomCode())) {
                throw new InvalidPasswordException("비밀번호가 일치하지 않습니다.");
            }
        }

        if (room.getCurrentCount() >= room.getMaxCount()) {
            throw new RoomFullException("방이 가득 찼습니다.");
        }

        room.setCurrentCount(room.getCurrentCount() + 1);
        room.getUserStatusMap().put(request.getNickname(), new UserStatus(false, false));
        room.getUserJoinTimes().put(request.getNickname(), System.currentTimeMillis());
        roomMap.put(room.getRoomId(), room);

        // ✅ 클라이언트 방 조인
        client.joinRoom(room.getRoomId());

        ackSender.sendAckData("joined");

        // ✅ 응답
        JoinRoomBroadcast response = new JoinRoomBroadcast(room);
        getServer().getRoomOperations(room.getRoomId()).sendEvent("join_room", response);

        // ✅ 방 정보 브로드캐스트
        RoomUpdateBroadcast broadcast = RoomUpdateBroadcast.from(room);
        getServer().getBroadcastOperations().sendEvent("room_update", broadcast);
        client.sendEvent("room_update", broadcast);

        // ✅ [추가] 입장 알림 브로드캐스트
        getServer().getRoomOperations(request.getRoomId()).sendEvent("join_notice",
                new NoticeBroadcast(
                        request.getRoomId(),
                        request.getNickname(),
                        request.getNickname() + "님이 입장했습니다."
                )
        );
    }

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }

    /**
     * 방 퇴장
     * 1. 퇴장하는 유저가 방장인지 확인합니다.
     * 2. 방장이 나가고 다른 유저가 남아있는 경우:
     *  - 방에 남아있는 유저 중 가장 먼저 입장한 유저를 찾습니다.
     *  - 해당 유저를 새로운 방장으로 설정합니다.
     *  - 방장 권한 위임 이벤트를 브로드캐스트합니다.
     * 3. 퇴장하는 유저의 준비 상태와 입장 시간 정보를 삭제합니다.
     * 4. 퇴장하는 유저의 세션-방 매핑 정보를 삭제합니다.
     * 5. 기존 로직대로 퇴장 알림, 방 나가기, 방 업데이트/삭제 처리를 수행합니다.
     */
    public void leaveRoom(LeaveRoomRequest request, SocketIOClient client) {
        Room room = roomMap.get(request.getRoomId());
        if (room == null) {
            log.warn("존재하지 않는 방입니다: {}", request.getRoomId());
            return;
        }

        // ✅ 현재 인원 감소
        room.setCurrentCount(Math.max(room.getCurrentCount() - 1, 0));

        // 방장 권한 위임 처리
        UserStatus userStatus = room.getUserStatusMap().get(request.getNickname());

        boolean isHost = userStatus.isHost();
        // ✅ 클라이언트 방 나가기
        client.leaveRoom(request.getRoomId());
        String newHostNickname = null;



        if (isHost && room.getCurrentCount() > 0) {
            room.getUserStatusMap().remove(request.getNickname());

            // 방장이 나가고 다른 유저가 남아있는 경우, 가장 먼저 입장한 유저에게 방장 권한 위임
            Map<String, Long> joinTimes = room.getUserJoinTimes();

            // 방장을 제외한 유저 중 가장 입장 시간이 빠른 유저 찾기
            newHostNickname = joinTimes.entrySet().stream()
                    .filter(entry -> !entry.getKey().equals(request.getNickname()))
                    .min(Map.Entry.comparingByKey()) // 입장 시간이 가장 빠른 유저
                    .map(Map.Entry::getKey)
                    .orElse(null);



            if (newHostNickname != null) {
                // 새 방장 설정
                UserStatus newHostStatus = room.getUserStatusMap().get(newHostNickname);
                newHostStatus.setHost(true);
                newHostStatus.setReady(true);
                log.info("방장 권한 위임: {} -> {}, 방: {}",
                        request.getNickname(), newHostNickname, request.getRoomId());

                RoomStatusResponse roomStatusResponse = new RoomStatusResponse(room);


                getServer().getRoomOperations(request.getRoomId())
                        .sendEvent("host_changed", roomStatusResponse);
            }
        }

        // 유저 준비 상태 및 입장 시간 정보 제거
        room.getUserStatusMap().remove(request.getNickname());
        room.getUserJoinTimes().remove(request.getNickname());

        // userRoomMap에서 사용자 정보 제거
        userRoomMap.remove(client.getSessionId().toString());

        // ✅ [추가] 퇴장 알림 - 본인 제외하고 전송
        getServer().getRoomOperations(request.getRoomId())
                .getClients()
                .stream()
                .filter(c -> !c.getSessionId().equals(client.getSessionId())) // 본인 제외
                .forEach(otherClient ->
                        otherClient.sendEvent("leave_notice", new NoticeBroadcast(
                                request.getRoomId(),
                                request.getNickname(),
                                request.getNickname() + "님이 퇴장했습니다."
                        ))
                );

        // ✅ 방 삭제 or 업데이트 브로드캐스트
        if (room.getCurrentCount() == 0) {
            roomMap.remove(request.getRoomId());
            getServer().getBroadcastOperations().sendEvent("room_removed", request.getRoomId());
        } else {
            RoomUpdateBroadcast updated = RoomUpdateBroadcast.from(room);
            getServer().getBroadcastOperations().sendEvent("room_update", updated);
        }
    }

    public String generatedRoomCode() {
        return UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

    public Boolean existsRoom(String roomId) {
        Room room = roomMap.get(roomId);
        return room != null && room.getCurrentCount() > 0;
    }

    public List<RoomListResponse> getRoomList() {
        return getAllRooms().stream()
                .sorted((r1, r2) -> {
                    // 1️⃣ 게임 중 여부 우선 정렬 (false < true)
                    int compareByIsStarted = Boolean.compare(r1.getIsStarted(), r2.getIsStarted());
                    if (compareByIsStarted != 0) {
                        return compareByIsStarted; // 게임 중인 방은 뒤로
                    }
                    // 2️⃣ 생성일 내림차순 정렬
                    return r2.getCreatedAt().compareTo(r1.getCreatedAt());
                })
                .map(room -> new RoomListResponse(
                        room.getRoomId(),
                        room.getRoomTitle(),
                        room.getCurrentCount(),
                        room.getMaxCount(),
                        room.getLanguage(),
                        room.getIsLocked(),
                        room.getIsStarted()))
                .toList();
    }

}
