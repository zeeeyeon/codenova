package kr.codenova.backend.single.repository;

import kr.codenova.backend.single.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Integer> {
}
