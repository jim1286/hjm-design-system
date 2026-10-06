# TextFormat 사용 지침

적용: `@hjmds/react` 1.12.1 (Native 없음) · 검토일: 2026-10-06 ·
계약: [TextFormat](../text-formats.md), recipe `textFormatRecipe`(`src/text-formats.ts`)

## 언제 쓰나

도움말·개발자 안내·약관 본문 안에서 단축키(`⌘S`), 짧은 코드 조각(`pnpm add …`), 인용문을
표시할 때 쓴다. `kind`마다 `<kbd>`·`<code>`·`<blockquote>`라는 다른 HTML 요소를 그려
보조기기가 그 의미대로 읽게 한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 여러 줄 코드, 복사 버튼이 붙은 코드 | [CodeBlock](code-block.md) |
| 단순히 글자 크기·굵기만 다름 | [Text](text.md) |
| Native 화면 | 없음. RN에는 대응 의미 요소가 없어 renderer를 두지 않는다([계약](../text-formats.md)) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TextFormat` | `@hjmds/react`, `/text-formats` | 없음 | 기본 |

## 최소 사용 예

```tsx
// Web
import { TextFormat } from "@hjmds/react/text-formats";

<Text>
  {t("help.saveShortcut.prefix")}{" "}
  <TextFormat kind="kbd">{t("help.saveShortcut.key")}</TextFormat>
</Text>

<TextFormat kind="code">pnpm add @hjmds/react</TextFormat>
```

Native: 없음.

## 축과 기본값

- `kind`(필수): `kbd` → `<kbd>`, `code` → `<code>`, `quote` → `<blockquote>`. 기본값은 없다.
  목록 밖 값은 실행 중 `TypeError`를 던진다.
- 나머지 prop은 해당 HTML 요소의 속성(`HTMLAttributes<HTMLElement>`)으로 전달되고 ref도 그 요소로 간다.

## 꼭 지킬 것

- 키 이름(⌘ / Ctrl 등)은 제품 문구다. 플랫폼별로 다르게 부르므로 i18n 키로 넣고 HJM이 정하지 않는다.
- `quote`는 블록 요소(`<blockquote>`)를 만든다. 문단 안 인라인 강조용으로 쓰지 않는다.
- `className`은 붙일 수 있지만(`hjm-text-format`에 합쳐진다) 글꼴·색·테두리를 덮지 않는다.
  배치 외 시각 override는 [소비 정책](../consumer-policy.md) 위반이다.
- 모양은 `@hjmds/react/styles.css`의 `.hjm-text-format` 규칙이 그린다. stylesheet를 불러오지
  않은 화면에서는 의미 요소만 남고 HJM 모양은 없다.
