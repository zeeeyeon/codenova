package kr.codenova.backend.single.repository;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.single.entity.TypingSpeed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypingSpeedRepository extends JpaRepository<TypingSpeed, Integer> {

    Optional<TypingSpeed> findByMemberIdAndLanguage(Integer memberId, Language language);
}
