# Skeleton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-17
- 근거: `src/component-recipes.ts`(`skeletonRecipe`), `src/semantic-colors.ts`(`surface.placeholder`), `src/foundations.ts`(`glyph`·`control`)
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

// 영역에서 한 번만 알린다. Skeleton 자체는 aria-hidden이다.
<Stack gap="sm" role="status" aria-label={t("profile.loading")} aria-busy="true">
  <Stack axis="inline" gap="sm" align="center">
    <Skeleton shape="circle" />
    <Skeleton shape="text" lines={2} layoutStyle={{ flex: 1 }} />
  </Stack>
  <Skeleton shape="media" />
</Stack>
```

```tsx
// Native
import { Skeleton } from "@hjmds/react-native/feedback";

<Stack gap="sm" accessible accessibilityLabel={t("profile.loading")} accessibilityState={{ busy: true }}>
  <Stack axis="inline" gap="sm" align="center">
    <Skeleton shape="circle" />
    <Skeleton shape="text" lines={2} layoutStyle={{ flex: 1 }} />
  </Stack>
  <Skeleton shape="media" />
</Stack>
```

목록 행 하나를 대신할 때는 Skeleton을 조립하지 말고 [ListRow](list-row.md)의 `loading`을 쓴다. 행 높이·슬롯
배치를 그대로 유지하고 같은 채움색을 쓴다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `shape` | `block`(높이 `spacing.xxl` 32·radius `md`) · `text`(`spacing.md` 16·`sm`) · `circle`(`glyph.xxl` 44 지름·`full`) · `media`(폭 100%·16:9·`md`) · `button`(`control.buttonHeight.medium` 44·Button 기본 모양의 모서리 `md`, `buttonShape`로 바꿈) | `block` | 모양과 기본 크기. `media`·`button`은 2026-10-17 추가 |
| `buttonShape` | `rounded` · `pill`(Button `shape`와 같은 축) | Button 기본값(`rounded`) | `button` 전용. 모서리를 `buttonRecipe.shapes`(rounded `md` · pill `full`)와 테마 radius에서 가져온다. 알약 버튼을 쓰는 제품(번뚝)은 버튼에 준 `shape="pill"`을 그대로 넘긴다(1.28.1) |
| `lines` | 양의 정수 | `1` | `text` 전용. 줄 수만큼 그리고 마지막 줄은 60%(`skeletonRecipe.lines.lastLineWidthPercent`), 줄 간격 `spacing.xs` 8. 펄스는 묶음 하나로 돈다. `width`는 묶음 전체 폭 |
| `animated` | `boolean` | `true`(펄스) | 0.9.12까지는 `false`였다. 정지 블록이 필요하면 `animated={false}`를 명시한다. reduced motion이면 두 renderer 모두 펄스를 멈추고 불투명한 끝 값으로 그린다(recipe `reducedMotion: "static"`) |
| `width` | Web `string \| number` · Native `ViewStyle["width"]` | 폭 100%(circle은 지름) | — |
| `height` | Web `string \| number` · Native `number` | shape 기본값 | — |
| `accessibilityLabel`(Native) | 문자열 | — | 주면 `busy` 상태로 읽힌다. 영역 첫 Skeleton 하나에만 준다 |
| `radius`(Native) | 숫자 | — | 0.9 호환용, `shape`보다 우선 |
| `layoutStyle` | 배치 전용 style 객체 | — | 바깥 여백만 |

콜백 prop은 없다.

### 디자인 프로필 상속

2026-10-07 테마 소비 경로 점검에서 고정 foundation/recipe 값이 남은 곳을 보완했다.
모서리의 recipe 역할은 유지하고 값은 가장 가까운 Provider의 `designProfile.tokens.radius`를
읽는다. Dialog/AlertDialog/Sheet/일반 Toast의 그림자는 `tokens.shadow.floating`을 읽으며
프로필 없는 소비자의 기본값은 유지한다. 상태·초안·선택·Modal teardown은 이 축의 소유가 아니다.
플랫폼 근사와 미검증 범위는 [프로필 계약](../../design-profile.md#오버레이선택-입력의-프로필-연결-보완)을 따른다.


## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | `block` 폭 100% · 높이 32, `text` 높이 16, `circle` 지름 44, `media` 폭 100% · 16:9, `button` 높이 44. 여러 줄 본문은 `lines`로(마지막 줄 60%) | `skeletonRecipe.shapes`·`.lines`, `.hjm-skeleton` |
| 색 | `semanticColors.surface.placeholder`(`text` 12% 투명도) 채움, 테두리 없음. 놓인 면(canvas·Card·프로필 테마)을 기준으로 진해진다 | `skeletonRecipe.background`, `--hjm-skeleton-background` |
| 간격 | 실제 콘텐츠의 간격 토큰을 그대로 쓴다(예: [Stack](stack.md) `spacing.xs` 8). Skeleton에 margin을 넣지 않는다 | — |
| 순서·정렬 | 로드 뒤 실제 콘텐츠가 놓일 자리에 같은 순서로. 목록 행은 ListRow `loading`, 카드는 `media` + `text lines={2}` + `button` | — |
| 고정·스크롤 | 스크롤 영역 안의 콘텐츠만 대신한다. 고정 바(TopBar·BottomCTA)는 그대로 둔다 | — |
| 좁은 폭·큰 글자 | `block`·`text`는 폭 100%라 컨테이너를 따른다. 높이는 글자 크기와 무관한 고정값이다 | `.hjm-skeleton` |

## 꼭 지킬 것

- 실제 콘텐츠와 같은 자리·비슷한 크기로 둔다. 로딩이 끝나면 Skeleton을 내용으로 **바꾼다**(겹쳐 두지 않는다).
- 색·테두리는 recipe와 테마가 정한다. 배치는 `layoutStyle`로 하고 `style`/`className`으로 회색 배경을 덮지 않는다.
  Native `style`은 제거된 속성이다.
- Web Skeleton은 `aria-hidden`이다. 로딩 사실을 알려야 하면 영역 단위로 한 번 알린다
  (예: 감싼 영역의 `aria-busy`, 또는 Spinner 하나). Skeleton마다 라벨을 붙이지 않는다.
- Web은 `HjmProvider` 안에서 렌더한다. 채움색·원 지름·버튼 높이·media 비율·줄 간격·펄스 값을 provider가 내보내는 `--hjm-skeleton-*` 변수로 읽는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 접근성 | 항상 `aria-hidden` | `accessibilityLabel`을 주면 `busy` 상태로 읽힘, 없으면 숨김(Android `no-hide-descendants`) |
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

## 근거

- 2026-10-17 사용자 요청("스켈레톤 유아이 개선해줘"): Native 스토리가 흰 바탕 위 옅은 테두리 막대 하나로만 보였다.
  원인은 `skeletonRecipe.background`가 화면 바탕과 같은 `semanticColors.canvas`였고, 두 renderer가 그 위에 1px
  테두리를 직접 그린 것이다. 2026-09-29 "넓은 회색·연파랑 면은 canvas + 테두리" 방향을 Skeleton에도 적용했지만,
  자리표시는 채운 면이어야 모양이 읽히므로 Skeleton·ListRow `loading`을 그 방향의 예외로 둔다.
- 채움은 불투명 `surfaceAlt` 대신 `text` 12% 투명도다. 대비(바탕 대비, 펄스 최고점): 기본 밝은 테마 약 1.27:1(펄스 최저점 1.14),
  어두운 테마 약 1.36:1(1.16). 불투명 `surfaceAlt`는 1.23 / 1.20, Card 면(`surface`) 위에서는 1.12 / 1.10이었고, `surfaceAlt`가 `bg`만큼 밝은
  프로필 팔레트에서는 거의 보이지 않았다. 장식 요소라 텍스트 대비 기준은 적용하지 않는다.
- `media`·`button`·`lines`는 카드·본문 자리표시를 제품마다 막대로 다시 조립하던 일을 줄이려고 추가했다. 목록 행은
  기존 ListRow `loading`이 맡으므로 별도 조합 컴포넌트는 두지 않는다.
- 움직임은 기존 불투명도 펄스(0.56↔1)를 유지한다. 빛 띠(shimmer)는 Native에 그라데이션 peer가 필요하고 reduced
  motion에서는 어차피 정지해야 한다.
