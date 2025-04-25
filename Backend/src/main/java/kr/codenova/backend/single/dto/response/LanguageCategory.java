package kr.codenova.backend.single.dto.response;

import kr.codenova.backend.common.enums.Language;

import java.util.ArrayList;
import java.util.List;

public record LanguageCategory(List<String> languages) {

    public static LanguageCategory withAllCategories() {
        List<String> result = new ArrayList<>(Language.toLanguageList());
        result.add("CS");
        return new LanguageCategory(result);
    }
}
