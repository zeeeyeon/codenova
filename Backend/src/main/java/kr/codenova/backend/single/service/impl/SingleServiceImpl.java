package kr.codenova.backend.single.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.codenova.backend.common.entity.CS;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.common.repository.CsRepository;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.*;
import kr.codenova.backend.single.entity.Report;
import kr.codenova.backend.single.entity.TypingSpeed;
import kr.codenova.backend.common.repository.CodeRepository;
import kr.codenova.backend.single.repository.ReportRepository;
import kr.codenova.backend.single.repository.TypingSpeedRepository;
import kr.codenova.backend.single.service.GptClient;
import kr.codenova.backend.single.service.SingleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static kr.codenova.backend.global.response.ResponseCode.CODE_NOT_FOUND;

import java.util.Optional;

import static kr.codenova.backend.global.response.ResponseCode.CODE_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class SingleServiceImpl implements SingleService {

    private final ObjectMapper objectMapper;
    private final CodeRepository codeRepository;
    private final TypingSpeedRepository typingSpeedRepository;
    private final ReportRepository reportRepository;
    private final CsRepository csRepository;
    private final GptClient gptClient;
    private final ReportAsyncService reportAsyncService;


    @Override
    public LanguageCategory getLanguageCategories() {
        return LanguageCategory.withAllCategories();
    }

    @Override
    public SingleBattleCodeResponse getSingleBattleCode(String language) {
        if (!Language.isValid(language)) {
            throw new CustomException(CODE_NOT_FOUND);
        }

        return codeRepository.findRandomByLanguage(language)
                .map(SingleBattleCodeResponse::from)
                .orElseThrow(() -> new CustomException(CODE_NOT_FOUND));
    }

    @Override
    public boolean saveTypingSpeed(int memberId, SingleCodeResultRequest request) {

        double typingSpeed = request.calculateTypingSpeed();

        return typingSpeedRepository.findByMemberIdAndLanguage(memberId, request.language())
                .map(existing -> {
                    if (existing.isUpdatable(typingSpeed)) {
                        existing.updateSpeed(typingSpeed);
                        typingSpeedRepository.save(existing);
                        return true;
                    }
                    return false;
                })
                .orElseGet(() -> {
                    typingSpeedRepository.save(TypingSpeed.create(memberId, request.language(), typingSpeed));
                    return true;
                });

    }

    @Override
    public List<CsCodeResponse> getCsCodeByCategory(String category) {
        List<CS> csList = csRepository.findRandomByCategory(category);
        return csList.stream()
                .map(cs -> new CsCodeResponse(cs.getKoreanWord(), cs.getContent()))
                .toList();
    }

    @Override
    public CsKeywordSummaryResponse generateReport(int memberId, List<String> keywords) {
        String prompt = buildStructuredPrompt(keywords);
        String fullSummary = gptClient.summarizeKeyword(prompt);
        List<CsKeywordSummaryResponse.KeywordSummary> summaries = parseStructuredSummary(fullSummary);

        reportAsyncService.saveReportAsync(memberId, summaries);

        return new CsKeywordSummaryResponse(summaries);
    }

    @Override
    public ReportListResponse getReportTitles(int memberId) {
        List<String> reportTitles = reportRepository.findReportsByMemberId(memberId)
                .stream()
                .map(Report::getTitle)
                .toList();
        return new ReportListResponse(reportTitles);
    }

    @Override
    public ReportDetailResponse getReportDetail(int memberId, int reportId) {
        Report report = reportRepository.findReportByIdAndMemberId(reportId, memberId)
                .orElseThrow(() -> new CustomException(ResponseCode.REPORT_NOT_FOUND));

        List<CsKeywordSummaryResponse.KeywordSummary> summaries = parseReportContent(report.getContent());
        return ReportDetailResponse.of(report, summaries);
    }


    private String buildStructuredPrompt(List<String> keywords) {
        StringBuilder builder = new StringBuilder();
        builder.append("""
            아래 키워드들에 대해 각각 다음 포맷을 지켜서 답해줘:
            [키워드]: [간단한 설명]

            면접에서 답하듯 간단하고 핵심만 정리해줘. 너무 길거나 어려운 용어는 쓰지 말고, 예시나 목적이 있다면 함께 알려줘.
            """);
        for (String keyword : keywords) {
            builder.append("- ").append(keyword).append("\n");
        }
        return builder.toString();
    }

    private List<CsKeywordSummaryResponse.KeywordSummary> parseStructuredSummary(String fullSummary) {
        if (fullSummary == null || fullSummary.isBlank()) {
            throw new CustomException(ResponseCode.GPT_RESPONSE_FAIL);
        }

        List<CsKeywordSummaryResponse.KeywordSummary> result = new ArrayList<>();
        String[] lines = fullSummary.split("\n");

        for (String line : lines) {
            if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                String keyword = parts[0].trim();
                String description = parts[1].trim();
                result.add(new CsKeywordSummaryResponse.KeywordSummary(keyword, description));
            }
        }

        if (result.isEmpty()) throw new CustomException(ResponseCode.GPT_RESPONSE_FAIL);

        return result;
    }

    private List<CsKeywordSummaryResponse.KeywordSummary> parseReportContent(String contentJson) {
        try {
            return Arrays.asList(
                    objectMapper.readValue(contentJson, CsKeywordSummaryResponse.KeywordSummary[].class)
            );
        } catch (Exception e) {
            throw new CustomException(ResponseCode.SERVER_ERROR, "Report", "리포트 변환 실패");
        }
    }
}
