package kr.codenova.backend.single.dto.response;

import java.util.List;

public record CsKeywordSummaryResponse(
        List<KeywordSummary> summaries
) {
    public record KeywordSummary(
            String keyword,
            String summary
    ) {}
}
