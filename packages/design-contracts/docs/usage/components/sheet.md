# Sheet

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: [Sheet 입력 화면과 가용 영역](../../sheet.md), [optional adapters](../../optional-adapters.md)(Native 제스처 확장), `src/component-recipes.ts`(`sheetRecipe`), `src/sheet.ts`(`sheetBehaviorDefaults`)
- 스토리북: `배포/컴포넌트/오버레이/시트`

## 언제 쓰나

현재 화면 위에 모달로 띄우는 보조 작업 패널에 쓴다. 설정 한 항목 편집, 선택 목록(테마·언어),
짧은 입력 폼, 공유·사진 출처 선택처럼 끝나면 원래 화면으로 돌아오는 작업이다. 기본은 하단에서 올라온다.

제목은 화면에 그리지 않고 대화상자의 접근성 이름으로만 쓴다(2026-10-17). 키보드 높이, top inset, 본문 maxHeight 보정은 Sheet가 소유한다. 제품 wrapper에서 Modal·키보드 listener·강제 maxHeight를
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
  returnFocusRef={openButtonRef}
  title={t("profile.edit.title")} closeLabel={t("common.close")}
  footer={<Button onClick={save} loading={saving}>{t("common.save")}</Button>}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
</Sheet>
```

Web의 외부 열기 버튼과 `returnFocusRef`에 같은 `useRef<HTMLButtonElement>(null)`을 연결한다.
버튼 클릭 시 초점을 주지 않는 macOS WebKit에서도 닫은 뒤 호출 위치로 돌아오기 위해서다.
`trigger` 슬롯을 쓰면 내부에서 연결한다([Dialog 초점 복귀](dialog.md#최소-사용-예)).

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
| `initialFocus` | `single-input` · `first-input` · `none` | `single-input` | 1.28.1. 열린 뒤(Native: 표시·진입 애니메이션 뒤, Web: 포커스 이동 시점) 포커스할 텍스트 입력. 기본은 텍스트 입력이 **하나뿐일 때만** 그 칸(이름 바꾸기·메모 한 줄), 여럿이면 기존 규칙(Web 첫 포커스 가능 요소, Native 접근성 포커스) 그대로. `first-input`은 `initialFocusTarget` 칸, 없으면 첫 칸. `initialFocusRef`(Web)가 있으면 그쪽이 이긴다. 열 때마다 다시 고른다 |
| `placement` | `bottom` · `start` · `end` | `bottom` | 나오는 가장자리 |
| `size` | `auto` · `medium`(60%) · `large`(85%) · `full`(100%) | `auto` | `auto`는 내용 높이. 비율은 화면 높이 기준(Web `dvh`), 두 플랫폼 모두 위 safe area(Native는 키보드도)를 뺀 남은 높이를 넘지 않는다. `maxHeightRatio` 0.9 상한은 `auto`에만 걸린다 |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | Web은 제어하면 `onOpenChange` 필수, 비제어면 `trigger` 필수 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | reason: `trigger` · `close-action` · `escape` · `back` · `outside` · `swipe` · `programmatic`. Android 하드웨어 back은 Native에서만 `back` |
| `onDismissComplete` | `(detail: { reason }) => void` | — | 표면이 실제로 사라진 뒤 한 번. 다음 modal·화면 이동은 여기서 |
| `dismissPolicy` | `{ dismissible?, dismissWhileBusy?, outsideDismiss?, escapeOrBackDismiss?, swipeDismiss? }` | `dismissible` true · `dismissWhileBusy` false · `outsideDismiss` true(모든 위치, 미게시 변경, 이전 하단 false) · `escapeOrBackDismiss` true · `swipeDismiss` true(미게시 변경, 이전 false) | 닫기 허용 범위. `resolveSheetDismissPolicy(placement, override)` |
| `keyboardAvoidance` (Native) | `boolean` | `true`(미게시 변경, 이전 `false`) | 모달이 키보드 높이만큼 비킨다. 안쪽 `ScreenLayout`은 중복 처리하지 않는다 |
| `showClose` | `boolean` | 하단 `false` · 옆 `true`(미게시) | 머리의 × 표시. 하단 시트는 드래그로 닫는 것이 기본이라 끈다 |
| `busy` | `boolean` | `false` | 사용자 닫기를 막는다 |
| `title` · `closeLabel` | 문구 | 필수 | `title`은 화면에 보이지 않는다. Web은 `aria-labelledby`가 가리키는 시각 숨김 `h2`, Native는 대화상자 `accessibilityLabel`과 배치 밖 1pt 머리글이다(미게시). Native `title`이 element면 `accessibilityTitle`(string) 필수이며 element 자체는 그려지지 않는다. `closeLabel`은 손잡이·×·가림막 닫기의 이름 |
| `description` · `footer` | 노드(Native `description`은 `string`) | — | `footer`는 스크롤 밖 고정. 저장 행동은 여기 |
| `detents`(Web) · `activeDetent` · `onDetentChange` | `readonly ("medium" \| "large" \| "full")[]` · `(detent) => void` | — | 사용자가 높이를 바꿀 단계. `detentLabels: { expand, collapse }` 필수 |
| `keyboardAvoidance` · `scrollable`(Native) | `boolean` | `false` | 입력 폼은 둘 다 켠다 |
| `safeAreaInsets`(Native) | `Partial<Insets>` | provider inset | — |
| `contentStyle`(Native) | 배치 key만 | — | `HjmCompositionStyleProp` 배치 전용 타입. 색·padding·높이 등 시각 key는 받지 않는다 |

### 디자인 프로필 상속

모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.


## 배치

선택형 Native `GestureSheetInput`의 실제 keyboard-tracking host에도 제품 `tokens.fontFamily.ui`가 이어진다. optional library·폰트 설치와 실제 기기 검증은 제품이 맡는다.

선택형 GestureSheetInput은 Provider typography와 field recipe radius 역할을 읽고 textScale을 한 번 적용한다. optional keyboard-tracking host는 그대로다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 하단 시트 높이: `auto` 내용 높이(최대 화면 높이 × `maxHeightRatio` 0.9), `medium` 60%, `large` 85%, `full` 위 safe area 안 전체 높이(0.9 상한 없음). Web 하단 시트 최대 폭 640. 위 두 모서리만 `radius.xl` 24. 옆 시트(`start`·`end`): Web 폭 `min(28rem, 100%)`·높이 화면 − 32, Native 폭 88%(최대 420)·화면 높이 | `sheetRecipe.sizes`·`content`·`web`, `.hjm-sheet`, Native `Sheet` |
| 간격 | 두 플랫폼 같은 값: 좌우 `content.paddingHorizontal`(`spacing.lg` 20), 위·아래 `content.paddingTop/Bottom`(`spacing.sm` 12, 하단 시트는 아래 safe area를 더함), 머리·본문·footer 사이 `body.gap`(`spacing.md` 16), footer 위 `footer.paddingTop`(`spacing.sm` 12), 제목–닫기 `header.gap`(`spacing.sm` 12), footer 버튼 사이 `footer.gap`(`spacing.sm` 12) | `.hjm-sheet__*`, `sheetRecipe.content`·`body`·`footer` |
| 순서·정렬 | 손잡이(하단) → 머리(설명 + 닫기, 둘 다 없으면 그리지 않음) → 본문 → `footer`. 보이는 제목 줄은 없다(미게시). 머리 최소 높이 44(`control.minTouchTarget`), ×는 설명이 없어도 끝 쪽 같은 자리다. 기본 하단 시트는 머리가 없어 본문이 손잡이 영역 바로 아래 `body.gap` 16에서 시작한다. Web footer는 오른쪽 정렬 가로 줄 [보조][주]. Native footer는 세로 열이라 꽉 찬 폭 버튼을 주 행동 먼저 둔다. 하단 시트는 항상 위 가운데 36×4 손잡이(터치 최소 폭 44)를 둔다. `detents`가 있으면 높이 전환 버튼, 없으면 `closeLabel` 이름의 닫기 버튼이다. 손잡이·머리 영역을 아래로 끌어 `sheetDragRecipe.dismissDistanceRatio`(시트 높이의 25%) 또는 `dismissVelocity` 0.5px/ms를 넘기면 `swipe`로 닫고, 아니면 제자리로 돌아간다(미게시, Web·Native 동일) | `sheetRecipe.header`·`handle`, `.hjm-sheet__footer`, `.hjm-sheet__handle` |
| 고정·스크롤 | 본문만 스크롤, 머리·`footer` 고정(Native는 `scrollable`일 때 ScrollView). 스크롤 영역은 시트 좌우 여백(`sheetRecipe.content.paddingHorizontal` 20) 끝까지 넓고 여백은 스크롤 내용 안쪽에 둔다(Web `.hjm-sheet__body` padding, Native ScrollView `marginHorizontal: -20` + 내용 `paddingHorizontal: 20`). 그래서 본문 ListRow의 8 표면이 잘리지 않고 내용 위치는 그대로다. 고정 높이(`medium`·`large`·`full`, 옆 시트)에서는 본문이 머리·footer를 뺀 남은 높이를 차지하고 `footer`는 시트 아래에 붙는다. 그래서 본문의 `flex: 1` 자식(SearchScreen, 목록 화면)이 그 높이를 채운다(Web `.hjm-sheet__body` `flex: 1 1 auto`, Native 본문 `flexGrow: 1`·`minHeight: 0`, 1.13.1 변경). `auto`는 내용 높이 그대로다. 저장·확인은 `footer`에. 아래 안전 영역은 시트가 자기 여백에 더한다(`spacing.sm` 12 + 아래 inset, Web은 `env(safe-area-inset-bottom)`). 위 inset은 시트가 올라갈 높이를 줄인다. 제품이 inset을 다시 더하지 않는다 | `.hjm-sheet__body`, `sheetRecipe.safeArea`, Native `Sheet` |
| 좁은 폭·큰 글자 | 폭 < 640이면 하단 시트가 화면 폭을 채운다. Web footer는 줄을 바꾼다. 큰 글자로 내용이 길어지면 `auto`는 최대 90%에서 멈추고 본문이 스크롤된다(`full`은 위 safe area까지) | `.hjm-sheet[data-placement="bottom"]`, `maxHeightRatio` |

```text
폭 < 640(모바일)                        Web 넓은 폭: 가운데, 최대 640
┌──────────────────────────────┐       ┌────────────────────────────────────┐
│ (뒤 화면 + scrim, 누르면 닫힘) │       │   (scrim, 누르면 닫힘)             │
│ ╭──────────────────────────╮ │       │      ╭────────────────────╮        │
│ │          ▬▬ 손잡이        │ │       │      │      ▬▬ 손잡이      │        │
│ │ (설명)  (showClose일 때 ×)│ │ ← 고정 │      │ 본문(스크롤)        │        │
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

