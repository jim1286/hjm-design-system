# 복합 입력 모음

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-15
- 근거: [복합 입력 계약](../../compound-controls.md), `showcase/shared/compound-controls.ts`, `showcase/{web/src/patterns,native/src}/compound-previews.tsx`
- 스토리북: `배포/구성/비교와 검증/복합 입력 모음`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

기존 컨트롤을 묶은 네 가지 복합 입력(소요 시간, 버튼 자리 확인, 이모지 반응, 알림 종)을 화면 안 한 블록으로 둘 때 쓴다.
스토리 네 개(소요 시간 선택·버튼 안에서 확인·이모지 반응·알림 상태)가 각각 "제목 → 설명 → 컨트롤 → 결과" 블록 하나를 보인다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Heading level="level3"` | 블록 제목(24). 문서 단계는 화면 구조에 맞춰 `semanticLevel` | [Heading](../components/heading.md) |
| Text `tone="muted"` | 설명·안내 | [Text](../components/text.md) |
| DurationField (`/duration-field`) | 시·분·초로 정수 초를 고른다 | [NumberField](../components/number-field.md) |
| InlineConfirm (`/inline-confirm`) | 오버레이 없이 버튼 자리에서 한 번 더 확인(트리거·확인 `danger`, 취소 `ghost`) | [Button](../components/button.md) |
| ReactionPicker (`/reaction-picker`) | 반응 하나를 고르거나 해제(`ghost` `pill` 토글 버튼 묶음) | [Button](../components/button.md) |
| NotificationBell (`/notification-bell`) | 읽지 않은 수가 있는 종 아이콘 버튼 | [IconButton](../components/icon-button.md) |
| `Stack` | 블록 안 세로 쌓기 `gap="xl"` | [Stack](../components/stack.md) |
| `Container` · `ScrollView` | 바깥 틀. HJM 화면 골격이 소유한다 | [Container](../components/container.md), [화면 여백](../tokens/layout.md) |
| Switch, Button `ghost`·`primary` | 스토리의 실패 응답 토글·다시 시작·알림 추가(데모 전용, 제품에는 넣지 않는다) | [Switch](../components/switch.md), [Button](../components/button.md) |

## 배치

```text
┌ 화면 바깥 틀(제품 소유) ───────────────────────────┐
│ Web: 문서 스크롤 · Native: ScrollView              │
│ ↕ Native 위아래 spacing.lg 20                      │
│ ←gutter 16|20→ Container ←gutter 16|20→           │
└────────────────────────────────────────────────────┘

소요 시간 선택                          버튼 안에서 확인
┌── Stack gap spacing.xl 24 ──────┐     ┌── Stack gap spacing.xl 24 ──────────┐
│ 제목 (Heading level3)           │     │ 제목                                 │
│ 설명 (muted)                    │     │ 설명 (muted)                         │
│ 집중할 시간                     │     │ [ 초안 삭제 ] danger ← 처음 트리거   │
│ [− 시 +] [− 분 +] [− 초 +]      │     │   ↓ 누르면 같은 자리에서             │
│   ↑ 칸 사이 spacing.md 16,      │     │ 이 초안을 삭제할까요?                │
│     좁거나 큰 글자면 줄바꿈      │     │ (오류 문구, 실패 때만)               │
│ 총 1,500초  ← 결과              │     │ [유지하기] [삭제하기]  ← 취소 → 확인  │
└─────────────────────────────────┘     │   ghost     danger, 사이 spacing.sm 12│
                                        └──────────────────────────────────────┘
