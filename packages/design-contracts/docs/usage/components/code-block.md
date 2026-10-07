# CodeBlock

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Code block](../../code-block.md), contract `src/code-block.ts`
- 스토리북: `배포/컴포넌트/데이터 표시/코드 블록`

## 언제 쓰나

코드·명령·설정 조각을 읽기 전용으로 보여 주고 사용자가 선택·복사하게 할 때 쓴다.
편집기나 HTML 실행기가 아니며 강조 색은 표현만 바꾸고 원문을 바꾸지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 사용자가 코드를 고침 | [TextArea](text-area.md) |
| 문장 안의 짧은 강조·서식 | [Text](text.md), [TextFormat](text-format.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CodeBlock` | 기본(별도 보조 기능, supplemental) | `/code-block` | `/code-block` |
| `ClipboardButton` | 보조(Web 복사 버튼, `copyAction` 슬롯에 넣는다) | `@hjmds/react`, `/clipboard` | 없음 |

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
      tone="secondary"
      size="small"
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `code` | `string` | 필수 | — |
| `label` | `string` | 필수 | 비면 `TypeError` |
| `language` | `string` | — | 헤더에 표시, 없으면 `label` 표시 |
| `wrap` | `boolean` | `false` | 긴 줄은 가로 스크롤한다. `true`면 줄바꿈한다 |
| `tokens` | `readonly { text: string; tone?: "plain" \| "keyword" \| "string" \| "comment" \| "number" }[]` | — | 없으면 전체가 plain 한 덩어리다 |
| `copyAction` | `ReactNode` | — | 머리 줄 끝 쪽 슬롯 |
| Web `layoutStyle` | margin·width·flex·`alignSelf` | — | 바깥 `section` 배치. Native는 없다 |
| `ClipboardButton` `value` · `labels` | `string` · `{ idle: ReactNode; copied: ReactNode }` | 필수 | 복사할 원문과 두 상태 문구 |
| `ClipboardButton` `onCopy` · `onCopyError` | `(value: string) => void` · `(error: unknown) => void` | — | 실패(권한 거부 등)는 `onCopyError`로만 알 수 있다 |
| `ClipboardButton` `feedbackDuration` | ms | 2000 | "복사했어요" 상태 유지 시간 |
| `ClipboardButton` `tone` · `size` | [Button](button.md)과 같다 | `secondary` · `medium`(1.12.1은 `primary`) | 코드 블록 안에서는 `small`로 낮춘다 |

## 배치

Native 코드 제목은 `tokens.fontFamily.ui`, 선택 가능한 원문과 그 token span은 `tokens.fontFamily.code`를 읽는다. 주변 UI와 코드 원문의 서체 역할을 구분하고 코드 본문의 LTR 순서는 유지한다.

양 플랫폼의 코드 본문은 프로필 `fontFamily.code`와 `typography.body`를 읽고 구문 span은 상속한다. Native의 기본 monospace 의도는 iOS Menlo/Android monospace로 번역하고 custom font 등록은 제품이 한다. 코드 본문은 RTL 화면에서도 LTR 읽기 순서를 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모 폭을 채우고 높이는 코드 줄 수가 정한다. 모서리 `radius.lg` 16, 배경 `surface-alt` | `react/src/code-block.tsx`, `react-native/src/code-block.tsx` |
| 간격 | 머리 줄 안쪽 `spacing.md` 16, 언어 이름↔복사 버튼 `spacing.sm` 12, 코드 영역 안쪽 `spacing.md` 16 | 같은 파일 |
| 순서·정렬 | 위→아래 [언어(또는 label) — 시작 쪽 · `copyAction` — 끝 쪽] → [코드]. 본문 문단 사이에 블록으로 둔다 | 같은 파일 |
| 고정·스크롤 | `wrap` 기본 `false`면 코드 영역만 가로 스크롤한다(Web `pre` `overflow-x: auto`, Native `ScrollView horizontal`). 세로 스크롤 영역은 만들지 않는다 | 같은 파일 |
| 좁은 폭·큰 글자 | 좁은 폭·큰 글자에서 읽기를 우선하면 `wrap`을 켠다(Web `pre-wrap` + `overflow-wrap: anywhere`) | `react/src/code-block.tsx` |

## 꼭 지킬 것

- `tokens`의 `text`를 이어 붙인 결과는 `code`와 공백까지 같아야 한다. 다르면 렌더 중 `TypeError`를 던진다.
- 토큰은 제품이 고른 하이라이터로 만든다(제품 소유). 토큰 색은 HJM semantic 색이 정한다.
- `label`은 i18n 키로 넣는다. Native 접근성 이름에는 `label`과 원문이 함께 들어간다.
- 복사 버튼과 실패 응답은 제품이 `copyAction`으로 공급한다. `onCopyError`에서 "직접 선택해 복사" 같은 안내를 보인다.
- 복사 버튼은 화면의 주 행동이 아니다. 기본 tone은 `secondary`다(미게시(1.12.1 이후). 1.12.1은 Button 기본 `primary`를
  물려받으므로 `tone="secondary"`를 명시한다). 코드 블록 안에서는 `size="small"`을 준다([Button](button.md)의 한 화면 primary 하나 규칙).
- 배치는 Web `layoutStyle`로 한다. Native CodeBlock은 배치 prop이 없으므로 감싸는 레이아웃(`Stack` 등)이 배치한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 원문 요소 | 포커스 가능한 `pre`(`tabIndex=0`) | 선택 가능한 `Text`, `wrap=false`면 가로 `ScrollView` |
| 복사 | `ClipboardButton` 슬롯 | 시스템 텍스트 선택, 또는 제품의 복사 버튼 슬롯 |
| 글꼴 | stylesheet 기본 | iOS `Menlo`, 그 외 `monospace` |

## 함정

- 복사는 화면의 주 행동과 경쟁하지 않도록 `ClipboardButton tone="secondary" size="small"`을 쓴다. Web 예제도 이 구성을 따른다.
- `ClipboardButton`은 `navigator.clipboard`가 거부되면 상태를 바꾸지 않고 `onCopyError`만 부른다. 이 콜백을 비워 두면
  사용자는 실패를 알 수 없다.
