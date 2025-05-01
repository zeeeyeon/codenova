
# 2025.04.28 (월) Happy jiyeon-day ✨

### KPT 작성

#### `Keep` : 현재 만족하고 있는 부분, 계속 이어갔으면 하는 부분

- 팀 분위기 너무 좋아 ..💚

- 스스로 정한 데드라인 지키기 (타협하지 말기)

#### `Problem` : 불편하게 느끼는 부분, 개선이 필요하다고 생각되는 부분

- [Infra]
    - 1. 트리거 걸린 브랜치에 이벤트를 일으키면, 백앤드+프론트 전부 컨테이너가 재빌드 되는 상황 발생
  
    - 2. AWS Aurora 보안 그룹, 전부 다 허용하지 말 것 (우리가 사용하는 IP만 설정해야 할 것 같은데...)
  
    - 3. AWS ElastiCache, redis 설정하기
  
    - 4. Websocket 설정이 잘 됐는지 확인하기
  
    - 5. 오늘의 빅 문제점 : application.yml 을 변수 처리하고 볼륨 마운트 했는데 못읽어옴, 그래서 서버 내부에 디렉토리를 만들고 볼륨 마운트 하는 방식으로 세팅 
  
- [Backend]
    - DB, 배틀에 사용하는 언어 카테고리 테이블 정규화 생각 해 보기 (속도 차이가 있는지 확인하기)  

#### `Try` : problem에 대한 해결책, 다음 회고 때 판별 가능한 것, 당장 실행 가능한 것

- 랭킹 구현하기

- 브랜치 트리거 수정

- elasticache 설정 + aurora, terminus 명령어로 사용하는 방법 찾아서 백앤드 칭구덜 알려주기 - 🎵

- application.yml 변수 값 다시 세팅 + 볼륨 마운트 해보기

#### `Today`

- 기본적인 인프라 세팅 완-✨
1. 기본 서버 세팅 (docker, docker-compose, aws cli)
2. aws 인증 세팅(iam 유저 생성 + access key 발급, aws configure 설정)
3. gitlab runner 세팅(ec2 내부 설치 + gitlab token 사용 -> 연결)
4. AWS ECR, repository 생성 (백앤드 + 프론트)
5. AWS RDS(Aurora PostgreSQL 17 생성 + Security Group 설정)
6. codenova.kr 도메인 연결 (nginx, 포트 포워딩)
7. .gitlab-ci.yml 스크립트 작성
8. SSL 인증서 발급 (HTTPS 적용 + HTTP -> HTTPS 리다이렉트)
9. Socket.IO 설정 (WebSocket 서버로 프록시)
---