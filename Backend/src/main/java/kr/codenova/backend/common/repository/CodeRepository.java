package kr.codenova.backend.common.repository;

import kr.codenova.backend.common.entity.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, Integer> {

    @Query(value = "SELECT * FROM code WHERE language = :language ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Code> findRandomByLanguage(@Param("language") String language);

    @Query(value = "SELECT * FROM code ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Code> findRandom();

    Optional<Code> findByCodeId(@Param("codeId") int codeId);
}
