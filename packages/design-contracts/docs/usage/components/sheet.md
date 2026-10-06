# Sheet

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Sheet 입력 화면과 가용 영역](../../sheet.md), [optional adapters](../../optional-adapters.md)(Native 제스처 확장), `src/component-recipes.ts`(`sheetRecipe`), `src/sheet.ts`(`sheetBehaviorDefaults`)
- 스토리북: `배포/컴포넌트/오버레이/시트`

## 언제 쓰나

현재 화면 위에 모달로 띄우는 보조 작업 패널에 쓴다. 설정 한 항목 편집, 선택 목록(테마·언어),
짧은 입력 폼, 공유·사진 출처 선택처럼 끝나면 원래 화면으로 돌아오는 작업이다. 기본은 하단에서 올라온다.

2026-09-23 소비 감사에서 제품마다 Sheet를 직접 조립하며 제목 정렬, 키보드 높이, top inset, 본문 maxHeight를
따로 보정하고 있었다. 이 보정은 Sheet가 소유한다. 제품 wrapper에서 Modal·키보드 listener·강제 maxHeight를
다시 만들지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 짧은 확인·되돌리기 어려운 결정 | [AlertDialog](alert-dialog.md) |
| 화면 중앙의 집중 작업 | [Dialog](dialog.md) |
| Web 가장자리 서랍, 비모달 보조 패널 | [SidePanel](side-panel.md) |
| 트리거 옆에 붙는 작은 내용 | [Popover](popover.md) |
| 행동 목록 | [Menu](menu.md) |
| 폼 한 칸의 선택 | [Select](select.md)(Native는 자체 sheet를 연다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Sheet` | 기본(모달) | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` |
| `GestureSheet` | 확장(optional: 끌어서 snap·닫기) | — | `/sheet-gesture` |
| `GestureSheetProvider` | 동반(optional: GestureSheet host) | — | `/sheet-gesture` |
| `GestureSheetInput` | 동반(GestureSheet 안 입력, 계약은 [Field](field.md)) | — | `/sheet-gesture` |

`/sheet-gesture`는 granular subpath로만 가져오며 optional peer `@gorhom/bottom-sheet` 5.2.14,
`react-native-reanimated` 4.x, `react-native-gesture-handler` 2.32.0이 필요하다. 없으면 기기 Metro 번들에서 죽는다.
기본 `Sheet`는 추가 peer가 없다.

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Sheet } from "@hjmds/react/overlays";

<Sheet open={open} onOpenChange={(next) => setOpen(next)}
  title={t("profile.edit.title")} closeLabel={t("common.close")}
  footer={<Button onClick={save} loading={saving}>{t("common.save")}</Button>}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
</Sheet>
```

```tsx
// Native — 입력 폼은 keyboardAvoidance + scrollable
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Sheet } from "@hjmds/react-native/overlays";

<Sheet open={open} onOpenChange={(next) => setOpen(next)}
  title={t("profile.edit.title")} closeLabel={t("common.close")}
  keyboardAvoidance scrollable busy={saving}
  footer={<Button onPress={save} loading={saving}>{t("common.save")}</Button>}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
