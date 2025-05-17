package kr.codenova.backend.single.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.codenova.backend.common.enums.Language;
import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.CorrectAnswerResult;
import kr.codenova.backend.single.dto.KeyLog;
import kr.codenova.backend.single.dto.response.ScoreResult;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Getter
@Slf4j
public class TypingSession {

    private final List<KeyLog> keyLogs;
    private final String correctAnswer;
    private final CorrectAnswerResult expectedLines; // 정답 코드를 줄별로 자르고 - 좌우 공백 자르기, 총 길이와 리스트 저장 레코드임

    private boolean tooFast;
    private boolean tooConsistent;
    private boolean insaneSpeed;
    private boolean flawlessFast;
    private boolean accuracySuspicious;
    private boolean hasSimultaneousInput;
    private long totalMillis;
    private double avg;
    private double stdDev;
    private double wpm;
    private double accuracy;
    private int backspaceCount;

    private TypingSession(List<KeyLog> keyLogs, String correctAnswer) {
        validateKeyLogs(keyLogs);
        this.keyLogs = keyLogs;
        this.correctAnswer = correctAnswer;
        this.expectedLines = correctAnswerToList(correctAnswer);
    }

    public static TypingSession createFrom(List<KeyLog> keyLogs, String correctAnswer) {
        return new TypingSession(keyLogs, correctAnswer);
    }

    public boolean isSuspicious() {

        List<Long> intervals = new ArrayList<>();
        this.backspaceCount = 0;
        this.hasSimultaneousInput = false;
        long previous = keyLogs.get(0).timestamp();

        for (int i = 1; i < keyLogs.size(); i++) {
            long current = keyLogs.get(i).timestamp();
            long interval = current - previous;
            if (interval == 0) this.hasSimultaneousInput = true;
            intervals.add(interval);
            previous = current;

            if ("Backspace".equalsIgnoreCase(keyLogs.get(i).key())) {
                this.backspaceCount++;
            }
        }

        // 평균 및 표준편차
        this.avg = intervals.stream().mapToLong(Long::longValue).average().orElse(0);
        this.stdDev = Math.sqrt(intervals.stream()
                .mapToDouble(i -> Math.pow(i - avg, 2)).average().orElse(0));

        // 입력 속도 계산
        this.totalMillis = keyLogs.get(keyLogs.size() - 1).timestamp() - keyLogs.get(0).timestamp();
        this.wpm = calculateWPM(expectedLines.correctLength(), totalMillis);

        // 정확도 & 오타 유무
        this.accuracy = calculateAccuracy();

        // === 느린 유저는 걸러내지 않음 ===
        if (wpm <= 400) {
            log.info("⚠️ CPM {} 이하이므로 사람으로 간주 (탐지 무시)", wpm);
            return false;
        }

        // === 빠른 유저에 한해서만 검사하기
        this.tooFast = avg < 40;
        this.tooConsistent = stdDev < 10;
        this.insaneSpeed = wpm > 750; //cpm 750이란뜻

        // calculateAccuracy로 시뮬레이션 했을때 keyLogs가 100가 아니면 부정확하면 이상한 것
        this.accuracySuspicious = accuracy != 100.0;

        this.flawlessFast = backspaceCount == 0 && wpm > 700;

        if (expectedLines.correctLength() > 150) {
            flawlessFast = backspaceCount == 0 && wpm > 500;
        } else if (expectedLines.correctLength() > 100) {
            flawlessFast = backspaceCount == 0 && wpm > 600;
        } else if (expectedLines.correctLength() > 50) {
            flawlessFast = backspaceCount == 0 && wpm > 650;
        }

        // 상세 로그 출력
        log.info("🧪 Macro Detection Log:");
        log.info("Total key logs: {}", keyLogs.size());
        log.info("correctAnswer_length: {}", expectedLines.correctLength());
        log.info("Total duration (ms): {}", totalMillis);
        log.info("Average interval (ms): {}", avg);
        log.info("Standard deviation of interval: {}", stdDev);
        log.info("WPM (words per minute): {}", wpm);
        log.info("Backspace count: {}", backspaceCount);
        log.info("Accuracy: {}", accuracy);

        log.info("===== 매크로 판별 상세 로그 =====");
        log.info("tooFast: {}", tooFast);
        log.info("tooConsistent: {}", tooConsistent);
        log.info("insaneSpeed: {}", insaneSpeed);
        log.info("flawlessFast: {}", flawlessFast);
        log.info("isAccuracy: {}", accuracySuspicious);
        log.info("hasSimultaneousInput: {}", hasSimultaneousInput);
        log.info("===================================");

        return tooFast || tooConsistent || insaneSpeed || hasSimultaneousInput || flawlessFast ||  accuracySuspicious;
    }

