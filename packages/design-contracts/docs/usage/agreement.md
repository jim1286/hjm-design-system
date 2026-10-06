# Agreement 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Agreement contract](../agreement.md), `agreementRecipe`·`resolveAgreementState`(`src/agreement.ts`)

## 언제 쓰나

가입·결제·서비스 시작 앞의 약관 동의 묶음에 쓴다. 전체 동의 한 줄, 필수/선택 항목, 항목별 전문
보기가 한 덩어리로 움직이고, 제출 가능 여부(`satisfied`)를 HJM이 판정한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 법적 의미 없는 여러 선택 | [CheckboxGroup](checkbox-group.md) |
| 동의 하나를 켜고 끄는 설정(마케팅 수신 등) | [Switch](switch.md), [Checkbox](checkbox.md) |
| 로그인 화면 하단의 "계속하면 동의" 고지 | [AuthScreenLayout](auth-screen-layout.md)의 `footer` |
| 약관 전문 표시 | 제품 화면·[Sheet](sheet.md)·[Link](link.md) (Agreement는 여는 경로만 가진다) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Agreement` | `@hjmds/react`, `/agreement` | `@hjmds/react-native`, `/agreement` | 기본 |
| `AgreementDescriptor`·`AgreementState` 타입 | `@hjmds/design-contracts/components/agreement` | 같음 | 입력·파생 상태 |

## 최소 사용 예

```tsx
// Web
import { Agreement } from "@hjmds/react/agreement";

<Agreement
  descriptor={{
    accessibilityLabel: t("signup.terms.group"),
    allLabel: t("signup.terms.all"),
    items: [
      { id: "tos", label: t("signup.terms.tos"), required: true, detail: { label: t("common.view"), href: "/legal/terms" } },
      { id: "marketing", label: t("signup.terms.marketing") },
    ],
  }}
  requiredLabel={t("signup.terms.required")}
  optionalLabel={t("signup.terms.optional")}
  onStateChange={(state) => setCanSubmit(state.satisfied)}
/>
```

```tsx
// Native
import { Agreement } from "@hjmds/react-native/agreement";

<Agreement
  descriptor={descriptor}
  requiredLabel={t("signup.terms.required")}
  optionalLabel={t("signup.terms.optional")}
  onDetail={(id) => openTermsSheet(id)}
  onStateChange={(state) => setCanSubmit(state.satisfied)}
/>
```

## 축과 기본값

- 항목 `required`: 기본 `false`(선택). 필수 항목이 하나라도 비면 `satisfied`가 `false`다.
- 전체 동의는 저장되는 값이 아니라 개별 항목에서 파생한 tri-state다. 비활성 항목은 분모에서 빠진다.
- 체크 상태는 `checkedIds`(제어)·`defaultCheckedIds`(비제어) 모두 `ReadonlySet<Id>`이다.
- 목록에서 빠진 항목의 체크는 자동으로 버려진다(`reconcileAgreementSelection`).

## 꼭 지킬 것

- 제출 버튼은 `onStateChange`로 받은 `satisfied`만 읽는다. 남은 필수 항목 안내는 `missingRequiredIds`로 제품이 문장을 만든다.
- `accessibilityLabel`·`allLabel`·항목 `label`·`requiredLabel`·`optionalLabel`은 모두 제품의 i18n 문구다.
  빈 문자열, 빈 목록, 중복 id, 필수이면서 `disabled`인 항목은 throw다.
- 약관 문구·링크 주소·법적 유효성·동의 기록 저장은 제품 소유다. HJM은 판정과 배치만 가진다.
- 전문 보기 컨트롤은 체크박스와 별개이며 눌러도 체크되지 않는다. 같은 행에 다른 누름 영역을 덧붙이지 않는다.
- 색·간격은 recipe가 정한다. Web `className`, Native `style`은 배치용으로만 쓴다([소비 정책 §3](../consumer-policy.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 전문 열기 | `detail.href`가 있으면 `<a>`, 없으면 버튼이 `onDetail(id)` 호출 | `href`를 쓰지 않고 항상 `onDetail(id)` |
| 배치 prop | `className` | `style` |
| `ref` | root `div`로 전달 | 없음 |
