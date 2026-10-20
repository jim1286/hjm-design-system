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
| `SheetPanel` | 확장(optional: 지도를 계속 조작하는 비모달 하단 패널, 미게시) | — | `/sheet-panel` |
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
| `initialFocus` | `single-input` · `first-input` · `none` | 하단: 자동 포커스 없음 / 측면: `single-input` | 1.33.0 정책 변경. 하단 시트는 이 prop·`initialFocusRef`·중첩 화면·`initialFocusTarget`으로 입력 자동 포커스를 켤 수 없다. Web은 모달 컨테이너로 초점을 옮겨 focus trap을 유지하고 Native는 키보드를 열지 않는다. 측면 시트는 기존 Dialog 계약을 따른다. 사용자가 직접 입력칸을 누르는 동작은 유지한다 |
| `placement` | `bottom` · `start` · `end` | `bottom` | 나오는 가장자리 |
| `size` | `auto` · `small`(40%, 1.37.0) · `medium`(60%) · `large`(85%) · `full`(100%) | `auto` | `auto`는 내용 높이. 비율은 화면 높이 기준(Web `dvh`), 두 플랫폼 모두 위 safe area(Native는 키보드도)를 뺀 남은 높이를 넘지 않는다. `maxHeightRatio` 0.9 상한은 `auto`에만 걸린다 |
| `open` · `defaultOpen` | `boolean` | 비제어 `false` | Web은 제어하면 `onOpenChange` 필수, 비제어면 `trigger` 필수 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | reason: `trigger` · `close-action` · `escape` · `back` · `outside` · `swipe` · `programmatic`. Android 하드웨어 back은 Native에서만 `back` |
| `onDismissComplete` | `(detail: { reason }) => void` | — | 표면이 실제로 사라진 뒤 한 번. 다음 modal·화면 이동은 여기서 |
| `dismissPolicy` | `{ dismissible?, dismissWhileBusy?, outsideDismiss?, escapeOrBackDismiss?, swipeDismiss? }` | `dismissible` true · `dismissWhileBusy` false · `outsideDismiss` true(모든 위치, 미게시 변경, 이전 하단 false) · `escapeOrBackDismiss` true · `swipeDismiss` true(미게시 변경, 이전 false) | 닫기 허용 범위. `resolveSheetDismissPolicy(placement, override)` |
| `keyboardAvoidance` (Native) | `boolean` | `true`(미게시 변경, 이전 `false`) | 모달이 키보드 높이만큼 비킨다. 안쪽 `ScreenLayout`은 중복 처리하지 않는다 |
| `swipeDirection` | `"down"` | 하단은 항상 아래 방향, 옆은 생략 시 드래그 없음 | 미게시. 옆 읽기 패널도 아래로 내려 닫아야 할 때 설정한다. 같은 손잡이·거리/속도 기준·busy/닫기 정책·`swipe` 사유를 쓰며 `placement`의 크기/위치는 바꾸지 않는다. `showClose={false}`이면 손잡이가 유일한 화면 내 닫기 버튼이다 |
| `showClose` | `boolean` | 하단 `false` · 옆 `true`(미게시) | 머리의 × 표시. 하단 시트는 드래그로 닫는 것이 기본이라 끈다 |
| `busy` | `boolean` | `false` | 사용자 닫기를 막는다 |
| `title` · `closeLabel` | 문구 | 필수 | `title`은 화면에 보이지 않는다. Web은 `aria-labelledby`가 가리키는 시각 숨김 `h2`, Native는 대화상자 `accessibilityLabel`과 배치 밖 1pt 머리글이다(미게시). Native `title`이 element면 `accessibilityTitle`(string) 필수이며 element 자체는 그려지지 않는다. `closeLabel`은 손잡이·×·가림막 닫기의 이름 |
| `description` · `footer` | 노드(Native `description`은 `string`) | — | `footer`는 스크롤 밖 고정. 저장 행동은 여기 |
| `detents`(Web) · `activeDetent` · `onDetentChange` | `readonly ("medium" \| "large" \| "full")[]` · `(detent) => void` | — | 사용자가 높이를 바꿀 단계. `detentLabels: { expand, collapse }` 필수 |
| `scrollable`(Native) | `boolean` | `false` | 긴 본문은 켜고 가상 목록은 중첩하지 않는다 |
| `safeAreaInsets`(Native) | `Partial<Insets>` | provider inset | — |
| `contentStyle`(Native) | 배치 key만 | — | `HjmCompositionStyleProp` 배치 전용 타입. 색·padding·높이 등 시각 key는 받지 않는다 |

### 디자인 프로필 상속

모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.


## 배치

