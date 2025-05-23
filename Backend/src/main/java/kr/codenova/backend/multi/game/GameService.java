package kr.codenova.backend.multi.game;

import com.corundumstudio.socketio.SocketIOServer;
import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.global.config.socket.SocketIOServerProvider;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.multi.dto.RoundStartRequest;
import kr.codenova.backend.multi.dto.broadcast.GameCountdownBroadcast;
import kr.codenova.backend.multi.dto.broadcast.GameResultBroadcast;
import kr.codenova.backend.multi.dto.broadcast.ReadyGameBroadcast;
import kr.codenova.backend.multi.dto.broadcast.TypingStartBroadcast;
import kr.codenova.backend.multi.dto.request.FinishGameRequest;
import kr.codenova.backend.multi.dto.request.ProgressUpdateRequest;
import kr.codenova.backend.multi.dto.request.ReadyGameRequest;
import kr.codenova.backend.multi.dto.request.StartGameRequest;
import kr.codenova.backend.multi.exception.InvalidGameStartException;
import kr.codenova.backend.multi.exception.IsNotHostException;
import kr.codenova.backend.multi.exception.RoomNotFoundException;
import kr.codenova.backend.multi.room.Room;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public interface GameService {

    // 1. 사용자 준비 토글
    public void toggleReady(ReadyGameRequest request);

    // 2. 현재 방 준비 상태 정보 생성
    public ReadyGameBroadcast buildReadyBroadcast(String roomId);

    // 3. 게임 시작 요청 처리
    public void startGame(StartGameRequest request) throws InterruptedException;

    // 4. 게임 시작 전 검증 (방장 여부 + 모든 준비 완료)
    public void validateStartGame(String roomId, String nickname);

    // 5. 3초 뒤에 타이핑 시작 알림
    @Async
    public void delayedTypingStart(String roomId) throws InterruptedException;

    // 6. 게임 진행률 갱신
    public void updateProgress(ProgressUpdateRequest request);

    // 7. 라운드 종료
    void endRound(String roomId) throws InterruptedException;

    // 8. 라운드 시작
    void startRound(RoundStartRequest request) throws IsNotHostException;

    // 8. 게임 종료
    void endGame(String roomId);

    // 9. 오타 발생
    void addTypo(String roomId, String nickname);

    // 13. 방 별 유저 수 저장
    public void setRoomUserCount(String roomId, int userCount);

    // 14. 게임 본문 가져오기
    public String getGameContent(String language);
}
