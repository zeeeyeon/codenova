package kr.codenova.backend.single.dto.request;

import kr.codenova.backend.common.enums.Language;

public record SingleCodeResultRequest(
        Integer codeId,
        Language language,
        double inputLength,
        int time
) {
    public double calculateTypingSpeed() {
        if (time == 0) return 0.0;
        return inputLength * (60.0 / time);
    }
}
