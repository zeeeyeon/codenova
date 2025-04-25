package kr.codenova.backend.common.entity;

import jakarta.persistence.*;
import kr.codenova.backend.common.enums.Language;

@Entity
public class Code {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer codeId;

    @Enumerated(EnumType.STRING)
    private Language language;

    private String content;
}
