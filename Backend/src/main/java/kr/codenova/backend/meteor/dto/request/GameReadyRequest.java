package kr.codenova.backend.meteor.dto.request;


import lombok.Data;

@Data
public class GameReadyRequest {
    private String roomId;
    private String nickname;
}