    public ScoreResult result() {
        int charCount = keyLogs.size();
        long durationMillis = keyLogs.get(keyLogs.size() - 1).timestamp() - keyLogs.get(0).timestamp();
        double wpm = calculateWPM(expectedLines.correctLength(), durationMillis); //입력한 단어가 아니라 총단어수로 변경
        double accuracy = calculateAccuracy();
        return new ScoreResult(charCount, durationMillis, wpm, accuracy);
    }

    private double calculateWPM(int charCount, long durationMillis) {
        double basicWpm = (charCount / 5.0) / (durationMillis / 1000.0 / 60.0);
        return basicWpm * 5.0;
    }

    // 정답 코드 줄별로 나누기 - 좌우 공백 trim로 삭제
    private CorrectAnswerResult correctAnswerToList(String correctAnswer) {

        List<String> expectedLines = new ArrayList<>();
        int correctLength = 0;

        for (String line : correctAnswer.lines().toList()) {
            String trimmed = line.trim();
            expectedLines.add(trimmed);
            correctLength += trimmed.length();
        }

        return new CorrectAnswerResult(expectedLines, correctLength);
    }

    private double calculateAccuracy() {

        log.info("📋 KeyLogs 전체 출력 시작 ======================");
        for (int i = 0; i < keyLogs.size(); i++) {
            KeyLog logEntry = keyLogs.get(i);
            log.info("[{}] key: '{}', timestamp: {}", i, logEntry.key(), logEntry.timestamp());
        }
        log.info("📋 KeyLogs 전체 출력 끝 ========================");

        List<StringBuilder> lines = new ArrayList<>();
        lines.add(new StringBuilder());

        int lineCursor = 0;
        int charCursor = 0;

        int match = 0;

        for (KeyLog keyLog : keyLogs) {
            String key = keyLog.key();
            StringBuilder currentLine = lines.get(lineCursor);

            switch (key) {
                case "ArrowLeft" -> {
                    if (charCursor > 0) charCursor--;
                }
                case "ArrowRight" -> {
                    if (charCursor  <  currentLine.length()) charCursor++;
                }
                case "Backspace" -> {
                    if (charCursor > 0) {
                        currentLine.deleteCharAt(charCursor - 1);
                        charCursor--;
                    }
                    if (charCursor < 0) charCursor = 0;
                }
                case "Enter" -> {
                    String currentInput = currentLine.toString().trim();
                    String expected = expectedLines.lines().get(lineCursor).trim();

                    log.info("[줄 {} 입력 완료] 입력값: '{}'", lineCursor, currentInput);
                    log.info("[줄 {} 기대값] 기대값: '{}'", lineCursor, expected);

                    if (currentInput.equals(expected)){
                        log.info("✅ 줄 {} 일치! match += {}", lineCursor, expected.length());
                        // 줄 전환 커서 초기화
                        lineCursor++;
                        charCursor = 0;
                        lines.add(new StringBuilder());
                        match += expected.length();

                    } else {
                        // 틀렸으면 가만히 있기
                        log.info("❌ 줄 {} 불일치! 줄 이동 없음", lineCursor);
                    }
                }
                case "Shift", "Alt", "Control", "Meta", "Tab", "CapsLock",
                     "ArrowUp", "ArrowDown", "Escape", "Insert", "Delete",
                     "Home", "End", "PageUp", "PageDown", "NumLock", "ScrollLock",
                     "PrintScreen", "ContextMenu", "HanjaMode", "HangulMode", "Process",
                     "F1", "F2", "F3", "F4", "F6", "F7", "F8", "F9", "F10", "F11", "F12" -> {
                    // 무시
                }
                default -> {


                    currentLine.insert(charCursor, key);
                    charCursor++;
                    if (charCursor > currentLine.length()) charCursor = currentLine.length();
                    log.debug("입력 키: '{}', 현재 줄: '{}', 커서 위치: {}", key, currentLine.toString(), charCursor);
                }
            }
        }
        log.info("최종 match: {}, 전체 정답 길이: {}", match, expectedLines.correctLength());
        return ((double) match / expectedLines.correctLength()) * 100.0;
    }

//    private double calculateAccuracy() {
//
//        // 정답 코드 줄별로 나누기 - 좌우 공백 trim로 삭제
//        List<String> expectedLines = correctAnswer.lines()
//                .map(String::trim)
//                .toList();
//
//        StringBuilder typed = new StringBuilder();
//        for (KeyLog k : keyLogs) typed.append(k.key());
//
//        String input = typed.toString();
//        int len = Math.min(correctAnswer.length(), input.length());
//
//        int match = 0;
//        for (int i = 0; i < len; i++) {
//            if (correctAnswer.charAt(i) == input.charAt(i)) match++;
//        }
//
//        return ((double) match / correctAnswer.length()) * 100.0;
//    }

