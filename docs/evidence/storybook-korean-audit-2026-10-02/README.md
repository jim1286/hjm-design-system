# Storybook 표시 이름·분류 검수

검토일: 2026-10-02 · 로컬 checkout · Web 및 Native

## 결과

- 210개 CSF 파일을 검사했다. Web 정적 index 323개 예제와 Native 소스 398개 예제의 표시 이름을 한글로 정리했다.
- 기본 상태 표시는 기본·어두운 테마·큰 글자. 공개 API, export, global 값은 유지했다.
- 피드백 분류를 상태와 알림으로 바꾸고 두 플랫폼 순서·탐색 검사·문서를 맞췄다.
- 이름은 용도를 먼저 표현한다. 생각 중 표시, 목록 간 항목 이동, 로그인 화면 등이 예다.
- Web 미리보기 함수 44개가 메뉴에 예제로 노출되던 문제를 includeStories로 제거했다. 실제 예제 323개의 ID는 보존했다. 비교 목록은 web-index-audit.json에 기록했다.
- Web 전체 탐색에서 한글과 API 이름을 모두 검색한다. AuthScreenLayout 링크는 실제 CSF export ID인 auth-screen-layout으로 교정했다.
- 단일 컴포넌트·화면 조합·비교 갤러리·디자인 기초의 역할 구분은 유지한다. 수치와 아바타의 움직임은 데이터 표시 역할이며, 장식 효과와 섞지 않는다. 신규 항목은 실험에서 사용자 승인 후 이동한다.

## 검증

- Native showcase check: typecheck, 생성, 12 tests PASS.
- Web showcase check: typecheck, 28 tests, token boundary PASS.
- Web build 및 static verify: 103개 canonical 계약 및 13개 탐색 페이지 PASS. 전체 323개 index 표시 이름과 각 경로에 한글이 있는지 검사한다.
- 실제 Web 전체 탐색에서 로그인 화면 검색 → AuthScreenLayout 결과 1개 확인. web-search.png.
- 기존 iPhone 17 / iOS 27.0 개발 앱에서 리퀴드 토스트와 목록 간 항목 이동의 한글 경로·기본 상태를 접근성 트리와 화면으로 확인했다.
- Native title 기반 ID는 변경된다. 예: 컴포넌트-상태와-알림-리퀴드-토스트--default. 오래된 저장 링크는 새 메뉴에서 다시 선택한다.

## 범위와 제한

Storybook 자체가 제공하는 Controls, Accessibility, 검색 도움말 등 관리 도구 UI의 영문은 이 저장소의 예제 이름과 별개다. 라이브러리 내부 문자열을 덮어쓰지 않았다.
Native 캡처에는 개발용 Refreshing 배너가 다시 나타났다. 메뉴 이름과 화면 진입은 확인했지만 배너 재발 원인 해결을 이 검수의 성공으로 보고하지 않는다.
전체 예제 각각의 상호작용을 다시 실행한 검수는 아니며, 메뉴 전수 검사와 대표 화면 확인이다. 패키지 게시·소비 앱 배포는 수행하지 않았다.
