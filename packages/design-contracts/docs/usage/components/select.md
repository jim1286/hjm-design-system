# Select

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [cross-platform core](../../cross-platform-core-normalization.md), [Native legacy 제거](../../migration-native-legacy-removal.md), `src/component-recipes.ts`(`selectRecipe`)
- 스토리북: `배포/컴포넌트/입력/목록에서 선택`, `배포/컴포넌트/입력/단계별 선택`

## 언제 쓰나

폼 한 칸에서 여러 선택지 중 하나를 고르게 할 때 쓴다. 선택지가 많거나(대략 7개 이상),
섹션으로 나뉘거나, 서버에서 비동기로 오거나, 화면에 펼쳐 둘 공간이 없을 때 맞다.
Web은 popover listbox, Native는 modal sheet로 목록을 연다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 2~6개 선택지를 펼쳐서 비교, 항목마다 설명 | [RadioGroup](radio-group.md) |
| 2~4개 짧은 보기 즉시 전환 | [SegmentedControl](segmented-control.md) |
| 입력하며 후보를 거름 | [Combobox](combobox.md) |
| 행동 목록(편집·삭제) | [Menu](menu.md) |
| 여러 개 선택 | [CheckboxGroup](checkbox-group.md), [TransferList](transfer-list.md) |
| Web 폼 제출·자동완성·모바일 브라우저 picker가 중요 | `NativeSelect`(아래) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Select` | 기본(커스텀 listbox / modal sheet) | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` |
| `NativeSelect` | 동반(브라우저 `<select>` 대안) | `@hjmds/react`, `/forms` | — |

## 최소 사용 예

```tsx
// Web
import { Select } from "@hjmds/react/forms";

<Select
  label={t("profile.country.label")}
  placeholder={t("profile.country.placeholder")}
  emptySelectionLabel={t("profile.country.none")}
  items={countries.map((c) => ({ id: c.code, label: t(c.nameKey), textValue: t(c.nameKey) }))}
  selectedKey={country}
  onSelectionChange={setCountry}
/>
```

```tsx
// Native
import { Select } from "@hjmds/react-native/forms";

<Select
  label={t("profile.country.label")}
  placeholder={t("profile.country.placeholder")}
  dismissLabel={t("common.close")}
  items={countries.map((c) => ({ id: c.code, label: t(c.nameKey), textValue: t(c.nameKey) }))}
  selectedKey={country}
  onSelectionChange={setCountry}
/>
```

```tsx
// Web
// 대안 — 브라우저 기본 select
import { NativeSelect } from "@hjmds/react/forms";

<NativeSelect name="country" label={t("profile.country.label")}
  options={[{ value: "kr", label: t("country.kr") }]} value={code} onValueChange={setCode} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` / `sections` | `readonly { id, label: string, textValue: string, description?, disabled? }[]` / 섹션 `{ id, label?, accessibilityLabel?, items }` | — | 항목 필수 필드는 `id`·`label`·`textValue`. Native는 `source`도 가능 |
