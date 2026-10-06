# Tooltip 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [Tooltip](../tooltip.md), 경계: [Popover의 Tooltip·Menu·Popover 판정](../popover.md)

## 언제 쓰나

Web에서 이미 이름과 focus를 가진 컨트롤(대개 [IconButton](icon-button.md))에 **짧은 보충 설명 한 문장**을
붙일 때 쓴다. 마우스를 올리면 500ms 뒤, 키보드 focus면 바로 열리고 Escape로 닫힌다.
브라우저 `title` 속성 툴팁 대신 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 버튼·링크·입력처럼 사용자가 눌러야 하는 내용이 들어감 | [Popover](popover.md) |
| 행동 항목 목록 | [Menu](menu.md), [ContextMenu](context-menu.md) |
| 오류·필수 정보처럼 놓치면 안 되는 내용 | [Field](field.md)의 설명·오류, [Notice](notice.md) |
| 처음 쓰는 사용자에게 순서대로 기능 소개 | [Tour](tour.md) |
| 컨트롤의 접근성 이름 자체 | 컨트롤의 `label`(Tooltip은 이름을 대신하지 않는다) |

Tooltip과 Popover의 구분: 안에 focus가 들어가야 하면(눌러야 할 것이 있으면) Popover다. Tooltip은 plain
string만 받고 focus를 받지 않으며, hover·focus가 풀리면 닫힌다. Popover는 click으로 열고 안의 컨트롤로
focus가 이동하며 `title`·`closeLabel`이 필수다.

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Tooltip` | `@hjmds/react`, `/overlays` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { IconButton } from "@hjmds/react/actions";
import { Tooltip } from "@hjmds/react/overlays";

<Tooltip
  content={t("notifications.tooltip")}
  trigger={
    <IconButton label={t("notifications.open")} onClick={openInbox}>
      <BellIcon />
    </IconButton>
  }
/>
```

Native: 없음. 계약상 Native는 `unsupported`이고 hover UI를 흉내 내지 않는다.

## 축과 기본값

- `content`: 현지화된 비어 있지 않은 문자열. ReactNode·링크·버튼은 받지 않는다.
- `placement`: `top`(기본) · `bottom` · `start` · `end`. `align`: `center`(기본) · `start` · `end`.
  공간이 모자라면 renderer가 반대쪽으로 뒤집는다.
- `pointerOpenDelayMs` 500(기본), `focusOpenDelayMs` 0(기본). 최근 Tooltip이 닫힌 뒤 300ms 안의 이웃은 바로 열린다.
- 열림 상태는 `open`/`defaultOpen`/`onOpenChange`(controlled·uncontrolled 중 하나).

## 꼭 지킬 것

- `trigger`는 focus 가능한 단일 interactive 요소다. Tooltip은 role·tabIndex·접근성 이름을 만들지 않으므로
  클릭되는 `span` 같은 것을 trigger로 쓰지 않는다.
- Tooltip 없이도 컨트롤의 이름과 결과를 이해할 수 있어야 한다. 핵심 정보를 Tooltip에만 두지 않는다.
- 배치 override prop은 없다(`className`만 있음). 위치는 `placement`·`align`으로만 정한다.
- `HjmProvider` 안에서는 한 번에 하나만 보인다. Provider 밖이면 이 조정이 없다.

## 함정

- 터치에는 hover가 없어서, 터치 탭은 trigger의 원래 click을 실행하면서 Tooltip도 연다(두 번째 탭이나 바깥
  누름으로 닫힘). 탭이 곧 행동이므로 모바일 Web에서 Tooltip을 미리 읽고 누르는 흐름을 기대하지 않는다.
- 접근성 이름 구실을 하는 속성(`iframe title` 등)은 Tooltip으로 바꾸지 않는다.
