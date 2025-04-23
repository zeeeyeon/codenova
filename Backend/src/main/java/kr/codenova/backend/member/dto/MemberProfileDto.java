package kr.codenova.backend.member.dto;

import kr.codenova.backend.member.entity.Member;
import lombok.Getter;

@Getter
public class MemberProfileDto {
    private String nickname;


    public  MemberProfileDto(Member member) {
        this.nickname = member.getNickname();
    }
}
