# 선택 후 적용·취소

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [제품 상호작용 품질](../../../../../docs/INTERACTION_QUALITY.md), [Sheet 계약](../../sheet.md), `src/component-recipes.ts`(`sheetRecipe`), `showcase/web/src/patterns/interaction-flow-previews.tsx`, `showcase/native/src/interaction-flow-previews.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/상호작용 예제/선택 후 적용·취소`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/선택과 필터/선택 후 적용·취소`

## 언제 쓰나

표시 방식·정렬·필터처럼 시트에서 여러 번 바꿔 본 뒤 적용을 눌러야 화면에 반영되고, 취소하거나 닫으면 기존 선택을 유지해야 할 때 쓴다.

누르는 즉시 반영해도 되는 단일 설정은 시트 없이 [SegmentedControl](../components/segmented-control.md)·[ToggleGroup](../components/toggle-group.md)을 쓴다.

같은 `상호작용 예제` 묶음: [닫았다 열고 초안 이어쓰기](interaction-flow-draft.md) · [늦은 응답보다 최신 검색 유지](interaction-flow-search.md) ·
[대표 항목과 묶음 전체 선택](selection-scope.md). 시트를 쓰는 두 예제의 공통 규칙은 이 문서의 [공통: 시트 흐름](#공통-시트-흐름)에,
상태 문구 알림은 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)에 있다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Container`·`Stack` | 바깥 틀. 구획 사이 `gap="xl"`, 묶음 안 `gap="md"` | [Container](../components/container.md), [Stack](../components/stack.md) |
| `Heading` | 묶음 제목 | [Heading](../components/heading.md) |
| `Text` 상태 | 현재 적용된 값 `t("display.current", { value })` | [Text](../components/text.md) |
| `Button` 트리거 | 시트를 연다. 열 때 임시 선택을 적용 값으로 초기화. 화면의 primary 하나 | [Button](../components/button.md) |
| `Sheet` | 선택 영역. `title`·`closeLabel` 필수, `returnFocusRef`로 트리거에 포커스 복귀 | [Sheet](../components/sheet.md) |
| `Button selected`(secondary) × N | 선택지. 임시 선택(draft)만 바꾼다 | [Button](../components/button.md) |
| `Button` 적용 / `Button` 취소(secondary) | 시트 `footer`. 적용만 확정 값을 바꾼다 | [Button](../components/button.md) |

## 배치

