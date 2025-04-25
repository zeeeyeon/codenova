package kr.codenova.backend.common.enums;

import java.util.Arrays;
import java.util.List;

public enum CsCategory {
    DATABASE, NETWORK, OS, DATA_STRUCTURE, COMPUTER_STRUCTURE;

    public static List<String> toCsList() {
        return Arrays.stream(values())
                .map(Enum::name)
                .toList();
    }
}
