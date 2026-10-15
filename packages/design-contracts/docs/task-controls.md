# 선택 뒤 실제 작업을 실행하는 구성

검토일: 2026-10-15 · Storybook 배포 · 미게시(1.20.0 이후) · Web/Native

Lucian 010·036·037·056의 공통 작업 흐름을 기존 Menu/Button/PasswordField/Progress/RadioGroup/Card로 합성한다.
새 메뉴·입력·작업 상태 엔진을 만들지 않는다. 공개 진입점은 `@hjmds/{react,react-native}/task-controls`,
계산·타입은 `@hjmds/design-contracts/task-controls`다.

| API | 의미와 기존 API를 직접 쓰는 경우 |
| --- | --- |
| SplitAction | 선택 모드와 주요 실행을 나누고 실행 중 잠금·실패 복구를 묶음. 단순 더보기 목록은 Menu |
| AccountSwitcher | 확인된 계정 표시, 세션 전환 callback, 실패 후 현재 계정 유지. 단순 필드 값은 Select |
| PasswordRulesField | 기존 PasswordField의 공개 입력·자동완성·보기 계약 + 제품 규칙 목록·충족 Progress. 규칙 표시가 필요 없으면 PasswordField |
| PricingChoice | controlled RadioGroup 요금 주기 선택 + 실제 가격·혜택·계속 행동과 실패 복구. 결제 없는 일반 선택은 RadioGroup |

## 데이터와 실제 확정

모든 옵션은 중복 없는 stable id를 갖고 현재 id는 목록에 있어야 한다. disabled 옵션은 실행하지 않는다.
SplitAction의 onModeChange는 실행하지 않는다. onExecute에는 누른 시점의 modeId를 전달하며 Promise resolve/reject를 기다린다.
AccountSwitcher의 accountId는 서버에서 확인된 현재 세션이다. 메뉴를 고른 것만으로 바꾸지 않고 제품 onSwitch가 실제 세션 전환 뒤 controlled prop을 갱신한다.
기존 메뉴를 먼저 닫은 뒤 실제 실행/전환 callback을 호출한다. 실패해도 현재 선택·계정은 보존하고 같은 행동으로 재시도한다.
공통 action-session을 사용해 진행 중 중복 요청과 unmount 뒤 응답을 분리한다. 제품은 권한·요청 멱등성·외부 세션 경합을 소유한다.
다른 엔티티/인증 세션으로 재사용할 때 제품 host key를 바꿔 이전 작업의 수명을 끝낸다.

PasswordRule은 pure test(value) predicate와 현지화 label이다. 충족 개수는 정책 조건의 수이며 엔트로피/유출 이력/실제 보안 강도가 아니다.
비밀번호를 저장·로그·전송하지 않는다. 서버 규칙 검증은 제품 소유다. 입력은 controlled이며 실패 시 초안을 자동 삭제하지 않는다.

PriceOption은 실제 `amountMinor`, ISO 4217 형식의 `currency`, `interval`(month/year), 양의 `intervalCount`, 실제 benefits를 받는다.
표시 formatPrice는 해당 가격과 과금 주기를 그대로 표현해야 한다. 월 환산액·할인·혜택을 추정하지 않는다.
선택 변경으로 결제를 실행하지 않는다. onContinue에 동결된 옵션 snapshot(혜택 배열 포함)을 전달하며 결제·동의·스토어 상품 검증은 실제 제품 흐름이 소유한다.
Showcase 가격·계정은 fixture이며 실제 결제·인증을 수행했다는 증거가 아니다.

## 문구·상태·플랫폼

제목·버튼·실패·규칙별 상태 문구·가격 formatter는 제품에서 공급한다. 실패 문구는 해당 구성 내부 중앙에 표시한다.
Web Menu는 anchored popover, Native Menu는 기존 Modal과 dismissLabel을 사용한다. 선택 강조와 실제 세션 확정을 동일시하지 않는다.
Native에는 OS/기기 키보드·자동완성 계약이 기존 PasswordField를 통해 유지된다.
Web/Native 공개 이름과 데이터 계약은 같으며 입력 prop의 host 타입은 각 기존 PasswordFieldProps를 따른다.