```text
┌ 화면 ────────────────────────────────┐
│ ░ 상단 안전 영역(화면 셸) ░          │
│ Native ScrollView 위아래 16          │
│ └ Container gutter 16/20             │
│   Heading 제목                       │
│   현재 표시: 간결하게   (status)     │  Stack gap spacing.md 16
│   [ 표시 방식 선택 ]  ← 트리거(primary)│
└──────────────────────────────────────┘
         ▼ 열림(하단 시트, 모달)
┌ Sheet ───────────────────────────────┐
│ 표시 방식 선택                   [×] │ ← header 고정, 닫기 = 취소와 같음
├──────────────────────────────────────┤
│ [ 간결하게   ✓ ]  (selected)         │ ↑ body 스크롤
│ [ 자세하게     ]                     │ │ 선택지 간격 spacing.md 16
│ [ 크게 보기    ]                     │ │
│ 안내: 적용해야 바뀐다                │ ↓
├──────────────────────────────────────┤
│ Web:    [선택 취소] [선택 적용]       │ ← footer 고정, 오른쪽 정렬, gap 12
│ Native: [ 선택 적용 ] / [ 선택 취소 ] │ ← 세로, 주 행동 먼저
│ ░░ 하단 안전 영역(시트가 더함) ░░    │
└──────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Native: `ScrollView` → `Container` → `Stack gap="xl"`. Web: `Container` → `Stack gap="xl"` | 화면 본문. 안전 영역은 화면 셸(제품 navigator)이, 시트의 아래 안전 영역은 Sheet가 더한다. 화면에 입력이 없어 키보드 처리는 없다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 구획 사이 `layout.sectionGap` 24 |
| 제목 | `Heading level="level3"` | 묶음 맨 위 | 24/32(`heading.level3`), 묶음 안 간격 `layout.contentGap` 16(`Stack gap="md"`) |
| 현재 값 | `Text` | 제목 아래, 트리거 위 | `spacing.md` 16 |
| 트리거 | `Button`(primary) | 현재 값 아래 | `medium` 44(`control.buttonHeight`) |
| 시트 머리 | `Sheet` header | 시트 위 고정 | Native 최소 높이 `control.minTouchTarget` 44, 제목–닫기 `spacing.sm` 12; Web 여백 `spacing.lg` 20, 제목–닫기 `spacing.md` 16 |
| 선택지 | `Button selected` × N | 시트 body, 스크롤 | 높이 44, 간격 `spacing.md` 16. 두 플랫폼 본문이 `sheetRecipe.body.gap`으로 준다(Web은 미게시(1.12.1 이후). 1.12.1 Web 본문은 gap이 없어 `Stack gap="md"`로 감싼다) |
| 행동 | `Button` 적용·취소 | 시트 footer, 스크롤 밖 고정 | 간격 `spacing.sm` 12(`sheetRecipe.footer.gap`), Native 위 여백 `spacing.sm` 12 |
| 시트 틀 | `Sheet` | 하단, 모달 | Web 최대 폭 640(`sheetRecipe.web.maxWidth`)·최대 높이 90%, Native 가로 여백 `spacing.lg` 20·최대 높이 90%(`maxHeightRatio` 0.9), 하단 안전 영역 추가 |

- footer 순서는 [Sheet](../components/sheet.md) 배치 규칙을 따른다. Web footer는 오른쪽 정렬 가로 줄 **[취소][적용]**(보조 → 주 행동), Native footer는 세로 열이라
  **적용(primary) 먼저, 취소(secondary) 아래**다. 두 renderer의 footer가 이미 `gap` 12를 주므로 버튼을 `Stack`으로 다시 감싸지 않는다.
- primary 개수: 화면에서는 트리거 하나, 시트 안에서는 적용 하나를 센다. 선택지는 `selected`를 준 secondary라 세지 않는다([Button](../components/button.md) 꼭 지킬 것).
- 선택지가 단일 선택이면 Button 묶음 대신 [RadioGroup](../components/radio-group.md)도 쓸 수 있다. 의미(임시 선택 → 적용)는 같다.

근거: `src/component-recipes.ts`(`sheetRecipe`), `packages/react/src/styles.css`(`.hjm-sheet__footer`, `.hjm-sheet__body`), `packages/react-native/src/overlays.tsx`(Sheet footer `View`), `src/foundations.ts`(`layout`, `heading`)

## 흐름과 상태

1. 트리거를 누르면 임시 선택을 현재 적용 값으로 초기화하고 시트를 연다.
2. 선택지를 누르면 임시 선택만 바뀐다(`selected` 표시). 화면 본문의 현재 값은 그대로다.
3. 적용을 누르면 확정 값을 임시 선택으로 바꾸고 시트를 닫는다.
4. 취소·닫기(×)·바깥 누름·Escape·Android back은 확정 값을 바꾸지 않고 닫는다.
5. 닫히면 포커스가 트리거로 돌아온다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 시트 닫힘, 현재 값 + 트리거 | — |
| 열림 | 임시 선택이 표시된 선택지, footer 두 버튼 | 시트로 포커스 이동(Web focus trap) |
| 진행 중 | 이 예제는 로컬 상태만 바꿔 진행 중이 없다. 적용을 서버에 저장하면 적용 버튼 `loading`, Sheet `busy`로 닫기를 막는다 | 시트 안 포커스 유지 |
| 실패 | 서버 저장이 실패하면(네트워크·서버 오류) 시트를 열어 둔 채 임시 선택을 유지하고 body 아래에 실패 문구(`display.applyFailed`)를 보인다. 다시 적용을 누르면 재요청하고, 재요청도 실패하면 같은 문구를 다시 알린다. 확정 값은 성공 전까지 바꾸지 않는다 | 실패 문구 알림(Web `role="status"`, Native live region) |
| 적용 | 시트 닫힘, 현재 값 갱신 | 트리거로 복귀, 현재 값 문구 알림 |
| 취소·닫기 | 시트 닫힘, 현재 값 유지 | 트리거로 복귀 |

선택지 id→문구 키는 상수 표로 둔다(`displayKey`). `` t(`display.${id}`) ``처럼 템플릿 문자열로 만들면 키 추출·누락 검사가 찾지 못한다.
서버 저장이 붙는 흐름은 [저장과 재시도](action-recovery-save.md)의 세션을 적용 버튼에 연결한다.

## 코드 골격

```tsx
// Web
import { useRef, useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { Sheet } from "@hjmds/react/overlays";

const displayKey = { compact: "display.compact", detailed: "display.detailed", large: "display.large" } as const;
type DisplayId = keyof typeof displayKey;
const options = Object.keys(displayKey) as DisplayId[];

const [open, setOpen] = useState(false);
const [applied, setApplied] = useState<DisplayId>("compact");
const [draft, setDraft] = useState<DisplayId>(applied);
const trigger = useRef<HTMLButtonElement>(null);

<Container gutter={gutter}>
  <Stack gap="xl">
    <Stack gap="md">
      <Heading level="level3" semanticLevel={2}>{t("display.title")}</Heading>
      <Text role="status">{t("display.current", { value: t(displayKey[applied]) })}</Text>
      <Button ref={trigger} onClick={() => { setDraft(applied); setOpen(true); }}>{t("display.choose")}</Button>
    </Stack>
  </Stack>
  <Sheet open={open} onOpenChange={setOpen} title={t("display.choose")} closeLabel={t("common.close")} returnFocusRef={trigger}
    footer={<>
      <Button tone="secondary" onClick={() => setOpen(false)}>{t("display.cancel")}</Button>
      <Button onClick={() => { setApplied(draft); setOpen(false); }}>{t("display.apply")}</Button>
    </>}>
    <Stack gap="md">{/* Web 시트 body에는 gap이 없다 */}
      {options.map((id) => (
        <Button key={id} tone="secondary" selected={draft === id} onClick={() => setDraft(id)}>{t(displayKey[id])}</Button>
      ))}
      <Text>{t("display.applyHint")}</Text>
    </Stack>
  </Sheet>
</Container>
```

```tsx
// Native
import { useRef, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { Sheet } from "@hjmds/react-native/overlays";
import { Container, Stack } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";
const trigger = useRef<View>(null);

<ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container gutter={gutter}>
    <Stack gap="xl">
      <Stack gap="md">
        <Heading level="level3" semanticLevel={2}>{t("display.title")}</Heading>
        <StatusText>{t("display.current", { value: t(displayKey[applied]) })}</StatusText>
        <View ref={trigger} collapsable={false}>
          <Button onPress={() => { setDraft(applied); setOpen(true); }}>{t("display.choose")}</Button>
        </View>
      </Stack>
    </Stack>
  </Container>
</ScrollView>
<Sheet open={open} onOpenChange={setOpen} title={t("display.choose")} closeLabel={t("common.close")} returnFocusRef={trigger}
  footer={<>
    <Button onPress={() => { setApplied(draft); setOpen(false); }}>{t("display.apply")}</Button>
    <Button tone="secondary" onPress={() => setOpen(false)}>{t("display.cancel")}</Button>
  </>}>
  {options.map((id) => (
    <Button key={id} tone="secondary" selected={draft === id} onPress={() => setDraft(id)}>{t(displayKey[id])}</Button>
  ))}
</Sheet>
```

`options`·`displayKey`·문구는 제품 소유다. `StatusText`는 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 Native 상태 알림 helper다.
Web `gutter`는 [화면 여백과 너비](../tokens/layout.md)처럼 폭 구간으로 고른다.

### 공통: 시트 흐름

[닫았다 열고 초안 이어쓰기](interaction-flow-draft.md)도 이 규칙을 따른다.

- 시트 안에서 바뀌는 값(임시 선택·초안)은 **시트 밖**, 시트를 여는 화면의 state에 둔다.
- 확정은 footer의 주 행동 하나만 한다. 닫기·바깥 누름·back은 확정하지 않는다.
- footer 버튼은 Web [보조][주], Native 주 → 보조 순서로 바로 넘긴다. renderer footer가 간격 12를 준다.
- `returnFocusRef`로 닫힌 뒤 포커스를 트리거에 돌려준다. Native는 Button을 `View ref collapsable={false}`로 감싸 ref를 넘긴다.
- 서버에 저장하는 확정이면 저장 중 Sheet `busy`로 닫기를 막고, 실패하면 시트와 시트 밖 값(임시 선택·초안)을 그대로 둔다.
- 시트가 닫힌 뒤 다른 모달을 열거나 화면을 옮기면 `onDismissComplete`에서 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 트리거 ref | `Button ref` | `View ref collapsable={false}`로 감쌈 |
| 시트 머리 | 여백 `spacing.lg` 20, 제목–닫기 `spacing.md` 16 | 최소 높이 44, 제목–닫기 `spacing.sm` 12 |
| footer | 가로 flex(wrap, 끝 정렬), [취소][적용] | 세로 View, 위 여백 `spacing.sm` 12, [적용] 위 [취소] 아래 |
| 초점 | focus trap + `returnFocusRef` | `returnFocusRef` |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출 |
| 바깥 틀 | `Container` | `ScrollView`(세로 여백) 안 `Container` |

## 함정

- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
