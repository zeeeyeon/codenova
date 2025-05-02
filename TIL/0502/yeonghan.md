# 2025.05.02(금)

### KPT 작성

#### `Keep` : 현재 만족하고 있는 부분, 계속 이어갔으면 하는 부분
- 오늘 다같이 테스트도 해보고 데이터도 구축하고 아주 보람찬 하루였습니다.


#### `Problem` : 불편하게 느끼는 부분, 개선이 필요하다고 생각되는 부분
- 음.. 추가적인 모드가 필요하다고 느꼈고, 이에 대한 가능성을 탐색해보는 시간을 가져야겠다고 생각했습니다.
- 너무 희생정신이 없는 것 같습니다. 팀원들을 위해 희생하는 정신을 가지겠습니다.

#### `Try` : problem에 대한 해결책, 다음 회고 때 판별 가능한 것, 당장 실행 가능한 것
- 다음 회고 때, 알아본 정보들을 함께 이야기 해보는 시간을 가지겠습니다.
- 다음 회의까지 기능을 대부분 다 구현해서 오도록 해야겠습니다.
- 인강 다 듣고 오겠습니다.

---
#### `Today`
```JAVA
import java.io.*;
public class MultiCatch {
    public static void main(String[] args) {
        try {
            new FileReader("x.txt");
        } catch (FileNotFoundException | NullPointerException e) {
            System.out.println("예외 발생");
        }
    }
}
```
이러한 코드를 300개 가량 찾아서 DB에 구축했습니다.
