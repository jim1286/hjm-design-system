# Sheet 입력 화면과 가용 영역

## 문제와 결정

2026-09-23 소비 조사에서 BurnTok 모바일 `AppSheet.tsx:93`은 제목을 수직 정렬하기 위해
ReactNode를 `as unknown as string`으로 전달했다. Web도 `.hjm-sheet__header`를 덮어썼다.
같은 어댑터가 키보드 높이, top inset, 본문 maxHeight를 별도로 보정하고 있었다.

1.4는 제목·닫기 컨트롤을 헤더 중앙에 정렬한다. 제목은 여전히 문자열이다. 임의의 제목 slot을
추가하면 접근성 이름과 표시가 서로 어긋날 수 있어 기본 renderer 정렬을 고치는 쪽을 택했다.

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
  floating keyboard, listener 해제, footer/body 경계, safe area와 title 이름.
- `packages/react-native/test/modal-lifecycle-fallback.test.tsx`: 종료/후속 surface/focus 회귀.
- `packages/react/test/sheet-layout.browser.test.tsx`: 320px의 제목/닫기 기하와 100/200% 글자.
- 위 Native proof는 host mock이다. 소비 앱 Device Hub 및 Android의 실제 키보드 동작은
  별도로 기록하며 mock 통과를 기기 증거로 삼지 않는다.

참조: [React Native Keyboard](https://reactnative.dev/docs/keyboard),
[ScrollView](https://reactnative.dev/docs/scrollview).
