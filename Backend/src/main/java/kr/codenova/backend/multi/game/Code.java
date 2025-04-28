package kr.codenova.backend.multi.game;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import kr.codenova.backend.common.enums.Language;
import lombok.Getter;

@Entity
@Getter
public class Code {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Language language;
    private String content;
}
