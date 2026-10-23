# ChoiceRow

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.41.0
- 검토일: 2026-10-23
- 근거: `src/choice-row.ts`(`resolveChoiceRow`). 2026-10-23 조사에서 언어 설정 행을 spint(`Select`)·utilverse(`ListRow`+`Sheet`+`RadioGroup`)·번뚝(자체 시트)이 각자 만들고, 테마 전환도 번뚝·야잘알이 따로 구현하고 있어 HJM으로 옮겼다.
- 스토리북: `배포/컴포넌트/입력/설정 값 선택`

## 언제 쓰나

설정 화면에서 언어·화면 테마·기본 정렬처럼 **여러 값 중 하나를 고르는 설정**에 쓴다. 행에는 현재 확인된 값을 보여 주고,
누르면 시트에서 고른다. 저장이 비동기면 시트가 저장 중으로 잠기고, 실패하면 시트를 연 채 오류를 보여 준다.
행에는 제품이 저장을 확인한 값만 보이므로, 실패한 선택이 저장된 것처럼 남지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 켜고 끄기 설정 | [Switch](switch.md)를 둔 [ListRow](list-row.md) |
| 폼 안에서 여러 필드와 함께 제출하는 선택 | [Select](select.md) 또는 [RadioGroup](radio-group.md) |
| 선택지가 화면에 펼쳐져 있어야 함(2~4개, 즉시 비교) | [SegmentedControl](segmented-control.md) 또는 [RadioGroup](radio-group.md) |
| 선택 외에 입력·설명이 많은 편집 패널 | [Sheet](sheet.md)를 직접 구성 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChoiceRow` | 독립 supplemental. root에서는 내보내지 않는다 | `@hjmds/react/choice-row` | `@hjmds/react-native/choice-row` |
| `ChoiceRowItem` | 선택지 타입 | 같은 경로 | 같은 경로 |

## 최소 사용 예

```tsx
// Web
import { ChoiceRow } from "@hjmds/react/choice-row";
<ChoiceRow title={t("language")} items={languages} value={confirmedLanguage}
  onValueChange={(next) => savePreference({ language: next })} closeLabel={t("close")} errorLabel={t("saveFailed")} />
```

```tsx
// Native
import { ChoiceRow } from "@hjmds/react-native/choice-row";
<ChoiceRow title={t("language")} items={languages} value={confirmedLanguage}
  onValueChange={(next) => savePreference({ language: next })} closeLabel={t("close")} errorLabel={t("saveFailed")} />
```

`savePreference`가 성공한 뒤에 제품이 `confirmedLanguage`를 바꾼다. "기기 설정 따르기"는 `items`의 한 선택지로 넣는다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | 선택지 값 또는 null | 필수 | 제품이 확인한 값. null이면 `placeholder`가 필요하다 |
| `items` | `ChoiceRowItem[]` | 필수 | 2개 이상, 값 중복 금지. `description`·`disabled` 지원 |
| `onValueChange` | `(value) => void` 또는 `(value) => Promise<void>` | 필수 | 동기 저장은 시트를 바로 닫는다. Promise를 돌려주면 끝날 때까지 시트가 잠기고, 거부되면 시트를 연 채 `errorLabel`을 보인다 |
| `errorLabel` | string | 비동기 저장일 때 필수 | 동기 저장에는 줄 수 없다. 시트 안 실패가 없기 때문이다(1.41.2) |
| `sheetTitle`·`sheetDescription` | string | `title`·없음 | 시트 머리 |
| `leading`·`trailing` | ReactNode | 없음 | 제품 아이콘·꼬리 표시. ListRow 슬롯 그대로 |
| `density` | ListRow density | ListRow 기본값 | 주변 설정 행과 같은 밀도(예: `compact`)를 맞춘다 |
| Native `accessibilityHint` | string | 없음 | 행을 눌렀을 때 일어날 일(예: 언어 목록 열기)을 제품 언어로 |
| `disabled`·`loading` | boolean | false | ListRow의 비활성·자리 유지 로딩 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ListRow 기본 높이와 터치 영역. 시트는 내용 높이(`size="auto"`) | [ListRow](list-row.md#배치), [Sheet](sheet.md#배치) |
| 간격 | ListRow·RadioGroup recipe 간격을 그대로 쓴다 | 같은 recipe |
| 순서·정렬 | 행: leading → 제목·현재 값(description) → trailing. 시트: 제목 → 설명 → 세로 선택지 → 오류 | [설정 화면](../screens/common-settings.md#버튼과-행동-위치) |
| 고정·스크롤 | 행은 바깥 화면 스크롤을 따른다. 선택지가 길면 시트 본문이 스크롤된다 | Sheet |
| 좁은 폭·큰 글자 | 제목과 현재 값이 줄바꿈되며 행 높이가 늘어난다 | ListRow |

## 꼭 지킬 것

- `value`는 저장이 확인된 값만 넣는다. 선택 직후 낙관적으로 바꾸면 실패해도 행이 바뀐 값으로 남는다.
- 즉시 저장 설정에 쓴다. 하단 저장 버튼으로 모아 저장하는 설정은 [설정 화면의 일괄 저장](../screens/common-settings.md#즉시-저장과-일괄-저장-선택)대로 초안을 따로 둔다.
- 저장 중에는 시트를 닫거나 다른 값을 고를 수 없다. 다시 고르면 이전 오류는 지워진다.
- 행은 시트가 열렸는지를 낭독한다(Web `aria-expanded`·`aria-haspopup="dialog"`, Native `expanded`). 시트는 머리를 고정하고 선택지만 스크롤한다(1.41.1, utilverse 언어 행 이관에서 확인).
- 문구·선택지·저장은 제품이 공급한다. 언어 목록이나 테마 적용 로직은 이 컴포넌트에 없다.
