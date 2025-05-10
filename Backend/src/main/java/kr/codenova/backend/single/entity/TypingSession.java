package kr.codenova.backend.single.entity;

import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.KeyLog;
import kr.codenova.backend.single.dto.response.ScoreResult;

import java.util.ArrayList;
import java.util.List;

public class TypingSession {

    private final List<KeyLog> keyLogs;
    private final String correctAnswer;

    private TypingSession(List<KeyLog> keyLogs, String correctAnswer) {
        validateKeyLogs(keyLogs);
        this.keyLogs = keyLogs;
        this.correctAnswer = correctAnswer;
    }

    public static TypingSession createFrom(List<KeyLog> keyLogs, String correctAnswer) {
        return new TypingSession(keyLogs, correctAnswer);
    }

    public boolean isSuspicious() {
        if (keyLogs.size() < 10) return false;

        List<Long> intervals = new ArrayList<>();
        int backspaceCount = 0;
        boolean hasSimultaneousInput = false;
        long previous = keyLogs.get(0).timestamp();

        for (int i = 1; i < keyLogs.size(); i++) {
            long current = keyLogs.get(i).timestamp();
            long interval = current - previous;
            if (interval == 0) hasSimultaneousInput = true;
            intervals.add(interval);
            previous = current;

            if ("Backspace".equalsIgnoreCase(keyLogs.get(i).key())) {
                backspaceCount++;
            }
        }

        // 평균 및 표준편차
        double avg = intervals.stream().mapToLong(Long::longValue).average().orElse(0);
        double stdDev = Math.sqrt(intervals.stream()
                .mapToDouble(i -> Math.pow(i - avg, 2)).average().orElse(0));

        // 입력 속도 계산
        long totalMillis = keyLogs.get(keyLogs.size() - 1).timestamp() - keyLogs.get(0).timestamp();
        double wpm = calculateWPM(keyLogs.size(), totalMillis);

        // 정확도 & 오타 유무
        double accuracy = calculateAccuracy();

        // 긴 멈춤 없는 경우
        boolean noPauseDetected = intervals.stream().noneMatch(i -> i > 1000);  // 1초 이상 쉬는 구간 없음

        // 의심 조건들
        boolean tooFast = avg < 50;
        boolean tooConsistent = stdDev < 10;
        boolean insaneSpeed = wpm > 600;
        boolean flawlessNoBackspace = backspaceCount == 0 && accuracy == 100.0;

        return tooFast || tooConsistent || insaneSpeed || hasSimultaneousInput || flawlessNoBackspace || noPauseDetected;
    }

    public ScoreResult result() {
        int charCount = keyLogs.size();
        long durationMillis = keyLogs.get(keyLogs.size() - 1).timestamp() - keyLogs.get(0).timestamp();
        double wpm = calculateWPM(charCount, durationMillis);
        double accuracy = calculateAccuracy();
        return new ScoreResult(charCount, durationMillis, wpm, accuracy);
    }

    private double calculateWPM(int charCount, long durationMillis) {
        return (charCount / 5.0) / (durationMillis / 1000.0 / 60.0);
    }

    private double calculateAccuracy() {
        StringBuilder typed = new StringBuilder();
        for (KeyLog k : keyLogs) typed.append(k.key());

        String input = typed.toString();
        int len = Math.min(correctAnswer.length(), input.length());

        int match = 0;
        for (int i = 0; i < len; i++) {
            if (correctAnswer.charAt(i) == input.charAt(i)) match++;
        }

        return ((double) match / correctAnswer.length()) * 100.0;
    }

    private void validateKeyLogs(List<KeyLog> logs) {
        if (logs == null || logs.size() < 2) throw new CustomException(ResponseCode.KEYLOG_TOO_SHORT);
        if (logs.get(0).timestamp() >= logs.get(logs.size() - 1).timestamp()) throw new CustomException(ResponseCode.KEYLOG_INVALID_ORDER);
    }
}


