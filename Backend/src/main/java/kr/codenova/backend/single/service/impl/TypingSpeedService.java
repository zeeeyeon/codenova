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
                    double oldSpeed = existing.getTypingSpeed(); // 🔥 기존 값 따로 저장
                    boolean isNewRecord = newSpeed > oldSpeed;
                    if (isNewRecord) {
                        existing.updateSpeed(newSpeed); // 내부 값 바뀜
                        typingSpeedRepository.save(existing);
                        redisRankingService.saveTypingSpeed(language, memberId, member.getNickname(), newSpeed);
                        log.info("속도 갱신됨 → 기존: {}, 새: {}", oldSpeed, newSpeed);
                    } else {
                        log.info("갱신 안함 → 기존: {}, 새: {}", oldSpeed, newSpeed);
                    }
                    return isNewRecord;
                })
                .orElseGet(() -> {
                    typingSpeedRepository.save(TypingSpeed.create(memberId, language, newSpeed));
                    redisRankingService.saveTypingSpeed(language, memberId, member.getNickname(), newSpeed);
                    log.info("최초 기록: {}", newSpeed);
                    return true;
                });
    }

}
