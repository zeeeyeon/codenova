package kr.codenova.backend.multi.room;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import kr.codenova.backend.multi.dto.request.*;
import kr.codenova.backend.multi.dto.response.RoomListResponse;
import kr.codenova.backend.multi.exception.UserNotInRoomException;

import java.util.Collection;
import java.util.List;

public interface RoomService {

    // 방 목록 조회
    public List<RoomListResponse> getRoomList();

    // 방 만들기
    public void createRoom(SocketIOClient client, CreateRoomRequest request, AckRequest ackSender);

    // 방 조회
    public Room getRoom(String roomId);

    // 방에 접속하기
    public void joinRoom(JoinRoomRequest request, SocketIOClient client, AckRequest ackSender);

    // 전체 방 목록 조회
    public Collection<Room> getAllRooms();

    // 방 나가기 처리
    public void leaveRoom(LeaveRoomRequest request, SocketIOClient client, boolean isDisconnected) throws UserNotInRoomException;

    // 룸 코드 생성
    public String generatedRoomCode();

    public Boolean existsRoom(String roomId);

    void getRoomStatus(RoomStatusRequest request, SocketIOClient client);

    public void onDisconnect(SocketIOClient client);

    void updateRoomStataus(FixRoomRequest request, SocketIOClient client);
}
