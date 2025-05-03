package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.single.dto.response.RankingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisRankingService {

    private final StringRedisTemplate redisTemplate;

    public void saveTypingSpeed(Language language, String nickname, double speed) {
        String key = getRankingKey(language);
        System.out.println("[saveTypingSpeed] Save - key: " + key + ", nickname: '" + nickname + "', speed: " + speed);
        redisTemplate.opsForZSet().add(key, nickname, speed);
    }

    public RankingResponse getRanking(Language language, String nickname) {
        List<RankingResponse.RankingEntry> top10 = getTop10(language);
        RankingResponse.MyRank myRank = (nickname != null) ? getMyRank(language, nickname) : null;
        return new RankingResponse(top10, myRank);
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

        System.out.println("[getMyRank] key = " + key);
        System.out.println("[getMyRank] nickname = '" + nickname + "'");
        System.out.println("[getMyRank] Nickname(trimmed): '" + nickname.trim() + "'");


        Long rank = redisTemplate.opsForZSet().reverseRank(key, nickname);
        Double score = redisTemplate.opsForZSet().score(key, nickname);

        System.out.println("[getMyRank] rank = " + rank + ", score = " + score);

        if (rank == null || score == null) return null;

        return new RankingResponse.MyRank(rank.intValue() + 1, score);
    }

    private String getRankingKey(Language language) {
        return "ranking:" + language.name().toLowerCase();
    }
}
