# TextFormat

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [TextFormat](../../text-formats.md), `src/text-formats.ts`(`textFormatRecipe`)
- 스토리북: `배포/컴포넌트/글자와 아이콘/글자 서식`

## 언제 쓰나

도움말·개발자 안내·약관 본문 안에서 단축키(`⌘S`), 짧은 코드 조각(`pnpm add …`), 인용문을
표시할 때 쓴다. `kind`마다 `<kbd>`·`<code>`·`<blockquote>`라는 다른 HTML 요소를 그려
보조기기가 그 의미대로 읽게 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 줄 코드, 복사 버튼이 붙은 코드 | [CodeBlock](code-block.md) |
| 단순히 글자 크기·굵기만 다름 | [Text](text.md) |
| Native 화면 | 없음. RN에는 대응 의미 요소가 없어 renderer를 두지 않는다([계약](../../text-formats.md)) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TextFormat` | 기본 | `@hjmds/react`, `/text-formats` | — |

## 최소 사용 예

```tsx
// Web
import { Text } from "@hjmds/react/layout";
import { TextFormat } from "@hjmds/react/text-formats";

<>
  <Text>
    {t("help.saveShortcut.prefix")}{" "}
    <TextFormat kind="kbd">{t("help.saveShortcut.key")}</TextFormat>
  </Text>
  <TextFormat kind="code">pnpm add @hjmds/react</TextFormat>
</>
```

Native: 없음.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `kind`(필수) | `kbd` → `<kbd>` · `code` → `<code>` · `quote` → `<blockquote>` | 없음 | 목록 밖 값은 실행 중 `TypeError` |
| `children` | `ReactNode` | — (필수) | — |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 배치(주로 `quote` 블록의 바깥 여백·폭) |
| 나머지 | `HTMLAttributes<HTMLElement>` | — | 해당 HTML 요소로 전달되고 ref도 그 요소로 간다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `kbd`·`code` 안쪽 좌우 여백 `spacing.xxs` 4, 모서리 `radius.sm` 8. `quote` 시작 쪽 2px 세로 선과 안쪽 여백 `spacing.md` 16 | `.hjm-text-format[data-kind]` |
| 간격 | 바깥 여백이 없다(`margin: 0`). `quote` 앞뒤 문단과의 간격은 부모가 준다 | `.hjm-text-format` |
| 순서·정렬 | `kbd`·`code`는 문장 안에 인라인으로, `quote`는 블록으로 놓는다 | `.hjm-text-format` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 긴 코드 조각은 줄바꿈된다(`overflow-wrap: anywhere`). 줄바꿈 없이 가로 스크롤이 필요하면 [CodeBlock](code-block.md) | `.hjm-text-format` |

## 꼭 지킬 것

- 키 이름(⌘ / Ctrl 등)은 제품 문구다. 플랫폼별로 다르게 부르므로 i18n 키로 넣고 HJM이 정하지 않는다.
- `quote`는 블록 요소(`<blockquote>`)를 만든다. 문단 안 인라인 강조용으로 쓰지 않는다.
- 배치는 `layoutStyle`로 한다. `className`은 붙일 수 있지만(`hjm-text-format`에 합쳐진다) 글꼴·색·테두리를 덮지 않는다.
  배치 외 시각 override는 [소비 정책](../../consumer-policy.md) 위반이다.
- 모양은 `@hjmds/react/styles.css`의 `.hjm-text-format` 규칙이 그린다. stylesheet를 불러오지
  않은 화면에서는 의미 요소만 남고 HJM 모양은 없다.
