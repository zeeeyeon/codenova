package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.single.entity.TypingSpeed;
import kr.codenova.backend.single.repository.TypingSpeedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TypingSpeedService {

    private final TypingSpeedRepository typingSpeedRepository;
    private final MemberRepository memberRepository;
    private final RedisRankingService redisRankingService;

    public boolean saveIfNewRecord(int memberId, Language language, double newSpeed) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ResponseCode.NOT_FOUND_USER));

        return typingSpeedRepository.findByMemberIdAndLanguage(memberId, language)
                .map(existing -> {
                    boolean isNewRecord = existing.isUpdatable(newSpeed);
                    if (isNewRecord) {
                        existing.updateSpeed(newSpeed);
                        typingSpeedRepository.save(existing);
                        redisRankingService.saveTypingSpeed(language, memberId, member.getNickname(), newSpeed);
                        log.info("기존 속도: {}, 새 속도: {}", existing.getTypingSpeed(), newSpeed);
                    } else {
                        log.info("기존 속도 유지: {}", existing.getTypingSpeed());
                    }
                    return isNewRecord;
                })
                .orElseGet(() -> {
                    typingSpeedRepository.save(TypingSpeed.create(memberId, language, newSpeed));
                    redisRankingService.saveTypingSpeed(language, memberId, member.getNickname(), newSpeed);
                    log.info("최초 등록 속도: {}", newSpeed);
                    return true;
                });
    }

}
