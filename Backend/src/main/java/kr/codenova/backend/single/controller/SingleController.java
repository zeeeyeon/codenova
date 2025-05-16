package kr.codenova.backend.single.controller;

import kr.codenova.backend.common.enums.CsCategory;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.request.ChatBotRequest;
import kr.codenova.backend.single.dto.request.CsKeywordRequest;
import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.*;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.request.SingleCodeResultRequest;
import kr.codenova.backend.single.dto.response.LanguageCategory;
import kr.codenova.backend.single.dto.response.SingleBattleCodeResponse;
import kr.codenova.backend.single.dto.response.SingleTypingResultResponse;
import kr.codenova.backend.single.service.ChatService;
import kr.codenova.backend.single.service.SingleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static kr.codenova.backend.global.response.ResponseCode.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/single")
public class SingleController {

    private final SingleService singleService;
    private final ChatService chatService;

    @GetMapping("/languages")
    public ResponseEntity<?> getLanguageCategories() {
        LanguageCategory categories = singleService.getLanguageCategories();
        return new ResponseEntity<>(Response.create(GET_LANGUAGE_CATEGORIES_SUCCESS, categories), GET_LANGUAGE_CATEGORIES_SUCCESS.getHttpStatus());
    }

    @GetMapping("/code")
    public ResponseEntity<?> getSingleBattleCodeByLanguage(@RequestParam("language") String language, @AuthenticationPrincipal CustomMemberDetails memberDetails) {
        SingleBattleCodeResponse code = singleService.getSingleBattleCode(language);
        return new ResponseEntity<>(Response.create(GET_SINGLE_BATTLE_CODE_BY_LANGUAGE, code), GET_SINGLE_BATTLE_CODE_BY_LANGUAGE.getHttpStatus());
    }

    @GetMapping("/code/{codeId}/description")
    public ResponseEntity<?> getCodeDescription(@PathVariable("codeId") int codeId, @AuthenticationPrincipal CustomMemberDetails memberDetails) {
        CodeDescriptionResponse description = singleService.getCodeDescription(codeId);
        return new ResponseEntity<>(Response.create(GET_CODE_DESCRIPTION, description), GET_CODE_DESCRIPTION.getHttpStatus());
    }

//    @PostMapping("/code/result")
//    public ResponseEntity<?> saveCodeResult(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody SingleCodeResultRequest request) {
//        boolean isNewRecord = false;
//
//        if (memberDetails != null && memberDetails.getMember() != null) isNewRecord = singleService.saveTypingSpeed(memberDetails.getMember().getMemberId(), request);
//        SingleTypingResultResponse response = new SingleTypingResultResponse(isNewRecord, request.speed());
//        ResponseCode resultCode = isNewRecord ? CODE_RESULT_HIGHEST_UPDATE : CODE_RESULT_SUCCESS;
//        return new ResponseEntity<>(Response.create(resultCode, response), resultCode.getHttpStatus());
//    }


    @GetMapping("/cs/categories")
    public ResponseEntity<?> getCsCategories() {
        List<String> categories = CsCategory.toCsList();
        return new ResponseEntity<>(Response.create(GET_CS_CATEGORIES_SUCCESS, categories), GET_CS_CATEGORIES_SUCCESS.getHttpStatus());
    }

    @GetMapping("/cs/code")
    public ResponseEntity<?> getCodeByCsCategory(@RequestParam("category") String category) {
        List<CsCodeResponse> codes = singleService.getCsCodeByCategory(category);
        return new ResponseEntity<>(Response.create(GET_CS_CODE_BY_CATEGORY, codes), GET_CS_CODE_BY_CATEGORY.getHttpStatus());
    }

    @PostMapping("/report")
    public ResponseEntity<?> generateReport(@AuthenticationPrincipal CustomMemberDetails memberDetails, @RequestBody CsKeywordRequest request) {
        if (memberDetails == null || memberDetails.getMember() == null) return new ResponseEntity<>(Response.create(FORBIDDEN_SAVE_RESULT_FOR_GUEST, null), FORBIDDEN_SAVE_RESULT_FOR_GUEST.getHttpStatus());

        CsKeywordSummaryResponse report = singleService.generateReport(memberDetails.getMember().getMemberId(), request.keywords());
        return new ResponseEntity<>(Response.create(CS_REPORT_CREATED, report), CS_REPORT_CREATED.getHttpStatus());
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReportList(@AuthenticationPrincipal CustomMemberDetails memberDetails) {
        ReportListResponse titles = singleService.getReportTitles(memberDetails.getMember().getMemberId());
        return new ResponseEntity<>(Response.create(ResponseCode.GET_REPORTS_SUCCESS, titles), ResponseCode.GET_REPORTS_SUCCESS.getHttpStatus());
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<?> getReportDetail(@AuthenticationPrincipal CustomMemberDetails memberDetails, @PathVariable int reportId) {
        ReportDetailResponse detail = singleService.getReportDetail(memberDetails.getMember().getMemberId(), reportId);
        return new ResponseEntity<>(Response.create(ResponseCode.GET_REPORT_DETAIL_SUCCESS, detail), ResponseCode.GET_REPORT_DETAIL_SUCCESS.getHttpStatus());
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatBotRequest request) {
        try {
            System.out.println("Chat API 호출 요청: " + request.getMessage());
            ChatBotResponse response = chatService.generateResponse(request);
            return new ResponseEntity<>(Response.create(GET_CHATBOT_RESPONSE, response), GET_CHATBOT_RESPONSE.getHttpStatus());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("컨트롤러 오류: " + e.getMessage());
            ChatBotResponse errorResponse = new ChatBotResponse("서비스 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            return new ResponseEntity<>(Response.create(INTERNAL_SERVER_ERROR, errorResponse), INTERNAL_SERVER_ERROR.getHttpStatus());
        }
    }

//    @GetMapping("/test")
//    public ResponseEntity<?> test(@RequestParam int codeId) {
//        SingleBattleCodeResponse code = singleService.test(codeId);
//        return new ResponseEntity<>(Response.create(GET_SINGLE_BATTLE_CODE_BY_LANGUAGE, code), GET_SINGLE_BATTLE_CODE_BY_LANGUAGE.getHttpStatus());
//    }
}