</Sheet>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `placement` | `bottom` · `start` · `end` | `bottom` | 나오는 가장자리 |
| `size` | `auto` · `medium`(60%) · `large`(85%) · `full`(100%) | `auto` | `auto`는 내용 높이. 비율은 화면 높이 기준(Web `dvh`), 두 플랫폼 모두 위 safe area(Native는 키보드도)를 뺀 남은 높이를 넘지 않는다. `maxHeightRatio` 0.9 상한은 `auto`에만 걸린다 |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | Web은 제어하면 `onOpenChange` 필수, 비제어면 `trigger` 필수 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | reason: `trigger` · `close-action` · `escape` · `back` · `outside` · `swipe` · `programmatic`. Android 하드웨어 back은 Native에서만 `back` |
| `onDismissComplete` | `(detail: { reason }) => void` | — | 표면이 실제로 사라진 뒤 한 번. 다음 modal·화면 이동은 여기서 |
| `dismissPolicy` | `{ dismissible?, dismissWhileBusy?, outsideDismiss?, escapeOrBackDismiss?, swipeDismiss? }` | `dismissible` true · `dismissWhileBusy` false · `outsideDismiss` true · `escapeOrBackDismiss` true · `swipeDismiss` false | 닫기 허용 범위 |
| `busy` | `boolean` | `false` | 사용자 닫기를 막는다 |
| `title` · `closeLabel` | 문구 | 필수 | Native `title`이 element면 `accessibilityTitle`(string) 필수 |
| `description` · `footer` | 노드(Native `description`은 `string`) | — | `footer`는 스크롤 밖 고정. 저장 행동은 여기 |
| `detents`(Web) · `activeDetent` · `onDetentChange` | `readonly ("medium" \| "large" \| "full")[]` · `(detent) => void` | — | 사용자가 높이를 바꿀 단계. `detentLabels: { expand, collapse }` 필수 |
| `keyboardAvoidance` · `scrollable`(Native) | `boolean` | `false` | 입력 폼은 둘 다 켠다 |
| `safeAreaInsets`(Native) | `Partial<Insets>` | provider inset | — |
| `contentStyle`(Native) | 배치 key만 | — | 배치 밖 key(색·높이 등)는 deprecated(개발 모드 경고), 다음 major에서 배치 전용 타입으로 좁힌다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 하단 시트 높이: `auto` 내용 높이(최대 화면 높이 × `maxHeightRatio` 0.9), `medium` 60%, `large` 85%, `full` 위 safe area 안 전체 높이(0.9 상한 없음). Web 하단 시트 최대 폭 640. 위 두 모서리만 `radius.xl` 24. 옆 시트(`start`·`end`): Web 폭 `min(28rem, 100%)`·높이 화면 − 32, Native 폭 88%(최대 420)·화면 높이 | `sheetRecipe.sizes`·`content`·`web`, `.hjm-sheet`, Native `Sheet` |
| 간격 | 두 플랫폼 같은 값: 좌우 `content.paddingHorizontal`(`spacing.lg` 20), 위·아래 `content.paddingTop/Bottom`(`spacing.sm` 12, 하단 시트는 아래 safe area를 더함), 머리·본문·footer 사이 `body.gap`(`spacing.md` 16), footer 위 `footer.paddingTop`(`spacing.sm` 12), 제목–닫기 `header.gap`(`spacing.sm` 12), footer 버튼 사이 `footer.gap`(`spacing.sm` 12) | `.hjm-sheet__*`, `sheetRecipe.content`·`body`·`footer` |
| 순서·정렬 | 머리(제목·설명 + 닫기) → 본문 → `footer`. 머리 최소 높이 44(`control.minTouchTarget`), 닫기는 끝 쪽에서 제목 세로 중앙. Web footer는 오른쪽 정렬 가로 줄 [보조][주]. Native footer는 세로 열이라 꽉 찬 폭 버튼을 주 행동 먼저 둔다. Web에서 `detents`를 주면 위 가운데 36×4 손잡이 버튼(터치 최소 폭 44 · 높이 `spacing.lg` 20). Native 기본 Sheet는 손잡이가 없다 | `sheetRecipe.header`·`handle`, `.hjm-sheet__footer`, `.hjm-sheet__handle` |
| 고정·스크롤 | 본문만 스크롤, 머리·`footer` 고정(Native는 `scrollable`일 때 ScrollView). 고정 높이(`medium`·`large`·`full`, 옆 시트)에서는 본문이 머리·footer를 뺀 남은 높이를 차지하고 `footer`는 시트 아래에 붙는다. 그래서 본문의 `flex: 1` 자식(SearchScreen, 목록 화면)이 그 높이를 채운다(Web `.hjm-sheet__body` `flex: 1 1 auto`, Native 본문 `flexGrow: 1`·`minHeight: 0`, 미게시(1.13.1 이후)). `auto`는 내용 높이 그대로다. 저장·확인은 `footer`에. 아래 안전 영역은 시트가 자기 여백에 더한다(`spacing.sm` 12 + 아래 inset, Web은 `env(safe-area-inset-bottom)`). 위 inset은 시트가 올라갈 높이를 줄인다. 제품이 inset을 다시 더하지 않는다 | `.hjm-sheet__body`, `sheetRecipe.safeArea`, Native `Sheet` |
| 좁은 폭·큰 글자 | 폭 < 640이면 하단 시트가 화면 폭을 채운다. Web footer는 줄을 바꾼다. 큰 글자로 내용이 길어지면 `auto`는 최대 90%에서 멈추고 본문이 스크롤된다(`full`은 위 safe area까지) | `.hjm-sheet[data-placement="bottom"]`, `maxHeightRatio` |

```text
폭 < 640(모바일)                        Web 넓은 폭: 가운데, 최대 640
┌──────────────────────────────┐       ┌────────────────────────────────────┐
│   (뒤 화면 + scrim, 누르면 닫힘)│       │        (scrim)                     │
│ ╭──────────────────────────╮ │       │      ╭────────────────────╮        │
│ │   ▬▬ (Web detents일 때)   │ │       │      │ 제목           [×] │        │
│ │ 제목·설명            [×] │ │ ← 고정 │      │ 본문(스크롤)        │        │
│ │──────────────────────────│ │       │      │      [취소] [저장] │        │
│ │ 본문 ↕ 스크롤             │ │       └──────┴────────────────────┴────────┘
│ │──────────────────────────│ │
│ │ footer: Web [취소][저장]  │ │ ← 고정
│ │ Native [   저장   ]       │ │
│ │        [   취소   ]       │ │
│ │ ░ 안전 영역(inset 더함) ░ │ │
└─┴──────────────────────────┴─┘
```

