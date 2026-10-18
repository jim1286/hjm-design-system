# ModerationScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.17.1
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소통/신고와 차단`

## 언제 쓰나

게시물·댓글·사용자 **신고** 화면에 쓴다. 사유 선택, 사유를 고르기 전까지 막힌 신고 버튼,
선택적인 차단 버튼과 그 확인 대화상자를 [ScreenLayout](screen-layout.md) 위에 조합한다.
운영자가 신고·이의 신청을 처리하는 화면은 `variant="review"`(1.31.0), 편지·카드·Sheet 안에서 펼치는 신고는
화면 틀 없는 `ModerationForm`(1.31.0)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 차단·삭제 확인만 필요 | [AlertDialog](alert-dialog.md) |
| 신고 진입 메뉴(⋯) | [Menu](menu.md) |
| 자유 입력 위주의 문의 폼 | [Form](form.md), [EditorScreen](editor-screen.md) |
| 편지·카드·Sheet 안 신고에 ModerationScreen을 넣고 `contentInset="none"`으로 틀을 끄기 | `ModerationForm` |
| 운영자 처리 화면을 TextArea·Button·Alert로 직접 조립 | `variant="review"` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ModerationScreen` | supplemental, 루트 barrel에 없음 | `/screen-flows` | `/screen-flows` |
| `ModerationForm` | companion(1.31.0). 화면 틀 없는 같은 폼 | `/screen-flows` | `/screen-flows` |
| `ModerationDecision`·`ModerationDecisionReason`·`ModerationFields`·`ModerationFormProps` (타입) | 운영자 결정·처리 사유·두 변형의 공통 필드·폼 props | `/screen-flows` | `/screen-flows` |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { ModerationScreen } from "@hjmds/react/screen-flows";

<ModerationScreen
  title={t("report.title")}
  exit={{ kind: "close", label: t("common.close"), onClick: closeReport }}
  reasonLabel={t("report.reason")}
  reasons={[
    { value: "spam", label: t("report.reason.spam") },
    { value: "abuse", label: t("report.reason.abuse") },
  ]}
  reason={reason}
  onReasonChange={setReason}
  submit={{ label: t("report.submit"), onAction: submitReport, pending: reporting }}
  block={{
    action: { label: t("report.block"), onAction: () => {} },
    confirmation: {
      mode: "confirm", tone: "danger",
      title: t("block.confirm.title"), description: t("block.confirm.body"),
      confirmLabel: t("block.confirm"), cancelLabel: t("common.cancel"),
      onConfirm: blockUser, fallbackErrorMessage: t("block.error"),
    },
  }}
/>
```

```tsx
// Native — props는 Web과 같다
import { ModerationScreen } from "@hjmds/react-native/screen-flows";

<ModerationScreen
  title={t("report.title")}
  exit={{ kind: "close", label: t("common.close"), onPress: closeReport }}
  reasonLabel={t("report.reason")}
  reasons={[
    { value: "spam", label: t("report.reason.spam") },
    { value: "abuse", label: t("report.reason.abuse") },
  ]}
  reason={reason}
  onReasonChange={setReason}
  submit={{ label: t("report.submit"), onAction: submitReport, pending: reporting }}
  block={{
    action: { label: t("report.block"), onAction: () => {} },
    confirmation: {
      mode: "confirm", tone: "danger",
      title: t("block.confirm.title"), description: t("block.confirm.body"),
      confirmLabel: t("block.confirm"), cancelLabel: t("common.cancel"),
      onConfirm: blockUser, fallbackErrorMessage: t("block.error"),
    },
  }}
