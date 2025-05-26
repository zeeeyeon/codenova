package kr.codenova.backend.member.dto;

import lombok.Data;

@Data
public class LoginResDto {

    private String nickname;

    public LoginResDto(String nickname) {
        this.nickname = nickname;
    }
}