## 꼭 지킬 것

- 입력 폼 Native Sheet는 `keyboardAvoidance`와 `scrollable`을 함께 켜고, 제품의 키보드 listener·maxHeight·
  중첩 ScrollView를 지운다. 본문이 FlatList 등 가상화 목록이면 `scrollable={false}`로 둔다.
- 저장 버튼은 `footer`에 둔다. 저장 중에는 `busy`로 닫기를 막는다.
- 닫힌 뒤 다른 modal을 열거나 화면 이동은 `onDismissComplete`에서 한다. 두 modal을 동시에 띄우지 않는다.
- 문구(`title`, `closeLabel`, 본문)는 i18n 키로 넣는다. 제목 정렬을 위해 `as unknown as string` 캐스트나
  `.hjm-sheet__header` CSS 덮어쓰기를 하지 않는다.
- Native `contentStyle`은 배치 key만 쓴다. 높이는 `size`로 정한다(`contentStyle={{ height }}` 금지, 배치 밖 key는 deprecated).
- Web Sheet는 `layoutStyle`을 받지 않는다(Web `layoutStyle` 제외 15개 중 하나). 표면 위치·크기는 `placement`·`size`가 정한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| uncontrolled 트리거 | `trigger`(uncontrolled면 필수) | 없음 |
| 사용자 높이 조절 | `detents`·`activeDetent`·`onDetentChange`·`detentLabels` | 없음(GestureSheet `snapPoints`) |
| 키보드·스크롤 | CSS scroll body | `keyboardAvoidance`, `scrollable` |
| 고정 높이 본문 채우기 | 항상 `flex: 1 1 auto` | `size`가 `auto`가 아니거나 옆 시트일 때 `flexGrow: 1`(1.13.1부터). `scrollable`이면 ScrollView 자체만 늘고 그 안 내용은 내용 높이다 |
| 초점 | `initialFocusRef`, `returnFocusRef`, focus trap | `returnFocusRef` |
| 겹침 순서 | `modalPriority`, `portalContainer` | RN `Modal` props(`testID` 등) |
| `title` 타입 | `ReactNode` | `string` 또는 element + `accessibilityTitle` |

### GestureSheet(Native optional)

- controlled `open`/`onOpenChange(open)`만 있다. `title`·`closeLabel`·`children` 필수, `snapPoints` 기본 `["50%", "90%"]`,
  `initialIndex` 기본 `0`, `busy`면 끌어 닫기·backdrop 닫기를 막는다. 닫기 버튼이 본문 끝에 자동으로 들어간다.
- 화면을 `GestureHandlerRootView` 안의 `GestureSheetProvider`로 감싼다. 입력은 `GestureSheetInput`을 쓴다.
- RN `Modal` 안에 GestureSheet를 두면 Android back이 `onRequestClose`로만 간다. 그 host는
  `dismissTopGestureSheet()`를 먼저 부르고 `false`일 때만 자기 자신을 닫는다.
- 동적 높이·footer·dismissPolicy·reason은 없다. 이것들이 필요하면 기본 Sheet를 쓴다.

## 함정

- 미게시(1.12.1 이후) 변경: 1.12.1까지 `size="full"`(Web `detents`의 `full` 포함)은 0.9 상한에 걸려 90%에서 멈췄다. 1.12.1을 쓰는 앱에서 화면 전체가 필요하면 화면 전환을 쓴다.
- 1.13.0 이하 Native 고정 높이 Sheet는 본문이 내용 높이라서 `flex: 1` 자식이 0pt가 됐다. 시트 안 SearchScreen이 검색 입력만 그리고
  필터 줄·목록이 사라졌다(2026-10-06 utilverse 채팅 도구 선택, iPhone 17 Pro · iOS 26.5). 제품은 창 높이 `flexBasis`로 우회했다.
  1.13.1부터는 그 우회 없이 채워진다. 1.13.0 이하에서도 footer는 본문 바로 아래에 있었고, 1.13.1부터 고정 높이 시트에서는 시트 아래에 붙는다.
- `scrollable` 본문 안에서는 자식이 `flex: 1`로 높이를 채울 수 없다(ScrollView 내용은 내용 높이다). 자기 스크롤을 가진 화면(SearchScreen 등)은
  `scrollable` 없이 넣는다.
