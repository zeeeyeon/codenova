package kr.codenova.backend.common.entity;

import jakarta.persistence.*;
import kr.codenova.backend.common.enums.CsCategory;
import lombok.Getter;

@Entity
@Getter
public class CS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer csId;

    @Enumerated(EnumType.STRING)
    private CsCategory csCategory;

    private String koreanWord;
    private String englishWord;
    private String content;
}
