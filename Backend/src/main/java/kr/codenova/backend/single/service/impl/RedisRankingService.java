package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.member.entity.Member;
import kr.codenova.backend.member.repository.MemberRepository;
import kr.codenova.backend.single.dto.response.RankingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRankingService {

    private final StringRedisTemplate redisTemplate;
    private final MemberRepository memberRepository;

    public void saveTypingSpeed(Language language, String nickname, double speed) {
        String key = getRankingKey(language);
        redisTemplate.opsForZSet().add(key, nickname, speed);
    }

    public RankingResponse getRanking(Language language, Integer memberId) {
        List<RankingResponse.RankingEntry> top10 = getTop10(language);
        String nickname = getNicknameFromMemberId(memberId);
        RankingResponse.MyRank myRank = (nickname != null) ? getMyRank(language, nickname) : null;
        return new RankingResponse(top10, myRank);
    }

    private String getNicknameFromMemberId(Integer memberId) {
        if (memberId == null || memberId <= 0) return null;
        return memberRepository.findById(memberId)
                .map(Member::getNickname)
                .orElse(null);
    }

    private List<RankingResponse.RankingEntry> getTop10(Language language) {
        String key = getRankingKey(language);
        Set<ZSetOperations.TypedTuple<String>> top10 = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 9);
        if (top10 == null) return List.of();
        return top10.stream()
                .map(entry -> new RankingResponse.RankingEntry(entry.getValue(), entry.getScore()))
                .toList();
    }

    private RankingResponse.MyRank getMyRank(Language language, String nickname) {
        String key = getRankingKey(language);
        Long rank = redisTemplate.opsForZSet().reverseRank(key, nickname);
        Double score = redisTemplate.opsForZSet().score(key, nickname);
        if (rank == null || score == null) return null;
        return new RankingResponse.MyRank(rank.intValue() + 1, score);
    }

    private String getRankingKey(Language language) {
        return "ranking:" + language.name().toLowerCase();
    }
}
