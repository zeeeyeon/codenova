package kr.codenova.backend.multi.game;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface GameContentRepository extends JpaRepository<Code, Long> {

    // 랜덤 한 문장 조회
    @Query(value = "SELECT * FROM code ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Code findRandomContent();
}
