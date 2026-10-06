# ContextMenu

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [ContextMenu](../../context-menu.md), [선택 어댑터](../../optional-adapters.md), recipe `menuRecipe`
- 스토리북: `배포/컴포넌트/탐색/상황별 메뉴`

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
| 텍스트 선택·링크·이미지 위의 브라우저 기본 메뉴 대체 | 쓰지 않는다([계약](../../context-menu.md)) |
| Native에서 추가 의존성 없이 행동 목록 | [Menu](menu.md), [Sheet](sheet.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ContextMenu` | 기본 — Web 전용 | `@hjmds/react`, `/context-menu` | 없음 |
| `NativeContextMenu` | 확장 — OS 길게 누르기 메뉴 선택 어댑터 | 없음 | `/context-menu-native` |

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
import { Pressable } from "react-native";

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

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| Web `items` | `{ id, label, textValue, shortcut?, disabled?, tone?: "default" \| "danger" }[]` | — (필수) | `MenuItemDescriptor`. `description`은 그리지 않는다 |
| Native `items` | `{ id: string, label: string, disabled?, tone?: "default" \| "danger" }[]` | — (필수) | 비거나 id 중복·빈 라벨이면 `TypeError` |
| `onAction` | Web `(id: Key) => void` · Native `(id: string) => void` | — (필수) | 고른 항목 id. 메뉴는 닫힌다 |
| Web `accessibilityLabel` | `string` | — (필수) | 메뉴 이름 |
| Native `onOpenChange` | `(open: boolean) => void` | — | OS 메뉴가 열리고 닫힐 때 |
| Web `layoutStyle` | 배치 전용 style | — | 영역 래퍼(흐름 안)에 붙는다. 떠 있는 메뉴는 배치하지 않는다 |
| Web `className` | `string` | — | 영역 래퍼 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 메뉴(Web): 최대 폭 `min(24rem, 90vw)`, 최대 높이 뷰포트 높이 − 2×`spacing.md`(16). 항목 최소 높이 `control.minTouchTarget` 44. 감싼 영역 래퍼(`.hjm-context-menu-host`)는 `min-inline-size: 0`만 가지며 크기·여백을 더하지 않는다 | `packages/react/src/styles.css` `.hjm-context-menu*` |
| 간격 | 메뉴 안쪽 여백 `spacing.xs` 8(`menuRecipe.surface.padding`, Menu와 같다. 2026-10-06까지 4, 1.12.1 이후 미게시), 항목 여백 `spacing.xs` 8 · `spacing.sm` 12, 라벨–단축키 간격 `spacing.sm` 12 | `packages/react/src/styles.css` `.hjm-context-menu__item` |
| 순서·정렬 | 항목은 `items` 배열 순서대로 위에서 아래로 그린다. 단축키는 끝에 붙고 줄바꿈하지 않는다. 우클릭·길게 누르기는 누른 좌표, Shift+F10·메뉴 키는 영역의 시작 쪽 아래 모서리에 메뉴를 연다 | `packages/react/src/context-menu.tsx`, `src/context-menu.ts` |
| 고정·스크롤 | `position: fixed`로 뜨고 뷰포트 밖으로 넘치면 안쪽으로 밀어 넣는다. 최대 높이를 넘으면 메뉴 안에서 스크롤한다 | `packages/react/src/context-menu.tsx` |
| 좁은 폭·큰 글자 | 좁은 폭에서는 최대 폭이 `90vw`로 줄고 항목 라벨은 줄바꿈한다. Native `NativeContextMenu`의 위치·크기·미리보기는 OS가 정한다 | `packages/react/src/styles.css` |

```text
┌ 카드(ContextMenu 영역) ─────────────────┐
│                 ● 우클릭·길게 누른 지점   │
│                 ┌──────────────────────┐ │
│                 │ 공유          ⌘S     │ │  항목 최소 높이 44
│                 │ 삭제(danger)         │ │
│                 └──────────────────────┘ │
└──────────────────────────────────────────┘
키보드로 열면 메뉴 왼쪽 위가 영역의 왼쪽 아래 모서리에 붙는다(RTL은 시작 쪽).
```

## 꼭 지킬 것

- 메뉴 이름·항목 라벨은 i18n 키로 넣는다. 위험한 행동은 `tone: "danger"`로 표시하고 실행 전 확인은 제품이 한다.
- Web 항목은 `MenuItemDescriptor`(`id`·`label`·`textValue` 필수, `shortcut`·`disabled`·`tone` 선택)다.
  `description`은 타입에 있지만 ContextMenu는 그리지 않는다.
- Web 영역은 `tabIndex=0` 래퍼가 되어 키보드로 열 수 있다. 같은 명령을 다른 보이는 경로에도 둔다.
- `NativeContextMenu`의 `children`은 접근 가능한 native 요소 하나다(`asChild`로 트리거가 된다).
  항목이 비거나, id가 중복되거나, id·라벨이 비면 실행 중 `TypeError`다.
- 메뉴 색·모양은 OS(Native)와 `menuRecipe`(Web)가 소유한다. 임의 색은 지원하지 않는다.

### Native 선택 어댑터 설치 조건

- `zeego` 3.0.6이 optional peer다. zeego가 요구하는 `@react-native-menu/menu` 1.2.2,
  `react-native-ios-context-menu` 3.2.1, `react-native-ios-utilities` 5.2.0도 package.json의 optional peer로
  고정돼 있다. 이 subpath를 쓰는 앱만 설치한다. 기본 entry는 이 peer 없이 동작한다.
- native module이라 개발 클라이언트를 다시 빌드해야 하고 Expo Go로는 확인할 수 없다.
- 배포된 HJM은 workspace patch를 적용해 주지 않는다. `@hjmds/react-native/docs/patches/`의 menu·
  ios-context-menu·ios-utilities patch를 앱에 복사해 등록한 뒤 빌드한다([선택 어댑터](../../optional-adapters.md)).
- 2026-10에 optional native peer가 없는 앱에서 다른 선택 subpath(celebration·effect-surface·qr-code·
  thinking-orb·toast-liquid)가 tsc·테스트는 통과하고 기기 Metro에서 크래시를 냈다. 이 subpath도
  peer를 import하므로 기기에서 실행해 확인한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 구현 | `ContextMenu` | `NativeContextMenu` |
| 여는 방법 | 우클릭, 터치 길게 누르기(500ms), Shift+F10·메뉴 키 | OS 길게 누르기 |
| 메뉴 접근성 이름 | `accessibilityLabel`(필수) | 없음(자식 요소가 이름을 가짐) |
| 항목 `textValue`·`shortcut` | 있음 | 없음 |
| 열림 알림 | 없음 | `onOpenChange(open)` |
| 성숙도 | stable | 실험적 어댑터(기기 증거 전까지 canonical unsupported) |
