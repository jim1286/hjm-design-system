# 로그인 카드 진행 상태 개선

2026-10-01 사용자 요청: 소셜 버튼의 로그인 접미 문구를 없애고, 인증 시작 시 모든 버튼을
숨긴 뒤 기존 카드 크기에서 중앙 로딩 하나를 표시한다.

## 반영

- Web·Native `AuthScreenLayout`에 mainCard와 지역화 문자열 pendingLabel을 추가했다.
  카드 배경·크기는 유지하고 main 내용을 숨기면서 키보드·터치·접근성 탐색에서 제외한다.
  취소·실패 후 pendingLabel을 제거하면 같은 버튼과 폼 상태가 복구된다.
- Web·Native 로그인 쇼케이스는 카카오·네이버·Google·Apple 이름만 표시한다.
  버튼 클릭으로 진행 상태를 확인할 수 있고 별도 Loading preview도 제공한다.
  데모의 1.2초 복구는 인증 성공 증거가 아니며 제품은 실제 인증 결과에 연결한다.
- 로그인 계약·제공자 버튼 계약·채택 가이드·두 renderer README·에이전트 지침을 갱신했다.
  상위 포트폴리오 로그인 화면 표준 LS 1.2도 같은 사용자 결정으로 갱신했다.
- public API를 유지하고 additive minor Changeset을 작성했다. 단독 버튼의 busy prop은
  호환성을 위해 남아 있으며 새 로그인 조합에서는 카드 pendingLabel만 사용한다.

## 이번 로컬 검증

| 범위 | 결과 |
| --- | --- |
| Web 신규 브라우저 회귀 | 카드 전후 bounds·배경 유지, 중앙 로딩 좌표, inert와 숨김, 취소 후 복구: 1개 통과 |
| Native 신규 회귀 | mounted action 유지, touch/accessibility 제외, 중앙 host 배치, 취소 후 복구: 1개 통과 |
| 기존 Web 환경 matrix | 591개 통과 |
| 기존 Native 환경 matrix·default render | 564개 통과 |
| AuthScreen 계약 | 6개 통과 |
| 타입·빌드 | 세 package build, Web·Native renderer typecheck 통과 |
| 쇼케이스 | 두 typecheck와 테스트 23개, Web token boundary, production build, canonical 103개 정적 검사 통과 |
| 번들 | contract graph 통과, Node 24.20.0 renderer graph/플랫폼 경계 통과, Native Android Metro raw 1502.0 KiB / gzip 372.0 KiB 통과 |
| 공통 연결 | workspace·evidence·103개 계약 projection·227개 공개 API map·governance 17개 테스트 통과 |
| 문서 | HJM 및 루트 문서 링크, 루트 현재 정책 일관성, diff whitespace 검사 통과 |

핵심 관련 회귀는 1,163개이며 전체 package 테스트 재실행 수치가 아니다.
Web root graph는 새 pending renderer 분기의 Node 24 측정치가 기존 gzip 한도를 넘겨
300 bytes만 추가했고 근거를 budget 주석에 남겼다. 나머지 크기·의존성 경계는 유지한다.

## 배포와 소비 경계

현재 checkout의 소스·dist·쇼케이스 반영이다. npm 게시·버전 bump·commit/push·소비 앱 수정은
수행하지 않았다. exact npm train을 설치하는 제품은 새 버전 배포/설치 후 지역화 문구와
인증 진행 상태를 이 API에 연결해야 한다. package 갱신만으로 제품의 문구·진행 상태가
자동 변경되지 않는다. iOS/Android 실제 기기 화면·OAuth·제공자 검수는 이번에 확인하지 않았다.

## 후속 소비 앱 반영

같은 날 사용자 요청으로 번뚝·다에리 웹/앱, 스핀트·모펀·유틸버스 앱에 제공자 이름과 카드 진행 상태를 연결했다. 게시된 1.10.0의 공개 API로 기존 카드 외형을 보존하는 합성 경계를 사용했으며 새 pendingLabel API를 설치한 것으로 보고하지 않는다. 추가 요청에 따라 로딩 아래 문구를 제거했다. Native의 기본 caption 있는 Spinner 대신 접근성 이름과 HJM 색을 가진 ActivityIndicator, Web은 접근성 전용 label인 Spinner를 사용한다. 각 제품 docs/LOGIN_CARD_PENDING_2026-10-01.md에 이관 조건을 기록했다. 배포·기기 화면 확인은 별도다.

추가 검증: 문구 제거 후 Web 높이 유지·inert·숨김 label과 Native 문구 없음·복구를 포함한 관련 테스트 78개가 통과했다(번뚝 Web 23, 다에리 Native 36, 스핀트 Native 18, HJM Native 1). 번뚝 Native·스핀트 Native·모펀 Native typecheck 통과. 다에리 Native는 기존 test/stubs/react-native.tsx:132, 유틸버스 Native는 별도 작업 중인 src/lib/rates-cache.ts:33의 타입 오류로 전체 검사가 실패했다. 실제 기기·공개 반영은 미확인이다.
