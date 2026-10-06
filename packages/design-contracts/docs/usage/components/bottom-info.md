# BottomInfo

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [BottomInfo](../../bottom-info.md), recipe `bottomInfoRecipe`(`src/bottom-info.ts`)
- 스토리북: `배포/컴포넌트/상태와 알림/하단 안내`

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

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `BottomInfo` | 기본 | `@hjmds/react`, `/bottom-info` | `@hjmds/react-native`, `/bottom-info` |

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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | 비지 않은 문자열 배열 | 필수 | 빈 배열·빈 문자열은 거부한다. 2개 이상이면 목록 표식이 붙는다(`listMarkerFrom: 2`) |
| `tone` | `muted` · `emphasis` | `muted` | 법적 고지처럼 놓치면 안 되는 문장만 `emphasis`. danger·success tone은 없다 |
| `renderItem` | `(item: string, index: number) => ReactNode` | — | 한 줄을 rich copy로 바꾼다(문장 안 약관 링크 등). `null`·`undefined`를 돌려주면 원래 문장을 그린다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치 전용. Native `style`은 deprecated — layoutStyle 또는 tone/토큰 |

상태가 없는 표시 컴포넌트다. 이벤트 콜백이 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 폭을 채우는 caption 글자 블록(`typography.caption` 11/16). 높이는 줄 수가 정한다. 누르는 요소가 아니다(문장 안 링크는 `renderItem`이 소유) | `bottomInfoRecipe.textVariant`, `.hjm-bottom-info` |
| 간격 | 위 `spacing.sm` 12(주 행동과의 간격), 줄 사이 `spacing.xxs` 4, 목록일 때 시작 쪽 들여쓰기 `spacing.md` 16(Web) | `bottomInfoRecipe.paddingTop`·`gap`, `.hjm-bottom-info__list` |
| 순서·정렬 | 주 행동 **바로 아래**. 주 행동과의 간격은 BottomInfo 자신의 위 여백(`spacing.sm` 12)이므로 둘을 감싸는 Stack에 간격을 더하지 않는다. 한 줄은 문장, 두 줄 이상은 목록 | `bottomInfoRecipe.paddingTop`·`listMarkerFrom` |
| 고정·스크롤 | 자체 고정이 없다. 하단에 고정한 [BottomCTA](bottom-cta.md) 아래에 둘 때는 그 바와 같은 영역(스크롤 밖)에 넣는다. BottomCTA `description`은 행동 **위** 한 줄로 자리가 다르다 | `../../bottom-info.md` |
| 좁은 폭·큰 글자 | 줄바꿈되고 자르지 않는다(`overflow-wrap: anywhere`) | `.hjm-bottom-info__item` |

```text
┌──────────────────────────────┐
│ [      가입하고 시작하기    ] │ ← 주 행동
│  ↕ spacing.sm 12              │
│ 가입하면 약관에 동의…(caption)│ ← BottomInfo 한 줄
│ • 수수료는 결제 시점에 확정    │ ← 2줄 이상은 목록
│ • 환불은 7일 이내              │
└──────────────────────────────┘
```

## 꼭 지킬 것

- 문장은 i18n 키로 넣는다. 자르지 않는다(법적 고지가 많다).
- 문장 안 링크의 주소·라우팅은 제품 소유다. `renderItem`으로 그 줄만 바꾼다.
- `items`가 React key로 쓰인다. 같은 문장을 두 번 넣지 않는다.
- 상태 알림 용도로 쓰지 않는다. `role="status"`가 없어 낭독되지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| root | `<aside>`, 여러 줄이면 `<ul>/<li>` | `View` + 줄마다 `·` 표식 텍스트 |
| 전달 가능 속성 | HTML 속성·`className`·ref·`layoutStyle` | `layoutStyle`(`style`은 deprecated) |
| `renderItem` 결과 위치 | `<li>`/`<p>` 안 | `Text` 안. 인라인 텍스트(문자열·`Text`·인라인 링크)만 돌려준다 |

## 함정

- Native는 `renderItem` 결과를 `Text` 안에 넣는다. `View`를 돌려주면 Text 안 View가 되어 플랫폼마다 배치가 깨진다.
- 같은 문장이 두 번 들어가면 React key가 겹친다(두 플랫폼 모두 `items` 문자열이 key).
