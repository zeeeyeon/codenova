package kr.codenova.backend.multi.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressUpdateRequest {
    private String roomId;
    private String nickname;
    private int progressPercent;  // 진행률 (0~100)
    private Integer time; // 도착 시간 (밀리초) - 100%일 때만 유효
}
