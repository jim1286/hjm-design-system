# Accordion 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: recipe `accordionRecipe`(`src/component-recipes.ts`), behavior `disclosureGroup`.
Collapsible과의 경계는 [Collapsible 계약](../collapsible.md)에 있다.

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Accordion` | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` | 기본 |

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

- `density`: `compact` · `comfortable`(기본). compact는 trigger 최소 높이가 최소 터치 영역이다.
- 여러 항목 동시 펼침: 기본 꺼짐. Web `allowsMultipleExpanded`, Native `multiple`.
- 펼침 상태는 제어(`value`/`expandedValues`)·비제어(`defaultValue`/`defaultExpandedValues`) 둘 다 된다.
- Web `headingLevel`: 2~6, 기본 3. 화면의 heading 위계에 맞춰 정한다.

## 꼭 지킬 것

- 항목은 하나 이상, 식별자(Web `id`, Native `value`)는 고유해야 한다. 빈 목록·중복 id·없는 값·
  단일 모드에서 둘 이상 펼침은 렌더 중 `TypeError`/`RangeError`로 실패한다.
- 제목·본문은 i18n 키로 넣는다. Native는 그룹 `label`이 필수이며 접근성 이름이 된다.
- 펼침 표시(`+`/`−`)와 trigger·panel 접근성 관계는 HJM이 소유한다. 직접 버튼과 패널을 다시 조립하지 않는다.
- Native의 `style`·`itemStyle`·`triggerStyle`·`titleStyle`·`indicatorStyle`·`panelStyle`은 배치용으로만 쓴다.
  색·글꼴·높이·간격을 덮지 않는다([소비 정책 §3](../consumer-policy.md)).

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
