# 2025.04.29(목)

### KPT 작성

#### `Keep` : 현재 만족하고 있는 부분, 계속 이어갔으면 하는 부분
- 멀티 UI 아주 이쁘게 잘 만들고 있는 것 같다.


#### `Problem` : 불편하게 느끼는 부분, 개선이 필요하다고 생각되는 부분
- 소켓도 수정할 부분이 보인다. 방 코드 입력 시, 방에 입장하는 코드 수정했다.
- 더 수정이 필요한 부분이 있을 것이다. 


#### `Try` : problem에 대한 해결책, 다음 회고 때 판별 가능한 것, 당장 실행 가능한 것
- 프론트 팀원과 소통을 열심히 하여, 더 안정적인 서버를 구축하고 싶다.
- 소켓 관련 필요한 기능을 더욱 찾아보고 공부해보겠습니다.
---
#### `Today`

게임 시, 소켓 통신의 공정성을 보장하는 방법

- 문제 상황
  - 현재 방식은 finish_game 요청이 "서버에 도착한 순서"로 1,2등을 정한다.
  - 하지만 네트워크 딜레이 때문에, 예를 들어 실제로는 A가 먼저 끝났는데, B의 요청이 서버에 먼저 도착할 수도 있다.
  - "서버 도착 시간"만 믿으면 100% 정확하지 않을 수 있다.
- 해결 방법
  - 클라이언트가 finish_game 요청할 때 "자기 디바이스 기준 finish 시간"을 같이 보내라!
  - 즉, FinishGameRequest에 finishTime(LocalDateTime 또는 Timestamp) 추가하기!

- 수정된 FinishGameRequest
```java
public class FinishGameRequest {
  private String roomId;
  private String nickname;
  private Double typingSpeed;
  private LocalDateTime finishTime;
  private Integer rank;
  
  public UserResultStatus(String nickname, Double typingSpeed, LocalDateTime finishTime) {
    this.nickname = nickname;
    this.typingSpeed = typingSpeed;
    this.finishTime = finishTime;
  }
}
```
- 서버 summarizeGameResult 수정
```java
public GameResultBroadcast summarizeGameResult(String roomId) {
    List<GameResultBroadcast.UserResultStatus> results = finishedUserResults.getOrDefault(roomId, new ArrayList<>());
    
    result.sort(Comparator.comparing(UserResultStatus::getFinishTime));
    
    int rank = 1;
    for (GameResultBroadcast.UserResultStatus userResult : results) {
        userResult.setRank(rank++);
    }
    
    GameResultBroadcast broadcast = new GameResultBroadcast();
    broadcast.setRoomId(roomId);
    broadcast.setResults(results);

    finishedUserResults.remove(roomId);
    roomUserCounts.remove(roomId);

    return broadcast;
}
```

