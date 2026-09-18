# Anchor — 같은 문서 안의 목차

2026-09-16 React/RN 확장 요청에 따라 Web 라이브러리 beta를 제공합니다. 이전에는 실제 제품의
긴 문서 수요가 없어 planned였습니다. 이번에는 작동하는 문서 예제와 브라우저 검증까지
제공하며 제품 채택·보조기기 검증·stable 승격은 별도로 남깁니다.

[Ant Design Anchor](https://ant.design/components/anchor/)의 문서 내 링크·현재 위치·스크롤
영역 구분을 비교했습니다. HJM은 content-brand 글자와 얇은 논리 방향 표시선으로 위치를
보여주며 별도 카드나 주요 행동 버튼으로 강조하지 않습니다. API 호환을 약속하지 않습니다.

## 사용법

```tsx
import { Anchor } from "@hjmds/react/anchor";

<Anchor label="가이드 목차" items={[
  { id: "start", label: "시작하기" },
  { id: "next", label: "다음 단계" },
]} offset={64} />
// 같은 문서에 고유 ID를 가진 <section id="start">, <section id="next">를 둡니다.
```

- `items`는 비어 있지 않은 `{ id, label }` 배열입니다. ID는 공백 없이 문서 안에서 고유해야
  합니다. 중복 ID·빈 label을 거부합니다. fragment는 ID를 URL encode해 생성합니다.
- `container` 생략 시 문서 스크롤을 관찰합니다. `HTMLElement`를 넘기면 해당 영역 내부만
  관찰합니다. ref를 기다리는 `null`에서는 관찰하지 않습니다.
- `offset`은 상단 고정 헤더 아래에 남길 CSS px입니다. 기본 0이고 유한한 음이 아닌 수만
  허용합니다. 별도 스크롤 영역의 border와 scrollTop을 포함해 계산합니다.
- `orientation`은 `vertical` 기본값 또는 `horizontal`입니다. 좁은 폭에서 링크가 줄바꿈하며
  긴 label을 자르지 않습니다. 목차의 sticky 배치와 문서 레이아웃은 호스트가 소유합니다.
- `historyMode`는 `push` 기본값, `replace`, `none`입니다. 앞의 둘은 기존 history.state를
  보존하며 fragment만 갱신합니다. `none`은 URL을 쓰지 않는 내장 미리보기에 적합합니다.
- `onNavigate(id, event)`에서 `preventDefault()`로 앱 라우터 등에 동작을 위임할 수 있습니다.
  새 탭을 여는 modifier 클릭은 브라우저에 맡깁니다. `ref`는 nav 요소를 가리킵니다.

## 스크롤·초점 계약

`nav > ul > li > a`를 사용하고 현재 링크 하나에 `aria-current="location"`을 둡니다.
대상이 DOM에 없는 링크는 현재 위치 후보에서 제외하며 기본 href 동작을 유지합니다.
사용자가 링크를 누르면 해당 section/제목에 초점을 옮깁니다. 일반 section은 임시 `tabindex=-1`을
받고 blur/unmount 때 복원합니다. Tab/Enter는 브라우저 링크 동작입니다.

현재 위치는 DOM 순서의 가정 대신 실제 위치로 계산합니다. 스크롤 끝에서는 짧은 마지막
섹션도 선택합니다. 스크롤·창 크기·대상/부모 크기·본문 삽입/삭제를 관찰하고 unmount 때
listener·observer·예약 frame을 해제합니다. CSS transform만으로 위치를 움직이는 별도 애니메이션은
계약에 포함하지 않습니다. window의 hashchange/popstate와 초기 fragment는 등록된 대상으로
즉시 이동하여 별도 스크롤 영역도 복구합니다.

일반 클릭은 smooth scroll입니다. HJM 환경 또는 OS가 reduced motion이면 `instant`로 이동합니다.
`auto`는 호스트의 scroll-behavior에 따라 다시 애니메이션될 수 있어 사용하지 않습니다.

## 범위와 검증

Web 전용입니다. Native 라우팅·목록 위치 이동은 해당 플랫폼과 제품이 소유하며 빈 RN wrapper를
추가하지 않습니다. 중첩 트리 목차·자동 제목 수집·오버레이 anchor positioning은 포함하지 않습니다.

`Patterns/Anchor`는 세 부분으로 나눈 읽기 가이드와 별도 스크롤 영역을 제공합니다.
브라우저 테스트는 위치 동기화·짧은 마지막 부분·offset·reduced motion·임시 focus 복원·
fragment 복구·나중에 삽입된 대상을 검사합니다. 실제 제품 문서 채택·보조기기 검증은 남아 있습니다.
