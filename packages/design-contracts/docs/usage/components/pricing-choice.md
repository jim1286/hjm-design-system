# PricingChoice

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [작업 선택 계약](../../task-controls.md), `src/task-controls.ts`의 `resolvePriceOption`, 양 renderer `src/task-controls.tsx`
- 스토리북: `배포/구성/선택과 필터/요금 주기 선택`

## 언제 쓰나

요금제·결제 주기 중 하나를 고르고, 선택한 실제 가격과 혜택을 확인한 뒤 [계속]으로 제품 결제 흐름을 시작할 때 쓴다.
선택은 controlled callback만 호출하고, 실제 요청은 계속 버튼에서만 시작한다. 실패하면 선택을 유지하고 같은 버튼으로 다시 시도한다.
묶음 사용 기준은 [선택과 실제 실행](../compositions/task-controls.md)이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 비동기 실행 없는 단순 선택 | [RadioGroup](radio-group.md) `presentation="card"` |
| 결제·약관·상품 검증 자체 | 제품 결제 흐름(onContinue 뒤) |
| 실행 방식 선택 + 즉시 실행 | `SplitAction`([선택과 실제 실행](../compositions/task-controls.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `PricingChoice` | 요금 선택 카드·가격·혜택·계속 | `@hjmds/react/task-controls` | `@hjmds/react-native/task-controls` |

루트 barrel에는 없다. `PriceOption` 타입과 `resolvePriceOption`은 `@hjmds/design-contracts/task-controls`에 있다.

## 최소 사용 예

```tsx
// Web
import { PricingChoice } from "@hjmds/react/task-controls";

<PricingChoice label={t("plan.title")} options={prices} selectedId={selectedId}
  onSelectionChange={setSelectedId} formatPrice={formatConfirmedPrice}
  continueLabel={t("plan.continue")} errorLabel={t("plan.failed")}
  onContinue={option => startCheckout(option.id)} />
```

```tsx
// Native
import { PricingChoice } from "@hjmds/react-native/task-controls";

<PricingChoice label={t("plan.title")} options={prices} selectedId={selectedId}
  onSelectionChange={setSelectedId} formatPrice={formatConfirmedPrice}
  continueLabel={t("plan.continue")} errorLabel={t("plan.failed")}
  onContinue={option => startCheckout(option.id)} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | Card 제목이자 RadioGroup 접근성 이름 |
| `options` | `PriceOption[]` | 필수 | `{ id, label, description?, disabled?, amountMinor, currency, interval: "month" \| "year", intervalCount, benefits }`. `amountMinor`는 0 이상 안전 정수, `currency`는 대문자 3자, `intervalCount`는 1 이상 정수가 아니면 `RangeError` |
| `selectedId` / `onSelectionChange` | `string` / `(id) => void` | 필수 | controlled. 목록에 없는 id·중복 id는 `TypeError` |
| `formatPrice` | `(option) => string` | 필수 | 라디오 설명과 선택 가격 줄에 같이 쓴다 |
| `continueLabel` / `errorLabel` | `string` | 필수 | 계속 버튼·실패 문구 |
| `onContinue` | `(option) => void \| Promise<void>` | 필수 | 선택 옵션의 고정된(frozen) 사본을 받는다. reject하면 실패 표시 |
| `disabled` | `boolean` | `false` | 선택과 계속을 모두 잠근다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Card 하나 안에 RadioGroup `presentation="card"`, 계속 Button 기본 크기 | 양 renderer `PricingChoice` |
| 간격 | Card 안 `Stack gap="md"`(16) | 같은 구현, `foundations.ts` space.md |
| 순서·정렬 | Card 제목 → 주기별 라디오 카드 → 선택한 가격(strong) → 혜택 줄 → [계속] → 실패 문구(가운데 정렬) | 렌더 순서 |
| 고정·스크롤 | 자체 고정·스크롤 없음 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 라디오 카드·혜택 Text는 줄바꿈되고 버튼은 Card 폭 안에 머문다 | 양 renderer |

## 꼭 지킬 것

- `formatPrice`는 실제 `amountMinor`·`currency`·`interval`·`intervalCount`와 일치해야 한다. 할인율·월 환산액을 추정해 넣지 않는다.
- 옵션 선택으로 결제를 시작하지 않는다. 결제·약관·상품 검증은 `onContinue` 뒤 제품 흐름 책임이다.
- 선택 옵션이 `disabled`이면 계속 버튼도 비활성이다. 비활성 옵션은 선택 callback을 호출하지 않는다.

## 상태와 상호작용

진행 중에는 계속 버튼이 로딩이 되고 라디오 선택이 잠긴다(중복 요청 차단). 실패하면 선택을 유지하고 Card 안에 오류 문구를 가운데 정렬로 표시한다(Web `role="alert"`).
