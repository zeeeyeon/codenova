package kr.codenova.backend.member.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GuestLoginDto {
    private String nickname;
    private String userType;
}
