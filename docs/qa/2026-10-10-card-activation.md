# QA — Card 전체 행동

2026-10-10 · main65afd501 위 로컬 미게시 변경. 번뚝 세 열 선택 카드에서 별도 선택 버튼/+ 제거 요청에 맞춰 기존 Card에 onActivate/disabled를 추가했다. 제품 Pressable 복제와 동일 항목 재실행을 막는 RadioGroup을 대신 쓰지 않았다.

- Web button type=button, aria-pressed, 이름 필수, disabled guard, 키보드·포커스·눌림 피드백. Native Pressable button, selected/disabled 상태, 기존 Surface 구조/slot 유지. actions와 전체 행동의 중복 사용은 거부한다.
- 양 renderer typecheck/build 통과. Web SSR281/browser1163개 통과, 새 Native Card2개 통과. usage/api-map/docs 검사 통과.
- BurnTok 웹 실제 모바일402×874·데스크톱1265×713에서 카드 선택과 초안 채움 확인. Native AX에서3열118pt 폭 확인.
- npm 게시, 소비 제품 production build, 실기기 Release 검증은 미수행. BurnTok 지정 Node24.20.0 source 소비 회귀93개 통과. 초기 Node26의 기존 AlertDialog 회귀 실패와 지정 환경 재확인 결과는 BurnTok docs/qa/2026-10-10-create-cards-profile-density.md에 기록했다.
- 새 브랜치/워크트리 없음. 공유 BottomNavigation labels 변경·생성 파일은 다른 세션 작업으로 보존.
