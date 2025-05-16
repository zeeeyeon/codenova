package kr.codenova.backend.single.service;

import kr.codenova.backend.single.dto.request.ChatBotRequest;
import kr.codenova.backend.single.dto.response.ChatBotResponse;

public interface ChatService {
    ChatBotResponse generateResponse(ChatBotRequest request);
}