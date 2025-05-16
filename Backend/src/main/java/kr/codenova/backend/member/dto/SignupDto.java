package kr.codenova.backend.member.dto;

import kr.codenova.backend.member.entity.Member;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@Data
public class SignupDto {

    private String nickname;
    private String id;
    private String password;


    public Member toUserEntity(BCryptPasswordEncoder passwordEncoder) {
        return Member
                .builder()
                .id(id)
                .nickname(nickname)
                .password(passwordEncoder.encode(password))
                .build();
    }
}
