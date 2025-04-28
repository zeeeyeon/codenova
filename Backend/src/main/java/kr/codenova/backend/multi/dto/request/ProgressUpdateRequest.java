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
}
