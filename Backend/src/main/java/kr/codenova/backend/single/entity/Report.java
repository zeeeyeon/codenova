package kr.codenova.backend.single.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.response.CsKeywordSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportId;
    private Integer memberId;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    public static Report create(int memberId, List<CsKeywordSummaryResponse.KeywordSummary> summaries) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String contentJson = mapper.writeValueAsString(summaries);
            LocalDateTime now = LocalDateTime.now();

            return Report.builder()
                    .memberId(memberId)
                    .title(generateTitle(now))
                    .content(contentJson)
                    .createdAt(now)
                    .build();
        } catch (Exception e) {
            throw new CustomException(ResponseCode.SERVER_ERROR, "Report", "리포트 변환 실패");
        }
    }

    private static String generateTitle(LocalDateTime createdAt) {
        return createdAt.toLocalDate() + " CS 리포트";
    }
}