이모지 반응                              알림 상태
┌─────────────────────────────────┐     ┌──────────────────────────────────────┐
│ 제목                            │     │ (🔔 3)   ← NotificationBell           │
│ [👍] [💜] [🎉] [✨]  ← 하나 선택 │     │ 안내 (muted)                          │
│   ghost pill, 사이 spacing.xs 8 │     └──────────────────────────────────────┘
└─────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web 문서 스크롤 > `Container`. Native `ScrollView` > `Container` | 블록을 감싸는 제품 화면. 상단 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md))가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래는 `contentContainerStyle` `paddingVertical: spacing.lg` 20 |
| 블록 | `Stack gap="xl"` | 바깥 틀 안, 본문 흐름 | 자식 사이 `spacing.xl` 24 |
| 소요 시간 | DurationField | 설명 아래 | NumberField 세 칸, 칸 사이 `spacing.md` 16. 세 칸이 모두 들어가면 한 줄(칸 최대 `fieldGroupRecipe.inline.maxWidth`), 아니면 세 칸 모두 세로([FieldGroup](field-group.md)) |
| 확인 | InlineConfirm | 트리거 자리 그대로 | 트리거와 확인 행동이 같은 자리, Button 높이 44, 질문·버튼 줄 사이 `spacing.sm` 12, 두 버튼 사이 `spacing.xs` 8 |
| 반응 | ReactionPicker | 제목 아래 | `ghost` `pill` Button 묶음, 사이 `spacing.xs` 8, 넘치면 줄바꿈 |
| 알림 종 | NotificationBell | 블록 맨 위, 시작 쪽 정렬. TopBar·헤더 끝에 둘 때는 `edge="end"` | IconButton(기본 `medium` 44) + CounterBadge `floating`(끝·위 모서리). `edge`(`start`·`end`·`both`)는 IconButton `edge`와 같은 값(`resolveIconButtonEdgeOverhang`, 44−24)/2 = 10을 벨 루트에 적용해 glyph 칸이 여백 선(TopBar 16)에 오고 배지는 아이콘 모서리를 지킨다 |

## 흐름과 상태

1. 소요 시간: 증감 버튼은 즉시, 타이핑은 blur에서 확정된다. 합계가 `min`~`max`로 clamp된다. `max`가 1시간 미만이면 시 칸이 비활성이다.
2. 버튼 안에서 확인: 트리거를 누르면 같은 자리에 질문과 [취소][확인]이 나온다. 확인하면 `onConfirm`이 돌고 성공·오류를 같은 자리에 보인다.
3. 확인이 실패(`onConfirm`의 throw·reject: 네트워크·서버 오류)하면 질문 아래 `errorLabel`이 나오고, 같은 확인 버튼이 다시 시도가 된다.
   다시 시도도 실패하면 같은 오류 문구가 남는다. 취소하면 트리거로 돌아간다.
4. 이모지 반응: 하나를 고르면 선택, 같은 것을 다시 누르면 해제, 다른 것을 누르면 바뀐다. 개수·저장은 제품 데이터다.
   서버에 저장하다 실패하면 값을 되돌리는 것은 [즉시 반영과 복구](action-recovery-optimistic.md)대로 제품이 한다.
5. 알림 종: 누르면 `onPress`만 온다. 읽음 처리는 제품이 한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 각 블록의 초기 값. InlineConfirm은 트리거 버튼 하나(`danger`) | — |
| 확인 대기 | 질문 + [유지하기][삭제하기] | Web은 취소에 처음 포커스, Escape는 취소하고 트리거로 포커스 복귀. Native는 질문이 live region, iOS 한 번 알림 |
| 진행 중 | InlineConfirm busy. 두 행동 비활성, 확인 버튼 `loading` + `pendingLabel`. DurationField·ReactionPicker·NotificationBell은 진행 상태가 없다 | Native iOS는 상태마다 한 번 알림, Web Escape 무시, 확인 버튼은 loading으로 재실행을 막고 키보드 초점 유지 |
| 실패 | InlineConfirm error. 질문 아래 `errorLabel`(Native `tone="danger"`), 확인 버튼으로 다시 시도 | Web `role="alert"`, Native `accessibilityRole="alert"` + iOS는 대기 중 음성을 끊고 알린다 |
| 재시도 실패 | 같은 `errorLabel`이 다시 나온다(busy → error로 바뀌므로 다시 알림) | 실패와 같다 |
| 확인 성공 | `successLabel`이 남는다 | Web `role="status"`에 해당 확인 묶음의 초점만 복귀(외부 초점 유지), Native live region. 초기화는 새 `key`로 remount |
| 알림 수 증가 | 종이 400ms 한 번 흔들린다 | 종 그림·배지는 숨기고 `label` 한 번만 읽는다 |
| reduced motion·배경·`active={false}` | 종이 흔들리지 않는다 | — |

