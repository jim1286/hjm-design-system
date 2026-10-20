# Accordion

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: recipe `accordionRecipe`(`src/component-recipes.ts`), behavior `disclosureGroup`, Collapsible과의 경계 [Collapsible 계약](../../collapsible.md)
- 스토리북: `배포/컴포넌트/데이터 표시/아코디언`

## 언제 쓰나

서로 관계가 있는 여러 접힘 항목을 한 그룹으로 보일 때 쓴다. FAQ, 설정 상세, 기록 상세처럼
제목 목록을 훑고 필요한 항목만 펼치는 화면이다. 기본은 한 번에 하나만 펼친다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 이웃 없는 단일 접힘 영역 | [Collapsible](collapsible.md) (`items.length === 1`인 Accordion으로 대신하지 않는다) |
| 같은 자리의 화면 전환 | [Tabs](tabs.md), [SegmentedControl](segmented-control.md) |
| 위계가 있는 계층 탐색 | [Tree](tree.md)(Web) |
| 눌러서 다른 화면으로 가는 목록 | [ListRow](list-row.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Accordion` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Accordion } from "@hjmds/react/display";

<Accordion
  headingLevel={3}
  items={[
    { id: "refund", title: t("faq.refund.title"), panel: <p>{t("faq.refund.body")}</p> },
    { id: "account", title: t("faq.account.title"), panel: <p>{t("faq.account.body")}</p> },
  ]}
  defaultValue={["refund"]}
/>
```

```tsx
// Native
import { Accordion } from "@hjmds/react-native/data-display";
import { Text } from "@hjmds/react-native/primitives";

<Accordion
  label={t("faq.title")}
  items={[
    { value: "refund", title: t("faq.refund.title"), content: <Text>{t("faq.refund.body")}</Text> },
    { value: "account", title: t("faq.account.title"), content: <Text>{t("faq.account.body")}</Text> },
  ]}
  defaultExpandedValues={["refund"]}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | Web `{ id, title: ReactNode, panel: ReactNode, disabled?, accessibilityLabel? }[]` · Native `{ value, title: string, description?, content, disabled?, accessibilityLabel?, accessibilityHint?, contentAccessibilityLabel? }[]` | 필수 | 한 개 이상, 식별자 고유 |
| `density` | `compact` · `comfortable` | `comfortable` | compact는 trigger 최소 높이가 최소 터치 영역이다 |
| Web `allowsMultipleExpanded` · Native `multiple` | `boolean` | `false` | 여러 항목 동시 펼침 |
| Web `value`·`defaultValue` · Native `expandedValues`·`defaultExpandedValues` | `readonly string[]`(펼친 식별자) | `defaultValue`·`defaultExpandedValues` `[]` | 제어·비제어 둘 다 된다 |
| Web `onValueChange` · Native `onExpandedValuesChange` | `(value: readonly string[]) => void` | — | 펼친 식별자 전체 목록을 받는다(단일 모드는 0~1개) |
| Web `headingLevel` | `2`~`6` | `3` | 화면의 heading 위계에 맞춰 정한다 |
| Native `label` | `string` | 필수 | 그룹 접근성 이름 |
| `renderIndicator` | Web `(props: { value, expanded, disabled }) => ReactNode` · Native는 `color, size`도 제공 | `+`/`−` | Web 슬롯·항목 접근성 이름은 미게시 로컬 소스다. 장식 펼침 표시만 교체한다. 점수 등 도메인 정보를 넣으면 item의 `accessibilityLabel`에 값도 포함한다. 버튼·링크를 넣지 않는다 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 배치 전용 |
| Native `style`·`itemStyle`·`triggerStyle`·`titleStyle`·`indicatorStyle`·`panelStyle` | — | — | 제거된 속성 — `layoutStyle` 또는 `density`/`renderIndicator` |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 본문 폭을 꽉 채운다. 트리거 최소 높이 `comfortable`(기본) 56(`layout.rowHeight.singleLine`) · `compact` 44(`control.minTouchTarget`) | `accordionRecipe.density`, `.hjm-accordion__trigger` |
| 간격 | 트리거 위아래 `comfortable` `spacing.sm` 12 · `compact` `spacing.xs` 8, 좌우 `spacing.xs` 8, 제목↔펼침 표시 `spacing.sm` 12. 패널 아래 `spacing.md` 16, 시작 쪽 `spacing.xs` 8. 앞뒤 블록과는 화면 구획 간격(`layout.sectionGap` 24) | `accordionRecipe`, `foundations.ts` `layout` |
| 순서·정렬 | 위→아래 [제목 트리거] → [패널]이 항목마다 반복된다. 트리거 안은 제목이 시작 쪽, 펼침 표시가 끝 쪽. 위·아래 구분선(`border.default` 1px)을 Accordion이 그리므로 Card 안에서 테두리를 겹쳐 그리지 않는다 | `.hjm-accordion`, `.hjm-accordion__item` |
| 고정·스크롤 | 고정 영역이 없다. 스크롤은 화면이 소유한다 | `react/src/styles.css` |
| 좁은 폭·큰 글자 | 제목은 줄바꿈되고 자르지 않는다. 큰 글자에서는 트리거가 최소 높이 이상으로 늘어나므로 높이를 고정하지 않는다 | `.hjm-accordion__title`(`overflow-wrap: anywhere`), `react-native/src/data-display.tsx` |

## 꼭 지킬 것

- 항목은 하나 이상, 식별자(Web `id`, Native `value`)는 고유해야 한다. 빈 목록·중복 id·최초 기본값 또는 제어 값에 없는 식별자·
  단일 모드에서 둘 이상 펼침은 렌더 중 `TypeError`/`RangeError`로 실패한다.
- 비제어 상태에서 펼쳐진 항목을 삭제하면 그 식별자를 펼침 값에서 제거하고 변경 콜백을 한 번 알린다. 재삽입해도 저절로 다시 열리지 않는다. 삭제로 오류 화면이 되거나 이전 선택이 되살아나는 문제를 막기 위한 규칙이다.
- 펼쳐진 항목의 `disabled` 전환은 추가 토글만 막고 읽던 본문은 유지한다. 웹에서 삭제된 항목 또는 새로 비활성화된 트리거에 포커스가 있었다면 다음 활성 트리거로 옮긴다(없으면 그룹). 사용자가 이미 외부로 옮긴 포커스는 유지한다.
- 제목·본문은 i18n 키로 넣는다. Native는 그룹 `label`이 필수이며 접근성 이름이 된다.
- 펼침 표시(`+`/`−`)와 trigger·panel 접근성 관계는 HJM이 소유한다. 직접 버튼과 패널을 다시 조립하지 않는다.
- 배치는 `layoutStyle`로만 한다. Native의 `style`·`itemStyle`·`triggerStyle`·`titleStyle`·`indicatorStyle`·`panelStyle`은
  제거된 속성이다. 새 코드에 쓰지 않는다([소비 정책 §3](../../consumer-policy.md), [Native 이관](../../migration-native-legacy-removal.md)).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 항목 키·본문 | `id`, `panel` | `value`, `content` |
| 제목 타입 | `ReactNode` | `string` + 선택 `description` |
| 상태 prop | `value`/`defaultValue`/`onValueChange` | `expandedValues`/`defaultExpandedValues`/`onExpandedValuesChange` |
| 그룹 이름 | 없음(HTML 속성으로 전달) | `label` 필수 |
| 펼침 표시 교체 | 없음 | `renderIndicator` |
| 항목별 접근성 문구 | 없음 | `accessibilityLabel`, `accessibilityHint`, `contentAccessibilityLabel` |
| 키보드 | ArrowUp/Down·Home·End로 trigger 이동(disabled 건너뜀) | 해당 없음 |
| 애니메이션 | 없음(`hidden` 전환) | `LayoutAnimation`, reduced motion이면 생략 |

2026-10-20 번뚝 평가 항목 이관에서 Web에도 Native와 같은 장식 indicator 슬롯과 항목 접근성 이름이 필요했다. 공통 버튼·키보드 이동·단일 펼침 엔진을 유지하면서 제품 점수 막대를 연결하도록 제공한다.
