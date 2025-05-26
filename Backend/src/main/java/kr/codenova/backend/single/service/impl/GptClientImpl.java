package kr.codenova.backend.single.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.service.GptClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GptClientImpl implements GptClient {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key}")
    private String apiKey;

    private static final String GPT_API_URL = "https://gms.p.ssafy.io/gmsapi/api.openai.com/v1/chat/completions";

    @Override
    public String summarizeKeyword(String prompt) {
        try {
            HttpEntity<Map<String, Object>> request = buildRequest(prompt);
            ResponseEntity<String> response = restTemplate.postForEntity(GPT_API_URL, request, String.class);
            return extractContent(response);
        } catch (Exception e) {
            throw new
                    CustomException(ResponseCode.GPT_RESPONSE_FAIL);
        }
    }

    private HttpEntity<Map<String, Object>> buildRequest(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1");
        body.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));

        return new HttpEntity<>(body, headers);
    }

    private String extractContent(ResponseEntity<String> response) throws Exception {
        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0).path("message").path("content").asText().trim();
    }
}
