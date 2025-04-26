package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.common.entity.Code;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.dto.response.SingleBattleCodeResponse;
import kr.codenova.backend.single.entity.TypingSpeed;
import kr.codenova.backend.single.repository.CodeRepository;
import kr.codenova.backend.single.repository.TypingSpeedRepository;
import kr.codenova.backend.single.service.SingleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static kr.codenova.backend.global.response.ResponseCode.CODE_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class SingleServiceImpl implements SingleService {
    
    private final CodeRepository codeRepository;
    private final TypingSpeedRepository typingSpeedRepository;

    @Override
    public LanguageCategory getLanguageCategories() {
        return LanguageCategory.withAllCategories();
    }

    @Override
    public SingleBattleCodeResponse getSingleBattleCode(String language) {
        if (!Language.isValid(language)) {
            throw new CustomException(CODE_NOT_FOUND);
        }

        return codeRepository.findRandomByLanguage(language)
                .map(SingleBattleCodeResponse::from)
                .orElseThrow(() -> new CustomException(CODE_NOT_FOUND));
    }

    @Override
    public boolean saveTypingSpeed(int memberId, SingleCodeResultRequest request) {

        double typingSpeed = request.calculateTypingSpeed();

        return typingSpeedRepository.findByMemberIdAndLanguage(memberId, request.language())
                .map(existing -> {
                    if (existing.isUpdatable(typingSpeed)) {
                        existing.updateSpeed(typingSpeed);
                        typingSpeedRepository.save(existing);
                        return true;
                    }
                    return false;
                })
                .orElseGet(() -> {
                    typingSpeedRepository.save(TypingSpeed.create(memberId, request.language(), typingSpeed));
                    return true;
                });

    }
}
