# CodeBlock 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Code block](../code-block.md), contract `src/code-block.ts`

## 언제 쓰나

코드·명령·설정 조각을 읽기 전용으로 보여 주고 사용자가 선택·복사하게 할 때 쓴다.
편집기나 HTML 실행기가 아니며 강조 색은 표현만 바꾸고 원문을 바꾸지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사용자가 코드를 고침 | [TextArea](text-area.md), [EditorScreen](editor-screen.md) |
| 문장 안의 짧은 강조·서식 | [Text](text.md), [TextFormat](text-format.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `CodeBlock` | `/code-block` | `/code-block` | 별도 보조 기능(supplemental) |
| `ClipboardButton` | `@hjmds/react`, `/clipboard` | 없음 | Web 복사 버튼(`copyAction` 슬롯에 넣는다) |

`CodeBlock`은 root에서 export되지 않고 granular subpath로만 import 된다. 추가 peer는 없다.
구문 분석기·하이라이터·클립보드 엔진은 포함하지 않는다.

## 최소 사용 예

```tsx
// Web
import { CodeBlock } from "@hjmds/react/code-block";
import { ClipboardButton } from "@hjmds/react/clipboard";

<CodeBlock
  code={snippet}
  label={t("docs.installSnippet")}
  language="bash"
  copyAction={
    <ClipboardButton
      value={snippet}
      labels={{ idle: t("common.copy"), copied: t("common.copied") }}
      onCopyError={showCopyError}
    />
  }
/>
```

```tsx
// Native
import { CodeBlock } from "@hjmds/react-native/code-block";

<CodeBlock code={snippet} label={t("docs.installSnippet")} language="bash" />
```

## 축과 기본값

- `code`(필수), `label`(필수, 비면 `TypeError`), `language`(헤더에 표시, 없으면 `label` 표시).
- `wrap`: 기본 `false`. 긴 줄은 가로 스크롤한다. `true`면 줄바꿈한다.
- `tokens`: 없으면 전체가 plain 한 덩어리다. 각 토큰 `{ text, tone? }`, tone은 `plain`·`keyword`·`string`·`comment`·`number`.

## 꼭 지킬 것

- `tokens`의 `text`를 이어 붙인 결과는 `code`와 공백까지 같아야 한다. 다르면 렌더 중 `TypeError`를 던진다.
- 토큰은 제품이 고른 하이라이터로 만든다(제품 소유). 토큰 색은 HJM semantic 색이 정한다.
- `label`은 i18n 키로 넣는다. Native 접근성 이름에는 `label`과 원문이 함께 들어간다.
- 복사 버튼과 실패 응답은 제품이 `copyAction`으로 공급한다. 배치 prop(`style`·`layoutStyle`)은 없다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 원문 요소 | 포커스 가능한 `pre`(`tabIndex=0`) | 선택 가능한 `Text`, `wrap=false`면 가로 `ScrollView` |
| 복사 | `ClipboardButton` 슬롯 | 시스템 텍스트 선택, 또는 제품의 복사 버튼 슬롯 |
| 글꼴 | stylesheet 기본 | iOS `Menlo`, 그 외 `monospace` |
