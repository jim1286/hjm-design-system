# Dialog

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Dialog](../../dialog.md), [명령형 오버레이](../../overlay-stack.md), recipe `dialogRecipe`(`src/component-recipes.ts`)
- 스토리북: `배포/컴포넌트/오버레이/대화상자`

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
| 화면 옆 보조 패널 | [SidePanel](side-panel.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Dialog` | 기본 | `@hjmds/react`, `/overlays` | `@hjmds/react-native`, `/overlays` |
| `OverlayStackProvider` | 확장 — 명령형 열기(`useDialog`·`useSheet`·`useOverlayStack`) | `@hjmds/react`, `/overlay-stack` | 없음 |

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
  footer={
    <>
      <Button tone="secondary" onClick={() => setOpen(false)} disabled={saving}>{t("common.cancel")}</Button>
      <Button onClick={save} loading={saving}>{t("common.save")}</Button>
    </>
  }
>
  {body /* 제품 본문: TextField 등 */}
</Dialog>
```

```tsx
// Native
import { Dialog } from "@hjmds/react-native/overlays";

<Dialog
  open={open}
  onOpenChange={setOpen}
  onActionError={() => setSaveError(t("album.rename.failed"))}
  title={t("album.rename.title")}
  description={t("album.rename.description")}
  closeLabel={t("common.close")}
  busy={saving}
  primaryAction={{ label: t("common.save"), onPress: save }}
  secondaryAction={{ label: t("common.cancel"), onPress: () => undefined, tone: "secondary" }}
>
  {body /* 제품 본문 */}
</Dialog>
```

Native `save`는 저장 Promise를 반환한다. Dialog가 완료를 기다리고 성공했을 때 `close-action`으로 닫으므로
`onPress`에서 따로 `setOpen(false)`를 부르지 않는다. 실패는 Promise를 거절하고 `onActionError`에서 본문 오류로
표시한다. `void save()`로 반환값을 버리거나 오류를 잡아 성공으로 반환하면 성공으로 처리되므로 피한다.
이벤트 밖에서 시작한 요청은 외부 `busy`로 연결한다. 이전 즉시 닫힘 대응 예제가 현재 Promise 계약과 충돌해
2026-10-06 독립 재구현 검증에서 교정했다.

```tsx
// Web 명령형: 앱 루트에 <OverlayStackProvider>를 두고
import { useDialog } from "@hjmds/react/overlay-stack";

const openDialog = useDialog();
const handle = openDialog({ title: t("album.rename.title"), closeLabel: t("common.close"), children: body });
await handle.closed; // portal 제거·초점 복구 뒤. 다음 오버레이는 여기서 연다
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `small` · `medium` · `large` | `medium` | Native recipe 최대 폭 320 · 420 · 640. Web 최대 폭 28rem · 36rem · 48rem(아래 배치 표) |
| `dismissible` | `true` · `false` | `true` | `false`면 닫기 버튼과 바깥·Escape/back 닫기가 사라진다 |
| `busy` | `true` · `false` | `false` | 비동기 작업 중에는 `open`을 유지하고 `busy`로 반복 행동과 닫기를 막는다 |
| `closeLabel` | 현지화 문자열 | — | 양쪽 필수. 닫기 버튼의 접근성 이름 |
| `open`·`defaultOpen` | `boolean` | `false` | 제어형은 `open`+`onOpenChange`. Web 비제어형은 `trigger`가 필수다 |
| `onOpenChange` | `(open: boolean, detail: { reason }) => void` | — | Web `reason`: `"trigger"`·`"close-action"`·`"escape"`·`"outside"`. Native: `"close-action"`·`"back"`·`"outside"`. `busy`이거나 `dismissible={false}`면 닫기 요청을 보내지 않는다 |
| `onDismissComplete`(Web) | `(detail: { reason: "close-action" \| "escape" \| "outside" \| "programmatic" }) => void` | — | 한 번 열릴 때마다 한 번, portal 제거·초점 복구 뒤. 다음 오버레이는 여기서 연다 |
| `trigger`(Web) | `ReactElement`(버튼 요소) | — | 누르면 `reason: "trigger"`로 열린다 |
| `primaryAction`·`secondaryAction`(Native) | `{ label, onPress: () => void \| Promise<void>, tone?, disabled?, accessibilityHint? }` | — | 동기 함수는 같은 누름에서 닫힌다. Promise를 반환하면 기다리는 동안 누른 버튼이 loading이 되고 행동·닫기·back·바깥 닫기가 모두 막히며, 성공하면 `close-action`으로 닫힌다. 던지거나 거절되면 열린 채 행동이 다시 켜지고 `onActionError`를 호출한다. 외부 `busy`도 반복 행동·닫기를 막는다. 미게시(1.12.1 이후) — 1.12.1은 Promise를 무시하고 바로 닫았다 |
| `onActionError`(Native) | `(error: unknown) => void` | — | action 실패를 본문 오류·재시도로 연결한다. 오류를 처리하는 동안 초안을 보존한다. 없으면 개발 빌드에서 실패마다 `console.error`를 남긴다(중복 제거 없음). 미게시(1.12.1 이후) |
| `children`(Native) | `ReactNode` | — | 고정된 제목 줄 아래 스크롤 본문(`ScrollView`) 안에 들어간다. `FlatList`·`SectionList`를 넣지 않는다 |
| `contentStyle`(Native) | 배치 key만(`HjmCompositionStyleProp`) | — | 대화상자 상자의 배치. 높이는 `size`로 |
| `useDialog()`(Web) | `(request) => { closed: Promise<void>, close(): void }` | — | request는 `open`·`defaultOpen`·`onOpenChange`·`trigger`를 뺀 DialogProps. `OverlayStackProvider` 안에서만 |

- Dialog는 `layoutStyle`을 받지 않는다(Web 제외 15개 중 하나 — 포털로 가운데 그려져 배치할 흐름 안 루트가 없다).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭(렌더 값): Native는 recipe 최대 폭 `small` 320 · `medium` 420 · `large` 640. Web은 `small` 28rem · `medium` 36rem · `large` 48rem이며 뷰포트 폭 − 32를 넘지 않는다. 닫기 버튼 44×44(`control.minTouchTarget`) | `src/component-recipes.ts`(`dialogRecipe`), `packages/react/src/styles.css` `.hjm-dialog*` |
| 간격 | 화면 가장자리와 최소 `spacing.md` 16. Web: 머리 위·좌우 `spacing.lg` 20, 본문 사방 `spacing.lg` 20, footer 좌우·아래 `spacing.lg` 20, footer 버튼 간격 `spacing.sm` 12. Native: 안쪽 `small` `spacing.lg` 20 · `medium`/`large` `spacing.xl` 24, 영역 사이 `spacing.md` 16, 제목–설명 `spacing.xs` 8, 머리–닫기 `spacing.sm` 12, 버튼 간격 `spacing.sm` 12 | `packages/react/src/styles.css` `.hjm-overlay`, `packages/react-native/src/overlays.tsx`(`Dialog`, `OverlayActions`) |
| 순서·정렬 | 화면 가운데에 뜨고 뒤는 scrim이 덮는다. 위에서 머리(제목·설명 \| 닫기) → 본문 → 행동 영역. 닫기 버튼은 머리 끝. 행동 순서는 **보조 → 주**. Web footer는 끝 정렬. Native는 두 버튼을 같은 폭으로 나란히 둔다. 버튼은 둘까지 둔다(Native `primaryAction`·`secondaryAction`). 파괴 행동은 `tone: "danger"`이지만 확인만 받는다면 [AlertDialog](alert-dialog.md)다 | 같은 파일 |
| 고정·스크롤 | Web은 대화상자 전체 높이가 뷰포트 − 32이고 넘치면 대화상자 안에서 스크롤한다. Native는 safe area 안의 가용 높이를 제한하고 머리 줄(제목·닫기)을 스크롤 밖에 고정한다. 설명과 본문은 함께 내부 ScrollView(`DialogScrollBody`)에서 전체 폭으로 스크롤하고, 행동도 스크롤 밖에 유지한다. 그래서 긴 본문을 스크롤해도 닫기에 닿는다. 목록 탐색처럼 긴 작업은 [Sheet](sheet.md)를 선택한다 | `packages/react-native/src/overlays.tsx` `Dialog`·`DialogScrollBody` |
| 좁은 폭·큰 글자 | Web footer는 넘치면 줄바꿈한다. Native는 `textScale ≥ 1.6`이거나 창 폭 < 480이면 버튼을 세로로 쌓고, 이때 보조가 위·주 행동이 아래다 | `packages/react-native/src/overlays.tsx` |

```text
┌ scrim ──────────────────────────────────────┐
│  ← spacing.md 16 →                          │
│   ┌ Dialog (medium) ───────────────────┐    │
│   │ 앨범 이름 바꾸기               [×] │ ← 머리, 닫기 44(Native는 고정)
│   │ 설명 문구                          │ ┐
│   │ ┌ 본문(제품): TextField ─────────┐ │ │ Native 스크롤 영역
│   │ └────────────────────────────────┘ │ ┘
│   │                    [취소] [저장]   │ ← 보조 → 주, 끝 정렬(Web), 스크롤 밖 고정
│   └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
Native, 큰 글자 또는 폭 < 480:   [      취소      ]
                                 [      저장      ]  ← 주 행동이 아래
```

## 꼭 지킬 것

- Native `primaryAction`·`secondaryAction`은 Promise 완료 후 닫힌다. 처리 중 중복 실행·닫기를 막고, 거부되면 그대로 유지한다. `onActionError(error)`에서 제품이 지역화 오류와 재시도를 표시한다. 단순 호출을 성공으로 간주하면 초안이 유실되므로 완료를 기다린다(2026-10-06 지침 대조에서 발견).

- 제목·설명·버튼·`closeLabel`은 i18n 키로 넣는다. 긴 문구는 자르지 않는다(계약이 줄바꿈·스크롤을 보장).
- 다음 오버레이는 닫힘 완료 뒤에 연다. Web은 `onDismissComplete` 또는 `handle.closed`를 쓰고 0ms 타이머로 추측하지 않는다.
  `OverlayStackProvider`는 한 번에 하나만 연다.
- Native에서 `title`에 요소를 넘기면 `accessibilityTitle`이 필수다.
- Native `children`에 `FlatList`·`SectionList`를 넣지 않는다. 본문이 이미 ScrollView 안이라 가상화가 풀리고 경고가 난다.
  긴 목록은 [Sheet](sheet.md)나 `map`으로 그린 짧은 목록을 쓴다.
- Native에서 저장처럼 실패할 수 있는 action은 `onActionError`를 넘긴다. 단발성 작업에 Promise를 반환하면 완료까지 닫히지 않으므로, 즉시 닫으려면 아무것도 반환하지 않는다.
- 배치 변경은 Native `contentStyle`(layout 전용)만 쓴다. 높이는 `size`로 정한다. Web은 `className`만 받으며 시각 override에 쓰지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 행동 영역 | `footer`(ReactNode) | `primaryAction`·`secondaryAction`(`OverlayAction`) |
| 트리거 | `trigger` 요소 | 없음(`open` 제어 또는 `defaultOpen`) |
| `title`·`description` | ReactNode | `title`은 string 또는 요소+`accessibilityTitle`, `description`은 string. 설명은 닫기 옆이 아니라 본문과 같이 스크롤한다 |
| 닫힘 완료 신호 | `onDismissComplete` | 없음 |
| 초점 | `initialFocusRef`·`returnFocusRef` | `returnFocusRef` |
| 모달 층·마운트 | `modalPriority`, `portalContainer` | 없음. RN `Modal` prop(`onShow` 등)을 그대로 받음 |
| 명령형 API | `OverlayStackProvider` | 없음 |

## 함정

- Native action은 반환된 Promise가 성공한 뒤 닫기를 요청한다. 거절되면 열린 상태를 유지하며 `onActionError`에서 제품 오류 문구를 연결한다. 처리 중 중복 누름과 이전 요청의 늦은 닫힘을 차단한다.
- Native `DialogProps`는 RN `Modal` props(`style` 포함)를 그대로 받는다. 배치는 `contentStyle`로만 준다.
- Native는 제어형과 비제어형을 렌더 중에 바꾸면 예외가 난다.
- Native 기본 렌더러 예제는 실제 저장 서버가 없는 동기 완료 예시다. 제품에서는 저장 Promise를 반환하며, 예제의 영문 고정 문구는 제품 i18n 키로 치환한다. 닫기는 action이 요청하는 `close-action`이 맡는다.

### 선택적인 트리거 형태 전환 (미게시 실험)

양 renderer의 `motionOrigin?: TransitionRect`는 열기 직전에 측정한 트리거의
`{ x, y, width, height }`를 받는다. Web은 getBoundingClientRect, Native는 measureInWindow로
얻은 물리 viewport/window 좌표를 전달한다. 별도 HJM morph wrapper를 만들지 않고 기존
Dialog의 제목·닫기·busy·초점 복귀·초안 소유 계약을 그대로 사용한다.

Web은 닫기 전환이 끝나야 portal을 제거하고 onDismissComplete와 초점 복귀를 실행한다.
닫는 동안 내용은 inert이며 빠른 재열기는 같은 subtree를 유지하고 오래된 완료를 취소한다.
Native는 실제 Modal 콘텐츠를 측정하며 콜백이 오지 않으면 기존 enter 시간 내 일반 표시로
복귀한다. 뒤늦은 측정으로 닫힌 세션을 되살리지 않는다. 측정이 없거나 모션 감소이면
공간 전환 없이 기존 표현을 쓴다. Native에서 진입 후 크기가 달라지면 이전 측정으로
닫지 않고 일반 fade로 복귀한다. 다음 open에서 다시 측정한다. 이 옵션의 실험은 `버튼에서 이어지는 편집` 구성이다.

초안은 제품 상태에 두고 닫을 때 삭제하지 않는다. 내용·화면 회전·키보드로 목적지 크기가
달라지는 흐름은 실제 기기 검증 후 채택한다. 원점이 다른 좌표계를 혼합하지 않는다.
