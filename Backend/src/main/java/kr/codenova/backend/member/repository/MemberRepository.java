package kr.codenova.backend.member.repository;

import kr.codenova.backend.member.entity.Member;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {

    @Query("SELECT m FROM Member m WHERE m.id = :id")
    Optional<Member> findByIdColumn(@Param("id")String id);
    Optional<Member> findByNickname(String nickname);
}
