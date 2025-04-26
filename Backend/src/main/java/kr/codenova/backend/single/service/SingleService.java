package kr.codenova.backend.single.service;

import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.dto.response.SingleBattleCodeResponse;

public interface SingleService {
    LanguageCategory getLanguageCategories();
    SingleBattleCodeResponse getSingleBattleCode(String languageCode);
    boolean saveTypingSpeed(int memberId, SingleCodeResultRequest request);
}
