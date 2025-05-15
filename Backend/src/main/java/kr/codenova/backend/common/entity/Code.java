package kr.codenova.backend.common.entity;

import jakarta.persistence.*;
import kr.codenova.backend.common.enums.Language;
import lombok.Getter;

@Entity
@Getter
public class Code {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer codeId;

    @Enumerated(EnumType.STRING)
    private Language language;

    @Column(length = 4048)
    private String content;

    @Column(length = 4048)
    private String descript;

    @Column(length = 4048)
    private String annotation;
}
