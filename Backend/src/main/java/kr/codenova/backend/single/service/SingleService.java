package kr.codenova.backend.single.service;

import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.*;

import java.util.List;
import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.dto.response.SingleBattleCodeResponse;

public interface SingleService {
    LanguageCategory getLanguageCategories();
    SingleBattleCodeResponse getSingleBattleCode(String languageCode);
//    boolean saveTypingSpeed(int memberId, SingleCodeResultRequest request);

    List<CsCodeResponse> getCsCodeByCategory(String category);
    CsKeywordSummaryResponse generateReport(int memberId, List<String> keywords);
    ReportListResponse getReportTitles(int memberId);
    ReportDetailResponse getReportDetail(int memberId, int reportId);
    CodeDescriptionResponse getCodeDescription(int codeId);
//    SingleBattleCodeResponse test(int codeId);
}
