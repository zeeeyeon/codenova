package kr.codenova.backend.member.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import kr.codenova.backend.member.entity.Member;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@Data
public class SignupDto {

    @Size(max = 11, message = "닉네임은 최대 11자까지 가능합니다.")
    private String nickname;
    @Pattern(regexp = "^[a-zA-Z]+$", message = "닉네임은 영어만 입력 가능합니다.")
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
