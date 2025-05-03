package kr.codenova.backend.single.controller;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.response.Response;
import kr.codenova.backend.member.auth.CustomMemberDetails;
import kr.codenova.backend.single.dto.response.RankingResponse;
import kr.codenova.backend.single.service.impl.RedisRankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static kr.codenova.backend.global.response.ResponseCode.GET_RANKING_SUCCESS;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/single/ranking")
public class RankingController {

    private final RedisRankingService rankingService;

    @GetMapping("/{language}")
    public ResponseEntity<?> getRanking(@AuthenticationPrincipal CustomMemberDetails memberDetails, @PathVariable Language language) {
        Integer memberId = (memberDetails != null && memberDetails.getMember() != null) ? memberDetails.getMember().getMemberId() : null;

        RankingResponse response = rankingService.getRanking(language, memberId);
        return new ResponseEntity<>(Response.create(GET_RANKING_SUCCESS, response), GET_RANKING_SUCCESS.getHttpStatus());
    }
}
