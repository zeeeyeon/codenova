package kr.codenova.backend.member.paesto;

public interface PasetoVO {
    String SECRET_KEY = "0123456789ABCDEF0123456789ABCDEF";
    int EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7; // 7일
    String TOKEN_PREFIX = "Bearer ";
    String HEADER = "Authorization";
}
