package kr.codenova.backend.single.dto.request;

import java.util.List;

public record CsKeywordRequest(
        List<String> keywords
) {
}
