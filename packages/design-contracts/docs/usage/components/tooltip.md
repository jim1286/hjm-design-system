# Tooltip

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Tooltip](../../tooltip.md), [Popover의 Tooltip·Menu·Popover 판정](../../popover.md), `src/component-recipes.ts`(`tooltipRecipe`)
- 스토리북: `배포/컴포넌트/오버레이/툴팁`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Tooltip` | 기본 | `@hjmds/react`, `/overlays` | — |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `content` | 현지화된 비어 있지 않은 문자열 | — | ReactNode·링크·버튼은 받지 않는다 |
| `placement` | `top` · `bottom` · `start` · `end` | `top` | 공간이 모자라면 renderer가 반대쪽으로 뒤집는다 |
| `align` | `center` · `start` · `end` | `center` | — |
| `pointerOpenDelayMs` | ms | 500 | 최근 Tooltip이 닫힌 뒤 300ms 안의 이웃은 바로 열린다 |
| `focusOpenDelayMs` | ms | 0 | — |
| `open` / `defaultOpen` | `boolean` | `defaultOpen` `false` | controlled(`open`+`onOpenChange` 필수)·uncontrolled 중 하나 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | `reason`은 `pointer` · `focus` · `pointer-leave` · `blur` · `escape` · `trigger-activation` · `another-tooltip` |
| `trigger` | `ReactElement`(focus 가능한 단일 요소) | — (필수) | — |
| `portalContainer` | `HTMLElement` | `document.body` | 말풍선을 붙일 곳 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | trigger를 감싼 바깥 `span`의 배치(margin·`alignSelf` 등). 말풍선 위치에는 영향이 없다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 말풍선 안쪽 여백 사방 `spacing.xs` 8(`tooltipRecipe.surface.padding`; 2026-10-06까지 Web은 좌우 12였다, 1.12.1 이후 미게시), 모서리 `radius.sm` 8, 최대 폭 280(`tooltipRecipe.content.maxWidth`, 화면 폭 − 24를 넘지 않음). trigger는 그 자체로 최소 터치 영역 44를 지켜야 한다(Tooltip은 영역을 넓히지 않는다). 보통 [IconButton](icon-button.md) | `tooltipRecipe.surface`, `.hjm-tooltip__content` |
| 간격 | trigger와 4(`positioning.sideOffset` = `spacing.xxs`), 뷰포트 가장자리와 최소 12(`positioning.collisionPadding` = `spacing.sm`) | `tooltipRecipe.positioning`, `react/src/overlays.tsx`(`Tooltip`) |
| 순서·정렬 | trigger 바로 옆에 붙는다. 한 줄에 Tooltip 달린 아이콘 버튼이 여럿이면 하나만 보이고, 300ms 안에 옆으로 옮기면 바로 열린다 | `react/src/overlays.tsx`(`Tooltip`) |
| 고정·스크롤 | 떠 있는 층(`position: fixed`)이라 문서 흐름에 자리를 만들지 않고 trigger 크기도 바꾸지 않는다. 공간이 모자라면 반대쪽으로 뒤집힌다 | `.hjm-tooltip__content`, `react/src/portal.tsx` |
| 좁은 폭·큰 글자 | 넘치면 줄바꿈하고 자르지 않는다(`overflow-wrap: anywhere`) | `.hjm-tooltip__content` |

```text
placement="top"(기본), align="center"
          ┌──────────────────┐
          │ 알림 보기        │  ← 말풍선(최대 280)
          └────────┬─────────┘
                   │ 4
                [ 🔔 ]          ← trigger(IconButton, 44)
뷰포트 가장자리와 12 미만이면 아래로 뒤집힌다.
```

## 꼭 지킬 것

- `trigger`는 focus 가능한 단일 interactive 요소다. Tooltip은 role·tabIndex·접근성 이름을 만들지 않으므로
  클릭되는 `span` 같은 것을 trigger로 쓰지 않는다.
- Tooltip 없이도 컨트롤의 이름과 결과를 이해할 수 있어야 한다. 핵심 정보를 Tooltip에만 두지 않는다.
- trigger 자리의 배치는 `layoutStyle`로 한다. 말풍선 위치는 `placement`·`align`으로만 정하고 `className`으로 말풍선 모양을 덮지 않는다.
- `HjmProvider` 안에서는 한 번에 하나만 보인다. Provider 밖이면 이 조정이 없다.

## 함정

- 터치에는 hover가 없어서, 터치 탭은 trigger의 원래 click을 실행하면서 Tooltip도 연다(두 번째 탭이나 바깥
  누름으로 닫힘). 탭이 곧 행동이므로 모바일 Web에서 Tooltip을 미리 읽고 누르는 흐름을 기대하지 않는다.
- 접근성 이름 구실을 하는 속성(`iframe title` 등)은 Tooltip으로 바꾸지 않는다.