- 문구(`labels`·확인 문구·반응 `label`·종 `label`)는 모두 제품이 i18n 키로 넣는다. 개수가 들어가는 문구는 `t(key, { count })`로 만든다.

## 코드 골격

```tsx
// Web
import { useState } from "react";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Icon } from "@hjmds/react/display";
import { DurationField } from "@hjmds/react/duration-field";
import { Heading } from "@hjmds/react/heading";
import { InlineConfirm } from "@hjmds/react/inline-confirm";
import { Container, Stack, Text } from "@hjmds/react/layout";
import { NotificationBell } from "@hjmds/react/notification-bell";
import { ReactionPicker } from "@hjmds/react/reaction-picker";

function CompoundBlocks() {
  const [seconds, setSeconds] = useState(1500);
  const [reaction, setReaction] = useState<string | null>(null);
  const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";
  return (
    <Container gutter={gutter}>
      <Stack gap="xl">
        <Heading level="level3" semanticLevel={2}>{t("focus.title")}</Heading>
        <Text as="p" tone="muted">{t("focus.description")}</Text>
        <DurationField value={seconds} onValueChange={setSeconds} max={86399} labels={durationLabels} />
        <InlineConfirm key={draft.id} label={t("draft.delete")} prompt={t("draft.delete.prompt")}
          confirmLabel={t("draft.delete.confirm")} cancelLabel={t("draft.delete.cancel")}
          pendingLabel={t("draft.delete.pending")} successLabel={t("draft.delete.done")}
          errorLabel={t("draft.delete.error")} onConfirm={() => deleteDraft(draft.id)} />
        <ReactionPicker label={t("reaction.group")} options={reactions} value={reaction} onValueChange={setReaction} />
        <NotificationBell count={unread} label={t("inbox.unread", { count: unread })}
          icon={<Icon name="notifications" />} onPress={openInbox} />
      </Stack>
    </Container>
  );
}
```

```tsx
// Native
import { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { DurationField } from "@hjmds/react-native/duration-field";
import { Heading } from "@hjmds/react-native/heading";
import { InlineConfirm } from "@hjmds/react-native/inline-confirm";
import { NotificationBell } from "@hjmds/react-native/notification-bell";
import { Container, Icon, Stack, Text } from "@hjmds/react-native/primitives";
import { ReactionPicker } from "@hjmds/react-native/reaction-picker";

function CompoundBlocks() {
  const [seconds, setSeconds] = useState(1500);
  const [reaction, setReaction] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
      <Container gutter={resolveWindowClass(width) === "compact" ? "compact" : "regular"}>
        <Stack gap="xl">
          <Heading level="level3" semanticLevel={2}>{t("focus.title")}</Heading>
          <Text tone="muted">{t("focus.description")}</Text>
          <DurationField value={seconds} onValueChange={setSeconds} max={86399} labels={durationLabels} />
          <InlineConfirm key={draft.id} {...confirmLabels} onConfirm={() => deleteDraft(draft.id)} />
          <ReactionPicker label={t("reaction.group")} options={reactions} value={reaction} onValueChange={setReaction} />
          <NotificationBell count={unread} label={t("inbox.unread", { count: unread })}
            icon={<Icon descriptor={{ name: "notifications" }} renderGlyph={renderGlyph} />} onPress={openInbox} />
        </Stack>
      </Container>
    </ScrollView>
  );
}
```

