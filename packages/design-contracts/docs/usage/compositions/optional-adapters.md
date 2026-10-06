# 이미지·시트·키보드 조작

- 단계: 구성
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional presentation adapters](../../optional-adapters.md#behavior-boundaries), `packages/react-native/src/keyboard-controller.tsx`, `packages/react-native/src/sheet-gesture.tsx`, `showcase/native/src/OptionalAdapters.stories.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/이미지·시트·키보드 조작`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/직접 조작과 모션/이미지·시트·키보드 조작`

## 언제 쓰나

Native 앱 한 화면에서 이미지 확대 보기, 끌어서 높이를 바꾸는 시트, OS 길게 누르기 메뉴, 키보드를 따라 올라가는 하단 행동을 함께 쓸 때 provider 중첩 순서와 각 요소의 자리를 확인하는 구성이다.

네 어댑터(`image-viewer`·`sheet-gesture`·`context-menu-native`·`keyboard-controller`)는 모두 experimental이고 Native 전용이다. 링크된 네이티브 모듈이 필요하므로
Expo Go가 아니라 호환 개발 클라이언트에서만 확인된다. 이 기능이 필요 없으면 기본 [Sheet](../components/sheet.md)·[ContextMenu](../components/context-menu.md)·
[KeyboardAvoiding](../components/keyboard-avoiding.md)을 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `GestureHandlerRootView` | 제스처 host. 화면 루트 하나 | — |
| `KeyboardMotionProvider` | 키보드 추적. 앱(화면) 루트에 하나, 필드마다 두지 않는다 | [KeyboardMotionProvider](../components/keyboard-motion-provider.md) |
| `GestureSheetProvider` | GestureSheet host. `GestureHandlerRootView` 안 | [Sheet](../components/sheet.md) |
| `KeyboardFormScrollView` | 입력이 있는 본문 스크롤. 초점 필드를 키보드 위로 | [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md) |
| `KeyboardDock` | 하단 행동(완료 등)이 키보드를 따라 올라감 | [KeyboardDock](../components/keyboard-dock.md) |
| `GestureSheet` + `GestureSheetInput` | 끌어서 snap(기본 `["50%", "90%"]`)·닫기, 시트 안 입력 | [Sheet](../components/sheet.md) |
| `ImageViewer` | 전체 화면 이미지 확대·넘기기, 실패 시 다시 시도 | [Image](../components/image.md) |
| `NativeContextMenu` | 길게 눌러 OS 메뉴. 자식은 접근 가능한 native 요소 하나 | [ContextMenu](../components/context-menu.md) |
| `Button`·`Text` | 트리거·결과 문구 | [Button](../components/button.md), [Text](../components/text.md) |

## 배치

```text
┌ GestureHandlerRootView ▸ KeyboardMotionProvider ▸ GestureSheetProvider ┐
│ ░ 상단 안전 영역(insets.top) ░                                          │
│ 상단 바 영역 (Container gutter 16/20)                                   │ ← 고정
├─────────────────────────────────────────────────────────────────────────┤
│ KeyboardFormScrollView  위아래 spacing.md 16                            │ ↑ 스크롤
│ └ Container gutter 16/20 ▸ Stack gap="md" 16                            │ │
│    [ 이미지 보기 ] (secondary)                                          │ │
│    [ 시트 열기 ] (secondary)                                            │ │
│    (길게 눌러 메뉴 열기)  ← NativeContextMenu 자식                      │ │
│    결과 문구 (live region)                                              │ │
│    [ 입력 TextField ]                                                   │ ↓
├─────────────────────────────────────────────────────────────────────────┤
│ KeyboardDock: [        완료 (primary)        ]  Container gutter       │ ← 주 행동, 키보드 위로 이동
│ ░ 하단 안전 영역: 키보드 닫힘일 때만 insets.bottom ░                    │
└─────────────────────────────────────────────────────────────────────────┘
  위에 겹침: GestureSheet(하단, 50% ↔ 90%) / ImageViewer(전체 화면, safeAreaInsets)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `GestureHandlerRootView` ▸ `KeyboardMotionProvider` ▸ `GestureSheetProvider`(이 순서로 화면 루트에 하나씩) → 본문 `KeyboardFormScrollView` → `Container` → `Stack gap="md"` | 화면 전체. 위 안전 영역은 상단 바 영역이 `paddingTop: insets.top`으로, 아래 안전 영역은 하단 행동 영역이 받는다. 키보드: 본문은 `KeyboardFormScrollView`가 초점 필드를 올리고 하단 행동은 `KeyboardDock`이 따라 올라간다 | 본문 위아래 `spacing.md` 16, 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20), 요소 사이 `layout.contentGap` 16 |
| 상단 | 제품 상단 바([TopBar](../components/top-bar.md) 등) | 고정, `paddingTop: insets.top` | 좌우 `Container` gutter |
| 트리거 | `Button tone="secondary"` × 2 | 본문 맨 위 | 높이 44. 화면의 primary는 하단 완료 하나 |
| 메뉴 트리거 | `NativeContextMenu` 자식(`Pressable` + 지역화된 `accessibilityLabel`) | 본문 안 | 터치 영역 최소 44(`control.minTouchTarget`) 권장 |
| 결과 문구 | `Text accessibilityLiveRegion="polite"` | 메뉴 트리거 아래 | — |
| 입력 | [TextField](../components/field.md) | 본문 끝 | 높이 44 |
| 하단 행동 | `KeyboardDock` + `Button`(primary) | 하단 고정, 키보드가 열리면 그 위로 | 좌우 `Container` gutter, 아래 여백은 키보드 닫힘 시 `insets.bottom`·열림 시 0, 추가 간격은 `clearance`(기본 0) |
| 시트 | `GestureSheet` + `GestureSheetInput` | 하단 오버레이 | snap 기본 50%·90%, 닫기 버튼이 본문 끝에 자동 |
| 이미지 | `ImageViewer` | 전체 화면 오버레이 | `safeAreaInsets` 필수(가장자리까지 그릴 때) |

- 하단 안전 영역은 host(제품)가 소유한다. `KeyboardDock`은 키보드만 따라가므로, 키보드가 닫혀 있을 때만 `insets.bottom`을 더한다.
- `KeyboardDock`을 다른 키보드 회피 wrapper와 같은 내용에 겹쳐 쓰지 않는다.
- 시트 안 입력은 `GestureSheetInput`이다. 시트의 키보드 여백은 시트가 소유하므로 시트 안에 `KeyboardFormScrollView`를 또 두지 않는다.

근거: `showcase/native/src/OptionalAdapters.stories.tsx`, `packages/react-native/src/keyboard-controller.tsx`(`clearance`), `packages/react-native/src/sheet-gesture.tsx`(`snapPoints`·`busy`), `packages/react-native/src/image-viewer.tsx`(로딩·실패·다시 시도), `src/foundations.ts`(`layout`)

## 흐름과 상태

1. 이미지 보기를 누르면 `ImageViewer`가 `open`으로 열린다. 닫으면 unmount되어 확대 상태가 초기화된다.
2. 시트 열기를 누르면 `GestureSheet`가 첫 snap(50%)으로 열린다. 끌어서 90%로 올리거나 아래로 끌어 닫는다.
3. 메뉴 트리거를 길게 누르면 OS 메뉴가 열리고, 고른 항목 id가 `onAction`으로 온다. 제품은 id를 결과 문구 키로 바꿔 보인다.
4. 입력에 초점이 가면 본문이 초점 필드를 키보드 위로 올리고, 완료 버튼이 키보드 위에 붙는다. 완료는 `Keyboard.dismiss()`다.
5. Android back: 열린 GestureSheet가 있으면 그것부터 닫는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 트리거 두 개·메뉴 트리거·안내 결과 문구(`memo.menuHint`)·입력, 하단에 완료 | — |
| 진행 중 | 이미지: 이미지마다 `loadingLabel` 문구. 시트 `busy`: 끌어 닫기·배경 닫기·Android back이 막힌다(코드로는 닫을 수 있다) | 이미지 로딩 문구는 live region(polite) |
| 실패 | 이미지 로드 실패: `errorLabel` + `retryLabel` 버튼. 다시 시도는 같은 이미지를 새로 요청하고, 다시 실패하면 같은 실패 문구와 버튼으로 돌아온다. 시트·메뉴는 요청이 없다. 시트 안 저장처럼 제품 요청이 실패하면 `busy`를 풀고 시트를 연 채 실패 문구를 둔다 | 실패 문구는 live region이 아니다(함정) |
| 시트 열림 | 하단 시트, 배경 눌러 닫기 | 열었던 트리거로 포커스 복귀는 제품이 처리 |
| 키보드 열림 | 완료 버튼이 키보드 위, 아래 안전 영역 0 | — |
| 메뉴 항목 disabled·danger | OS가 비활성·파괴 표시 | OS 메뉴 접근성 |

메뉴 결과처럼 상태→문구 키는 상수 표로 둔다. 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
// 없음: 네 어댑터 모두 Native 전용이다. Web은 기본 Sheet·ContextMenu와 브라우저 키보드 동작을 쓴다.
```

```tsx
// Native
import { Keyboard, Pressable, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@hjmds/react-native/actions";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { TextField } from "@hjmds/react-native/inputs";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { KeyboardMotionProvider, KeyboardDock, KeyboardFormScrollView } from "@hjmds/react-native/keyboard-controller";
import { GestureSheet, GestureSheetProvider, GestureSheetInput } from "@hjmds/react-native/sheet-gesture";
import { ImageViewer } from "@hjmds/react-native/image-viewer";
import { NativeContextMenu } from "@hjmds/react-native/context-menu-native";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const menuResultKey = { none: "memo.menuHint", save: "memo.saved", delete: "memo.deleted" } as const;
const { spacing } = useHjmNativeTheme().tokens;
const insets = useSafeAreaInsets();
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<GestureHandlerRootView style={{ flex: 1 }}>
  <KeyboardMotionProvider>
    <GestureSheetProvider>
      <View style={{ paddingTop: insets.top }}><Container gutter={gutter}>{topBar}</Container></View>
      <KeyboardFormScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
        <Container gutter={gutter}>
          <Stack gap="md">
            <Button tone="secondary" onPress={() => setViewer(true)}>{t("photo.view")}</Button>
            <Button tone="secondary" onPress={() => setSheet(true)}>{t("detail.open")}</Button>
            <NativeContextMenu items={menuItems} onAction={(id) => setMenuResult(id === "delete" ? "delete" : "save")}>
              <Pressable accessibilityRole="button" accessibilityLabel={t("memo.moreActions")}>{card}</Pressable>
            </NativeContextMenu>
            <Text accessibilityLiveRegion="polite">{t(menuResultKey[menuResult])}</Text>
            <TextField label={t("memo.label")} value={memo} onValueChange={setMemo} />
          </Stack>
        </Container>
      </KeyboardFormScrollView>
      <KeyboardDock>
        <View style={{ paddingBottom: keyboardOpen ? 0 : insets.bottom }}>
          <Container gutter={gutter}>
            <Button onPress={() => Keyboard.dismiss()}>{t("common.done")}</Button>
          </Container>
        </View>
      </KeyboardDock>
      <GestureSheet open={sheet} onOpenChange={setSheet} busy={sheetBusy} title={t("detail.title")} closeLabel={t("common.close")}>
        <GestureSheetInput accessibilityLabel={t("detail.memo")} />
      </GestureSheet>
      <ImageViewer open={viewer} onClose={() => setViewer(false)} safeAreaInsets={insets} items={images}
        closeLabel={t("common.close")} previousLabel={t("common.previous")} nextLabel={t("common.next")}
        loadingLabel={t("common.loading")} errorLabel={t("photo.loadFailed")} retryLabel={t("photo.retryLoad")} />
    </GestureSheetProvider>
  </KeyboardMotionProvider>
</GestureHandlerRootView>
```

`keyboardOpen`은 `Keyboard`의 `keyboardDidShow`·`keyboardDidHide` 구독으로 제품이 만든다. `images`·`menuItems`·`card`·`topBar`·문구는 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 지원 | 없음(기본 Sheet·ContextMenu 사용) | 네 어댑터 experimental |
| 실행 환경 | — | 호환 개발 클라이언트(Expo Go 불가) |

## 함정

- RN `Modal` 안에 GestureSheet를 두면 Android back이 `Modal`의 `onRequestClose`로만 간다. `dismissTopGestureSheet()`를 먼저 부르고 `false`일 때만 host를 닫는다.
- KeyboardDock은 window 기준 좌표를 쓴다. Storybook 캔버스처럼 아래에 다른 영역이 남는 host에서는 위치가 어긋나 스토리가 전체 화면 `Modal`로 띄운다. 제품도 앱 크기 host에서 쓴다.
- NativeContextMenu 패치(Zeego 3.0.6 관련)는 HJM 설치로 적용되지 않는다. `@hjmds/react-native/docs/patches/`를 제품에 복사해 등록한다.
- 필요한 optional peer(`react-native-zoom-toolkit` 5.1.1, `react-native-keyboard-controller` 1.22.5, `@gorhom/bottom-sheet` 5.2.14, `zeego` 3.0.6 등)가 없으면 기기 Metro 번들이 실패한다.
- `ImageViewer` 실패는 Android assertive live region과 iOS announceForAccessibility로 알린다. 제품이 같은 오류를 다시 낭독하지 않는다. 제품 이미지 host와 상태 이벤트 연결은 [Image 사용 지침](../components/image.md)의 Native ImageViewer 절을 따른다.
- 2026-10-06 예제 검수에서 머리·본문·하단의 좌우 여백을 Container compact로 맞추고 본문 간격은 Stack md로 옮겼다. 안전 영역·키보드 좌표는 바깥 host가 유지한다. 메뉴 결과는 상태 문구와 iOS/Android 알림을 함께 갱신한다.
