package kr.codenova.backend.multi.room;

import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public interface RoomService {

    // 방 만들기
    public Room createRoom(CreateRoomRequest request);

    // 방 조회
    public Room getRoom(String roomId);

    // 방에 접속하기
    public Room joinRoom(JoinRoomRequest request);

    // 빈 방 확인하기
    public Boolean isRoomEmpty(String roomId);

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms();

    // 방 나가기 처리
    public void leaveRoom(String roomId);

    // 룸 코드 생성
    public String generatedRoomCode();

    public Boolean existsRoom(String roomId);
}