/>
```

### 제품이 공급할 것

| 슬롯·prop | 내용 |
| --- | --- |
| `reasons`, `reasonLabel` | 지역화한 사유 목록과 그룹 이름. 기본으로 세로 RadioGroup을 그린다 |
| `reason`, `onReasonChange` | 선택된 사유(제어형, 없으면 `null`) |
| `reasonPicker` | 단계형 사유 목록 등 다른 선택 UI. 주면 기본 RadioGroup 대신 그린다 |
| `children` | 상세 설명 입력 등 추가 내용 |
| `submit` | 신고 행동 `{ label, onAction, disabled?, pending? }` |
| `block` | 차단 버튼 행동과 `AlertDialog` 확인 요청(`mode: "confirm"`) |
| ScreenLayout props | `title`, `description`, `exit`(push·모달로 여는 신고 화면의 닫기/뒤로, 헤더 시작 끝), `header`, `actions`, `notice`, `state`, `stateAction` 등(`footer` 제외) |

### 운영자 검토 `variant="review"` (1.31.0)

```tsx
// Native(Web은 exit의 onPress 대신 onClick)
<ModerationScreen
  variant="review"
  title={t("moderation.review")}
  exit={{ kind: "back", label: t("moderation.queue"), onPress: back }}
  decisionReason={{ label: t("moderation.reason"), description: t("moderation.reasonHint"), value: reason, onValueChange: setReason, maxLength: 500 }}
  decisions={[
    { id: "dismiss", label: t("moderation.dismiss"), pending: sending === "dismiss",
      confirmation: { mode: "confirm", title: t("moderation.dismissConfirm"), description: t("moderation.dismissHint"),
        confirmLabel: t("moderation.dismiss"), cancelLabel: t("common.cancel"), fallbackErrorMessage: t("common.error"), onConfirm: () => decide("dismiss") },
      onAction: () => {} },
    { id: "hide", label: t("moderation.hide"), tone: "danger", pending: sending === "hide", disabled: !detail.available,
      confirmation: { mode: "confirm", tone: "danger", title: t("moderation.hideConfirm"), description: t("moderation.hideHint"),
        confirmLabel: t("moderation.hide"), cancelLabel: t("common.cancel"), fallbackErrorMessage: t("common.error"), onConfirm: () => decide("hide") },
      onAction: () => {} },
  ]}
  {...(detail.resolution ? { resolution: <Notice tone="success" title={t("moderation.hidden")} description={detail.resolutionReason} /> } : {})}
>
  <ReportedContent detail={detail} />
</ModerationScreen>
```

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `"report"` · `"review"` | `"report"` | `review`면 아래 props를 쓰고 신고 props(`reasons`·`reason`·`submit`·`block` 등)는 받지 않는다 |
| `children` | `ReactNode` | — | 신고된 내용·신고 사유 등 검토 대상(DescriptionList·Notice 등 HJM 구성으로) |
| `decisionReason` | `{ label, value, onValueChange, description?, maxLength?, required?, disabled? }` | `required` `true` | 처리 사유 TextArea(제어형). `required`면 공백뿐인 사유로는 어떤 결정도 열리지 않는다 |
| `decisions` | `ModerationDecision[]`(`ScreenFlowAction` + `{ id, tone?, confirmation? }`) | `tone` `"secondary"` | 결정 버튼, footer에 순서대로 세로로 쌓인다(`spacing.xs` 8). `tone`은 `primary`·`secondary`·`danger`. `confirmation`(AlertDialog `confirm`)이 있으면 누를 때 확인창만 열고 `onConfirm`이 실행하며 `onAction`은 부르지 않는다(`block`과 같은 규칙). 한 결정이 `pending`이면 다른 결정과 사유 입력이 잠긴다. 본문 `state`가 `ready`가 아니어도 잠긴다 |
| `resolution` | `ReactNode` | — | 이미 처리된 신고. 주면 사유 입력과 결정 버튼 자리를 이것이 대체한다(footer 없음) |

### ModerationForm: 화면 틀 없는 신고 폼

ModerationScreen과 같은 필드(`variant` 두 가지 모두)를 [CompositionLayout](composition-layout.md) 하나로 그린다: (제목) → 본문(사유 선택 또는 검토 대상·처리 사유) → 행동(세로 쌓기 `spacing.xs` 8). 화면 머리·바깥 여백·footer 표면·스크롤이 없어 편지·카드(Surface) 안이나 Sheet 본문에 놓는다. 감싸는 표면·위치·스크롤은 host 소유다.

```tsx
// Web — 편지 아래에 펼친 신고
import { ModerationForm } from "@hjmds/react/screen-flows";

<Surface tone="subtle" radius="lg" padding="lg">
  <ModerationForm
    title={t("report.title")}
    reasons={reasons} reason={reason} onReasonChange={setReason} reasonLabel={t("report.reason")}
    submit={{ label: t("report.confirm"), pending: busy, onAction: report }}
    cancel={{ label: t("common.cancel"), disabled: busy, onAction: collapse }}
  >
    {error ? <Notice tone="danger" title={error} /> : null}
  </ModerationForm>
</Surface>
```

```tsx
// Native — Sheet 안: Sheet가 제목과 닫기를 가지므로 title·cancel을 생략한다
import { ModerationForm } from "@hjmds/react-native/screen-flows";

<Sheet open={open} onOpenChange={setOpen} title={t("report.title")} closeLabel={t("common.close")}>
  <ModerationForm reasons={reasons} reason={reason} onReasonChange={setReason} reasonLabel={t("report.reason")}
    submit={{ label: t("report.confirm"), pending: busy, onAction: report }} />
