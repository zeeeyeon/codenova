package kr.codenova.backend.common.repository;

import kr.codenova.backend.common.entity.CS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CsRepository extends JpaRepository<CS, Integer> {

    @Query(value = "SELECT * FROM cs WHERE cs_category = :category ORDER BY RANDOM() LIMIT 5", nativeQuery = true)
    List<CS> findRandomByCategory(@Param("category") String category);
    @Query(
            value = "SELECT CASE " +
                    "         WHEN RANDOM() < 0.5 AND english_word IS NOT NULL AND LENGTH(english_word) <= 10 THEN english_word " +
                    "         WHEN korean_word IS NOT NULL AND LENGTH(korean_word) <= 10 THEN korean_word " +
                    "       END AS word " +
                    "FROM cs " +
                    "WHERE (english_word IS NOT NULL AND LENGTH(english_word) <= 10) " +
                    "   OR (korean_word IS NOT NULL AND LENGTH(korean_word) <= 10) " +
                    "ORDER BY RANDOM() " +
                    "LIMIT 50",
            nativeQuery = true
    )
    List<String> findRandom50English();
}
