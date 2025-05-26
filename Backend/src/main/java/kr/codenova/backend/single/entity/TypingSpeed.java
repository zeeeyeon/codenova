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
@Table(
        name = "typing_speed",
        uniqueConstraints = @UniqueConstraint(columnNames = {"memberId", "language"}),
        indexes = @Index(columnList = "memberId, language")
)
public class TypingSpeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer speedId;

    private Integer memberId;

    @Enumerated(EnumType.STRING)
    private Language language;

    private Double typingSpeed;

    private LocalDateTime updatedAt;

    public static TypingSpeed create(int memberId, Language language, double typingSpeed) {
        return TypingSpeed.builder()
                .memberId(memberId)
                .language(language)
                .typingSpeed(typingSpeed)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public boolean isUpdatable(double newTypingSpeed) {
        return newTypingSpeed > this.typingSpeed;
    }

    public void updateSpeed(double newTypingSpeed) {
        this.typingSpeed = newTypingSpeed;
        this.updatedAt = LocalDateTime.now();
    }
}
