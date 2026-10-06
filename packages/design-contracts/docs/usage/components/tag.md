# Tag

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Tag contract](../../tag.md), `src/tag.ts`(`tagRecipe`)
- 스토리북: `배포/컴포넌트/데이터 표시/태그`

## 언제 쓰나

반복해서 나오는 **정적 메타데이터 한 조각**에 쓴다. `좌익수`, `A등급`, `2026 시즌`처럼 누르지도,
고르지도, 지우지도 않는 짧은 라벨이다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 누르거나 선택·해제하는 조각(필터, 지울 수 있는 태그) | [Chip](chip.md) |
| 상태(새 글, 실패, 진행 중)를 알림 | [Badge](badge.md) |
| 아이콘·아바타 위 숫자 | [CounterBadge](counter-badge.md) |
| 사용자가 여러 값을 입력해 모음 | [TagsInput](tags-input.md) |
| 경고·위험 안내 | [Notice](notice.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Tag` | 기본 | `@hjmds/react`, `/display` | `@hjmds/react-native`, `/data-display` |

## 최소 사용 예

```tsx
// Web
import { Tag } from "@hjmds/react/display";

<Tag tone="success">{t("player.gradeA")}</Tag>
```

```tsx
// Native
import { Tag } from "@hjmds/react-native/data-display";

<Tag layoutStyle={{ marginTop: 4 }}>{t("player.position.leftField")}</Tag>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `children` | 문자열 | — (필수) | 문자열만 받는다. 비어 있으면 `TypeError` |
| `tone` | `neutral` · `info` · `success` · `attention` · `brand` | `neutral` | `warning`·`danger`는 없다(이유는 계약 문서) |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 바깥 여백·`alignSelf` 같은 배치. Web·Native 모두 |
| `accessibilityLabel`(Native) | `string` | 라벨 | — |
| `style`·`labelStyle`(Native) | `StyleProp` | — | deprecated — `layoutStyle` 또는 `tone`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

모양은 radius `sm` 사각형, 최소 높이 20(큰 글자에서 늘어남), caption 크기 semibold 글자다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 20, 테두리 1, radius `sm` 8. 누르는 대상이 아니므로 44 터치 영역을 두지 않는다 | `tagRecipe.size`, `styles.css` `.hjm-tag`, `react-native/src/data-display.tsx` |
| 간격 | 좌우 여백 `spacing.xxs` 4. 제목 옆이면 간격 `spacing.xs` 8, 여러 개는 가로로 `spacing.xxs` 4~`xs` 8 | `tagRecipe.size` |
| 순서·정렬 | 제목·행 옆에 붙는 작은 메타 표시다. 제목 옆이면 제목과 세로 가운데 정렬한다 | — |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | 여러 개는 줄바꿈(`wrap`)한다. 큰 글자에서는 높이가 글자에 맞춰 늘어난다(고정 높이 금지) | `tagRecipe.size.minHeight` 주석 |

## 꼭 지킬 것

- 라벨은 i18n 키로 넣는다. 라벨 문구와 어떤 값에 어떤 tone을 줄지는 제품 소유, 색·모양은 HJM 소유다.
- 배치는 `layoutStyle`로만 한다. 색·radius·여백을 덮지 않는다.
- `onClick`/`onPress`를 붙여 누르는 Tag로 만들지 않는다. 누를 수 있어야 하면 Chip을 쓴다.
- 여러 Tag는 [Stack](stack.md) `axis="inline"`·`wrap`으로 나열한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근 이름 | 보이는 글자 | 기본은 라벨, `accessibilityLabel`로 바꿀 수 있음 |
| 추가 style prop | `className`·`style`(HTML 속성) | `style`·`labelStyle`(deprecated) |
| ref | `forwardRef`(`span`) | 없음 |
| import 경로 | `/display` | `/data-display` |
