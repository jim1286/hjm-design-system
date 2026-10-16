# AccountSwitcher

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: `src/task-controls.ts`의 `resolveTaskChoice`, 양 renderer `src/task-controls.tsx`, [선택과 실제 실행 구성](../compositions/task-controls.md)
- 스토리북: `배포/구성/탐색과 이동/계정 전환`

## 언제 쓰나

확인된 현재 계정을 보여 주고 메뉴에서 다른 계정을 골라 실제 세션 전환을 요청할 때 쓴다.
선택만 바꾸는 메뉴와 달리 메뉴가 닫힌 뒤 제품의 `onSwitch`가 끝날 때까지 기다리며, 그동안
`accountId`는 바뀌지 않는다. 2026-10-15 선택과 실행 상태를 혼동하지 않도록 구성으로 도입했다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 선택만 바꾸고 요청이 없는 메뉴 | [Menu](menu.md) |
| 모드 선택 뒤 주요 행동 실행 | `SplitAction`([선택과 실제 실행](../compositions/task-controls.md)) |
| 화면 안에서 항목 하나를 고르는 폼 | [RadioGroup](radio-group.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `AccountSwitcher` | 확인된 계정 표시와 전환 요청 | `@hjmds/react/task-controls` | `@hjmds/react-native/task-controls` |

계정 항목 타입 `TaskChoice`는 `@hjmds/design-contracts/task-controls`에서 import한다. 루트 barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { AccountSwitcher } from "@hjmds/react/task-controls";

<AccountSwitcher label={t("account.switch")} dismissLabel={t("common.close")}
  accounts={accounts} accountId={session.accountId}
  errorLabel={t("account.switchFailed")}
  onSwitch={async id => { const next = await switchSession(id); setSession(next); }} />
```

```tsx
// Native
import { AccountSwitcher } from "@hjmds/react-native/task-controls";

<AccountSwitcher label={t("account.switch")} dismissLabel={t("common.close")}
  accounts={accounts} accountId={session.accountId}
  errorLabel={t("account.switchFailed")}
  onSwitch={async id => { const next = await switchSession(id); setSession(next); }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| accounts | `readonly TaskChoice[]`(`id`·`label`·`description?`·`disabled?`) | 필수 | 메뉴 항목. id 중복이면 오류 |
| accountId | string | 필수 | 제품이 확인한 현재 계정. `accounts`에 없으면 오류 |
| label | string | 필수 | 메뉴 트리거 버튼 문구와 메뉴 이름 |
| dismissLabel | string | 필수 | Native 메뉴 닫기 문구. Web Menu에는 전달하지 않는다 |
| errorLabel | string | 필수 | 전환 실패 문구 |
| onSwitch | `(accountId) => void \| Promise<void>` | 필수 | 실제 세션 전환. reject하면 실패 상태 |
| disabled | boolean | false | 메뉴 잠금과 요청 무시 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭 안의 세로 묶음. 트리거는 기본 크기 `Button`(tone `secondary`) | 양 renderer `AccountSwitcher`·`ChoiceMenu` |
| 간격 | 현재 계정·트리거·실패 문구 사이 `spacing.sm` 12 | `Stack gap="sm"` |
| 순서·정렬 | 현재 계정 이름(strong) → 계정 메뉴 버튼 → 실패 시 중앙 정렬 오류 문구 | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음. 메뉴 표면은 Web 트리거 앵커 portal, Native 화면 가운데 `Modal` | [Menu](menu.md) |
| 좁은 폭·큰 글자 | 계정 이름과 오류 문구는 줄바꿈된다. 메뉴 폭·높이 상한은 Menu를 따른다 | [Menu](menu.md) |

## 꼭 지킬 것

- `onSwitch`는 실제 세션 전환이 끝난 뒤 resolve하고, 제품이 확인한 계정으로 `accountId`를 갱신한다. HJM은 낙관적으로 계정을 바꾸지 않는다.
- 계정 목록·권한·세션 저장은 제품이 소유한다. 현재 계정 이름 줄을 제품 레이아웃으로 다시 그리지 않는다.
- 모든 계정이 `disabled`이면 메뉴 대신 비활성 버튼만 남는다. 빈 상태 안내는 제품 문구로 주변에 둔다.

## 상태와 상호작용

| 상태 | 모습 | 동작 |
| --- | --- | --- |
| 기본 | 현재 계정 + 메뉴 버튼, 메뉴에 현재 계정이 단일 선택으로 표시 | Web `onActionAfterDismiss`, Native `onSelectionAfterDismiss` 뒤 요청 |
| 진행 중 | 트리거 버튼 로딩, 메뉴 잠금 | 같은 계정·비활성 계정 선택은 무시, 중복 요청 차단 |
| 실패 | 기존 계정 유지, `errorLabel` 중앙 표시 | Web `role="alert"`, Native `accessibilityRole="alert"`·assertive. 같은 메뉴로 재시도 |

언마운트되면 진행 중 응답을 분리해 이전 요청 결과가 새 화면 상태에 반영되지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 메뉴 | `Menu` 드롭다운, `dismissLabel` 미사용 | `Menu` Modal, `dismissLabel`로 닫기 |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"` |