2026-10-20 선택의창 위치 안내 사용자 지적: 버튼은 홈 인디케이터·하단 제스처 안전 영역 **위쪽**에 둔다. Native 앱은 `SafeAreaProvider` 아래에서 읽은 `useSafeAreaInsets()`를 `HjmNativeProvider safeAreaInsets`에 전달해야 한다. Provider 기본값은 실제 기기 inset의 자동 조회가 아니므로 누락 시 0이 된다. 시트는 이 값을 사용해 하단 여백을 확보하고 footer의 BottomCTA와 중복 적용하지 않는다. 시트 높이 축소로 안전 여백을 없애지 않는다.

개발 소스·미게시: `size="small"`은 가용 높이의 40%로, `medium`(60%) 높이의 2/3이다. 짧은 안내에 내용 높이만 쓰면 지나치게 작고 medium은 빈 공간이 큰 경우 선택한다. Web·Native 공통 recipe가 크기를 소유한다.

Native 스크롤 본문은 viewport 높이만큼 content를 채운다(미게시). 고정 크기 시트의 빈/오류/로딩 상태는 `CompositionLayout layoutStyle={{ flex: 1 }}`로 연결해 손잡이·머리·footer를 제외한 본문 중앙에 둔다. 목록이 길면 같은 본문에서 스크롤한다.

선택형 Native `GestureSheetInput`의 실제 keyboard-tracking host에도 제품 `tokens.fontFamily.ui`가 이어진다. optional library·폰트 설치와 실제 기기 검증은 제품이 맡는다.

선택형 GestureSheetInput은 Provider typography와 field recipe radius 역할을 읽고 textScale을 한 번 적용한다. optional keyboard-tracking host는 그대로다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 하단 시트 높이: `auto` 내용 높이(최대 화면 높이 × `maxHeightRatio` 0.9), `medium` 60%, `large` 85%, `full` 위 safe area 안 전체 높이(0.9 상한 없음). Web 하단 시트 최대 폭 640. 위 두 모서리만 `radius.xl` 24. 옆 시트(`start`·`end`): Web 폭 `min(28rem, 100%)`·높이 화면 − 32, Native 폭 88%(최대 420)·화면 높이 | `sheetRecipe.sizes`·`content`·`web`, `.hjm-sheet`, Native `Sheet` |
| 간격 | 두 플랫폼 같은 값: 좌우 `content.paddingHorizontal`(`spacing.lg` 20), 위·아래 `content.paddingTop/Bottom`(`spacing.sm` 12, 하단 시트는 아래 safe area를 더함), 머리·본문·footer 사이 `body.gap`(`spacing.md` 16), footer 위 `footer.paddingTop`(`spacing.sm` 12), 제목–닫기 `header.gap`(`spacing.sm` 12), footer 버튼 사이 `footer.gap`(`spacing.sm` 12) | `.hjm-sheet__*`, `sheetRecipe.content`·`body`·`footer` |
| 순서·정렬 | 손잡이(하단) → 머리(설명 + 닫기, 둘 다 없으면 그리지 않음) → 본문 → `footer`. 보이는 제목 줄은 없다(미게시). 머리 최소 높이 44(`control.minTouchTarget`), ×는 설명이 없어도 끝 쪽 같은 자리다. 기본 하단 시트는 머리가 없어 본문이 손잡이 영역 바로 아래 `body.gap` 16에서 시작한다. Web footer는 오른쪽 정렬 가로 줄 [보조][주]. Native footer는 세로 열이라 꽉 찬 폭 버튼을 주 행동 먼저 둔다. 하단 시트는 항상 위 가운데 36×4 손잡이(터치 최소 폭·높이44)를 둔다. `detents`가 있으면 높이 전환 버튼, 없고 ×가 없으면 `closeLabel` 이름의 닫기 버튼이다. `showClose: true`로 ×를 표시하면 손잡이는 장식으로 남겨 같은 닫기 버튼이 중복되지 않는다(미게시). 손잡이·머리 영역을 아래로 끌어 `sheetDragRecipe.dismissDistanceRatio`(시트 높이의 25%) 또는 `dismissVelocity` 0.5px/ms를 넘기면 `swipe`로 닫고, 아니면 제자리로 돌아간다(미게시, Web·Native 동일) | `sheetRecipe.header`·`handle`, `.hjm-sheet__footer`, `.hjm-sheet__handle` |
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

### 옆 읽기 패널의 아래로 끌어 닫기 (미게시)

다에리 편지 상세가 옆 시트 안에 별도 손잡이/포인터 처리/본문 이동을 복제하던 경로를 없애기 위해 추가했다.
`placement="end" swipeDirection="down" showClose={false}`로 공통 손잡이를 사용한다. 문구·반환 경로와
미저장 확인은 제품의 `onOpenChange`에 남기고, 본문에 닫기 손잡이를 다시 만들지 않는다.
Web은 최초 포인터만 드래그를 소유하며 다른 손가락의 종료/취소는 무시한다. 소유 포인터의 취소·캡처 해제는
제자리로 돌아가고, 짧은 드래그 뒤 브라우저가 발생시키는 click은 닫기 명령으로 바뀌지 않는다.
키보드/스위치의 손잡이 클릭은 `close-action`, 충분한 드래그는 `swipe`로 같은 소유자에게 요청한다.

