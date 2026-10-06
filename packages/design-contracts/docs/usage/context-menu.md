# ContextMenu 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [ContextMenu](../context-menu.md), [선택 어댑터](../optional-adapters.md), recipe `menuRecipe`

## 언제 쓰나

Web에서 제품이 소유한 영역(카드·목록 행·캔버스)의 우클릭·길게 누르기·Shift+F10에 명령 목록을
띄울 때 쓴다. 같은 명령은 화면의 다른 경로(버튼·Menu)에도 있어야 한다. Native canonical 구현은 없고,
OS 길게 누르기 메뉴가 필요하면 선택 어댑터 `NativeContextMenu`를 쓴다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 버튼을 눌러 여는 명령 목록 | [Menu](menu.md) |
| 앱 상단 메뉴 막대(Web) | [Menubar](menubar.md) |
| 목록 행을 밀어 나오는 행동 | [SwipeActions](swipe-actions.md) |
| 텍스트 선택·링크·이미지 위의 브라우저 기본 메뉴 대체 | 쓰지 않는다([계약](../context-menu.md)) |
| Native에서 추가 의존성 없이 행동 목록 | [Menu](menu.md), [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `ContextMenu` | `@hjmds/react`, `/context-menu` | 없음 | 기본(Web 전용) |
| `NativeContextMenu` | 없음 | `/context-menu-native` | OS 길게 누르기 메뉴 선택 어댑터 |

`NativeContextMenu`는 root에서 재노출되지 않는다. `@hjmds/react-native/context-menu-native`로만 import한다.

## 최소 사용 예

```tsx
// Web
import { ContextMenu } from "@hjmds/react/context-menu";

<ContextMenu
  accessibilityLabel={t("post.actions")}
  items={[
    { id: "share", label: t("post.share"), textValue: t("post.share") },
    { id: "delete", label: t("post.delete"), textValue: t("post.delete"), tone: "danger" },
  ]}
  onAction={(id) => runPostAction(post, id)}
>
  <PostCard post={post} />
</ContextMenu>
```

```tsx
// Native (선택 어댑터)
import { NativeContextMenu } from "@hjmds/react-native/context-menu-native";

<NativeContextMenu
  items={[
    { id: "share", label: t("post.share") },
    { id: "delete", label: t("post.delete"), tone: "danger" },
  ]}
  onAction={(id) => runPostAction(post, id)}
>
  <Pressable accessibilityRole="button" accessibilityLabel={t("post.open")}>
    <PostCardBody post={post} />
  </Pressable>
</NativeContextMenu>
```

## 꼭 지킬 것

- 메뉴 이름·항목 라벨은 i18n 키로 넣는다. 위험한 행동은 `tone: "danger"`로 표시하고 실행 전 확인은 제품이 한다.
- Web 항목은 `MenuItemDescriptor`(`id`·`label`·`textValue` 필수, `shortcut`·`disabled`·`tone` 선택)다.
  `description`은 타입에 있지만 ContextMenu는 그리지 않는다.
- Web 영역은 `tabIndex=0` 래퍼가 되어 키보드로 열 수 있다. 같은 명령을 다른 보이는 경로에도 둔다.
- `NativeContextMenu`의 `children`은 접근 가능한 native 요소 하나다(`asChild`로 트리거가 된다).
  항목이 비거나, id가 중복되거나, id·라벨이 비면 실행 중 `TypeError`다.
- 메뉴 색·모양은 OS(Native)와 `menuRecipe`(Web)가 소유한다. 임의 색은 지원하지 않는다.

## Native 선택 어댑터 설치 조건

- `zeego` 3.0.6이 optional peer다. zeego가 요구하는 `@react-native-menu/menu` 1.2.2,
  `react-native-ios-context-menu` 3.2.1, `react-native-ios-utilities` 5.2.0도 package.json의 optional peer로
  고정돼 있다. 이 subpath를 쓰는 앱만 설치한다. 기본 entry는 이 peer 없이 동작한다.
- native module이라 개발 클라이언트를 다시 빌드해야 하고 Expo Go로는 확인할 수 없다.
- 배포된 HJM은 workspace patch를 적용해 주지 않는다. `@hjmds/react-native/docs/patches/`의 menu·
  ios-context-menu·ios-utilities patch를 앱에 복사해 등록한 뒤 빌드한다([선택 어댑터](../optional-adapters.md)).
- 2026-10에 optional native peer가 없는 앱에서 다른 선택 subpath(celebration·effect-surface·qr-code·
  thinking-orb·toast-liquid)가 tsc·테스트는 통과하고 기기 Metro에서 크래시를 냈다. 이 subpath도
  peer를 import하므로 기기에서 실행해 확인한다.

## 플랫폼 차이

| 항목 | Web `ContextMenu` | Native `NativeContextMenu` |
| --- | --- | --- |
| 여는 방법 | 우클릭, 터치 길게 누르기(500ms), Shift+F10·메뉴 키 | OS 길게 누르기 |
| 메뉴 접근성 이름 | `accessibilityLabel`(필수) | 없음(자식 요소가 이름을 가짐) |
| 항목 `textValue`·`shortcut` | 있음 | 없음 |
| 열림 알림 | 없음 | `onOpenChange(open)` |
| 성숙도 | stable | 실험적 어댑터(기기 증거 전까지 canonical unsupported) |
