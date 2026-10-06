# Sheet 입력 화면과 가용 영역

## 문제와 결정

2026-09-23 소비 조사에서 BurnTok 모바일 `AppSheet.tsx:93`은 제목을 수직 정렬하기 위해
ReactNode를 `as unknown as string`으로 전달했다. Web도 `.hjm-sheet__header`를 덮어썼다.
같은 어댑터가 키보드 높이, top inset, 본문 maxHeight를 별도로 보정하고 있었다.

1.4는 제목·닫기 컨트롤을 헤더 중앙에 정렬한다. 1.4에서는 제목을 문자열로 유지했다. 임의의 제목 slot을
추가하면 접근성 이름과 표시가 서로 어긋날 수 있어 기본 renderer 정렬을 고치는 쪽을 택했다.

1.7은 Native `Sheet`·`Dialog`의 `title`을 `string | ReactElement`로 넓힌다(`OverlayTitleProps`).
정렬을 고친 뒤에도 강조·아이콘이 든 제목을 위해 캐스트가 남았기 때문이다(2026-09-27 감사).
어긋남은 타입으로 막는다: element 제목이면 `accessibilityTitle: string`이 필수이고 modal의
`accessibilityLabel`은 그 문자열(+description)로만 만든다. 문자열 제목은 그대로 이름이 되고
`accessibilityTitle`은 선택이다. Web은 `aria-labelledby`가 렌더된 DOM을 읽으므로 ReactNode 그대로다.

Native Sheet는 `keyboardAvoidance`와 `scrollable`을 제공한다. 둘 다 기본 false다.
이미 키보드를 처리하거나 FlatList를 넣는 소비자를 minor에서 이중 처리하지 않기 위한 선택이다.
입력 폼은 두 옵션을 함께 켜고 제품의 키보드 listener·강제 maxHeight·중첩 ScrollView를 제거한다.

## 계약과 플랫폼 번역

- 제목/닫기와 footer는 스크롤 본문 바깥에 둔다. body만 줄어들고 스크롤한다.
- top safe area는 화면의 가용 높이를 제한한다. bottom sheet 내부에 노치 높이를 더하지 않는다.
- Native modal의 실제 onLayout 높이를 사용한다. Android adjustResize가 이미 줄인 높이에
  키보드 높이를 한 번 더 빼지 않는다.
- 열린 키보드 위에 Sheet가 나타나도 `Keyboard.metrics()`로 현재 상태를 읽는다.
- iOS frame change, Android didShow/didHide를 구독하고 종료 시 해제한다.
- 화면 폭보다 좁은 floating keyboard에는 화면 전체를 밀어 올리지 않는다.
- docked keyboard가 있으면 home indicator inset을 키보드 위에 중복 추가하지 않는다.
- Web은 기존 scroll body·viewport CSS·focus trap을 유지하며 헤더 정렬을 함께 고친다.
- busy, close reason, Modal dismiss completion, focus return 계약은 유지한다.

```tsx
<Sheet open={open} title="설정" closeLabel="닫기"
  keyboardAvoidance scrollable safeAreaInsets={insets}
  onOpenChange={setOpen} footer={<Button onPress={save}>저장</Button>}>
  <TextField label="이름" value={name} onValueChange={setName} />
</Sheet>
```

`scrollable` 본문 안에 가상화 목록을 중첩하지 않는다. 목록 자체가 스크롤 소유자인 경우
`scrollable={false}`로 두고 목록의 flex/keyboard 연결을 제품 adapter에서 담당한다.

## 증거와 남은 확인

- `packages/react-native/test/sheet-viewport.test.tsx`: 키보드 사전 표시, frame 변경, resize,
  floating keyboard, listener 해제, footer/body 경계, safe area와 title 이름, element 제목의
  `accessibilityTitle` 쌍(타입·accessibilityLabel), close action/busy 차단, 200% 긴 제목·설명.
- `packages/react-native/test/modal-lifecycle-fallback.test.tsx`: 종료/후속 surface/focus 회귀.
- `packages/react/test/sheet-layout.browser.test.tsx`: 320px의 제목/닫기 기하와 100/200% 글자,
  긴 제목·설명 줄바꿈, Tab focus containment, Escape 종료와 trigger focus 복원.