- 하단 시트는 드래그로 내려 닫을 수 있어야 한다(필수). 시트 밖(가림막)을 누르거나 클릭해도 닫힌다(모든 위치, 미게시). ×는 하단 시트에서 기본으로 끈다. 드래그를 쓸 수 없는 사용자를 위해 손잡이 닫기 버튼, 가림막 닫기(Native는 `closeLabel` 이름의 버튼), Escape·Android back, VoiceOver 닫기 제스처는 유지한다. Web은 누름이 가림막에서 시작할 때만 닫아 시트 안에서 시작한 드래그 선택은 닫지 않는다. `outsideDismiss: false`·`swipeDismiss: false`는 결제 확인처럼 실수로 닫히면 안 되는 흐름에만 쓰고 이유를 제품 코드에 남긴다.
- 저장하지 않은 입력을 버릴지 묻는 흐름은 제어형 `onOpenChange`에서 처리한다. 가림막(`outside`)·드래그(`swipe`)·Escape·back·손잡이 모두 같은 경로로 들어오므로 확인을 건너뛰지 않는다. 저장 중 `busy`는 모든 사용자 닫기를 막는다.

- 입력 폼 Native Sheet는 `keyboardAvoidance`와 `scrollable`을 함께 켜고, 제품의 키보드 listener·maxHeight·
  중첩 ScrollView를 지운다. 본문이 FlatList 등 가상화 목록이면 `scrollable={false}`로 둔다.
