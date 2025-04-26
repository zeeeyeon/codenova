package kr.codenova.backend.single.service.impl;

import kr.codenova.backend.single.dto.response.CsKeywordSummaryResponse;
import kr.codenova.backend.single.entity.Report;
import kr.codenova.backend.single.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportAsyncService {

    private final ReportRepository reportRepository;

    @Async
    public void saveReportAsync(int memberId, List<CsKeywordSummaryResponse.KeywordSummary> summaries) {
        Report report = Report.create(memberId, summaries);
        reportRepository.save(report);
    }
}
