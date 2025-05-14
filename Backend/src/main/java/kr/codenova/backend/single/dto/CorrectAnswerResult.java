package kr.codenova.backend.single.dto;

import java.util.List;

public record CorrectAnswerResult(
        List<String> lines,
        int correctLength
) {
}