    private void validateKeyLogs(List<KeyLog> logs) {
        if (logs == null) throw new CustomException(ResponseCode.KEYLOG_TOO_SHORT);
        if (logs.get(0).timestamp() >= logs.get(logs.size() - 1).timestamp()) throw new CustomException(ResponseCode.KEYLOG_INVALID_ORDER);
    }

    public String keyLogsToJsonString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < keyLogs.size(); i++) {
            KeyLog logEntry = keyLogs.get(i);
            sb.append(String.format("{\"key\":\"%s\",\"timestamp\":%d}", logEntry.key(), logEntry.timestamp()));
            if (i < keyLogs.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    public String createLogToJson(String requestId, Integer memberId, Integer codeId, Language language) {
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode logNode = objectMapper.createObjectNode();

        logNode.put("event", "macro_detection_summary");
        logNode.put("requestId", requestId);
        logNode.put("memberId", memberId);
        logNode.put("codeId", codeId);
        logNode.put("language", language.name());
        logNode.put("totalKeys", keyLogs.size());
        logNode.put("durationMs", totalMillis);
        logNode.put("wpm", wpm);
        logNode.put("avgIntervalMs", avg);
        logNode.put("stdDevIntervalMs", stdDev);
        logNode.put("backspaceCount", backspaceCount);
        logNode.put("accuracyPercentage", accuracy);
        logNode.put("simultaneousInputCount", hasSimultaneousInput ? 1 : 0);
        logNode.put("tooFast", tooFast);
        logNode.put("tooConsistent", tooConsistent);
        logNode.put("insaneSpeed", insaneSpeed);
        logNode.put("flawlessFast", flawlessFast);
        logNode.put("accuracySuspicious", accuracySuspicious);
        logNode.put("hasSimultaneousInput", hasSimultaneousInput);

        ArrayNode keyLogsArray = logNode.putArray("keyLogs");
        keyLogs.forEach(k -> {
            ObjectNode key = objectMapper.createObjectNode();
            key.put("key", k.key());
            key.put("timestamp", k.timestamp());
            keyLogsArray.add(key);
        });

        return logNode.toString();
    }
}


