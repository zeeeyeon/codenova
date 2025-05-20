package kr.codenova.backend.member.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.codenova.backend.member.dto.ProfileUpdateDto;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Getter
@NoArgsConstructor
@Entity
public class Member {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Integer memberId;

    @NotNull
    @Column(unique = true)
    private String id;

    @NotNull @Size(max = 11)
    @Column(unique = true)
    private String nickname;

    @NotNull @JsonIgnore
    private String password;

    private String phoneNum;

    private int winCount;
    private int playCount;

    private int warnCount;
    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean isActive;

    @Builder
    public Member(Integer memberId, String id, String password, String nickname,
                  int winCount, int playCount, String phoneNum) {
        this.memberId = memberId;
        this.id = id;
        this.password = password;
        this.nickname = nickname;
        this.winCount = winCount;
        this.playCount = playCount;
        this.phoneNum = phoneNum;
    }

    public void updateProfile(ProfileUpdateDto dto) {
        if (dto.getNickname() != null && !dto.getNickname().isBlank()) {
            this.nickname = dto.getNickname();
        }
        if (dto.getPhoneNum() != null && !dto.getPhoneNum().isBlank()) {
            this.phoneNum = dto.getPhoneNum();
        }
    }
}
