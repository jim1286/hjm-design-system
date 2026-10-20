# Spinner

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/component-recipes.ts`(`spinnerRecipe`)
- 스토리북: `배포/컴포넌트/상태와 알림/로딩 표시`

## 언제 쓰나

진행량을 모르고 도착할 내용의 모양도 정해지지 않은 **짧은 대기**를 한 자리에서 알릴 때 쓴다.
패널 하나를 다시 불러오는 동안, 작은 영역의 결과를 기다리는 동안이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 도착할 목록·카드의 모양을 알고 있음 | [Skeleton](skeleton.md) |
| 진행량을 알거나 긴 작업(업로드·내보내기) | [Progress](progress.md) |
| 버튼을 누른 뒤의 처리 중 | [Button](button.md)의 `loading`(같은 자리에 Spinner를 겹치지 않는다) |
| 목록 끝에서 다음 페이지 | [LoadMore](load-more.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Spinner` | 기본 | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |
| `PendingContent` | 입력·높이를 보존하는 영역 대기(미게시) | `@hjmds/react`, `/feedback` | `@hjmds/react-native`, `/feedback` |

## 최소 사용 예

```tsx
// Web
import { Spinner } from "@hjmds/react/feedback";

<Spinner label={t("feed.loading")} />
```

```tsx
// Native
import { Spinner } from "@hjmds/react-native/feedback";

<Spinner label={t("feed.loading")} size="large" />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | — (필수) | 화면에는 보이지 않고 보조기기에만 읽힌다 |
| `size`(Web) | `small` · `medium` · `large` | `medium` | — |
| `tone`(Web) | `brand` · `neutral` · `inverse` | `brand` | — |
| `size`(Native) | `small` · `large` | `small` | 플랫폼 `ActivityIndicator`를 테마 `contentBrand` 색으로 그린다. `tone`은 없다 |
| `layoutStyle` | `HjmCompositionStyleProp`(margin·width·flex 계열·`alignSelf`) | — | 루트 배치. Web·Native 모두 |
| `style`(Native) | 지원하지 않음 | — | 제거된 속성 — `layoutStyle` 또는 `size`. 현재 공개 props에서 제거되었다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Web `small` 14 · `medium` 20(기본) · `large` 28(`glyph.xs`·`glyph.sm`·`glyph.lg`, 테두리 `stroke.strong` 2). Native는 플랫폼 `ActivityIndicator`의 `small`(기본)·`large`이고 HJM 숫자를 쓰지 않는다 | `spinnerRecipe`, `styles.css` `.hjm-spinner`·`.hjm-spinner__glyph`, `react-native/src/feedback.tsx` |
| 간격 | — | — |
| 순서·정렬 | 기다리는 영역의 가운데에 하나만 둔다. Web·Native 모두 루트가 가운데 정렬(`align-items`·`justify-content: center`)이므로 부모가 영역 크기를 잡아 주면 된다. 화면 전체 대기는 `large`, 카드·행 안의 대기는 `small` | `styles.css` `.hjm-spinner`, `react-native/src/feedback.tsx` |
| 고정·스크롤 | — | — |
| 좁은 폭·큰 글자 | — | — |

버튼 안 대기는 Spinner를 겹치지 않고 [Button](button.md)의 `loading`을 쓴다.

## 꼭 지킬 것

- `label`은 i18n 키로 넣고 "무엇을" 기다리는지 적는다("불러오는 중"만 반복하지 않는다).
- 한 영역에 Spinner는 하나다. 목록 행마다 Spinner를 두면 대신 Skeleton을 쓴다.
- 대기가 끝나면 Spinner를 결과(내용·[EmptyState](empty-state.md)·오류)로 바꾼다.
- 색은 Web `tone`과 테마로만 바꾼다. 어두운 배경 위에서는 `tone="inverse"`를 쓴다.
- 배치(바깥 여백·정렬)는 `layoutStyle`로만 한다. Native `style`은 쓰지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 역할 | `role="status"`, `aria-live="polite"` | `accessibilityRole="progressbar"`, `busy: true` |
| 크기 | 3단계 | `small`·`large` 2단계 |
| tone | 있음 | 없음(항상 brand 색) |
| reduced motion | 회전 멈춤(CSS) | 별도 처리 없음(`ActivityIndicator` 그대로) |
| `style` | HTML 속성(`layoutStyle`과 합쳐지고 `layoutStyle`이 이김) | 제거된 속성 |


## 입력을 보존하는 대기 영역

`PendingContent`는 Spinner의 보조 구성이다. 다에리 로그인 카드가 영역 높이 측정·입력 숨김·로딩 중앙 배치를 제품에서 복제한 것이 추가 계기다. Web·Native의 `/feedback`과 root에서 제공하며 현재 개발 소스의 미게시 API다.

`pending`, 지역화한 `label`, `children`을 전달한다. 대기 중 자식은 언마운트하지 않고 마지막 준비 상태 높이를 유지하며 입력·접근성 탐색에서 제외한다. 한 Spinner를 그 영역의 가로·세로 중앙에 표시한다. 처리 결과·인증·취소는 제품이 소유한다. 화면 전체 인증은 기존 AuthScreenLayout의 pendingLabel을 사용하고, 개별 버튼은 Button.loading을 사용한다.

실행 예제는 Web·Native의 기존 Spinner 스토리 `PendingRegion`이다. 입력 후 대기 시작→취소로 값이 보존되는지 확인한다. 로컬 소스 예제이며 게시본 제공을 뜻하지 않는다.
