# 공통 실행·복구 보강 — 2026-10-02

## 변경

- 선택적 `@hjmds/design-contracts/action-session`: 외부 저장소 구독, 중복 실행 차단,
  성공/오류 구분, 명시적 재시도 허용, 낙관적 변경 rollback, reset 이후 오래된 응답 무시.
- 기존 Button·AlertDialog·Toast의 UI/API는 변경하지 않았다. 라이브러리 추가 없음.
- Web/Native `실험/공통 동작`: 저장과 재시도, 즉시 반영과 복구, 보관과 실행 취소.
  각각 기본·어두운 테마·큰 글자 상태. 원본 예제는 지연/실패를 시뮬레이션한다.
- [소유권과 사용 계약](../../../packages/design-contracts/docs/action-session.md)에 멱등 키,
  서버 취소·캐시·초안 영속화·실행 취소 범위를 기록했다. Changeset은 additive minor지만
  이미 준비된 major 변경과 함께 릴리스 계획에서 합산된다. 실제 버전/lockfile 변경은 없음.

## 실행한 검사

- contracts check: 타입·923 tests·build·생성 계약·bundle budget 통과. 새 helper 1 module,
  2504 raw / 889 gzip bytes; 기존 예산 변경 없음.
- Web showcase check: 타입·28 tests·토큰 경계 통과.
- Native showcase check: 스토리 생성·타입·12 tests 통과.
- workspace:check, api-map:check, docs:check 통과.
- [실제 브라우저 결과](web-results.json): 320px에서 세 흐름 × 세 상태 = 9개.
  실패 주입 후 초안 보존/rollback/역연산 실패 상태 보존/재시도, 가로 넘침 없음,
  pageerror 없음 확인. [저장](web-save.png), [북마크](web-optimistic.png), [실행 취소](web-undo.png).

## 검증 한계

Device Hub 프로세스와 기존 iPhone 17 / iOS 27.0 실행을 확인했으나 CUA 앱 연결이
`timeoutReached (-10005)`로 실패했다. 기기 UI 조작·VoiceOver/TalkBack·Android 검증은
완료하지 않았다. 새로운 시뮬레이터나 Release 빌드를 만들지 않았다.
실제 서버 요청, outbox, 영속 초안 저장, 소비 앱 채택, npm 게시와 배포는 수행하지 않았다.

기존 Expo 개발 서버(8187)의 실제 프로젝트 경로로 iOS 번들 요청도 HTTP 200으로 완료했다.
생성 번들에 action-session과 신규 저장 예제가 포함됨을 확인했다. 이는 기기 UI 검증은 아니다.