```tsx
<Sheet placement="end" swipeDirection="down" showClose={false}
  open={open} onOpenChange={handleChange} title={title} closeLabel={closeLabel}>
  {readingContent}
</Sheet>
```

양 Showcase의 Sheet `ReadingPanel`은 이 API의 실제 실행 예제다. Native도 같은 prop을 사용하며
진입/종료의 가로 이동과 사용자의 아래 드래그를 합성한다.

- 미게시 손잡이 터치 목표 수정: 다에리 실제 Web에서 44×20px이 측정됐고 Native도 bar4+상하8=20pt였다.
  Native는 기존 hitSlop으로 실제 터치 영역은44pt였으나 배치/접근성 frame은20pt였다.
  양 renderer의 손잡이 frame은 control.minTouchTarget44 이상으로 맞추고 Native hitSlop도 보존한다. bar36×4 그림은 그대로이며
  닫기·drag·detent의 입력 영역만 공통 최소 목표를 충족한다.

2026-10-20 선택의창 장소 편집 실화면 수정(미게시): `footer`에 `BottomCTA`를 합성하면 시트가 바깥 여백·바탕·하단 safe area를 한 번만 소유하고 버튼은 본문과 같은 좌우 경계에 맞춘다. 앱에서 추가 padding이나 별도 하단 바를 덧대지 않는다. 자세한 계산은 [BottomCTA 배치](bottom-cta.md#배치)를 따른다.


## 지도와 함께 조작하는 하단 패널 — 미게시

2026-10-20 다에리의 지도 패널은 뒤 지도를 계속 조작해야 하므로 모달 Sheet나 GestureSheet로 대체할 수 없었다.
Native `SheetPanel`은 같은 sheet recipe의 표면·위쪽 모서리·손잡이·본문 여백을 사용하는 선택형 확장이다.
추가 canonical 컴포넌트가 아니며 Web은 기존 Card 기반 인라인 패널을 사용한다. Web에 없는 네이티브 지도 끌기를 흉내 내는 모달을 만들지 않는다.
`/sheet-panel`만 import하며 기존 Gesture Handler·Reanimated·Worklets peer가 필요하다. Gorhom이나 Modal provider는 필요 없다.

```tsx
import { SheetPanel } from "@hjmds/react-native/sheet-panel";

<SheetPanel handleLabel="여정 패널" maximumHeight={availableHeight} height={availableHeight}
  onHeightChange={setMapBottomInset}>
  <Text>선택한 여정</Text>
</SheetPanel>
```

- 배치는 손잡이(최소 44) → 본문이며 위 모서리만 `sheetRecipe.content.radius`로 둥글게 한다. 하단은 화면에 붙어 지도색이 새지 않게 각진다. 좌우 바깥 여백은 부모의 대칭 `layoutStyle`로 연결한다.
- `maximumHeight`는 부모의 지도/탭 영역을 제외한 가용 높이, `height`는 선택 상태 간 유지할 높이다. 본문만 스크롤하며 고정 높이에서 남은 영역을 채운다. 부모가 이미 safe area를 제외한 지도 높이를 주므로 safe area를 다시 더하지 않는다.
- 접으면 손잡이만 남는다. 손잡이 끌기와 본문 맨 위의 아래 방향 끌기가 같은 snap 정책을 쓴다. 취소되면 시작 위치로 돌아오며 높이가 바뀌어도 접힘 상태를 유지한다. 내용 안에서 시작한 스크롤은 중간에 맨 위에 도달해도 시트를 끌지 않는다.
- 손잡이를 눌러도 접기/펼치기가 가능하며 `accessibilityState.expanded`가 바뀐다. 접힌 본문은 보조기술에서 숨기고 뒤 지도는 숨기지 않는다. 포커스 격리·backdrop·Android back 가로채기는 없다.
- 제품의 가로 넘김은 `contentGesture`로 제공한다. 수직 동작/멀티터치/짧은 탭을 가로 넘김이 빼앗지 않도록 제품 gesture의 방향 기준을 지정한다. `handleActions`/`onHandleAction`으로 이전/다음 같은 도메인 접근성 행동을 추가할 수 있다. `overlay`는 제품 그림·소인 슬롯이다.
- 현재 호스트 검사와 소비 앱 타입/동작 검사 대상이며, 새 패널의 실제 iOS/Android 제스처·지도 동시 조작은 별도 기기 확인이 필요하다. 안정화·게시 완료를 뜻하지 않는다.
