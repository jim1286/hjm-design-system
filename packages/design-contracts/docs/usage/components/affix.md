# Affix

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-23
- 근거: [Affix — Web 상단 고정](../../affix.md), `affixRecipe`(`src/affix.ts`)
- 스토리북: `배포/컴포넌트/기반 기능/고정 배치`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Affix` | 기본(root entry에 없다) | `@hjmds/react/affix` | 없음 |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `offset` | 유한한 0 이상의 CSS px | `0` | 스크롤 조상 상단에서 띄울 거리. 아니면 `TypeError` |
| `disabled` | `boolean` | `false` | 고정을 끄고 일반 흐름으로 둔다. 자식은 재마운트되지 않는다 |
| `onChange` | `(affixed: boolean) => void` | — | 최초 측정 결과와 이후 붙음↔풀림 전환 때만 호출된다(스크롤마다 호출하지 않는다) |
| `layer` | `sticky` · `base` | `sticky` | 쌓임 단계. `sticky`는 공통 `layer.sticky`(100, `--hjm-layer-sticky`)로 뒤에 오는 position 지정 콘텐츠 위에 그린다. `base`(0)는 자체 쌓임을 가진 표면(대화상자·측면 패널 본문) 안에서만 쓴다(개발 소스, 미게시) |
| `fill` | `canvas` · `none` | `canvas` | 상자 뒤 바탕. `canvas`는 화면 배경(`--hjm-color-bg`)을 깔아 지나가는 콘텐츠가 비치지 않게 한다. `none`은 자식이 자기 표면(Card·채운 도구 막대)을 가질 때 쓴다(개발 소스, 미게시) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | sticky 상자의 배치 전용. `position`·`top`·`zIndex`는 Affix가 소유한다 |
| `children` | `ReactNode` | 필수 | 고정할 영역 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 자식이 정한다. Affix는 여백·높이를 더하지 않고 `fill="canvas"`(기본)면 화면 배경(`--hjm-color-bg`)만 깔아 아래 내용을 가린다 | `.hjm-affix` |
| 간격 | 스크롤 조상 상단에서 `offset`만큼 띄운다. 상단 바가 있는 화면은 그 높이를 준다(스토리는 `offset={8}`) | `react/src/affix.tsx`, `showcase/web/src/patterns/WebAdditions.stories.tsx` |
| 순서·정렬 | 고정하려는 영역이 원래 있던 자리(DOM 순서)에 그대로 둔다. 쌓임은 `layer`가 정한다: 기본 `sticky`(100)라 뒤에 오는 position 지정 카드·이미지가 고정된 막대 위로 그려지지 않는다. 제품이 바깥 wrapper에 z-index를 따로 주지 않는다 | `affixRecipe.defaults`, `foundations.ts` `layer`, `.hjm-affix[data-layer]` |
| 고정·스크롤 | 상단 sticky만 된다. 고정 구간은 부모 높이 안에서만 생기고 부모가 끝나면 함께 밀려 올라간다. 한 스크롤 영역에 Affix를 여러 개 두지 않는다 | `affixRecipe`(`edge: "top"`, `position: "sticky"`) |
| 좁은 폭·큰 글자 | 자식이 스크롤 영역 높이 − `offset`보다 크면 고정하지 않는다(`data-oversize`). 좁은 폭·큰 글자에서는 자식을 한 줄 요약으로 줄인다 | `affixRecipe.oversize: "flow"` |

```text
스크롤 영역
┌──────────────────────────────┐
│ TopBar (고정, 높이 = offset)  │
├──────────────────────────────┤ ← offset
│ [필터 요약]      [저장]       │ ← Affix(붙은 상태)
│ ↑ 스크롤 콘텐츠               │
└──────────────────────────────┘
```

## 꼭 지킬 것

- 부모에 스크롤할 공간이 있어야 고정 구간이 생긴다. 부모의 overflow 설정이 sticky 기준을 바꾼다.
- 자식의 의미·접근성 이름은 제품이 소유한다. Affix는 role이나 알림을 더하지 않는다.
- `className`·`style` prop이 없다. 배치는 `layoutStyle`이나 `offset`으로 한다(`position`·`top`은 덮을 수 없다).
- 상단 고정만 된다. 하단 고정·portal·여러 sticky 영역 충돌 조정은 없다.

## 함정

- 콘텐츠가 스크롤 영역 높이에서 `offset`을 뺀 값보다 크면 고정이 풀리고 일반 흐름으로 돌아간다
  (`data-oversize`). 고정이 안 된다고 보이면 콘텐츠 높이부터 확인한다.

## 근거

- `layer`·`fill`(2026-10-23 소비 감사): Affix가 z-index를 두지 않아 뒤에 오는 position 지정 내용이 고정된 탭 막대 위로 그려질 수 있었고,
  `layoutStyle`로도 줄 수 없었다. 그래서 포트폴리오 사이트가 `.tabs-bar { position: sticky; z-index: 2; background: var(--hjm-color-bg) }`를
  따로 유지했다. 숫자 z-index 대신 공통 `layer` 단계 이름으로 받고 기본을 BottomCTA·FAB와 같은 `sticky`로 둔다. 바탕 칠은 기존 동작(`canvas`)을
  기본값으로 이름 붙이고 자식이 표면을 가질 때만 `none`을 고른다.

```tsx
// 포트폴리오 사이트 탭 막대 이관 예: sticky·z-index·배경 CSS를 지운다
<Affix><Container size="content" gutter="regular"><Tabs … /></Container></Affix>
```
