# ModerationScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소통/신고와 차단`

## 언제 쓰나

게시물·댓글·사용자 **신고** 화면에 쓴다. 사유 선택, 사유를 고르기 전까지 막힌 신고 버튼,
선택적인 차단 버튼과 그 확인 대화상자를 [ScreenLayout](screen-layout.md) 위에 조합한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 차단·삭제 확인만 필요 | [AlertDialog](alert-dialog.md) |
| 신고 진입 메뉴(⋯) | [Menu](menu.md) |
| 자유 입력 위주의 문의 폼 | [Form](form.md), [EditorScreen](editor-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ModerationScreen` | supplemental, 루트 barrel에 없음 | `/screen-flows` | `/screen-flows` |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { ModerationScreen } from "@hjmds/react/screen-flows";

<ModerationScreen
  title={t("report.title")}
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
| ScreenLayout props | `title`, `description`, `header`, `leading`, `actions`, `notice`, `state`, `stateAction` 등(`footer` 제외) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout 폭(최대 720); 사유는 세로 `RadioGroup`, 신고·차단은 `Button` 기본 크기 | `ModerationScreen`, `screen-flows.tsx` `Action` |
| 간격 | 화면 padding `spacing.md` 16; 본문 사유 선택–`children` `spacing.lg` 20; footer 신고–차단 `spacing.sm` 12 | Web·Native `ModerationScreen` `Stack gap="lg"`·`gap="sm"` |
| 순서·정렬 | 헤더(제목) → 본문(사유 → 추가 설명 `children`) → footer(신고 primary → 차단 ghost) | 렌더 순서 |
| 고정·스크롤 | 헤더·footer 고정, 본문 화면 스크롤; 차단 확인은 AlertDialog 오버레이 | `ScreenLayout`, `AlertDialog` |
| 좁은 폭·큰 글자 | 사유 문구는 줄바꿈되고 항목이 세로로 늘어난다; footer 버튼은 세로로 쌓여 좁은 폭에서도 나란히 줄지 않는다 | `RadioGroup orientation="vertical"`, `Stack` |

## 꼭 지킬 것

- 신고 버튼은 `reason`이 `reasons` 안의 값이 아니거나 `state`가 `ready`가 아니면 자동으로 막힌다. `reasonPicker`를 쓸 때도 `reasons`에 유효한 값을 넣어야 버튼이 열린다.
- 차단 버튼의 `block.action.onAction`은 호출되지 않는다. 버튼은 확인 대화상자만 열고, 실제 차단은 `confirmation.onConfirm`에서 한다.
- 서버 신고·권한·차단 mutation, 완료 후 이동은 제품 소유다. 사유 목록과 정책 문구도 제품이 정한다.
- 확인 대화상자의 성공 후 닫힘·실패 문구는 [AlertDialog](alert-dialog.md) 계약을 따른다.
