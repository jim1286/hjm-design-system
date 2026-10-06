# Popover 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [Popover](../popover.md), [ConfirmPopover 조합](../confirm-popover.md)

## 언제 쓰나

트리거에 붙어 뜨는 비모달 표면 안에 **포커스를 받는 임의 콘텐츠**를 둘 때 쓴다.
작은 폼, 링크가 섞인 설명, 여러 control이 섞인 필터 묶음, 되돌릴 수 있는 행동의 짧은 확인이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| stable id를 가진 action·선택 항목 목록 | [Menu](menu.md) |
| 포커스가 들어가지 않는 한 문장 보충 설명 | [Tooltip](tooltip.md) |
| 되돌릴 수 없는 파괴적 행동의 확인 | [AlertDialog](alert-dialog.md) |
| 사용자가 반드시 응답해야 하는 모달 작업 | [Dialog](dialog.md) |
| Native 앱의 같은 자리 | [Sheet](sheet.md) (Popover는 Web 전용) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Popover` | `@hjmds/react`, `/popover` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Popover } from "@hjmds/react/popover";

<Popover
  trigger={<Button tone="secondary">{t("filter.open")}</Button>}
  title={t("filter.title")}
  closeLabel={t("common.close")}
  descriptor={{ placement: "bottom", align: "start" }}
>
  {({ close }) => <FilterForm onApply={() => { apply(); close(); }} />}
</Popover>
```

Native 예는 없다(renderer 없음).

## 축과 기본값

- `openOn`: `press`(기본) · `hover`. `hover`는 지연된 포인터 진입을 **더할** 뿐이고 click/Enter/Space 경로는 그대로다.
- `descriptor.placement`: `top` · `bottom` · `start` · `end`, `align`: `start` · `center` · `end`.
- `dismissPolicy`(부분 지정): `dismissible`·`outsideDismiss`·`escapeDismiss`·`focusOutDismiss` 모두 기본 `true`.
- 열림: `open`+`onOpenChange`(제어) 또는 `defaultOpen`. `onOpenChange`의 두 번째 인자 `reason`은 `trigger`, `close-action`, `outside-pointer`, `outside-focus`, `escape`, `programmatic` 중 하나다.

## 꼭 지킬 것

- `title`과 `closeLabel`은 비어 있으면 안 된다(던진다). 둘 다 i18n 키로 넣는다.
- 행동 목록을 띄우려는 것이면 Popover가 아니라 Menu다. Popover 안에 menuitem 목록을 직접 만들지 않는다.
- 처음 포커스 대상을 바꿔야 하면 `initialFocusRef`를 쓴다.
- 콘텐츠 안에서 닫기는 children 함수 인자의 `close()`로 한다.
- `className`은 배치에만 쓴다. 표면의 색·radius·그림자를 덮지 않는다.

## 함정

- 부모 Popover가 닫히면 안에 중첩된 Popover도 닫히고 `onOpenChange(false, { reason: "programmatic" })`가 온다. 제어형이면 이 reason도 처리한다.
