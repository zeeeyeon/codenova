package kr.codenova.backend.single.entity;

import kr.codenova.backend.global.exception.CustomException;
import kr.codenova.backend.global.response.ResponseCode;
import kr.codenova.backend.single.dto.CorrectAnswerResult;
import kr.codenova.backend.single.dto.KeyLog;
import kr.codenova.backend.single.dto.response.ScoreResult;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class TypingSession {

    private final List<KeyLog> keyLogs;
    private final String correctAnswer;
    private final CorrectAnswerResult expectedLines; // 정답 코드를 줄별로 자르고 - 좌우 공백 자르기, 총 길이와 리스트 저장 레코드임

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
        double wpm = calculateWPM(expectedLines.correctLength(), totalMillis);

        // 정확도 & 오타 유무
        double accuracy = calculateAccuracy();

        // 긴 멈춤 없는 경우
        boolean noPauseDetected = intervals.stream().noneMatch(i -> i > 500); // 이거 너무 길어서 메크로아닌데 메크로라캄

        // 의심 조건들
        boolean tooFast = avg < 50;
        boolean tooConsistent = stdDev < 10;
        boolean insaneSpeed = wpm > 600;
        boolean flawlessNoBackspace = backspaceCount == 0;

        // calculateAccuracy로 시뮬레이션 했을때 keyLogs가 100가 아니면 부정확하면 이상한 것
        boolean isAccuracy = accuracy != 100.0;

        // 상세 로그 출력
        log.info("🧪 Macro Detection Log:");
        log.info("Total key logs: {}", keyLogs.size());
        log.info("Total duration (ms): {}", totalMillis);
        log.info("Average interval (ms): {}", avg);
        log.info("Standard deviation of interval: {}", stdDev);
        log.info("WPM (words per minute): {}", wpm);
        log.info("Backspace count: {}", backspaceCount);
        log.info("Accuracy: {}", accuracy);
        log.info("Long pause detected: {}", noPauseDetected);

        // 조건별 탐지 여부
        log.info("Condition - tooFast: {}", tooFast);
        log.info("Condition - tooConsistent: {}", tooConsistent);
        log.info("Condition - insaneSpeed: {}", insaneSpeed);
        log.info("Condition - hasSimultaneousInput: {}", hasSimultaneousInput);
        log.info("Condition - flawlessNoBackspace: {}", flawlessNoBackspace);
        log.info("Condition - noPauseDetected: {}", noPauseDetected);
        log.info("Condition - isAccuracy: {}", isAccuracy);

        return tooFast || tooConsistent || insaneSpeed || hasSimultaneousInput || flawlessNoBackspace || noPauseDetected || isAccuracy;
    }

    public ScoreResult result() {
        int charCount = keyLogs.size();
        long durationMillis = keyLogs.get(keyLogs.size() - 1).timestamp() - keyLogs.get(0).timestamp();
        double wpm = calculateWPM(expectedLines.correctLength(), durationMillis) * 5; //입력한 단어가 아니라 총단어수로 변경
        double accuracy = calculateAccuracy();
        return new ScoreResult(charCount, durationMillis, wpm, accuracy);
    }

    private double calculateWPM(int charCount, long durationMillis) {
        return (charCount / 5.0) / (durationMillis / 1000.0 / 60.0);
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
                }
                case "Enter" -> {
                    String currentInput = currentLine.toString().trim();
                    String expected = expectedLines.lines().get(lineCursor).trim();
                    if (currentInput.equals(expected)){
                        // 줄 전환 커서 초기화
                        lineCursor++;
                        charCursor = 0;
                        lines.add(new StringBuilder());
                        match += expected.length();

                    } else {
                        // 틀렸으면 가만히 있기
                    }
                }
                case "Shift", "Alt", "Control", "Meta", "Tab", "CapsLock",
                     "ArrowUp", "ArrowDown", "Escape", "Insert", "Delete",
                     "Home", "End", "PageUp", "PageDown", "NumLock", "ScrollLock",
                     "PrintScreen", "ContextMenu", "HanjaMode", "HangulMode",
                     "F1", "F2", "F3", "F4", "F6", "F7", "F8", "F9", "F10", "F11", "F12" -> {
                    // 무시
                }
                default -> {
                    currentLine.insert(charCursor, key);
                    charCursor++;
                }
            }
        }
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
        if (logs == null || logs.size() < 2) throw new CustomException(ResponseCode.KEYLOG_TOO_SHORT);
        if (logs.get(0).timestamp() >= logs.get(logs.size() - 1).timestamp()) throw new CustomException(ResponseCode.KEYLOG_INVALID_ORDER);
    }
}


