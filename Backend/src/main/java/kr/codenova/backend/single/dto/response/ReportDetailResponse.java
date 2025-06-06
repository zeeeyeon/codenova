package kr.codenova.backend.single.dto.response;

import kr.codenova.backend.single.entity.Report;

import java.util.List;

public record ReportDetailResponse(
        String title,
        List<CsKeywordSummaryResponse.KeywordSummary> summaries
) {
    public static ReportDetailResponse of(Report report, List<CsKeywordSummaryResponse.KeywordSummary> summaries) {
        return new ReportDetailResponse(report.getTitle(), summaries);
    }
}