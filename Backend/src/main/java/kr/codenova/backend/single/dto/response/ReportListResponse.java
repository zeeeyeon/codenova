package kr.codenova.backend.single.dto.response;

import kr.codenova.backend.single.entity.Report;

import java.time.LocalDateTime;
import java.util.List;

public record ReportListResponse(
        List<String> reports
) {
    public static ReportListResponse from(List<Report> reports) {
        return new ReportListResponse(
                reports.stream().map(Report::getTitle).toList()
        );
    }
}
