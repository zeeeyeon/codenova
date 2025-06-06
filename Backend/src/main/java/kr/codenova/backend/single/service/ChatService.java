package kr.codenova.backend.single.service;

import kr.codenova.backend.single.dto.request.ChatBotRequest;
import kr.codenova.backend.single.dto.response.ChatBotResponse;

public interface ChatService {

    // 사용자 ID와 메시지를 받는 새 메서드 추가
    ChatBotResponse generateResponse(String userId, String message);
}