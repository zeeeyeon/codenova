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
            value = "SELECT english_word FROM cs WHERE english_word IS NOT NULL ORDER BY RANDOM() LIMIT 50",
            nativeQuery = true
    )
    List<String> findRandom50English();
}
