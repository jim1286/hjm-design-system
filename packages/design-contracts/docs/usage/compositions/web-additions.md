# 웹 전용 보조 컴포넌트

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [ColorPicker](../../color-picker.md), [Watermark](../../watermark.md), [Affix](../../affix.md), `showcase/web/src/patterns/WebAdditions.stories.tsx`, `packages/react/src/affix.tsx`, `packages/react/src/styles.css`(`.hjm-color-picker`, `.hjm-watermark`, `.hjm-affix`), `src/affix.ts`, `src/color-picker.ts`
- 스토리북: `배포/구성/비교와 검증/웹 전용 보조 컴포넌트`

## 언제 쓰나

Web에만 있는 보조 컴포넌트 세 개(색 고르기, 문서 워터마크, 스크롤 중 고정되는 실행 영역)를 실제 쓰임 하나씩과 함께 보여 주는 모음이다.
스토리 셋은 서로 이어진 흐름이 아니다. 무엇을 고를지는 아래 기준으로 정한다.

| 필요 | 고를 것 | 스토리 |
| --- | --- | --- |
| 사용자가 강조 색 같은 **사용자 데이터 색**을 고른다 | `ColorPicker` | 색상 선택 |
| 검토용·대외비 문서임을 본문 위에 표시하되 읽기·선택·버튼은 막지 않는다 | `Watermark` | 문서 표시 |
| 긴 스크롤 영역에서 저장 같은 실행 버튼을 위쪽에 붙여 둔다 | `Affix` | 고정 실행 영역 |

Native 화면에서 같은 일이 필요하면 이 구성을 옮기지 않는다. 하단 고정 행동은 [BottomCTA](../components/bottom-cta.md)를 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `ColorPicker` | 네이티브 색 입력 + HEX 입력 + 불투명도(`alpha`) + 프리셋 견본. controlled | [ColorPicker](../components/color-picker.md) |
| 선택값 문구 `Text` `role="status"` | 바뀐 HEX를 알림. 값은 `<bdi dir="ltr">`로 감싼다 | [Text](../components/text.md) |
| `Watermark` | 본문 위 장식 SVG 타일. 포인터·선택을 가로채지 않는다 | [Watermark](../components/watermark.md) |
| `Affix` | 가장 가까운 스크롤 조상 상단에 `position: sticky`로 붙는다 | [Affix](../components/affix.md) |
| `Heading` | 워터마크 안 문서 제목 | [Heading](../components/heading.md) |
| `Button` | 워터마크 위 저장, Affix 안 저장. 저장 중 `loading` | [Button](../components/button.md) |
| `Notice` | 저장 실패 안내(스토리에 없음) | [Notice](../components/notice.md) |

## 배치

```text
색상 선택                               문서 표시
┌ fieldset ──────────────────────┐      ┌ Watermark ──────────────────────┐
│ 강조 색상 (legend)             │      │ ╱HJM╱  검토 중인 문서  ╱HJM╱    │ ← 타일 240×160, -22°, 0.12
│ [■] [ HEX  #b94627cc        ]  │      │ 본문 문단 (선택 가능)           │
│ 불투명도 ───────●──────        │      │ [ 문서 저장 ]                   │ ← 오버레이 위에서도 눌림
│ [ 미리보기 막대             ]  │      └─────────────────────────────────┘
│ [■ 프리셋][■ 프리셋][■ 프리셋] │
└────────────────────────────────┘
선택한 색상: #b94627cc  ← live

고정 실행 영역(스크롤 조상 안)
┌ 스크롤 영역 ───────────────────┐
│ ↑ offset spacing.xs 8          │
│ [ 변경 저장 ] 상단 고정 중     │ ← Affix: 스크롤하면 이 줄이 위에 붙는다
│ … 긴 본문(스크롤) …            │
└────────────────────────────────┘
바깥 틀: 제품 페이지(문서 스크롤, Container). 안전 영역·키보드 처리 없음
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 제품 페이지 레이아웃(문서 스크롤) | 세 스토리 모두 바깥 폭·여백을 정하지 않는다. 페이지 본문은 [Container](../components/container.md)가 정한다. Affix만 가장 가까운 스크롤 조상(문서 또는 제품의 `overflow: auto` 영역)에 붙는다. Web 전용이라 안전 영역·화면 키보드 처리는 없다 | Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20 |
| 색 입력 줄 | `ColorPicker` 색 견본 + HEX | fieldset 첫 줄, 좁으면 줄바꿈(`flex-wrap`) | 입력 최소 높이 `colorPickerRecipe.minTargetSize` 44, 색 견본 폭 3rem, 줄 간격 0.75rem |
| 불투명도·미리보기·프리셋 | `ColorPicker` 내부 | 색 입력 아래 순서대로 | 각 위 여백 0.75rem, 프리셋 사이 0.5rem, 프리셋 최소 높이 44 |
| 선택값 | live 문구 | ColorPicker 바로 아래 | 제품 레이아웃 소유 |
| 워터마크 | `Watermark` | 감싼 본문 전체를 덮는 오버레이(`inset: 0`) | `tileWidth` 240 · `tileHeight` 160 · `rotate` -22 · `opacity` 0.12(기본값), 색 `--hjm-color-text-sub` |
| 고정 행동 | `Affix` | 스크롤 조상 상단 + `offset` | `offset` 기본 0, 띄울 때는 spacing 토큰 값(스토리 `spacing.xs` 8). 스크롤 조상보다 높으면 고정하지 않고 흐름에 남는다 |
| 저장 실패 | `Notice` danger | 저장 버튼 위(Watermark 본문 안, Affix 아래 본문 첫머리) | 버튼과 `spacing.md` 16 |

- ColorPicker 내부 간격은 CSS가 rem 값으로 직접 둔다(`padding: 1rem`, `gap: 0.75rem`·`0.5rem`). 제품에서 덮지 않는다.
- Affix는 스크롤 조상 안에서만 붙는다. 그 조상의 높이·overflow는 제품 레이아웃이 정한다(스토리의 280px 박스는 데모 값).

## 흐름과 상태

1. 색상 선택: 색 견본·HEX·프리셋 중 하나로 고른다 → `onValueChange`가 소문자 `#rrggbb`(또는 `alpha`면 `#rrggbbaa`)를 준다 → 문구가 갱신된다.
2. HEX 입력은 Enter·blur에 확정되고 Escape는 마지막 `value`로 되돌린다.
3. 문서 표시: 워터마크 위에서 본문을 선택하고 버튼을 누른다. 워터마크는 상태가 없다.
4. 고정 실행 영역: 스크롤하면 Affix가 상단에 붙고 `onChange(true)`, 다시 올리면 `onChange(false)`가 온다.
5. 저장: 버튼이 `loading`이 되고, 실패하면 Notice danger가 나오며 버튼을 다시 누를 수 있다. 성공하면 Notice를 내린다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | ColorPicker는 `value` 색, 워터마크 타일, Affix는 일반 위치(`data-affixed` 없음) | — |
| 진행 중 | 저장 버튼 `loading`(Watermark·Affix 안). ColorPicker는 요청이 없다 | 포커스는 버튼에 남는다 |
| 실패 | 저장 실패 Notice danger, 버튼 다시 활성. Affix 고정 중이면 버튼은 그대로 위에 붙어 있다 | Notice `danger`는 `role="alert"` |
| HEX 잘못 입력 | `labels.invalid` 문구가 오류로 보이고 외부 값은 그대로 | 오류 문구는 alert |
| 프리셋 선택됨 | 선택한 견본 테두리가 primary 색, `aria-pressed="true"` | — |
| `disabled` | fieldset 전체 흐림(opacity 0.5), 입력·프리셋 막힘 | 포커스 불가 |
| Affix 고정 중 | `data-affixed="true"`, 배경 `--hjm-color-bg` | 고정돼도 버튼 상태·키보드 포커스 유지(자식 재마운트 없음) |
| Affix 너무 큼 | `data-oversize="true"`, 고정하지 않고 일반 흐름 | — |

