package kr.codenova.backend.multi.room;

import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.exception.RoomFullException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomServiceImpl implements RoomService {

    private final Map<String, Room> roomMap = new ConcurrentHashMap<>();
    private final Logger log = LoggerFactory.getLogger(getClass());


    // 방 생성
    public Room createRoom(CreateRoomRequest request) {
        String roomId = UUID.randomUUID().toString();
        String roomCode = request.getIsLocked() ? generatedRoomCode() : null;
        Room room = new Room(
                roomId,
                request.getTitle(),
                request.getLanguage(),
                request.getMaxNum(),
                0,
                request.getIsLocked(),
                false,
                roomCode
                );
        roomMap.put(roomId, room);
        return room;
    }

    // 방 조회
    public Room getRoom(String roomId) {
        return roomMap.get(roomId);
    }

    // 방 입장
    public Room joinRoom(JoinRoomRequest request) {
        // 1. 방 조회
        Room room = roomMap.get(request.getRoomId());
        if(room == null) {
            throw new RoomNotFoundException("방을 찾을 수 없습니다.");
        }

        // 2. 최대 인원 체크
        if (room.getCurrentCount() >= room.getMaxCount()) {
            throw new RoomFullException("방이 가득 찼습니다.");
        }

        // 3. 입장 처리 (currentCount 증가)
        room.setCurrentCount(room.getCurrentCount() + 1);

        // 4. (필요시) room 객체 업데이트
        roomMap.put(room.getRoomId(), room);

        return room;
    }

    // 빈 방 확인하기
    public Boolean isRoomEmpty(String roomId) {
        Room room = roomMap.get(roomId);
        return room != null && room.getCurrentCount() <= 0;
    }

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms() {
        return roomMap.values();
    }

    // 방 퇴장
    public void leaveRoom(String roomId) {
        Room room = roomMap.get(roomId);
        if (room == null) {
            log.warn("존재하지 않는 방입니다: {}", roomId);
            return;
        }

        // 현재 인원 감소 (음수 방지)
        room.setCurrentCount(Math.max(room.getCurrentCount() - 1, 0));

        // 인원이 0명이면 방 삭제
        if (room.getCurrentCount() == 0) {
            roomMap.remove(roomId);
        }
    }

    public String generatedRoomCode() {
        return UUID.randomUUID().toString().substring(0,6).toUpperCase();
    }

}
