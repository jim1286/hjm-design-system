# 선택과 실제 실행

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-15
- 근거: [작업 선택 계약](../../task-controls.md), `src/task-controls.ts`, 양 renderer의 `src/task-controls.tsx`
- 스토리북: `배포/구성/입력과 작성/분할 실행`, `배포/구성/입력과 작성/비밀번호 규칙 확인`, `배포/구성/탐색과 이동/계정 전환`, `배포/구성/선택과 필터/요금 주기 선택`

## 언제 쓰나

선택만 하는 화면과 선택 뒤 실제 요청을 실행하는 화면의 상태를 혼동하지 않도록 도입했다.
분할 실행/계정 전환/규칙 확인/요금 선택의 비동기 복구나 해석이 필요할 때 사용한다.
단순 메뉴·필드·라디오 그룹이면 기존 Menu/PasswordField/RadioGroup을 직접 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| SplitAction | 모드 선택과 주요 실행 | [Menu](../components/menu.md) |
| AccountSwitcher | 확인된 계정과 전환 요청 | [Menu](../components/menu.md) |
| PasswordRulesField | controlled 비밀번호·규칙 충족 | [PasswordField](../components/password-field.md) |
| PricingChoice | 실제 요금/혜택·선택·계속 | [RadioGroup](../components/radio-group.md) |

## 배치

```text
분할 실행: [현재 방식 실행] [방식 메뉴]
계정 전환: 확인된 현재 계정 → [계정 메뉴]
비밀번호: 기존 비밀번호 입력 → 규칙 충족 막대 → 규칙별 상태
요금: 주기별 라디오 카드 → 선택한 실제 가격·혜택 → [계속]
실패: 구성 내부 중앙 오류 → 기존 행동으로 재시도
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack/Card | 기존 본문·패널 안 | sm 또는 md |
| 분할 행동 | Button/Menu | 같은 inline 행 | xs wrap |
| 비밀번호 | PasswordField/Progress/Text | 위→아래 | sm |
| 요금 선택 | RadioGroup | 카드 상단 | card presentation |
| 실패 | Text | 구성 내부 중앙 | 임의 상단 여백 없음 |

## 흐름과 상태

1. 제품이 현재 확인된 선택·계정, 옵션, 문구를 공급한다.
2. 모드·요금 선택은 controlled callback만 호출한다. 실제 실행은 주요 버튼에서만 시작한다.
3. 계정은 메뉴가 닫힌 뒤 실제 세션 callback을 기다리며 현재 accountId는 확정 전까지 유지한다.
4. 실패하면 선택·입력을 보존하고 다시 실행할 수 있다. 요금 계속은 선택 옵션 snapshot을 전달한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 현재 선택과 실행 행동 | 기존 Menu/RadioGroup/PasswordField 키보드 계약 |
| 진행 중 | 실행 버튼 로딩·경쟁 선택 잠금 | 기존 메뉴 dismiss 뒤 실행, 중복 요청 차단 |
| 실패 | 선택 유지·중앙 오류 | Web alert / Native assertive, 같은 행동 재시도 |

## 코드 골격

```tsx
// Web
import { AccountSwitcher } from "@hjmds/react/task-controls";
<AccountSwitcher accounts={accounts} accountId={confirmedAccountId}
  label={t("switch")} dismissLabel={t("close")} errorLabel={t("switchFailed")}
  onSwitch={switchConfirmedSession} />;
```

```tsx
// Native
import { AccountSwitcher } from "@hjmds/react-native/task-controls";
<AccountSwitcher accounts={accounts} accountId={confirmedAccountId}
  label={t("switch")} dismissLabel={t("close")} errorLabel={t("switchFailed")}
  onSwitch={switchConfirmedSession} />;
```

실행 예제: Web `showcase/web/src/patterns/TaskControls.previews.tsx`, Native `showcase/native/src/task-controls-preview.tsx`.
공개 API를 소비하며 제품이 showcase 소스를 import하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 메뉴 | anchored popover | Modal, dismissLabel 필수 |
| 비밀번호 입력 | 기존 HTML input | 기존 TextInput |
| 계정 확정·요금 데이터 | 제품 controlled 상태 | 동일 |

## 함정

- 메뉴를 고른 것을 계정 전환 완료로 표시하지 않는다. 실제 세션 확정 뒤 accountId를 바꾼다.
- 충족 개수를 비밀번호 보안 강도라고 부르지 않는다. 규칙 test는 pure하고 예외를 던지지 않아야 한다.
- 가격 formatter가 실제 amountMinor/interval/intervalCount와 일치해야 한다. 할인·월 환산액은 추정하지 않는다.
- 옵션 선택으로 결제를 시작하지 않는다. 실제 결제·약관·상품 검증은 onContinue 뒤 제품 흐름 책임이다.
- 다른 엔티티/세션으로 전환할 때 host key를 바꾸고 늦은 제품 API 응답도 제품 상태 계층에서 검증한다.
- npm 1.21.0 API다. 기기·실제 로그인·결제 검증과 npm 게시를 구분한다.
