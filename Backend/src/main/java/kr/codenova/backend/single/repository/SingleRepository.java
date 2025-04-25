package kr.codenova.backend.single.repository;

import kr.codenova.backend.single.entity.TypingSpeed;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SingleRepository extends JpaRepository<TypingSpeed, Integer> {
}
