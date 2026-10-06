# 숫자 변화와 메뉴 변형

- 단계: 구성
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Statistic](../../statistic.md), [선택 어댑터](../../optional-adapters.md), `showcase/web/src/components/OptionalMotion.stories.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/숫자 변화와 메뉴 변형`

## 언제 쓰나

선택 설치 모션(숫자 자리 단위 변화, 메뉴 형태 변환)을 기존 컴포넌트 자리에 끼워 넣을 때 쓴다. 숫자 지표가 사용자 행동으로
바뀌는 곳에 AnimatedStatistic을, 실행만 하는 짧은 작업 메뉴에 MorphingMenu를 둔다. 모션이 꺼진 환경에서는 둘 다 기본
컴포넌트 동작으로 돌아간다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| AnimatedStatistic (`/statistic-motion`) | 숫자 값 변화를 자리 단위로 보인다(optional peer `@number-flow/react` 0.6.2) | [Statistic](../components/statistic.md) |
| Button | 값을 바꾸는 행동 | [Button](../components/button.md) |
| MorphingMenu (`/menu-morph`) | 실행 전용 작업 메뉴(optional peer `bloom-menu` 0.1.0) | [Menu](../components/menu.md) |
| `Text role="status"` | 마지막 실행·갱신 결과 문구 | [Text](../components/text.md) |
| Stack | 세로 묶음 간격 | [Stack](../components/stack.md) |

## 배치

```text
┌ 제품 화면 Container(gutter) 안 ─────────────┐
│ Stack gap="md" 16                           │
│ 조회 수                                     │
│ 1,280           ← AnimatedStatistic         │
│ [ 조회 수 새로고침 ]  secondary             │
│ [ 작업 선택 ▾ ]   ← MorphingMenu 트리거     │
│   ├ 저장                                    │
│   ├ 공유                                    │
│   └ 삭제 (disabled)                         │
│ 결과 문구        ← Text role="status"       │
└─────────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 제품 화면의 `Container`(좌우 여백·최대 폭) 안에 `Stack gap="md"` | 본문 흐름 안. 스크롤·안전 영역은 화면(문서 스크롤)이 소유하고, 텍스트 입력이 없어 키보드 처리는 없다 | 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 요소 사이 `layout.contentGap` 16. 다른 구획과는 `layout.sectionGap` 24 |
| 지표 | AnimatedStatistic | 맨 위 | 값은 Statistic `comfortable`(`heading` 크기) |
| 값 갱신 | Button `secondary` | 지표 아래 | 높이 `medium` 44. 화면의 primary는 제품 주 행동에 남긴다 |
| 작업 메뉴 | MorphingMenu | 값 갱신 아래 | 트리거에서 펼쳐짐 |
| 결과 문구 | `Text as="p" role="status"` | 맨 아래 | — |

## 흐름과 상태

1. "조회 수 새로고침"을 누르면 제품이 새 값을 요청한다. 응답이 오면 `value`가 바뀌고 AnimatedStatistic이 바뀐 자리만 굴려 보인다.
2. "작업 선택"을 열면 메뉴가 트리거에서 형태를 바꿔 펼쳐진다. 항목을 고르면 `onAction(id)`가 오고 메뉴가 닫힌다. 제품은 결과를 상태로 바꿔 결과 문구 키를 고른다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 현재 값과 닫힌 메뉴, 안내 결과 문구(`post.actionHint`) | — |
| 진행 중 | 새로고침 Button `loading`(다시 누를 수 없음), 지표는 직전 값 유지 | Button의 진행 표시 |
| 실패 | 새로고침 요청 실패: 지표는 직전 값을 유지하고 결과 문구가 `stats.refreshFailed`. 버튼을 다시 누르면 재요청하고, 재요청도 실패하면 같은 문구를 다시 둔다. 메뉴 작업 실패도 같은 결과 문구 자리에 둔다 | `role="status"`로 알림 |
| 값 변화 | 자리 단위 숫자 전환 | 최종 값만 읽힌다 |
| 비활성 항목 | `disabled` 항목은 고를 수 없다 | — |
| reduced motion·RTL | AnimatedStatistic은 정적 값, MorphingMenu는 `Menu`로 돌아간다 | 같다 |
| 라틴 숫자가 아닌 numbering system, `ar`·`fa`·`he`·`ur` locale | AnimatedStatistic이 정적 값으로 그린다 | — |

상태→문구 키는 상수 표로 둔다(아래 `resultKey`). 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
import { Stack, Text } from "@hjmds/react/layout";
import { AnimatedStatistic } from "@hjmds/react/statistic-motion";
import { MorphingMenu } from "@hjmds/react/menu-morph";
import { Button } from "@hjmds/react/actions";

const resultKey = { idle: "post.actionHint", saved: "post.saved", shared: "post.shared", refreshFailed: "stats.refreshFailed" } as const;

<Stack gap="md">
  <AnimatedStatistic descriptor={{ id: "views", label: t("stats.views") }} value={views} locale={locale} />
  <Button tone="secondary" loading={refreshing} onClick={refresh}>{t("stats.refresh")}</Button>
  <MorphingMenu label={t("post.actions")} items={[
    { id: "save", label: t("post.save") },
    { id: "share", label: t("post.share") },
  ]} onAction={(id) => setResult(id === "share" ? "shared" : "saved")} />
  <Text as="p" role="status">{t(resultKey[result])}</Text>
</Stack>
```

```tsx
// Native
// 없음. MorphingMenu는 Native가 없다. Native AnimatedStatistic(`@hjmds/react-native/statistic-motion`)은 지표 전체를 rise로 전환한다.
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 스토리 | 있음 | 없음 |
| AnimatedStatistic 모션 | 숫자 자리 단위 NumberFlow | 지표 전체 `rise` 전환 |
| MorphingMenu | `/menu-morph` | 없음, `Menu`를 쓴다 |

## 함정

- AnimatedStatistic `descriptor`에 `value`를 넣지 않는다. 값은 `value` prop의 숫자로 받는다.
- MorphingMenu는 실행 전용이다. 선택 상태나 비동기 목록이 필요하면 `Menu`를 쓴다.
- optional peer를 설치하지 않으면 subpath import가 실패한다. 제품 package.json에 peer를 명시한다.
- 예제는 `Stack gap="md"`, secondary 값 변경 버튼과 `Text role="status"`를 사용한다. 작업 ID는 사용자 문구로 변환한 뒤 표시한다.
- 현재 스토리는 값을 로컬에서 바로 올려 진행 중·실패 상태가 없다. 서버 값을 새로고침하는 제품은 위 진행 중·실패 행을 따른다.