</Sheet>
```

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| 신고·검토 필드 | ModerationScreen과 같음 | — | `variant`·`reasons`…·`block` 또는 `decisionReason`·`decisions`·`resolution` |
| `title` | 문자열 | — | 구성 제목(`level3`, 문서 수준 `headingLevel` 기본 3). 제목 줄이 있는 Sheet·Dialog 안에서는 생략 |
| `headingLevel` | 1~6 | 3 | 제목의 문서 수준 |
| `cancel` | `ScreenFlowAction` | — | 행동 줄 맨 끝 ghost 버튼(펼친 신고 접기) |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용 |

화면 상태(`state`)가 없으므로 신고·결정 버튼은 사유·`disabled`·`pending`으로만 잠긴다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 사유는 세로 `RadioGroup`, 신고·차단은 `Button` 기본 크기 | `ModerationScreen`, `screen-flows.tsx` `Action` |
| 간격 | 화면 padding `spacing.md` 16; 본문 사유 선택–`children` `spacing.lg` 20; footer 신고–차단 `spacing.xs` 8(세로로 쌓은 버튼, `actionGroupRecipe.stackedGap`) | Web·Native `ModerationScreen` `Stack gap="lg"`·`gap="xs"` |
| 순서·정렬 | 헤더(제목) → 본문(사유 → 추가 설명 `children`) → footer(신고 primary → 차단 ghost). `review`: 본문(검토 대상 `children` → 처리 사유 TextArea 또는 `resolution`) → footer(결정 버튼, 주어진 순서). `ModerationForm`: (제목) → 본문 → 행동(… → `cancel` ghost) | 렌더 순서 |
| 고정·스크롤 | 헤더·footer 고정, 본문 화면 스크롤; 차단 확인은 AlertDialog 오버레이 | `ScreenLayout`, `AlertDialog` |
| 좁은 폭·큰 글자 | 사유 문구는 줄바꿈되고 항목이 세로로 늘어난다; footer 버튼은 세로로 쌓여 좁은 폭에서도 나란히 줄지 않는다 | `RadioGroup orientation="vertical"`, `Stack` |

## 꼭 지킬 것

- 신고 버튼은 `reason`이 `reasons` 안의 값이 아니거나 `state`가 `ready`가 아니면 자동으로 막힌다. `reasonPicker`를 쓸 때도 `reasons`에 유효한 값을 넣어야 버튼이 열린다.
- 차단 버튼의 `block.action.onAction`은 호출되지 않는다. 버튼은 확인 대화상자만 열고, 실제 차단은 `confirmation.onConfirm`에서 한다.
- 서버 신고·권한·차단 mutation, 완료 후 이동은 제품 소유다. 사유 목록과 정책 문구도 제품이 정한다.
- 신고 화면은 push·모달로 열리므로 `exit`로 나갈 길을 준다. 2026-10-17 화면 검토(S5)에서 exit 없는 예제가 나갈 수 없는 화면으로 렌더링됐다.
- 확인 대화상자의 성공 후 닫힘·실패 문구는 [AlertDialog](alert-dialog.md) 계약을 따른다.
- 운영자 결정의 문구·id·서버 결정 mutation은 제품 소유다. 결정이나 그 `confirmation`이 사라지거나 `resolution`이 오면 열린 확인창도 닫힌다.
- 편지·카드·Sheet 안 신고는 `ModerationForm`이다. ModerationScreen의 `contentInset`·`scroll`·`header`로 화면 틀을 지우지 않는다.
- `block`을 제거하면 열린 확인 세션도 종료한다. 나중에 차단 행동을 다시 공급해도 사용자가 버튼을 새로 눌러야 확인창이 열린다. 2026-10-13 사라진 행동의 확인 상태가 부활하던 경로를 수정했다. 대상이 바뀌는 제품은 대상 id를 화면 key/초안·요청 수명에 함께 연결한다.

## 근거

- `variant="review"`(1.31.0): 2026-10-18 앱 감사에서 utilverse 신고·이의 신청 처리 화면이 처리 사유 TextArea, 기각/숨기기 버튼 묶음, OS `Alert` 확인을 화면마다 직접 조립했다. 결정 문구는 큐마다 달라(기각·숨기기·유지·번복) props로 받고, 사유 필수·한 번에 한 결정·확인창 규칙은 HJM이 소유한다.
- `ModerationForm`(1.31.0): 같은 감사에서 diairy가 편지 안에 펼치는 신고에 ModerationScreen을 넣고 `contentInset="none"`·`scroll="content"`로 화면 틀을 끄면서도 머리 띠가 남았다(Dialog·Sheet는 자기 제목 줄을 가진다). 같은 필드·행동을 화면 틀 없이 그리는 companion으로 분리해 두 표현이 한 구현(`useModeration`)을 공유한다.
