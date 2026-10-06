# Dialog 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Dialog](../dialog.md), [명령형 오버레이](../overlay-stack.md), recipe `dialogRecipe`(`src/component-recipes.ts`)

## 언제 쓰나

화면 흐름을 잠시 멈추고 사용자의 주의가 필요한 **짧은 작업**에 쓴다. 이름 바꾸기, 짧은 입력·설정,
설명과 함께 고르는 행동처럼 본문(children)에 제품 내용이 들어가는 모달이다.

### Dialog · AlertDialog · Sheet 고르기

| 질문 | 고를 것 |
| --- | --- |
| 알림 한 줄 또는 "할까요?" 확인만 받는다(삭제·나가기 확인 포함) | [AlertDialog](alert-dialog.md) — `request`로 문구·`mode`(`alert`/`confirm`)·`tone`만 넘기고 중복 확인·busy·오류를 계약이 처리 |
| 제목·설명 아래 제품 본문(입력·선택)이 있는 짧은 작업 | **Dialog** |
| 목록·선택지가 길거나 높이를 단계로 바꾸거나 화면 아래/옆에서 올라와야 한다 | [Sheet](sheet.md) — `placement`·`size`·`detents` |

확인 문구와 버튼 두 개를 Dialog로 직접 조립하지 않는다. 그것은 AlertDialog다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 결과 알림, 자동으로 사라지는 메시지 | [Toast](toast.md) |
| 화면 안에 남는 안내 | [Notice](notice.md) |
| 트리거 옆에 뜨는 비모달 내용 | [Popover](popover.md) |
| 사진 출처 고르기 | [PhotoSourceSheet](photo-source-sheet.md) |
| 화면 옆 보조 패널 | [SidePanel](side-panel.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Dialog` | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` | 기본 |
| `OverlayStackProvider` | `@hjmds/react`, `/overlay-stack` | 없음 | 명령형 열기(`useDialog`·`useSheet`·`useOverlayStack`) |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Dialog } from "@hjmds/react/overlays";

<Dialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  title={t("album.rename.title")}
  description={t("album.rename.description")}
  closeLabel={t("common.close")}
  busy={saving}
  footer={<Button onClick={save} loading={saving}>{t("common.save")}</Button>}
>
  {/* 제품 본문: TextField 등 */}
</Dialog>
```

```tsx
// Native
import { Dialog } from "@hjmds/react-native/overlays";

<Dialog
  open={open}
  onOpenChange={(next) => setOpen(next)}
  title={t("album.rename.title")}
  description={t("album.rename.description")}
  closeLabel={t("common.close")}
  busy={saving}
  primaryAction={{ label: t("common.save"), onPress: save }}
  secondaryAction={{ label: t("common.cancel"), onPress: () => setOpen(false), tone: "secondary" }}
>
  {/* 제품 본문 */}
</Dialog>
```

```tsx
// Web 명령형: 앱 루트에 <OverlayStackProvider>를 두고
import { useDialog } from "@hjmds/react/overlay-stack";

const openDialog = useDialog();
const handle = openDialog({ title: t("album.rename.title"), closeLabel: t("common.close"), children: body });
await handle.closed; // portal 제거·초점 복구 뒤. 다음 오버레이는 여기서 연다
```

## 축과 기본값

- `size`: `small`(최대 320) · `medium`(기본, 420) · `large`(640).
- `dismissible`: 기본 `true`. `false`면 닫기 버튼과 바깥·Escape/back 닫기가 사라진다.
- `busy`: 기본 `false`. 비동기 작업 중에는 `open`을 유지하고 `busy`로 반복 행동과 닫기를 막는다.
- `closeLabel`은 양쪽 필수다. 닫힘 사유: Web `escape`·`outside`·`close-action`, Native `back`·`outside`·`close-action`.

## 꼭 지킬 것

- 제목·설명·버튼·`closeLabel`은 i18n 키로 넣는다. 긴 문구는 자르지 않는다(계약이 줄바꿈·스크롤을 보장).
- 다음 오버레이는 닫힘 완료 뒤에 연다. Web은 `onDismissComplete` 또는 `handle.closed`를 쓰고 0ms 타이머로 추측하지 않는다.
  `OverlayStackProvider`는 한 번에 하나만 연다.
- Native에서 `title`에 요소를 넘기면 `accessibilityTitle`이 필수다.
- 배치 변경은 Native `contentStyle`(layout 전용)만 쓴다. 높이는 `size`로 정한다. Web은 `className`만 받으며 시각 override에 쓰지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행동 영역 | `footer`(ReactNode) | `primaryAction`·`secondaryAction`(`OverlayAction`) |
| 트리거 | `trigger` 요소 | 없음(`open` 제어 또는 `defaultOpen`) |
| `title`·`description` | ReactNode | `title`은 string 또는 요소+`accessibilityTitle`, `description`은 string |
| 닫힘 완료 신호 | `onDismissComplete` | 없음 |
| 초점 | `initialFocusRef`·`returnFocusRef` | `returnFocusRef` |
| 모달 층·마운트 | `modalPriority`, `portalContainer` | 없음. RN `Modal` prop(`onShow` 등)을 그대로 받음 |
| 명령형 API | `OverlayStackProvider` | 없음 |

## 함정

- Native action의 `onPress`는 콜백을 실행하고 `close-action`을 요청할 뿐이다. 제어형이면 닫을지는 `onOpenChange`를 받은 소유자가 정한다.
- Native는 제어형과 비제어형을 렌더 중에 바꾸면 예외가 난다.
