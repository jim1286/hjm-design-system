# QA 리포트 — 입력을 유지하는 도구

## 판정·대상

부분 확인. 2026-10-07, Codex, main e5d0ff1 위 Web/Native Showcase와 사용 지침 수정.
기존 단일 선택을 공개 SegmentedControl로 연결했다. 새 공개 API나 엔진 추가는 없다.
전체 레퍼런스 전수 검토·Storybook 승격·npm 게시·소비 제품 채택 완료를 뜻하지 않는다.

## 환경과 재현

Web IAB localhost6006, dark/RTL/textScale2, 390×844. Native 기존 iPhone17Pro/iOS26.5,
Expo Go57.0.9/Metro8084, light/기본 글자. Native는 idb·simctl 대체 도구이며
직접 Device Hub 창·실물 Release 검증이 아니다. 서버 요청 없는 메모리 예제다.

1. 기존 Web 예제에 초안을 입력하고 Tab/Enter로 표현 도구를 연다.
2. 기본·인용·강조는 정확히 하나 선택되지만 AX에 세 개의 독립 checkbox로 표시됐다.
3. 양 예제를 SegmentedControl presentation=pills로 바꿨다. Collapsible과 입력 위치는 유지했다.
4. 수정 뒤 Web에 `도구를 접어도 남는 초안`을 입력하고 Tab/Enter로 연다.
5. 선택 그룹에 Tab으로 진입한 뒤 RTL Left로 기본→인용을 선택한다.
6. Shift+Tab/Enter로 접으면 trigger에 초점이 남고, 다시 열어도 초안·인용 선택이 남는다.

## 결과

| 확인 | 관찰 |
| --- | --- |
| Web 접근성 의미 | 기록 표현 그룹, radio 3개, checked는 인용 하나 |
| Web 키보드 | Tab 진입·RTL Left 선택·Shift+Tab/Enter 접기·재개 통과 |
| Web 시각 | 390px dark/큰 글자에서 입력·trigger·선택·결과 문구 확인, 버튼 잘림 없음 |
| Native 입력 | 키보드가 열린 채 도구 열기·인용 선택·접기·재개, 초안 값 유지 |
| Native 선택 의미 | 인용 radio button checked, 나머지 unchecked |
| Native 시각 | 입력과 도구가 키보드 위에 보이며 인용 선택 구분 가능 |

Native `idb ui text` ASCII 입력은 현재 한글 키보드 배열로 입력돼 실제 값이
`ㅇㄱㅁㄹㅅ ㄴㅅ묜 42`였다. 의도한 영어 입력 성공이라고 기록하지 않는다.
이 실제 문자열이 전 과정에서 같았다는 것만 초안 보존 근거로 사용했다.
입력 직후 같은 명령에 붙인 첫 펼침 tap에는 화면 변화가 없었다. 스크린샷으로
키보드와 접힌 trigger를 확인한 뒤 별도 tap으로 열었다. 첫 tap 무응답을 통과로 세지 않는다.

## 자동 검사

Node24.20.0/pnpm11.18.0. 양 Showcase check exit0:
Web typecheck·43 tests·token boundary, Native story generation·typecheck·18 tests 통과.
문서 링크·사용 지침·Storybook 규격·git diff 공백 검사 통과.
이 변경은 예제 조합 수정이며 앞선 전체 ci:check 결과를 이번 변경의 전체 CI 결과로 재사용하지 않는다.

## 남은 검증과 범위

Native RTL/다크/큰 글자·제품 팔레트·VoiceOver·외부 키보드·Android는 미확인.
예제는 선택과 초안 보존만 보여 준다. 본문 서식 변환·서버 저장·영구 복구를 제공하지 않는다.
외부 Dynamic/Expandable Toolbar 원본의 전환과 성능 동등성도 미확인이다.

## 보관

검사 결과와 실제 관찰은 이 문서에 보존했다. 확인한 Native 원시 캡처 2개는 제거했다.
재사용 소스·사용 지침과 다른 작업의 실행 중 로그는 보존한다.
