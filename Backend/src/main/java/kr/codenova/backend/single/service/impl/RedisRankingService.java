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

    public void saveTypingSpeed(Language language, Integer memberId, String nickname, double speed) {
        String key = getRankingKey(language);
        String memberId = String.valueOf(memberId);

        redisTemplate.opsForZSet().add(key, memberId, speed);
        redisTemplate.opsForHash().put("user:nickname", memberId, nickname);

    }

    public RankingResponse getRanking(Language language, Integer memberId) {
        List<RankingResponse.RankingEntry> top10 = getTop10(language);
        RankingResponse.MyRank myRank = (memberId != null) ? getMyRank(language, memberId) : null;
        return new RankingResponse(top10, myRank);
    }



    private List<RankingResponse.RankingEntry> getTop10(Language language) {
        String key = getRankingKey(language);
        Set<ZSetOperations.TypedTuple<String>> top10 = redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, 9);
        if (top10 == null) return List.of();

        return top10.stream()
                .map(entry -> {
                    String memberId = entry.getValue();
                    String nickname = (String) redisTemplate.opsForHash().get("user:nickname", memberId);
                    return new RankingResponse.RankingEntry(
                            nickname != null ? nickname : "(알 수 없음)", entry.getScore()
                    );
                })
                .toList();
    }

    private RankingResponse.MyRank getMyRank(Language language, Integer memberId) {
        String key = getRankingKey(language);
        String memberId = String.valueOf(memberId);

        Long rank = redisTemplate.opsForZSet().reverseRank(key, memberId);
        Double score = redisTemplate.opsForZSet().score(key, memberId);

        if (rank == null || score == null) return null;
        return new RankingResponse.MyRank(rank.intValue() + 1, score);
    }

    public RankingResponse getRanking(Language language, Integer memberId) {
        List<RankingResponse.RankingEntry> top10 = getTop10(language);
        RankingResponse.MyRank myRank = (memberId != null) ? getMyRank(language, memberId) : null;
        return new RankingResponse(top10, myRank);
    }
}