- 위 Native proof는 host mock이다. 소비 앱 Device Hub 및 Android의 실제 키보드 동작은
  별도로 기록하며 mock 통과를 기기 증거로 삼지 않는다.

2026-09-29 renderer 증거 보완: 기존 Sheet renderer proof에는 layout·환경 matrix는 있었지만
behavior contract의 Web key 동작과 Native host action, 긴 제목·설명 회귀가 별도 interaction test로
등록되어 있지 않았다. 제품별 기기 영수증을 공통 성숙도 조건으로 만들지 않고, renderer가 소유한
focus/dismiss와 텍스트 배치 회귀를 직접 확인하도록 위 테스트를 추가했다.

참조: [React Native Keyboard](https://reactnative.dev/docs/keyboard),
[ScrollView](https://reactnative.dev/docs/scrollview).

Native accessibility follow-up (2026-10-01): at 200% text scale, the close glyph was clipped inside the fixed IconButton frame. Dialog and Sheet now render that decorative glyph at a fixed icon size, matching Toast; title/body text still scales and the named close action and touch target are preserved. `sheet-viewport.test.tsx` checks both renderers and close callbacks.

## Backdrop focus preservation (2026-10-03)

Diairy QA W16 reproduced Chrome default backdrop blur undoing Dialog focus return; Sheet used the same handler. Both Web renderers prevent the backdrop-only mousedown default while retaining dismissal policy and busy guards. Inner controls keep their default pointer behavior. Native has no DOM mousedown default and its host focus path is unchanged. `modal-outside-focus.browser.test.tsx` uses real pointer input rather than synthetic event dispatch to verify return focus, next Tab order, and focus containment while busy.

## 열림 높이 `size`와 여백 (2026-10-06)

- `sheetRecipe.sizes.full`(1)은 위쪽 안전 영역 안의 전체 높이다. `content.maxHeightRatio`(0.9)는 `size="auto"`만 제한한다.
  이전에는 두 renderer 모두 `full`도 90%에서 멈췄다(Web `max-block-size: 90dvh`, Native `maxHeight` 0.9).
- Web 여백은 Native와 같은 recipe 값이다: 위아래 `content.paddingTop/Bottom`(sm 12), 좌우 `paddingHorizontal`(lg 20),
  머리·본문·footer 사이 `body.gap`(md 16), footer 위 `footer.paddingTop`(sm 12). Web은 Dialog 여백(20)을 쓰고 있었다.
  본문 스크롤 상자는 자식 포커스 링이 잘리지 않도록 4px 안쪽 여백과 같은 크기의 음수 margin을 둔다(보이는 간격은 recipe 값).

## 고정 높이 본문 채우기 (1.13.1, 2026-10-06)

고정 높이 Native Sheet(`size` `medium`·`large`·`full`, 옆 시트)의 본문은 머리·footer를 뺀 남은 높이를 차지한다(`flexGrow: 1`, `minHeight: 0`).
`scrollable`이면 ScrollView가 늘고 그 내용 컨테이너는 늘지 않는다. Web `.hjm-sheet__body`는 이미 `flex: 1 1 auto`였다.
계기: utilverse가 1.13.0을 적용하며 `size="large"` Sheet 안에 SearchScreen을 넣었는데, 본문이 내용 높이 View라 ScreenLayout의 `flex: 1` 루트가
0pt가 되고 검색 입력만 그려졌다(iPhone 17 Pro · iOS 26.5, 이전 코드로도 재현). 제품은 창 높이 `flexBasis`로 우회했다.
`auto`는 내용 높이 그대로다(늘 남는 공간이 없다). 바뀌는 모습: 고정 높이 시트의 `footer`가 본문 바로 아래가 아니라 시트 아래에 붙는다(Web과 같다).
버린 대안: 새 `bodyLayout` prop(기본값을 그대로 두면 Web과 다른 동작이 남고 제품마다 켜야 한다).
