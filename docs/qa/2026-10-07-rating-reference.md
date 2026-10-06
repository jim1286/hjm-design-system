# QA 리포트 — 별점 선택·초기화

## 판정과 대상

부분 확인. 2026-10-07 03:31 KST, Codex. main 4aa6563 위 미커밋 Web Rating 초점 복구,
기존 별점 실험 Web/Native. 실험 승격·게시·소비 앱 반영은 미실행이다.

## 환경

Web IAB 1280×720 light, localhost:6006 개발 Storybook(브라우저 세부 버전 미확인).
Native 기존 iPhone 17 Pro / iOS26.5 / Expo Go57.0.9 localhost:8084, 큰 글자(textScale2).
idb·simctl 확인으로 직접 Device Hub 창·실물 Release 검증이 아니다. 한국어, 합성 로컬 값,
실제 API·계정·저장 없음.

## 문제와 수정 전후

Web 3점 선택→오른쪽 키로4점→평가 지우기에서 값은 null이 되지만 초점이 body로 빠졌다.
초기화가 자기 버튼을 disabled로 바꾸기 때문이다. controlled callback 전에 첫 radio에
focus를 주도록 수정했다. 값 변경과 초점 소유권은 기존 Rating 안에 유지한다.

최종 build 후 같은 흐름을 다시 실행했다. 초기화 직후 첫 radio가 unchecked인 채 초점을
받고 Space로1점을 다시 선택했다. 회귀 검사에도 초점과 FormData 재선택을 추가했다.

| 흐름 | 결과 |
| --- | --- |
| Web 클릭+오른쪽 키 | 3→4점, 선택과 값 일치 |
| Web 초기화 후 Space | 미평가→첫 radio 초점→1점 |
| Web 평균·비활성 | 평균3.5점은 단일 이름 있는 이미지, 비활성4점 유지 |
| Native 큰 글자 3점 터치 | 3점 checked와 값 표시, 별/행 배치 캡처 확인 |
| Native 비활성5점 터치 | 비활성4점 유지 |
| Native 초기화 | 모든 입력 unchecked, 미평가 문구 복원 |

과거 rating.md는 독립 API가 없다고 안내하고 있었다. 현재 reference-controls와 usage를
현재 계약으로 명시하고 과거 Slider/Statistic 판단은 이력으로 남겼다. 반점 입력은 Slider,
정수 입력·미평가·소수 평균은 supplemental Rating이라는 구분을 유지한다.

## 검사

Node24.20.0/pnpm11.18.0. Web reference-adoption.browser.test.tsx 5개 통과(초점·폼 값과
기존 이미지 비교/전환 회귀 포함), Web package build 통과. 실행 중 기존 act 경고가 출력됐으나
실패는 없었다. 최종 typecheck·docs/usage 검사 수행. Native runtime은 이번에 수정하지 않았다.

## 미확인과 보관

RTL 반점 시각 방향·다크·두 제품 팔레트·좁은 화면 조합, Native VoiceOver 발화/초기화 후 접근성
초점, Android·실물 성능은 남았다. 평균 접근성 이름 존재를 실제 스크린리더 검증으로 세지 않는다.
검사 로그와 Native 캡처는 결과 보존 후 제거하고 테스트·fixture·코드·문서는 유지한다.