- 저장 버튼은 `footer`에 둔다. 저장 중에는 `busy`로 닫기를 막는다.
- 닫힌 뒤 다른 modal을 열거나 화면 이동은 `onDismissComplete`에서 한다. 두 modal을 동시에 띄우지 않는다.
- 문구(`title`, `closeLabel`, 본문)는 i18n 키로 넣는다. 보이지 않는 `title`도 스크린 리더가 읽으므로 번역한다. `as unknown as string` 캐스트나
  `.hjm-sheet__header` CSS 덮어쓰기를 하지 않는다.
- Native `contentStyle`은 배치 key만 쓴다. 높이는 `size`로 정한다(`contentStyle={{ height }}` 금지, 배치 밖 key는 지원하지 않음).
- Web Sheet는 `layoutStyle`을 받지 않는다(Web `layoutStyle` 제외 15개 중 하나). 표면 위치·크기는 `placement`·`size`가 정한다.

## 플랫폼 차이

Flutter 제품은 `showModalBottomSheet` 대신 `showHjmBottomSheet`(`hjm_flutter`)로 연다. 같은 기본값(드래그 닫기·손잡이 표시·배경 탭 닫기 끔·× 없음)을 적용하고 본문은 `HjmSheetLayout`을 쓴다(미게시). 2026-10-17의 제목 숨김·가림막 닫기 결정은 아직 Flutter에 반영하지 않았다.

| 항목 | Web | Native |
| --- | --- | --- |
| uncontrolled 트리거 | `trigger`(uncontrolled면 필수) | 없음 |
| 사용자 높이 조절 | `detents`·`activeDetent`·`onDetentChange`·`detentLabels` | 없음(GestureSheet `snapPoints`) |
| 키보드·스크롤 | CSS scroll body | `keyboardAvoidance`, `scrollable` |
| 고정 높이 본문 채우기 | 항상 `flex: 1 1 auto` | `size`가 `auto`가 아니거나 옆 시트일 때 `flexGrow: 1`(1.13.1부터). `scrollable`이면 ScrollView 자체만 늘고 그 안 내용은 내용 높이다 |
| 초점 | `initialFocusRef`, `returnFocusRef`, focus trap | `returnFocusRef` |
| 겹침 순서 | `modalPriority`, `portalContainer` | RN `Modal` props(`testID` 등) |
| `title` 타입(보이지 않음) | `ReactNode`(시각 숨김 `h2` 안) | `string` 또는 element + `accessibilityTitle`(element는 그리지 않음) |

