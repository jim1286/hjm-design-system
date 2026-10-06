# Button

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [버튼 라벨 줄바꿈](../../button-label.md), `src/base-recipes.ts`(`buttonRecipe`), `src/foundations.ts`(`control.buttonHeight`)
- 스토리북: `배포/컴포넌트/동작/버튼`, `배포/컴포넌트/동작/버튼 안에서 확인`, `배포/컴포넌트/동작/반응 선택`

## 언제 쓰나

사용자가 누르면 무언가가 일어나는 텍스트 행동에 쓴다. 저장·확인·다음 같은 화면의 주 행동,
보조 행동, 삭제처럼 되돌리기 어려운 행동, 켜고 끄는 토글 버튼(`selected`)이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 아이콘만 있는 행동 | [IconButton](icon-button.md) |
| 화면 하단에 고정된 주 행동 | [BottomCTA](bottom-cta.md) |
| 다른 페이지·URL로 이동 | [Link](link.md) (`tone="link"` 버튼은 같은 화면 안의 행동용) |
| 여러 선택지 중 하나를 고름 | [SegmentedControl](segmented-control.md), [ToggleGroup](toggle-group.md) |
| 소셜 로그인 | [AuthProviderButton](auth-provider-button.md) |
| 복사 | `ClipboardButton`(Web, 아래 표) |
| 떠 있는 주 행동 | [FloatingActionButton](floating-action-button.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Button` | 기본 | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions` |
| `ClipboardButton` | 동반(복사) | `/clipboard` | — |
| `InlineConfirm` | 확장(버튼 자리에서 한 번 더 확인) | `/inline-confirm` | `/inline-confirm` |
| `ReactionPicker` | 확장(반응 고르기) | `/reaction-picker` | `/reaction-picker` |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";

<Button tone="primary" loading={saving} onClick={save}>
  {t("profile.save")}
</Button>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";

<Button tone="primary" loading={saving} onPress={save} fullWidth>
  {t("profile.save")}
</Button>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tone` | `primary` · `secondary` · `ghost` · `danger` · `link` | `primary` | 한 화면의 `primary`는 하나(예외는 아래 꼭 지킬 것) |
| `size` | `small` · `medium` · `large` | `medium` | 높이 36 · 44 · 52 |
| `shape` | `rounded` · `pill` | `rounded` | `radius.md` · `full` |
| `align` | `center` · `leading` | `center` | `leading`은 꽉 찬 폭의 행 행동 |
| `selected` | `boolean` | — | 주면 토글 버튼. Web `aria-pressed`, Native 접근성 state |
| `loading` | `boolean` | `false` | 기존 문구·아이콘을 시각적으로 숨기고 중앙 스피너 하나만 표시한다. 같은 children을 유지해 크기를 보존하고 누름을 막는다. 접근성 이름·포커스는 유지한다(Web `aria-disabled`, Native는 `disableWhileLoading`으로만 옛 disabled 동작) |
| Web `onClick` | `(event: MouseEvent<HTMLButtonElement>) => void` | — | `disabled`·`loading`·`aria-disabled`이면 부르지 않는다 |
| Native `onPress` | `(event: GestureResponderEvent) => void` | — | 같은 조건에서 부르지 않는다 |
| `leading` · `trailing` | `ReactNode` | — | 라벨 앞뒤 아이콘 |
| `layoutStyle` | margin·width·flex·`alignSelf` | — | 배치. Web 꽉 찬 폭은 `layoutStyle={{ width: "100%" }}` |
| Native `fullWidth` | `boolean` | `false` | 부모 폭을 채운다 |
| Native `loadingLabel` · `renderLoadingIndicator` | `ReactNode` · `(props: { color: string; size: "small" }) => ReactNode` | — | 로딩 중 읽기 문구·스피너 교체 |
| Native `growWithContent` | `boolean` | `false` | 이미지 등 사용자 콘텐츠가 recipe 높이를 넘어 늘어나게 한다. 문자열·숫자 라벨은 이 옵션 없이도 줄 수에 맞춰 늘어난다 |
| `ClipboardButton` | `value: string`, `labels: { idle; copied }`, `onCopy?: (value: string) => void`, `onCopyError?: (error: unknown) => void`, `feedbackDuration?`(ms, 2000) | — | Button props를 물려받는다(`tone` 기본 `secondary`, 미게시(1.12.1 이후). 1.12.1은 `primary`). 쓰는 법은 [CodeBlock](code-block.md) |
| `InlineConfirm` | `label`·`prompt`·`confirmLabel`·`cancelLabel`·`pendingLabel`·`successLabel`·`errorLabel`(모두 `string`), `onConfirm: () => void \| Promise<void>` | — | danger 버튼 → 같은 자리 확인 묶음. Promise가 거부되면 `errorLabel`을 alert로 보인다. Web만 `layoutStyle` |
| `ReactionPicker` | `label: string`, `options: readonly { id; emoji; label; count?; disabled? }[]`, `value: string \| null`, `onValueChange: (value: string \| null) => void`, `layout?: "wrap" \| "strip"`, `more?: { label; options }` | `layout` `wrap` | 제어 전용. 같은 반응을 다시 누르면 `null`. 이모지는 `strip`(대화 반응 줄)에서만 `typography.title` 18/26으로 커지고 `wrap`은 버튼 글자 크기 그대로다. `more`를 주면 끝에 `+` 토글이 생겨 카탈로그를 펼치고, 카탈로그에만 있는 이모지를 고르면 접히면서 Web 키보드 포커스가 `+` 버튼으로 간다. Web만 `layoutStyle`(루트 기본 `minWidth`보다 우선). `layout`·`more`·`layoutStyle`은 미게시(1.12.1 이후) |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이 `small` 36 · `medium` 44 · `large` 52. `small`만 hitSlop 4로 터치 영역 44 | `control.buttonHeight`, `control.buttonHitSlop` |
| 간격 | 나란한 버튼 사이 `spacing.sm` 12. Dialog·Sheet 행동 영역 좌우·아래 여백 `spacing.lg` 20 | `.hjm-dialog__footer` |
| 순서·정렬 | 가로 행동 줄은 **보조 → 주**, 끝 정렬. 세로 순서는 배치 소유자의 계약을 따른다: Dialog는 보조 → 주, Native Sheet는 주 → 보조, 좁은 AlertDialog는 주 → 보조. 본문의 짧은 선택·확정 구성은 해당 구성의 순서다. 목록 행 끝은 `small` + `ghost`/`secondary`, `primary` 금지 | `renderAction` 순서(Native overlays), `.hjm-dialog__footer` |
| 고정·스크롤 | 화면 맨 아래 고정 주 행동은 Button 대신 [BottomCTA](bottom-cta.md)(안전 영역·키보드 처리) | — |
| 좁은 폭·큰 글자 | 폭 < 600(`breakpoint.medium`)이면 AlertDialog 행동을 세로로 쌓고 주 행동이 위(DOM은 [취소][확인] 유지). 라벨은 두 줄까지, 큰 글자에서는 상한 해제 | `.hjm-alert-dialog__actions`, [버튼 라벨](../../button-label.md) |

```text
대화상자·시트 하단                     폭 < 600인 AlertDialog
┌──────────────────────────────┐      ┌──────────────────────┐
│                [취소] [저장] │      │ [      삭제      ]   │ ← primary(danger)
│   secondary ─┘   primary ─┘  │      │ [      취소      ]   │
└──────────────────────────────┘      └──────────────────────┘
```

## 꼭 지킬 것

- 라벨은 i18n 키로 넣는다. 자르지 말고 두 줄을 넘으면 카피를 고친다([라벨 정책](../../button-label.md)).
- 배치는 `layoutStyle`로만 한다. 색·radius·높이를 `style`/`className`으로 덮지 않는다.
  Native에서 `style`·`labelStyle`을 넘기면 실행 중 `TypeError`가 난다.
- 색은 tone과 제품 테마 토큰으로 바꾼다. 버튼마다 브랜드 색을 하드코딩하지 않는다.
- 진행 중 상태는 `loading`으로 표시하고 같은 자리에 별도 Spinner를 겹치지 않는다. children을 빈 문자열이나 다른 길이의 진행 문구로 바꾸지 않는다. 렌더러가 문구·아이콘을 숨긴 자리에 중앙 스피너만 표시하고 기존 크기·접근성 이름을 유지한다. 2026-10-06 독립 검증에서 이 사용자 요구가 사용 지침에는 빠져 있음을 확인해 명시했다.
- "한 화면 `primary` 하나"의 예외는 다음과 같다. `selected`를 준 버튼은 tone과 관계없이 `buttonRecipe.states.selected`(배경 `bg`, 글자·테두리 `contentBrand`)로 칠해져 primary 채움이 아니므로 세지 않고(Web `.hjm-button[data-selected="true"]`, Native `internal/recipe-button.tsx`, 검색·작품 탐색 스토리의 필터 줄), Sheet·Dialog 안의 행동은 그 표면 안에서 primary 하나를 센다([Sheet](sheet.md) `footer`, 작품 탐색·랜딩 스토리의 시트).

- 긴 소개 화면에서 위·아래 CTA가 **동일한 행동**으로 이어지고 서로 다른 스크롤 구간에 있으면 둘 다 primary를 허용한다. 큰 글자에서 첫 CTA가 멀어지는 문제를 보완하기 위한 예외이며, 서로 다른 가입·구매 행동을 동시에 강조하는 근거로 쓰지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress` |
| 꽉 찬 폭 | `layoutStyle={{ width: "100%" }}` | `fullWidth` |
| 로딩 문구·스피너 교체 | 없음 | `loadingLabel`, `renderLoadingIndicator` |
| 내용에 맞춰 높이 증가 | CSS가 처리 | 문자열·숫자 라벨은 자동. 사용자 콘텐츠는 `growWithContent` |
| 기본 `type` | `"button"`(폼 submit은 `type="submit"`을 명시) | 해당 없음 |


- 2026-10-06 독립 지침 재구현에서 footer 순서를 모든 본문 행동에 강제하는 것으로 읽혔다. 시간 선택처럼 주 행동 다음에 초기화가 오는 구성과 AlertDialog의 좁은 폭 순서는 각각 명시된 구성 계약을 따른다.
