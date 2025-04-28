
# 2025.04.26(토)

### KPT 작성

#### `Keep` : 현재 만족하고 있는 부분, 계속 이어갔으면 하는 부분
- 소켓 부분 그래도 테스트가 잘되고 있는거 같음
- 팀 분위기 좋음 

#### `Problem` : 불편하게 느끼는 부분, 개선이 필요하다고 생각되는 부분
- 예외처리 부분이 아직 부족함
- 통합 테스트 해볼려고 테스트 코드 작성해봤는데 계속 에러가 나서 테스트 못해봤음 
- 서버에서 낙하 시간하고 일정 시간 지나면 낙하 시간 감소하게 설정해놨는데 나중에 수정이 필요해보임



#### `Try` : problem에 대한 해결책, 다음 회고 때 판별 가능한 것, 당장 실행 가능한 것
- 테스트 코드 작성해서 통합테스트나 단위 테스트 해보기 
- socket.io 지원하는 Artilley를 이용하여 부하테스트도 해볼 수 있으면 해보기
- 낙하 시간하고 다음 단어 스폰 시간은 테스트 해보면서 어느 시간이 적절한지 결정

---
#### `Today`
- socket 공통 부분 코드 수정하고 합치기
- 랜덤매칭과 코드로 방 참가 시 브로드 캐스트와 클라이언트한테 응답 2가지 형태로 줬는데 하나로 통일해서 모든 사용자한테 현재 방에 있는 사용자 리스트를 브로드캐스트 하는 형식으로 수정

- GameRoom에서 동시성 제어를 위해 AtomicInteger로 목숨 변수 관리 
   get()으로 현재 목숨 가져오고 set()으로 목숨 변경하는 메서드 추가

- 단어들을 ConcuurentLinkedQueue에 저장하고, 스케줄러에서 해당 단어를 가져와서 낙하시키는 코드 작성
- ConcurrentLinkedQueue
  - 비동기 환경에서도 안전하게 사용할 수 있는 Queue (FIFO: 선입선출) 자료구조
  - 내부적으로는 lock-free (락 없이 CAS 연산, Compare-And-Swap) 기반으로 동작
  - 여러 스레드가 동시에 offer(추가), poll(꺼내기) 해도 문제가 안 생김
``` java
// 단어 초기화 (초기에 50개 쌓아두기)
public void initFallingwords(List<String> words) {
    fallingWords.clear();
    if (words != null) {
        fallingWords.addAll(words);  // 한번에 쭉 추가
    }
}

// 하나씩 꺼내기
public String pollNextWord() {
    return fallingWords.poll(); // 제일 앞에 있는 단어 하나 꺼내고 큐에서 제거
}
```