package kr.codenova.backend.member.dto;

import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.member.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
public class MemberProfileDto {
    private String id;
    private String nickname;
    private String phoneNum;
    private List<UserScore> userScoreList;


    public  MemberProfileDto(Member member, List<UserScore> scoreList) {
        this.id = member.getId();
        this.nickname = member.getNickname();
        this.phoneNum = member.getPhoneNum();
        this.userScoreList = scoreList;
    }


    @Data
    @AllArgsConstructor
    public static class UserScore {
        private Language language;
        private Double score;
    }
}
