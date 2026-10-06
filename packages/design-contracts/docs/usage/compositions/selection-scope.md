# 대표 항목과 묶음 전체 선택

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [제품 상호작용 품질](../../../../../docs/INTERACTION_QUALITY.md), `showcase/web/src/patterns/SelectionScope.stories.tsx`, `showcase/native/src/SelectionScope.stories.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/상호작용 예제/대표 항목과 묶음 전체 선택`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/선택과 필터/대표 항목과 묶음 전체 선택`

## 언제 쓰나

사진 묶음·스레드처럼 대표 항목 하나와 묶음 전체가 같은 모양으로 보일 때, 공유·삭제·이동 전에 대상 범위와 개수를 고르고 문구로 확인한 뒤 적용하게 할 때 쓴다.

2026-10-02 조사에서 대표 항목과 전체 구성원을 같은 선택으로 오인할 위험을 확인했다. 길게 누르기나 작은 배지만으로 범위를 숨기는 방식은
발견성·접근성 때문에 쓰지 않는다. 기본 범위·공유 정책·실제 전송은 제품이 정한다.

같은 `상호작용 예제` 묶음: [선택 후 적용·취소](interaction-flow-apply.md) · [닫았다 열고 초안 이어쓰기](interaction-flow-draft.md) ·
[늦은 응답보다 최신 검색 유지](interaction-flow-search.md). 상태 문구 알림은 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)을 따른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Heading level="level3" semanticLevel={2}` | 질문형 제목 `t("share.scopeQuestion")` | [Heading](../components/heading.md) |
| `Text` | 묶음 설명: 대표 1개 포함 전체 N개 | [Text](../components/text.md) |
| `Button selected`(secondary) × 2 | 범위 선택: "대표만 · 1개" / "묶음 전체 · N개". 라벨에 개수를 넣는다 | [Button](../components/button.md) |
| `Text` | 선택 범위 요약(범위 이름 + 개수) | [Text](../components/text.md) |
| `Button`(primary) | 적용. 라벨에 개수를 넣는다 `t("share.apply", { count })`. 진행 중은 `loading` | [Button](../components/button.md) |
| `Text` 상태 | 적용 결과·안내·실패 | [Text](../components/text.md) |
| `Container`·`Stack` | 바깥 틀, 바깥 `gap="md"`, 범위 버튼 묶음 `gap="sm"` | [Container](../components/container.md), [Stack](../components/stack.md) |

## 배치

```text
┌ 바깥 틀: 스크롤(Web 문서, Native ScrollView 위아래 spacing.md 16) ┐
│ ← Container gutter 16(폭 600 미만)/20 · 최대 720 →                │
│ 이 묶음에서 무엇을 공유할까요?       Heading level3(24)           │
│ 묶음 설명(대표 1 · 전체 3)                 ↕ spacing.md 16        │
│ ┌ 범위 선택 ───────────────────────┐                              │
│ │ [ 대표 사진만 · 1개   ✓ ]        │ secondary, selected          │
│ │          ↕ spacing.sm 12         │                              │
│ │ [ 묶음 전체 · 3개       ]        │ secondary                    │
│ └──────────────────────────────────┘       ↕ spacing.md 16        │
│ 선택 범위: 대표 사진만 (1개)                                       │
│ [ 1개 공유 대상으로 정하기 ]         ← 주 행동(primary), 개수 포함 │
│ 결과·안내 (Web role=status, Native live region)                    │
│ ░ 하단 안전 영역(화면 host 소유) ░                                 │
└────────────────────────────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: `Container size="reading"` → `Stack gap="md"`. Native: `ScrollView` → `Container` → `Stack gap="md"` | 화면 본문 스크롤. 안전 영역은 화면 host(SafeArea·navigation header)가 준다. 입력이 없어 키보드 처리는 없다. 적용 버튼을 하단에 고정하면 [BottomCTA](../components/bottom-cta.md)가 하단 안전 영역을 맡는다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우는 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 최대 폭 `layout.readingMaxWidth` 720 |
| 질문·설명 | `Heading` + `Text` | 맨 위 | 사이 `spacing.md` 16 |
| 범위 선택 | `Button selected` × 2 | 설명 아래, 세로 묶음 | 각 `medium` 44(`control.buttonHeight`), 서로 `spacing.sm` 12 |
| 범위 요약 | `Text` | 범위 선택 아래 | `spacing.md` 16 |
| 주 행동 | `Button` 적용 | 요약 아래 | `medium` 44, `spacing.md` 16 |
| 결과 | `Text` 상태 | 맨 아래 | `spacing.md` 16 |

- 범위 버튼은 서로 가깝게(`spacing.sm` 12), 다른 덩어리와는 `spacing.md` 16으로 띄워 한 묶음으로 읽히게 한다.
- 순서는 좁은 범위(대표) → 넓은 범위(전체)다. 기본 선택은 스토리에서 대표 항목이지만 제품이 정한다.
- 범위 버튼은 `selected` 처리로 칠해져 primary로 세지 않는다. 화면의 primary는 적용 하나다([Button](../components/button.md) "한 화면 primary 하나"의 예외).
- 적용 버튼이 화면 하단 고정이면 [BottomCTA](../components/bottom-cta.md)에 두고 라벨의 개수는 유지한다.

근거: `src/component-recipes.ts`(`stackRecipe.gaps` = `spacing`, `buttonRecipe.states.selected`), `src/foundations.ts`(`control`·`layout`)

## 흐름과 상태

1. 화면은 묶음 설명과 기본 범위(대표)를 보여 준다.
2. 사용자가 범위 버튼을 누르면 `selected`가 옮겨 가고, 요약과 적용 버튼 라벨의 개수가 바뀐다. 이전 결과 문구는 지운다.
3. 적용을 누르면 그 범위의 항목 ID로 제품 작업(공유 대상 확정 등)을 실행한다. 끝날 때까지 적용 버튼은 `loading`이다.
4. 결과 문구로 몇 개에 적용했는지 알린다. 실패하면 범위는 그대로 두고 실패 문구를 알린다. 적용을 다시 누르면 같은 범위로 재요청한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 기본 범위 버튼 `selected`, 요약에 개수, 안내 문구 `share.chooseScope` | `selected`는 Web `aria-pressed`·Native 접근성 state로 알림 |
| 범위 변경 | 요약·적용 라벨의 개수 갱신, 결과 문구는 안내로 돌아감 | 같음 |
| 진행 중 | 적용 버튼 `loading`(누름 막힘·스피너), 범위 버튼 `disabled` | 포커스는 적용 버튼 유지 |
| 성공 | 결과 문구 `t("share.applied", { count })` | 결과 알림, 포커스는 적용 버튼 유지 |
| 실패 | 네트워크·서버 실패: 범위 유지, 결과 문구 `share.applyFailed`, 적용 버튼 다시 활성. 재요청도 실패하면 같은 문구를 다시 알린다 | 결과 알림(Web `role="status"`, Native live region + iOS 알림) |

- 상태→문구 키는 상수 표로 둔다(아래 `resultKey`·`scopeKey`). 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.
- 선택 범위는 제품의 안정적인 항목 ID와 권한으로 확정한다. 재시도 세대·늦은 응답 처리까지 필요하면 [저장과 재시도](action-recovery-save.md)의 세션을 합친다.

## 코드 골격

```tsx
// Web
import { useState } from "react";
import { Button } from "@hjmds/react/actions";
import { Heading } from "@hjmds/react/heading";
import { Container, Stack, Text } from "@hjmds/react/layout";

