package kr.codenova.backend.multi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinishGameRequest {
    private String roomId;
    private String nickname;
    private Double typingSpeed;
    private LocalDateTime finishTime; // ✅ 추가: 클라이언트 기준 게임 종료 시각
}
