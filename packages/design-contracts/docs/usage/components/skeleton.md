# Skeleton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`skeletonRecipe`), `src/foundations.ts`(`glyph`)
- 스토리북: `배포/컴포넌트/상태와 알림/스켈레톤`

## 언제 쓰나

데이터가 오기 전, 곧 채워질 콘텐츠의 **모양을 미리 보여 줄 때** 쓴다. 목록 행·카드·프로필
사진·본문 줄처럼 도착 뒤의 배치를 알고 있고, 로딩이 끝나면 같은 자리에 실제 내용이 들어오는 경우다.

## 쓰지 않을 때

로딩 표시 셋은 "무엇을 아는가"로 고른다.

| 상황 | 대신 쓸 것 |
| --- | --- |
| 도착할 내용의 모양을 모르거나 작은 영역의 짧은 대기 | [Spinner](spinner.md) |
| 진행량(몇 %, 몇 개 중 몇 개)을 알거나 사용자가 기다려야 하는 긴 작업 | [Progress](progress.md) |
| 버튼을 누른 뒤의 처리 중 | [Button](button.md)의 `loading` |
| 목록 끝에서 다음 페이지를 불러옴 | [LoadMore](load-more.md) |
| 불러온 결과가 비어 있음 | [EmptyState](empty-state.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Skeleton` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |

## 최소 사용 예

```tsx
// Web
import { Skeleton } from "@hjmds/react/feedback";

<>
  <Skeleton shape="circle" />
  <Skeleton shape="text" width="60%" />
</>
```

```tsx
// Native
import { Skeleton } from "@hjmds/react-native/feedback";

<>
  <Skeleton shape="circle" accessibilityLabel={t("profile.loading")} />
  <Skeleton shape="text" width="60%" />
</>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `shape` | `block`(높이 `spacing.xxl`·radius `md`) · `text`(`spacing.md`·`sm`) · `circle`(`glyph.xxl` 지름·`full`) | `block` | 모양과 기본 크기 |
| `animated` | `boolean` | `true`(펄스) | 0.9.12까지는 `false`였다. 정지 블록이 필요하면 `animated={false}`를 명시한다. reduced motion이면 두 renderer 모두 펄스를 멈추고 불투명한 끝 값으로 그린다(recipe `reducedMotion: "static"`) |
| `width` | Web `string \| number` · Native `ViewStyle["width"]` | 폭 100%(circle은 지름) | — |
| `height` | Web `string \| number` · Native `number` | shape 기본값 | — |
| `accessibilityLabel`(Native) | 문자열 | — | 주면 `busy` 상태로 읽힌다. 영역 첫 Skeleton 하나에만 준다 |
| `radius`(Native) | 숫자 | — | 0.9 호환용, `shape`보다 우선 |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백만 |

콜백 prop은 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `block` 폭 100% · 높이 `spacing.xxl` 32, `text` 높이 `spacing.md` 16, `circle` 지름 `glyph.xxl` 44. 텍스트 마지막 줄은 `width="60%"`처럼 짧게 | `skeletonRecipe.shapes`, `.hjm-skeleton` |
| 간격 | 실제 콘텐츠의 간격 토큰을 그대로 쓴다(예: [Stack](stack.md) `spacing.xs` 8). Skeleton에 margin을 넣지 않는다 | — |
| 순서·정렬 | 로드 뒤 실제 콘텐츠가 놓일 자리에 같은 순서로. 목록이면 행 구조(원 + 텍스트 줄 둘)를 행 수만큼 반복 | — |
| 고정·스크롤 | 스크롤 영역 안의 콘텐츠만 대신한다. 고정 바(TopBar·BottomCTA)는 그대로 둔다 | — |
| 좁은 폭·큰 글자 | `block`·`text`는 폭 100%라 컨테이너를 따른다. 높이는 글자 크기와 무관한 고정값이다 | `.hjm-skeleton` |

## 꼭 지킬 것

- 실제 콘텐츠와 같은 자리·비슷한 크기로 둔다. 로딩이 끝나면 Skeleton을 내용으로 **바꾼다**(겹쳐 두지 않는다).
- 색·테두리는 recipe와 테마가 정한다. 배치는 `layoutStyle`로 하고 `style`/`className`으로 회색 배경을 덮지 않는다.
  Native `style`은 deprecated(개발 모드 경고, 다음 major 제거)다.
- Web Skeleton은 `aria-hidden`이다. 로딩 사실을 알려야 하면 영역 단위로 한 번 알린다
  (예: 감싼 영역의 `aria-busy`, 또는 Spinner 하나). Skeleton마다 라벨을 붙이지 않는다.
- Web은 `HjmProvider` 안에서 렌더한다. 원 지름·펄스 값을 provider가 내보내는 `--hjm-skeleton-*` 변수로 읽는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근성 | 항상 `aria-hidden` | `accessibilityLabel`을 주면 `busy` 상태로 읽힘, 없으면 숨김 |
| 높이 | `string \| number` | `number`만 |
| 모서리 직접 지정 | 없음 | `radius`(0.9 호환용, `shape`보다 우선) |
| reduced motion 판단 | `prefers-reduced-motion`·`.hjm-root[data-motion="reduced"]` | provider `environment.reducedMotion` |

## 함정

- Native에서 `width`·`height`·`radius`는 `shape`보다 우선한다. 셋을 다 주면 shape가 사실상 무시된다.
- Native는 `RN Animated`(native driver)로 펄스를 돌린다. 별도 peer 의존성은 없다.
- Native `accessibilityLabel?: string`은 `exactOptionalPropertyTypes`에서 `undefined`를 받지 않는다. 첫 Skeleton에만 줄 때는
  `{...(first ? { accessibilityLabel: t("…") } : {})}`처럼 조건부 spread로 넘긴다.
- 현재 Web `style`은 `width`·`height` prop 값 뒤에 펼쳐져 크기·배경을 덮을 수 있다(타입이 막지 않는다). 크기는 `width`·`height`,
  배치는 `layoutStyle`로 준다.
