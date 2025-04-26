package kr.codenova.backend.single.dto.response;

import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.common.enums.Language;

public record SingleBattleCodeResponse(
        Integer codeId,
        Language language,
        String content
) {
    public static SingleBattleCodeResponse from(Code code) {
        return new SingleBattleCodeResponse(
                code.getCodeId(),
                code.getLanguage(),
                code.getContent()
        );
    }
}
