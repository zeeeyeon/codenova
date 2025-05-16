package kr.codenova.backend.single.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.request.ChatBotRequest;
import kr.codenova.backend.single.dto.response.ChatBotResponse;
import kr.codenova.backend.single.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${openai.api.key}")
    private String gmsKey;

    private static final String GPT_API_URL = "https://gms.p.ssafy.io/gmsapi/api.openai.com/v1/chat/completions";

    @Override
    public ChatBotResponse generateResponse(ChatBotRequest request) {
        try {
            log.info("ChatBot API 요청 시작: {}", request.getMessage());

            // 요청 생성
            HttpEntity<String> httpRequest = buildRequest(request.getMessage());

            // 요청 내용 자세히 로깅
            try {
                log.info("API URL: {}", GPT_API_URL);
                log.info("API 요청 헤더: {}", httpRequest.getHeaders());
                log.info("API 요청 본문: {}", objectMapper.writeValueAsString(httpRequest.getBody()));
            } catch (Exception e) {
                log.warn("요청 로깅 실패: {}", e.getMessage());
            }

            // API 요청 보내기
            ResponseEntity<String> response = null;
            try {
                response = restTemplate.exchange(
                        GPT_API_URL,
                        HttpMethod.POST,
                        httpRequest,
                        String.class
                );

                log.info("API 응답 상태 코드: {}", response.getStatusCode());
                log.info("API 응답 헤더: {}", response.getHeaders());
                if (response.getBody() != null) {
                    log.info("API 응답 본문: {}", response.getBody());
                }
            } catch (HttpStatusCodeException e) {
                log.error("HTTP 오류: 상태 코드 {}", e.getStatusCode());
                log.error("오류 응답 헤더: {}", e.getResponseHeaders());
                log.error("오류 응답 본문: {}", e.getResponseBodyAsString());
                throw e;
            }

            // 응답 파싱
            String content = extractContent(response);
            log.info("ChatBot 응답 생성 완료");

            return new ChatBotResponse(content);

        } catch (HttpStatusCodeException e) {
            // HTTP 상태 코드 오류
            log.error("API 응답 오류: 상태 코드 {}, 응답 본문: {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new CustomException(ResponseCode.GPT_RESPONSE_FAIL);

        } catch (RestClientException e) {
            // RestTemplate 관련 오류
            log.error("API 요청 중 REST 클라이언트 오류: {}", e.getMessage());
            throw new CustomException(ResponseCode.GPT_RESPONSE_FAIL);

        } catch (Exception e) {
            // 기타 예외
            log.error("ChatBot 응답 생성 중 예외 발생: {}", e.getMessage(), e);
            throw new CustomException(ResponseCode.GPT_RESPONSE_FAIL);
        }
    }

    private HttpEntity<String> buildRequest(String message) throws JsonProcessingException {
        // 헤더에 KEY 넣어줘야함
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + gmsKey);
        headers.set("Content-Type", "application/json-");
//        headers.setContentType(MediaType.APPLICATION_JSON);

        // 본문에 넣을 Openai 모델
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", "gpt-4.1");

        // 메시지 추가 ( 대답하는 형식과 클라이언트)
        List<Map<String, String>> messages = new ArrayList<>();

        messages.add(Map.of(
                "role", "system",
                "content", "You are a helpful assistant."
        ));

        messages.add(Map.of(
                "role", "user",
                "content", message
        ));

        body.put("messages", messages);
//        body.put("max_tokens", 500);
//        body.put("temperature", 0.3);

        String jsonBody = objectMapper.writeValueAsString(body);

        return new HttpEntity<>(jsonBody, headers);
    }

    private String extractContent(ResponseEntity<String> response) throws Exception {
        try {
            JsonNode root = objectMapper.readTree(response.getBody());

            if (!root.has("choices") || root.path("choices").isEmpty()) {
                log.error("API 응답에 choices 필드가 없거나 비어 있습니다: {}", response.getBody());
                throw new Exception("API 응답 형식이 잘못되었습니다");
            }

            return root.path("choices").get(0).path("message").path("content").asText().trim();

        } catch (Exception e) {
            log.error("API 응답 파싱 중 오류 발생: {}", e.getMessage());
            log.error("응답 본문: {}", response.getBody());
            throw e;
        }
    }
}