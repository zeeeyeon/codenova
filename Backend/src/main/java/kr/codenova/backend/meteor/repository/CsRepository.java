package kr.codenova.backend.meteor.repository;

import kr.codenova.backend.common.entity.CS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CsRepository extends JpaRepository<CS, Integer> {
    @Query(
            value = "SELECT english_word FROM cs ORDER BY RANDOM() LIMIT 50",
            nativeQuery = true
    )
    List<String> findRandom50English();
}