const scopeKey = { cover: "share.scope.cover", group: "share.scope.group" } as const;
const resultKey = { idle: "share.chooseScope", applied: "share.applied", failed: "share.applyFailed" } as const;

const [scope, setScope] = useState<"cover" | "group">("cover");
const [result, setResult] = useState<"idle" | "applying" | "applied" | "failed">("idle");
const count = scope === "cover" ? 1 : group.items.length;
const choose = (next: "cover" | "group") => { setScope(next); setResult("idle"); };
const apply = async () => {
  setResult("applying");
  try { await onApply(scope); setResult("applied"); } catch { setResult("failed"); }
};

<Container size="reading">
  <Stack gap="md">
    <Heading level="level3" semanticLevel={2}>{t("share.scopeQuestion")}</Heading>
    <Text as="p">{t("share.groupSummary", { total: group.items.length })}</Text>
    <Stack gap="sm">
      <Button tone="secondary" selected={scope === "cover"} disabled={result === "applying"} onClick={() => choose("cover")}>
        {t("share.coverOnly", { count: 1 })}
      </Button>
      <Button tone="secondary" selected={scope === "group"} disabled={result === "applying"} onClick={() => choose("group")}>
        {t("share.wholeGroup", { count: group.items.length })}
      </Button>
    </Stack>
    <Text as="p">{t("share.scopeSummary", { scope: t(scopeKey[scope]), count })}</Text>
    <Button loading={result === "applying"} onClick={() => void apply()}>{t("share.apply", { count })}</Button>
    <Text as="p" role="status">{t(resultKey[result === "applying" ? "idle" : result], { count })}</Text>
  </Stack>
</Container>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";
// scope·result·count·choose·apply·scopeKey·resultKey는 Web과 같다.

<ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container size="reading" gutter={gutter}>
    <Stack gap="md">
      <Heading level="level3" semanticLevel={2}>{t("share.scopeQuestion")}</Heading>
      <Text>{t("share.groupSummary", { total: group.items.length })}</Text>
      <Stack gap="sm">
        <Button tone="secondary" selected={scope === "cover"} disabled={result === "applying"} onPress={() => choose("cover")}>
          {t("share.coverOnly", { count: 1 })}
        </Button>
        <Button tone="secondary" selected={scope === "group"} disabled={result === "applying"} onPress={() => choose("group")}>
          {t("share.wholeGroup", { count: group.items.length })}
        </Button>
      </Stack>
      <Text>{t("share.scopeSummary", { scope: t(scopeKey[scope]), count })}</Text>
      <Button loading={result === "applying"} onPress={() => void apply()}>{t("share.apply", { count })}</Button>
      <StatusText>{t(resultKey[result === "applying" ? "idle" : result], { count })}</StatusText>
    </Stack>
  </Container>
</ScrollView>
```

`group`·`onApply`는 제품 소유다. `StatusText`는 [저장과 재시도의 공통 절](action-recovery-save.md#공통-세션과-상태-알림)의 helper(Android live region + iOS 알림)다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 틀 | 문서 스크롤 + `Container` | `ScrollView`(위아래 `spacing.md`) + `Container` |
| 이벤트 | `onClick` | `onPress` |
| `selected` 알림 | `aria-pressed` | 접근성 state |
| 상태 알림 | `role="status"` | live region(Android) + iOS 알림 호출(`StatusText`) |

## 함정

- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 스토리의 "다음 적용 실패시키기"(ghost)와 350ms 지연은 실패·진행 중을 확인하는 데모 전용이다. 제품에 넣지 않는다.
