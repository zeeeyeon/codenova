package kr.codenova.backend.member.jwt;


public interface JwtVO {
    String SECRET = "7Iqk7YyM66W07YOA7L2U65Sp7YG065+9U3ByaW5n6rCV7J2Y7Yqc7YSw7LWc7JuQ67mI7J6F64uI64ukLg=="; // HS256 (대칭키)
    int EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;  // Access Token: 일주일
    String TOKEN_PREFIX = "Bearer ";
    String HEADER = "Authorization";
}

