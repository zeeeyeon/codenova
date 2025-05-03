package kr.codenova.backend.single.repository;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.single.entity.TypingSpeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TypingSpeedRepository extends JpaRepository<TypingSpeed, Integer> {

    @Query("SELECT t FROM TypingSpeed t WHERE t.memberId = :memberId AND t.language = :language")
    Optional<TypingSpeed> findByMemberIdAndLanguage(@Param("memberId") Integer memberId, @Param("language") Language language);
}