| `size` | `medium` · `large` | `medium` | 트리거 높이 44 · 52 |
| `density` | `compact` · `comfortable` | `comfortable` | 선택지 행 44 · 56 |
| `selectedKey` · `defaultSelectedKey` | 키 · `null` | 비제어 `null` | 제어하면 Web은 `onSelectionChange` 필수 |
| `onSelectionChange` | `(key: Key \| null) => void` | — | 선택 해제 허용이 기본이라 `null`이 올 수 있다 |
| `onSelectionAfterDismiss`(Native) | `(value: Key) => void \| Promise<void>` | — | sheet가 실제로 닫힌 뒤. 화면 이동·다른 modal은 여기서 |
| `disallowEmptySelection` | `boolean` | `false` | — |
| `asyncState` | `{ status: "idle" }` · `{ status: "loading" \| "loadingMore" \| "empty" \| "error", message: string }` | `{ status: "idle" }` | 비동기 상태를 그린다. 목록이 아직 없는 동안 선택된 항목은 `selectedItem` |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | 제어하면 Web은 `onOpenChange` 필수 |
| `onOpenChange` | `(open: boolean, reason) => void` | — | `reason`: `trigger` · `keyboard` · `selection` · `escape` · `outside` · `blur` · `programmatic` |
| `renderLeading` | `(item \| null, appearance: { color, size }) => ReactNode` | — | 트리거 앞 아이콘(선택 없으면 `item`이 `null`). Web `color`는 `"currentColor"` |
| `renderOptionLeading` | `(item, appearance: { color, size, selected, highlighted, disabled }) => ReactNode` | — | 선택지 앞 아이콘 |
| `busy`, `readOnly`, `required`, `disabled` | `boolean` | `false` | `busy`는 포커스 순서를 유지한 채 조작을 막는다. `disabled`는 라벨과 트리거만 `selectRecipe.states.disabledOpacity`(0.5)로 흐리고 도움말·오류는 그대로 둔다([Field](field.md)). NativeSelect는 Field 기본값 0.6 |
| `label` / `accessibilityLabel` | 문자열 | — | 둘 중 하나 필수 |
| `layoutStyle` | 배치 전용 style 객체 | — | 필드 전체(라벨·트리거·설명) 배치. Web `style`은 트리거 버튼에 붙는다 |
| `options`(NativeSelect) | `readonly { value: string; label: string; disabled? }[]` | 필수 | 브라우저 `<select>` 대안 |
| `onValueChange`(NativeSelect) | `(value: string) => void` | — | 원시 `onChange`도 받는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 트리거 최소 높이 `medium` 44 · `large` 52, 폼 열 폭을 채운다(Web `inline-size: 100%`). 선택지 행 `comfortable` 56 · `compact` 44. Web 목록 최대 폭 420(`min(26.25rem, 100vw − 2×spacing.md)`)·최대 높이 360. Native sheet 최대 높이 75% | `fieldFrameContract.minHeight`, `control.buttonHeight.large`, `selectRecipe.density`·`popover`, `.hjm-select__listbox`, Native `forms.tsx` |
| 간격 | 트리거 좌우 `medium` `spacing.md` 16 · `large` `spacing.lg` 20(recipe), 안쪽 요소 사이 `spacing.sm` 12. 라벨·설명·오류와 `spacing.xs` 8. Web 목록은 트리거에서 8 떨어지고 안쪽 여백 `spacing.xs` 8(`selectRecipe.popover.padding`; 2026-10-06까지 4, 1.12.1 이후 미게시), 화면 가장자리에서 8(`selectRecipe.popover.collisionPadding`). Native sheet 안쪽 `spacing.md` 16, 머리와 목록 사이 `spacing.sm` 12 | `selectRecipe.sizes`·`value.gap`, `formSupportContract.gap`, `selectRecipe.popover`(sideOffset 8, collisionPadding 8, padding 8), Native `forms.tsx` |
| 순서·정렬 | 트리거: 앞 아이콘 → 값(넘치면 말줄임) → 펼침 표시. Web 목록은 트리거 아래·트리거와 같은 폭, 공간이 없으면 위로 뒤집힌다. Native sheet 머리는 제목 + 끝쪽 닫기 ×(44). 확인 버튼은 없고 항목을 누르면 선택하고 닫힌다 | `.hjm-select__trigger`, `select.tsx`(`matchAnchorWidth`), `CollectionSheetHeader` |
| 고정·스크롤 | Web 목록은 `position: fixed` popover(z-index `layer.dropdown` 400), 넘치면 목록 안에서 스크롤. Native는 화면 아래에서 올라오는 modal sheet로 목록만 스크롤되고, 아래 여백에 안전 영역(`safeArea.bottom`)을 더한다. 배경(scrim)을 누르면 닫힌다 | `.hjm-select__listbox`, Native `Select`(Modal·ScrollView) |
| 좁은 폭·큰 글자 | 트리거 높이는 최소값이라 큰 글자에서 늘어나고 값은 한 줄 말줄임이다. Web 목록 폭은 화면 폭 − 32를 넘지 않는다 | `.hjm-select__value`, `.hjm-select__listbox` |

```text
Web popover                         Native sheet
라벨                                 ┌──────── scrim (누르면 닫힘) ────────┐
┌──────────────────────┐            │                                     │
│ 선택된 값          ⌄ │ 44         ├─────────────────────────────────────┤ radius.lg 16
└──────────────────────┘            │ 정렬 기준                       (×) │ ← 머리, × 44
  ↓ 8                               │   gap spacing.sm 12                 │
┌──────────────────────┐            │ ┌─────────────────────────────────┐ │
│ 최신순             ✓ │ 56         │ │ 최신순                        ✓ │ │ 56 ↕ 스크롤
│ 인기순               │            │ │ 인기순                          │ │
└──────────────────────┘ max 360    │ └─────────────────────────────────┘ │
 트리거 폭, max 420                  │ padding 16 + 안전 영역              │ max 75%
                                    └─────────────────────────────────────┘
```

## 꼭 지킬 것

- 모든 문구(`placeholder`, Web `emptySelectionLabel`, Native `dismissLabel`)는 i18n 키로 넣는다. 비면 `TypeError`.
- 항목이 0개인데 `asyncState`가 `idle`이면 오류를 던진다. 로딩·빈 결과는 `asyncState`로 알린다.
  controlled 키가 목록에 없으면(그리고 `selectedItem`도 아니면) Native는 `RangeError`다.
- 옛 Native `options`·`value`·`onValueChange`는 1.11에서 제거됐다. `items`/`selectedKey`/`onSelectionChange`를 쓴다.
- Native 선택 후 화면 이동·다른 modal 열기는 `onSelectionAfterDismiss`에서 한다. sheet가 닫히기 전에
  다음 modal을 띄우지 않는다.
- 배치는 `layoutStyle`로 한다. Web `className`·`style`은 트리거 버튼에 붙는다. Native `style`은 deprecated(개발 모드 경고,
  다음 major 제거)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 목록 표면 | anchored popover(`align`, `portalContainer`) | modal sheet(`dismissLabel` 필수) |
| 컬렉션 입력 | `items` 또는 `sections` | `source`·`items`·`sections` 중 정확히 하나 |
| 선택 해제 항목 문구 | `emptySelectionLabel` 필수 | 없음 |
| 재시도 | 없음 | `onRetry`, `retryLabel` |
| 낭독 보조 | 없음 | `readOnlyLabel`, `openHint`, `optionsAccessibilityLabel` |
| 키보드 | `loop`, typeahead(`locale`) | 해당 없음 |
| `description`·`error` 타입 | `ReactNode` | `string` |
