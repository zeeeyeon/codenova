package kr.codenova.backend.single.repository;

import kr.codenova.backend.single.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Integer> {

    @Query("SELECT r FROM Report r WHERE r.memberId = :memberId ORDER BY r.createdAt DESC")
    List<Report> findReportsByMemberId(@Param("memberId") Integer memberId);

    @Query("SELECT r FROM Report r WHERE r.reportId = :reportId AND r.memberId = :memberId")
    Optional<Report> findReportByIdAndMemberId(@Param("reportId") int reportId, @Param("memberId") int memberId);
}
