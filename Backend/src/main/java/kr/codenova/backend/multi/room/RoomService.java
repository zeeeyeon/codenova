package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import kr.codenova.backend.multi.dto.request.CreateRoomRequest;
import kr.codenova.backend.multi.dto.request.JoinRoomRequest;
import kr.codenova.backend.multi.dto.request.LeaveRoomRequest;
import kr.codenova.backend.multi.dto.response.RoomListResponse;

import java.util.Collection;
import java.util.List;

public interface RoomService {

    // 방 만들기
    public void createRoom(CreateRoomRequest request, AckRequest ackSender);

    // 방 목록 조회
    public List<RoomListResponse> getRoomList();

    // 방 조회
    public Room getRoom(String roomId);

    // 방에 접속하기
    public void joinRoom(JoinRoomRequest request, SocketIOClient client, AckRequest ackSender);

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms();

    // 방 나가기 처리
    public void leaveRoom(LeaveRoomRequest request, SocketIOClient client);

    // 룸 코드 생성
    public String generatedRoomCode();

    public Boolean existsRoom(String roomId);
}
