package kr.codenova.backend.single.entity;

import jakarta.persistence.*;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.member.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TypingSpeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer speedId;

    private Language language;

    private Double typingSpeed;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;
}
