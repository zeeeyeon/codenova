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
                    double oldSpeed = existing.getTypingSpeed();
                    if (existing.isUpdatable(newSpeed)) {
                        existing.updateSpeed(newSpeed);
                        typingSpeedRepository.save(existing);
                        redisRankingService.saveTypingSpeed(language, memberId, member.getNickname(), newSpeed);
                        return true;
                    }
                    return false;
                })
                .orElseGet(() -> {
                    typingSpeedRepository.save(TypingSpeed.create(memberId, language, newSpeed));
                    redisRankingService.saveTypingSpeed(language, member.getMemberId(), member.getNickname(), newSpeed);
                    return true;
                });
    }

}
