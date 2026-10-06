# Affix 사용 지침

적용: `@hjmds/react` 1.12.1(Web 전용) · 검토일: 2026-10-06 ·
계약: [Affix — Web 상단 고정](../affix.md), `affixRecipe`(`src/affix.ts`)

## 언제 쓰나

Web에서 스크롤하는 동안 요약·필터·저장 버튼 같은 작은 영역을 가장 가까운 스크롤 조상의 상단에
붙여 두고, 부모가 끝나면 함께 풀리게 할 때 쓴다. CSS sticky라 원래 DOM 자리와 초점·입력값이 유지된다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면 하단에 고정된 주 행동 | [BottomCTA](bottom-cta.md) |
| 화면 상단 앱 바·제목 | [TopBar](top-bar.md), [Top](top.md) |
| 페이지 안 섹션 목차 | [Anchor](anchor.md) |
| 떠 있는 주 행동 | [FloatingActionButton](floating-action-button.md) |
| Native 화면 | 없음. Native renderer에는 Affix가 없다 |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Affix` | `@hjmds/react/affix` | 없음 | 기본(root entry에 없다) |

## 최소 사용 예

```tsx
// Web
import { Affix } from "@hjmds/react/affix";
import { Button } from "@hjmds/react/actions";

<Affix offset={16} onChange={setPinned}>
  <Button onClick={save}>{t("form.save")}</Button>
</Affix>
```

Native 사용 예는 없다(renderer 없음).

## 축과 기본값

- `offset`: 기본 `0`. 스크롤 조상 상단에서 띄울 CSS px. 유한한 0 이상이어야 하며 아니면 `TypeError`.
- `disabled`: 기본 `false`. 고정을 끄고 일반 흐름으로 둔다. 자식은 재마운트되지 않는다.
- `onChange(affixed)`: 최초 상태와 이후 전환 때만 호출된다.

## 꼭 지킬 것

- 부모에 스크롤할 공간이 있어야 고정 구간이 생긴다. 부모의 overflow 설정이 sticky 기준을 바꾼다.
- 자식의 의미·접근성 이름은 제품이 소유한다. Affix는 role이나 알림을 더하지 않는다.
- `className`·`style` prop이 없다. 배치는 바깥 wrapper나 `offset`으로 한다.
- 상단 고정만 된다. 하단 고정·portal·여러 sticky 영역 충돌 조정은 없다.

## 함정

- 콘텐츠가 스크롤 영역 높이에서 `offset`을 뺀 값보다 크면 고정이 풀리고 일반 흐름으로 돌아간다
  (`data-oversize`). 고정이 안 된다고 보이면 콘텐츠 높이부터 확인한다.
