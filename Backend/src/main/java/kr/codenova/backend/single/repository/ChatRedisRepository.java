package kr.codenova.backend.single.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ChatRedisRepository {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;


    private static final long conversationExpirySeconds = 1800;

    private static final String KEY_PREFIX = "chat:conversation:";

    // 레디스에서 사용자 대화 내역 조회
    public List<Map<String, String>> getConversation(String userId) {
        String json = redisTemplate.opsForValue().get(KEY_PREFIX + userId);

        if (json == null) {
            // 초기 시스템 메시지로 대화 내역 생성
            List<Map<String, String>> conversation = new ArrayList<>();
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "너는 개발 공부를 하는 학생에게 쉽고 명확하게 알려주는 친절한 시니어 개발자야. 복잡한 개념도 예시와 함께 이해하기 쉽게 설명하고, 실무에서의 활용법, 주의점, 추가 공부 키워드를 짧고 명확하게 알려줘. AI인 척하지 말고 자연스럽고 자신감 있게 답해.");
            conversation.add(systemMessage);
            saveConversation(userId, conversation);
            return conversation;
        }

        try {
            // JSON 문자열을 객체로 변환
            List<Map<String, String>> conversation = objectMapper.readValue(json,
                    new TypeReference<List<Map<String, String>>>() {});

            // 접근 시 유효시간 갱신
            redisTemplate.expire(KEY_PREFIX + userId, conversationExpirySeconds, TimeUnit.SECONDS);

            return conversation;
        } catch (JsonProcessingException e) {
            log.error("대화 내역 파싱 중 오류 발생: {}", e.getMessage());

            // JSON 파싱 실패 시 새 대화 시작
            List<Map<String, String>> conversation = new ArrayList<>();
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "너는 개발 공부를 하는 학생에게 쉽고 명확하게 알려주는 친절한 시니어 개발자야. 복잡한 개념도 예시와 함께 이해하기 쉽게 설명하고, 실무에서의 활용법, 주의점, 추가 공부 키워드를 짧고 명확하게 알려줘. AI인 척하지 말고 자연스럽고 자신감 있게 답해.");
            conversation.add(systemMessage);
            saveConversation(userId, conversation);
            return conversation;
        }
    }

    // 대화 내역을 레디스에 저장
    public void saveConversation(String userId, List<Map<String, String>> conversation) {
        try {
            // 객체를 JSON 문자열로 변환
            String json = objectMapper.writeValueAsString(conversation);

            // 레디스에 저장 및 유효시간 설정
            redisTemplate.opsForValue().set(KEY_PREFIX + userId, json);
            redisTemplate.expire(KEY_PREFIX + userId, conversationExpirySeconds, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            log.error("대화 내역 저장 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("대화 내역 저장 중 오류 발생", e);
        }
    }

    // 레디스에서 대화 내역 삭제
    public void clearConversation(String userId) {
        redisTemplate.delete(KEY_PREFIX + userId);
    }
}