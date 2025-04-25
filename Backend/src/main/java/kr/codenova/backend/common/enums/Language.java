package kr.codenova.backend.common.enums;

import java.util.Arrays;
import java.util.List;

public enum Language {
    JAVA, PYTHON, JS, SQL;

    public static List<String> toLanguageList() {
        return Arrays.stream(values())
                .map(Enum::name)
                .toList();
    }
}
