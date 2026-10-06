# QA 리포트 — 읽기 진행 레퍼런스

## 판정·대상·환경

부분 확인. 2026-10-07 03:27 KST, Codex. main 65e0174 위 미커밋 Web/Native
ReadingProgress 스토리에 내용 축소·복원 제어를 추가했다. public runtime은 변경하지 않았다.
Web IAB localhost:6006, light 1280×720(세부 버전 미확인). Native는 기존 iPhone 17 Pro,
iOS 26.5, Expo Go 57.0.9 / localhost:8084. idb·simctl 대체 도구이며 직접 Device Hub 창이나
실물 Release 검증이 아니다. 한국어 합성 본문, 실제 API·계정 없음.

## 출처 관찰과 판단

[Tracing Beam 원본](https://ui.aceternity.com/components/tracing-beam)에서 전체 데모 링크를
열었다. 실제 viewport 611×853 dark. 시작점과 본문 왼쪽 수직 선, React/Changelog 이미지와
본문 배치를 확인했다. 스크롤 위치 0→853에서 다음 본문으로 이동했다. 문서의 속도 반응 설명은
이번 화면 관찰만으로 검증하지 못했다. 광선 표현 흡수 후보는 미결이며 기존 Progress 또는
Timeline이 동일한 표현이라고 주장하지 않는다.

기존 HJM은 읽는 문서의 scroll host와 접근 가능한 Progress 범위를 제공한다. 이 계약을
window 전용 장식으로 교체하지 않고, 내용이 바뀌는 비교 제어를 기존 스토리에 추가했다.

## 재현·결과

| 흐름 | 실제 결과 | 판정 |
| --- | --- | --- |
| Web region에 End 키 | windowY=0 유지, host offset80/content440/viewport360으로 끝 이동 | 통과 |
| Web 요약만 보기 | 화면 안에 들어오는 본문으로 축소, 진행률1 | 통과 |
| Web 전체 내용 복원 | 긴 본문 복원, 진행률0 | 통과 |
| Native 본문 스와이프 | 0%에서30%로 변화 | 통과 |
| Native 요약만 보기 | 짧은 본문100% | 통과 |
| Native 전체 내용 복원 | 0% 및 초기 본문 복원, 캡처 확인 | 통과 |

Web End 직후의 0.79375는 스크롤 이동 중 관찰이며 최종 위치 값으로 세지 않았다.
변형은 스크롤 위치를 보여줄 뿐 실제 독서·동의·학습 완료를 증명하지 않는다.

## 자동 검사

Node24.20.0/pnpm11.18.0, Showcase Native check(typecheck·18 tests), Web check
(typecheck·43 tests·token boundary) 모두 통과. 최종 usage/docs/storybook/diff 검사 수행.
Runtime 변경이 없으므로 이번에 package 전체 테스트와 production build는 재실행하지 않았다.

## 남은 범위·보관

원본의 속도 반응·접근성·모션 감소, HJM 두 제품 팔레트·다크·큰 글자·RTL·Native 끝까지 스크롤,
Android·실물 성능은 남았다. 실험 승격·npm 게시·Utilverse 적용은 미실행이다.
검사 로그와 Native 원시 캡처는 이 리포트에 결과를 보존한 뒤 제거한다. fixture와 실제 소스,
URL ledger·지침은 유지한다. 진행 서버와 다른 세션 산출물은 보존한다.
