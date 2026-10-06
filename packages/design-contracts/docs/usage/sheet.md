# Sheet 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Sheet 입력 화면과 가용 영역](../sheet.md), recipe `sheetRecipe`(`src/component-recipes.ts`), 정책 `sheetBehaviorDefaults`(`src/sheet.ts`),
Native 제스처 확장: [optional adapters](../optional-adapters.md)

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
| 사진 촬영·앨범 선택 | [PhotoSourceSheet](photo-source-sheet.md) |
| 폼 한 칸의 선택 | [Select](select.md)(Native는 자체 sheet를 연다) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Sheet` | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` | 기본(모달) |
| `GestureSheet` | 없음 | `/sheet-gesture` | optional: 끌어서 snap·닫기 |
| `GestureSheetProvider` | 없음 | `/sheet-gesture` | optional: GestureSheet host |
| `GestureSheetInput` | 없음 | `/sheet-gesture` | GestureSheet 안 입력(계약은 [Field](field.md)) |

`/sheet-gesture`는 granular subpath로만 가져오며 optional peer `@gorhom/bottom-sheet` 5.2.14,
`react-native-reanimated` 4.x, `react-native-gesture-handler` 2.32.0이 필요하다. 없으면 기기 Metro 번들에서 죽는다.
기본 `Sheet`는 추가 peer가 없다.

## 최소 사용 예

```tsx
// Web
import { Sheet } from "@hjmds/react/overlays";

<Sheet open={open} onOpenChange={(next) => setOpen(next)}
  title={t("profile.edit.title")} closeLabel={t("common.close")}
  footer={<Button onClick={save} loading={saving}>{t("common.save")}</Button>}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
</Sheet>
```

```tsx
// Native — 입력 폼은 keyboardAvoidance + scrollable
import { Sheet } from "@hjmds/react-native/overlays";

<Sheet open={open} onOpenChange={(next) => setOpen(next)}
  title={t("profile.edit.title")} closeLabel={t("common.close")}
  keyboardAvoidance scrollable busy={saving}
  footer={<Button onPress={save} loading={saving}>{t("common.save")}</Button>}>
  <TextField label={t("profile.name")} value={name} onValueChange={setName} />
</Sheet>
```

## 축과 기본값

- `placement`: `bottom`(기본) · `start` · `end`. `size`: `auto`(기본, 내용 높이) · `medium`(60%) · `large`(85%).
- 열림: `open` + `onOpenChange(open, { reason })` 또는 `defaultOpen`. reason 타입은 `trigger` · `close-action` · `escape` ·
  `back` · `outside` · `swipe` · `programmatic`이다. Android 하드웨어 back은 Native에서만 `back`으로 온다.
- `dismissPolicy`(부분 지정): `dismissible` true · `dismissWhileBusy` false · `outsideDismiss` true ·
  `escapeOrBackDismiss` true · `swipeDismiss` false. `busy`(기본 `false`)면 사용자 닫기를 막는다.
- `closeLabel`(필수), `title`(필수), `description`, `footer`(스크롤 밖 고정), `onDismissComplete({ reason })`.
- Native `keyboardAvoidance`·`scrollable` 기본 `false`. `safeAreaInsets` 기본은 provider inset.
- Native `title`이 element면 `accessibilityTitle`(string)이 필수다.

## 꼭 지킬 것

- 입력 폼 Native Sheet는 `keyboardAvoidance`와 `scrollable`을 함께 켜고, 제품의 키보드 listener·maxHeight·
  중첩 ScrollView를 지운다. 본문이 FlatList 등 가상화 목록이면 `scrollable={false}`로 둔다.
- 저장 버튼은 `footer`에 둔다. 저장 중에는 `busy`로 닫기를 막는다.
- 닫힌 뒤 다른 modal을 열거나 화면 이동은 `onDismissComplete`에서 한다. 두 modal을 동시에 띄우지 않는다.
- 문구(`title`, `closeLabel`, 본문)는 i18n 키로 넣는다. 제목 정렬을 위해 `as unknown as string` 캐스트나
  `.hjm-sheet__header` CSS 덮어쓰기를 하지 않는다.
- Native `contentStyle`은 배치에만 쓴다. 높이는 `size`로 정한다(`contentStyle={{ height }}` 금지).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| uncontrolled 트리거 | `trigger`(uncontrolled면 필수) | 없음 |
| 사용자 높이 조절 | `detents`·`activeDetent`·`onDetentChange`·`detentLabels` | 없음(GestureSheet `snapPoints`) |
| 키보드·스크롤 | CSS scroll body | `keyboardAvoidance`, `scrollable` |
| 초점 | `initialFocusRef`, `returnFocusRef`, focus trap | `returnFocusRef` |
| 겹침 순서 | `modalPriority`, `portalContainer` | RN `Modal` props(`testID` 등) |
| `title` 타입 | `ReactNode` | `string` 또는 element + `accessibilityTitle` |

## GestureSheet(Native optional)

- controlled `open`/`onOpenChange(open)`만 있다. `title`·`closeLabel`·`children` 필수, `snapPoints` 기본 `["50%", "90%"]`,
  `initialIndex` 기본 `0`, `busy`면 끌어 닫기·backdrop 닫기를 막는다. 닫기 버튼이 본문 끝에 자동으로 들어간다.
- 화면을 `GestureHandlerRootView` 안의 `GestureSheetProvider`로 감싼다. 입력은 `GestureSheetInput`을 쓴다.
- RN `Modal` 안에 GestureSheet를 두면 Android back이 `onRequestClose`로만 간다. 그 host는
  `dismissTopGestureSheet()`를 먼저 부르고 `false`일 때만 자기 자신을 닫는다.
- 동적 높이·footer·dismissPolicy·reason은 없다. 이것들이 필요하면 기본 Sheet를 쓴다.
