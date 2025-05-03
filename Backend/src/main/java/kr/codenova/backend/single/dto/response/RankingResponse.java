package kr.codenova.backend.single.dto.response;

import java.util.List;

public record RankingResponse(
        List<RankingEntry> top10,
        MyRank myRank
) {
    public record RankingEntry(
            String nickname,
            Double typingSpeed
    ) {}

    public record MyRank(
            int rank,
            double typingSpeed
    ) {}
}