### GestureSheet(Native optional)

- controlled `open`/`onOpenChange(open)`만 있다. `title`·`closeLabel`·`children` 필수, `snapPoints` 기본 `["50%", "90%"]`,
  `initialIndex` 기본 `0`, backdrop을 누르면 닫히고 `busy`면 끌어 닫기·backdrop 닫기를 막는다. `title`은 보이지 않는 머리글·접근성 이름이다(미게시). 닫기 버튼이 본문 끝에 자동으로 들어간다.
- 화면을 `GestureHandlerRootView` 안의 `GestureSheetProvider`로 감싼다. 입력은 `GestureSheetInput`을 쓴다.
- RN `Modal` 안에 GestureSheet를 두면 Android back이 `onRequestClose`로만 간다. 그 host는
  `dismissTopGestureSheet()`를 먼저 부르고 `false`일 때만 자기 자신을 닫는다.
- 동적 높이·footer·dismissPolicy·reason은 없다. 이것들이 필요하면 기본 Sheet를 쓴다.

## 함정

- `size="full"`(Web `detents`의 `full` 포함)은 위 안전 영역을 뺀 전체 높이를 사용한다. 0.9 상한은 `auto`에만 적용된다(1.13.0 변경).
- 1.13.0 이하 Native 고정 높이 Sheet는 본문이 내용 높이라서 `flex: 1` 자식이 0pt가 됐다. 시트 안 SearchScreen이 검색 입력만 그리고
  필터 줄·목록이 사라졌다. 제품은 창 높이 `flexBasis`로 우회했다.
  1.13.1부터는 그 우회 없이 채워진다. 1.13.0 이하에서도 footer는 본문 바로 아래에 있었고, 1.13.1부터 고정 높이 시트에서는 시트 아래에 붙는다.
- `scrollable` 본문 안에서는 자식이 `flex: 1`로 높이를 채울 수 없다(ScrollView 내용은 내용 높이다). 자기 스크롤을 가진 화면(SearchScreen 등)은
  `scrollable` 없이 넣는다.

## 근거

- 시트에 보이는 제목 없음: 2026-10-17 사용자 결정 — 시트 위쪽 제목 줄(예: SearchScreen 필터 시트의 "필터")을 모든 시트에서 없앤다. `title`은 대화상자 접근성 이름으로 남는다. Native Select·Combobox 선택 시트와 GestureSheet도 같다. 같은 작업에서 머리가 손잡이 영역(`.hjm-sheet__drag`, 2026-10-16) 안으로 들어가 `.hjm-sheet > .hjm-sheet__header` 선택자가 맞지 않아 Dialog 위 여백 20이 섞이던 Web 결함을 고쳤다.
- 가림막 누르면 닫힘: 2026-10-17 사용자 결정 — 하단 시트도 시트 밖을 누르면 닫힌다(2026-10-16의 드래그 전용 기본을 대체). 닫기 경로는 손잡이·드래그와 같은 `requestClose`라 `busy`·`dismissPolicy`·제어형 owner의 확인을 그대로 따른다.
- 스크롤 영역을 시트 여백 끝까지: 2026-10-17 1.27.2 채택 점검. utilverse 테마·언어 시트(Native `scrollable`)에서 여백 20이 ScrollView 바깥에 있어 ListRow 선택 표면의 양옆이 잘렸다(3x 측정: 선택 테두리 옆 선 없음, 위 선 21–381pt). Web은 본문 스크롤 상자가 이미 여백을 안쪽에 두어 잘림 0(402·1280, LTR·RTL)이었고 Native를 같은 구조로 맞췄다(수정 후 옆 선 13pt·끝 13pt).
- Sheet가 제목 정렬·키보드·top inset·maxHeight 보정 소유: 2026-09-23 소비 감사에서 제품마다 Sheet를 직접 조립하며 이 값을 따로 보정하고 있었다.
- Native `keyboardAvoidance` 기본 true: 2026-10-16 키보드 전수 조사 — 입력 시트가 옵션을 빠뜨려 키보드에 가려졌다.
- 디자인 프로필 상속(radius·floating shadow): 2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
- 하단 시트 드래그 닫기(필수): 2026-10-16 사용자 결정.
- 1.13.0 이하 고정 높이 Sheet 함정: 2026-10-06 utilverse 채팅 도구 선택, iPhone 17 Pro · iOS 26.5에서 확인했다.
