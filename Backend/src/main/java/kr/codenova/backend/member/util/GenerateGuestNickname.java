package kr.codenova.backend.member.util;

import java.util.Random;

public class GenerateGuestNickname {
    public String guestNickname(){
        String[] adjectives = {"행복한", "즐거운", "신나는", "재미있는", "귀여운","따뜻한", "상쾌한", "멋진", "활기찬", "느긋한",
                "친절한", "용감한", "영리한", "날쌘", "재치있는",
                "현명한", "부지런한", "명랑한", "화려한", "소중한",
                "깜찍한", "당당한", "얌전한", "활발한", "우아한",
                "특별한", "기발한", "시원한", "푸른", "빛나는",
                "조용한", "엉뚱한", "자유로운", "사랑스러운", "포근한"};
        String[] nouns = {       "고양이", "강아지", "토끼", "판다", "사자",
                "호랑이", "곰", "여우", "늑대", "기린",
                "코끼리", "원숭이", "다람쥐", "펭귄", "앵무새",
                "독수리", "올빼미", "물개", "돌고래", "문어",
                "거북이", "청설모", "하마", "코알라", "캥거루",
                "너구리", "오리", "앵무새", "악어", "참새",
                "햄스터", "치타", "표범", "고슴도치", "얼룩말",
                "하이에나", "족제비", "수달", "비버", "박쥐"};

        Random random = new Random();
        String adjective = adjectives[random.nextInt(adjectives.length)];
        String noun = nouns[random.nextInt(nouns.length)];

        return adjective  + noun + (random.nextInt(900) + 100);
    }
}
