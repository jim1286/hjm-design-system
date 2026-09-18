# 화면 제목과 마지막 행동

2026-09-16: 앱 감사에서 Native 전용 TopBar/BottomCTA 때문에 같은 제품의 Web에
별도 헤더와 푸터가 생기는 공백을 확인했다. 기존 Native recipe를 React에 연결한다.
TDS의 [ListRow](https://tossmini-docs.toss.im/tds-mobile/components/ListRow/list-row-overview/)와
[BottomCTA](https://tossmini-docs.toss.im/tds-mobile/components/BottomCTA/check-first/)에서
제목/본문/보조 정보의 위계, 하나의 강한 주 행동을 참조한다. 색·형상·간격은 HJM 소유다.

## 공개 경로와 경계

| 구성 | React | React Native |
| --- | --- | --- |
| 제목 | `@hjmds/react/top-bar` | `@hjmds/react-native/top-bar` |
| 마지막 행동 | `@hjmds/react/bottom-cta` | `@hjmds/react-native/bottom-cta` |
| 행동 이벤트 | `onClick` | `onPress` |
| 위치 | 기본 flow, 선택적 sticky | 제품의 화면 레이아웃이 배치 |

Native의 기존 `navigation`/`actions` 경로도 유지한다. 새 경로는 그 모듈의 alias이므로
기능별 파일 분리나 번들 감소를 의미하지 않는다. manifest 변경 이유는 Web/RN에서
같은 기능을 찾기 쉽게 하면서 기존 import를 깨지 않기 위해서다.

TopBar는 leading, title, trailing/actions 슬롯을 받는다. title 클릭은 실제 버튼,
이동은 슬롯의 Link로 표현한다. actions와 trailing을 동시에 전달하면 거절한다.
Web의 headingLevel은 페이지 구조가 정한다. div root이므로 Dialog 안에 넣어도
두 번째 banner landmark를 만들지 않는다. `centered`는 남은 제목 영역 내 정렬이다.
짧은 행동 문구를 압축하던 동일 폭 좌우 열 대신 콘텐츠 폭을 보장하고 제목이 줄바꿈한다.
큰 글자에서는 제목을 다음 행으로 내려 행동과 겹치지 않게 한다.

BottomCTA는 primaryAction 하나와 선택적인 secondaryAction, description을 받는다.
loading은 표시 문구의 폭을 유지하고 중복 실행을 막는다. 큰 글자에서 세로로 쌓을 때
가로 배치용 flex-basis를 해제한다. 가로 배치 값이 세로 높이로 해석되어 거대한 공백을
만들었던 320px 브라우저 재현이 근거다. 간격은 Native와 같은 `bottomCtaRecipe.gap`이다.

Web sticky는 문서 흐름 안에 자리를 유지한다. fixed overlay는 본문 spacer 측정이
추가로 필요하므로 제공하지 않는다. safeAreaTop/Bottom은 유한한 0 이상 숫자이며
브라우저 env inset과 명시적 inset 중 큰 값을 쓴다. 키보드가 열린 제품 화면의 실제
viewport 처리는 제품 QA에 남는다. 버튼 그룹은 일반 Tab 순서이며 toolbar가 아니다.

## 검증

`packages/react/test/screen-chrome.browser.test.tsx`는 320/390px, 1/2배 글자,
LTR/RTL, light/dark에서 hit target, 글자 범위, overflow, 제목 분리와 footer 간격을
검증한다. ref/heading/link, busy 중 중복 실행 방지와 폭/focus 보존, sticky footer 위
마지막 본문 행동의 도달 가능성도 검사한다. 기본 SSR renderer fixture를 추가한다.

`Patterns/Notification settings`는 Web/RN에서 동일 문구·선택·저장 상태를 합성한다.
행 제목과 스위치 문구가 중복되면 `labelVisibility="hidden"`을 사용한다. `label`은
계속 필수이며 Web의 visually-hidden 텍스트와 Native의 accessibilityLabel로 남는다.
Web List의 indented 구분선은 행 margin이 아닌 별도 선으로 그린다. 320px 조합에서
두 번째 제목부터 들여쓰기되던 재현을 고쳤고 Native의 기존 선 전용 inset과 맞췄다.
Storybook의 조작과 브라우저 검사는 Native 기기의 VoiceOver/TalkBack 검증을 대체하지 않는다.
catalog beta는 구현 지원 범위이며 stable 또는 앱 배포 완료 선언이 아니다.