## 코드 골격

```tsx
// Web
import { ColorPicker } from "@hjmds/react/color-picker";
import { Watermark } from "@hjmds/react/watermark";
import { Affix } from "@hjmds/react/affix";
import { Button } from "@hjmds/react/actions";
import { Notice } from "@hjmds/react/feedback";
import { Heading } from "@hjmds/react/heading";
import { Stack, Text } from "@hjmds/react/layout";

<Stack gap="md">
  <ColorPicker label={t("theme.accent")} value={color} onValueChange={setColor} alpha
    presets={productPresets}
    labels={{ color: t("theme.color"), hex: t("theme.hex"), opacity: t("theme.opacity"), invalid: t("theme.invalidHex") }} />
  <Text role="status">{t("theme.selected")} <bdi dir="ltr">{color}</bdi></Text>
</Stack>;

<Watermark text={[t("doc.watermark.brand"), t("doc.watermark.review")]}>
  <Stack gap="md">
    <Heading level="level3">{t("doc.title")}</Heading>
    {documentBody}
    {saveFailed ? <Notice tone="danger" title={t("doc.saveFailed")} /> : null}
    <Button loading={saving} onClick={save}>{t("doc.save")}</Button>
  </Stack>
</Watermark>;

<div className="scroll-region" /* 제품 소유 스크롤 조상 */>
  <Affix offset={8 /* spacing.xs */} onChange={setPinned}>
    <Button loading={saving} onClick={save}>{t("doc.saveChanges")}</Button>
  </Affix>
  {longContent}
</div>;
```

```tsx
// Native
// 없음. 세 컴포넌트 모두 Native 구현이 없다.
```

스토리의 초기 색 `#b94627cc`와 프리셋 세 색은 예시 데이터다. 프리셋은 제품 소유이며 브랜드 색을 넣더라도 사용자 데이터 값으로만 다룬다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `ColorPicker` | `/color-picker` | 없음 |
| `Watermark` | `/watermark` | 없음 |
| `Affix` | `/affix`(root entry에 없음) | 없음. 하단 고정은 [BottomCTA](../components/bottom-cta.md) |

## 함정

- 세 컴포넌트 모두 root barrel에 없다. granular subpath(`@hjmds/react/color-picker` 등)로만 import한다.
- Affix `offset`이 음수이거나 유한하지 않으면 `TypeError`를 던진다.
- Watermark 범위(`tileWidth` ≥ 80, `tileHeight` ≥ 60, `rotate` -90~90, `opacity` 0~1, 줄 1~3개·각 120자 이하)를 벗어나면 `TypeError`다.
- 현재 스토리의 저장은 라벨만 "저장됨"으로 바꾸는 토글이다. 진행 중·실패 경로가 없다.
