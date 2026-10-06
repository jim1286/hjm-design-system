# BottomInfo 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [BottomInfo](../bottom-info.md), recipe `bottomInfoRecipe`(`src/bottom-info.ts`)

## 언제 쓰나

주 행동 아래에 늘 붙어 있는 작은 조건 문장에 쓴다. "가입하면 약관에 동의하는 것으로 봅니다",
"수수료는 결제 시점에 확정됩니다" 같은 문장이다. 한 줄은 문장으로, 두 줄 이상은 목록으로 그린다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 지금 생긴 오류·성공·경고 | [Notice](notice.md) |
| 사용자가 직접 체크해야 하는 동의 | [Agreement](agreement.md) |
| 입력 하나에 딸린 설명·오류 | [Field](field.md) |
| 하단 행동 영역 자체 | [BottomCTA](bottom-cta.md) (`description`은 행동 위 한 줄) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `BottomInfo` | `@hjmds/react`, `/bottom-info` | `@hjmds/react-native`, `/bottom-info` | 기본 |

## 최소 사용 예

```tsx
// Web
import { BottomInfo } from "@hjmds/react/bottom-info";

<BottomInfo
  items={[t("signup.termsNotice"), t("signup.ageNotice")]}
  renderItem={(item, index) => index === 0 ? <TermsSentence text={item} /> : item}
/>
```

```tsx
// Native
import { BottomInfo } from "@hjmds/react-native/bottom-info";

<BottomInfo items={[t("checkout.feeNotice")]} tone="emphasis" />
```

## 축과 기본값

- `items`: 비지 않은 문자열 배열. 빈 배열·빈 문자열은 거부한다. 2개 이상이면 목록 표식이 붙는다(`listMarkerFrom: 2`).
- `tone`: `muted`(기본) · `emphasis`. 법적 고지처럼 놓치면 안 되는 문장만 `emphasis`. danger·success tone은 없다.
- `renderItem(item, index)`: 한 줄을 rich copy로 바꾼다(문장 안 약관 링크 등).

## 꼭 지킬 것

- 문장은 i18n 키로 넣는다. 자르지 않는다(법적 고지가 많다).
- 문장 안 링크의 주소·라우팅은 제품 소유다. `renderItem`으로 그 줄만 바꾼다.
- `items`가 React key로 쓰인다. 같은 문장을 두 번 넣지 않는다.
- 상태 알림 용도로 쓰지 않는다. `role="status"`가 없어 낭독되지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | `<aside>`, 여러 줄이면 `<ul>/<li>` | `View` + 줄마다 `·` 표식 텍스트 |
| 전달 가능 속성 | HTML 속성·`className`·ref | `style`만 |
