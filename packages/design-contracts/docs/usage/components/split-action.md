# SplitAction

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [작업 선택 계약](../../task-controls.md), `src/task-controls.ts`의 `resolveTaskChoice`, 양 renderer `src/task-controls.tsx`
- 스토리북: `배포/구성/입력과 작성/분할 실행`

## 언제 쓰나

실행 버튼 하나와 실행 방식 선택 메뉴를 나란히 둔다. 선택한 방식(`modeId`)으로 실제 작업을 실행하고, 메뉴에서는
방식만 바꾼다. 방식 선택과 실행을 한 버튼에 섞으면 메뉴를 고르는 순간 작업이 실행되므로 두 행동을 분리했다.
배치·진행·실패 표시의 흐름은 [선택과 실제 실행](../compositions/task-controls.md) 구성 지침을 함께 본다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 실행 방식이 하나뿐인 행동 | [Button](button.md) |
| 고르는 즉시 적용되는 항목 목록 | [Menu](menu.md) |
| 계정·세션 전환 | `AccountSwitcher`([선택과 실제 실행](../compositions/task-controls.md)) |
| 요금 주기·상품 선택 후 계속 | `PricingChoice`([선택과 실제 실행](../compositions/task-controls.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `SplitAction` | 실행 버튼 + 방식 선택 메뉴 | `@hjmds/react/task-controls` | `@hjmds/react-native/task-controls` |

`TaskChoice` 타입은 `@hjmds/design-contracts/task-controls`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { SplitAction } from "@hjmds/react/task-controls";

<SplitAction modes={modes} modeId={modeId} onModeChange={setModeId}
  onExecute={id => exportReport(id)} executeLabel={mode => t("export.run", { mode: mode.label })}
  menuLabel={t("export.modes")} dismissLabel={t("common.close")} errorLabel={t("export.failed")} />
```

```tsx
// Native
import { SplitAction } from "@hjmds/react-native/task-controls";

<SplitAction modes={modes} modeId={modeId} onModeChange={setModeId}
  onExecute={id => exportReport(id)} executeLabel={mode => t("export.run", { mode: mode.label })}
  menuLabel={t("export.modes")} dismissLabel={t("common.close")} errorLabel={t("export.failed")} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `modes` | `readonly TaskChoice[]`(`{ id, label, description?, disabled? }`) | 필수 | id는 비지 않고 서로 달라야 한다. 아니면 던진다 |
| `modeId` | string | 필수 | 제어값. `modes`에 없으면 던진다 |
| `onModeChange` | `(id) => void` | 필수 | 메뉴에서 고른 방식. 잠금 중이거나 비활성 방식이면 부르지 않는다 |
| `onExecute` | `(modeId) => void \| Promise<void>` | 필수 | 실제 작업. Promise가 끝날 때까지 진행 중이다 |
| `executeLabel` | `(mode: TaskChoice) => string` | 필수 | 실행 버튼 문구 |
| `menuLabel` · `dismissLabel` · `errorLabel` | string | 필수 | 메뉴 trigger·닫기(Native Menu)·실패 문구 |
| `disabled` | boolean | false | 실행과 메뉴를 함께 잠근다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 두 버튼 모두 [Button](button.md) 기본 `medium`(높이 44) | `task-controls.tsx` |
| 간격 | 실행·메뉴 사이 `spacing.xs` 8, 버튼 줄과 실패 문구 사이 `spacing.sm` 12 | `Stack gap="xs"`, 바깥 `Stack gap="sm"` |
| 순서·정렬 | [실행(primary)] → [방식 메뉴(secondary)], 실패 문구는 아래 가운데 정렬 | 양 renderer |
| 고정·스크롤 | 자체 고정·스크롤 없음. 놓는 영역이 정한다 | — |
| 좁은 폭·큰 글자 | 버튼 줄이 `wrap`으로 다음 줄로 넘어간다 | `Stack axis="inline" wrap` |

모든 방식이 `disabled`이면 메뉴 대신 비활성 버튼 하나(`menuLabel`)만 그린다.

## 꼭 지킬 것

- 메뉴 선택은 방식만 바꾼다. 선택만으로 작업을 실행하지 않는다.
- 진행 중(`onExecute` 대기)에는 실행 버튼이 loading이고 메뉴가 잠긴다. 실패하면 `errorLabel`을 경고로 알리며, 재시도는 같은 실행 버튼이다.
- 모든 문구는 제품 i18n에서 만든다. 실행 결과·권한·서버 요청은 제품이 소유한다.
- 같은 배치를 Button·Menu로 다시 조립하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 메뉴 | `Menu` trigger 버튼, 고른 뒤 닫히고 `onModeChange` | `Menu` + `dismissLabel` 닫기, 닫힌 뒤 `onModeChange` |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"` |

## 관련 지침

[선택과 실제 실행](../compositions/task-controls.md), [Button](button.md), [Menu](menu.md).