`durationLabels`는 `{ label, hours, minutes, seconds, increment(unit), decrement(unit) }`를 제품이 현지화한다.
`confirmLabels`는 Web 예의 일곱 문구(`label`·`prompt`·`confirmLabel`·`cancelLabel`·`pendingLabel`·`successLabel`·`errorLabel`) 묶음이다.
반응 목록·이모지·개수, 삭제 동작과 서버 멱등성, `renderGlyph`(예: `createLucideGlyph`)는 제품 소유다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView`(위아래 `spacing.lg`) |
| 종 아이콘 | `<Icon name>` | `<Icon descriptor renderGlyph>` |
| 확인 알림 | 포커스 이동 + Escape, 오류 `role="alert"` | iOS 명시 알림, Android live region, 오류 `accessibilityRole="alert"` |
| 소요 시간 칸 줄바꿈 | flex-basis 계산으로 측정 없이 전부-또는-세로 | 잰 행 폭으로 같은 기준 계산 |

## 함정

- 반응 개수를 화면낭독기에 알려야 하면 옵션 `label` 문구 안에 개수를 넣는다. 보이는 이모지·개수 그림은 장식으로 숨겨진다.
- NotificationBell 누름이 읽음 처리를 하지 않는다. 제품이 count를 갱신해야 배지가 줄어든다.
- DurationField 범위 밖 `value`는 조용히 고치지 않고 오류를 던진다.
- InlineConfirm의 성공 상태는 다시 트리거로 돌아가지 않는다. 같은 자리에서 다시 쓰려면 새 `key`로 remount한다.
- 양 플랫폼 예제의 블록 제목은 `Heading level="level3"`(24)이다. 제품 문서 단계는 화면 구조에 맞는 `semanticLevel`로 지정한다. 기존 Web 32/Native 24의 근거 없는 차이는 2026-10-13 실제 구성 검수에서 통일했다.
- 현재 Native 스토리는 `ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}`로 좌우 여백과 간격을 직접 준다.
  좌우 여백은 `Container gutter`, 위아래는 `paddingVertical: spacing.lg`, 자식 간격은 `Stack gap="xl"`로 둔다([화면 여백](../tokens/layout.md)).
- 현재 스토리의 Switch "실패 응답 보기"·"예제 다시 시작"·"새 알림 추가" 버튼은 데모 조작이다. 알림 상태 스토리의 "새 알림 추가"는 primary라
  제품 화면에 옮기면 그 화면의 주 행동과 겹친다.


2026-10-13 실제 구성 검수에서 실패 설정을 요청 완료 시 읽어 진행 중 결과가 바뀌고, 같은 렌더의 연속 알림 추가가 하나로 합쳐지는 문제를 확인했다. 예제의 600ms 지연은 유지하되 실패 여부는 확인 시작 시 캡처하고, 새 알림은 함수형 갱신으로 모두 반영한다. 처리 중 설정 변경은 다음 확인에 적용된다. 다시 시작은 새 로컬 예제를 열며 이전 삭제 요청의 실제 취소를 뜻하지 않는다. Web 확인의 pending/success 초점 문제는 예제의 DOM 우회가 아니라 공개 InlineConfirm에서 고쳤다.

### 소요 시간의 하위 입력 그룹

`DurationField`는 `FieldGroup layout="inline"`으로 그룹 이름과 단위별 잠금을 연결하고, 각 값은 기존 NumberField로 편집한다. 좁은 영역에서는 시간·분·초 순서를 유지한 채 세 칸 모두 세로로 쌓는다. Native의 보이는 라벨은 각 단위만, 접근성 이름은 그룹 이름과 단위를 함께 전달한다. 그룹이 잠기거나 사라진 뒤 도착한 이전 단위 callback은 값을 바꾸지 않는다. 총 초 단위 값·상한 보정은 기존 duration-field 계약이 소유한다.

2026-10-13 날짜 직접 입력과 반복되던 그룹 제목·입력 행을 FieldGroup과 공통 `fieldGroupRecipe`로 옮겼다. 자세한 배치 축은 [관련 입력 묶음](field-group.md)을 따른다.

## 근거

- NotificationBell `edge`: 2026-10-17 1.27.2 채택 점검. Spint 홈·탐색 TopBar 끝의 벨은 IconButton을 감싸지만 `edge`가 없어 glyph 칸이 바 끝에서 26에 놓였다(Web 402·1280, LTR·RTL 측정 26 → 16, Native 3x 프레임: 버튼 끝 386 기준 15.7). 넘침은 안쪽 버튼이 아니라 벨 루트에 준다. 버튼에 주면 루트가 10 줄어 끝에 붙은 배지가 아이콘에서 10 안쪽으로 밀린다(측정: 배지 끝 − 버튼 끝 0 유지).
- 2026-10-17 구성 리뷰: 소요 시간 칸이 데스크톱에서 늘어나고 좁은 폭에서 한 칸만 다음 줄로 끊겨 FieldGroup recipe의 inline 규칙을 바꿨다.
