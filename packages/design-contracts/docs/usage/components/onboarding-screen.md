# OnboardingScreen

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: [반복 화면 조합](../../screen-patterns.md), Web·Native `src/screens.tsx`·`src/screen-flows.tsx`; 기존 개별 지침을 새 규격으로 통합. 예제 스토리는 2026-10-06 사용자 승인으로 스토리북 배포([승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정)). 스토리북 배포는 API 게시가 아니다(`적용` 참고)
- 스토리북: `배포/화면/소개/온보딩`

2026-10-07 Motion의 단계 카드 검토에서 새 상태 엔진을 추가하기 전에 npm 1.14.0의
양 renderer `screen-flows.d.ts`·`screen-flows.js`·exports를 확인했다. 기존 `layoutStyle`과
마지막 `complete` 행동이 이미 게시돼 있어 오래된 미게시 표기를 바로잡는다. 현재 개발 중인
디자인 프로필 확장의 게시 여부와는 별개다([조사 근거](../../../../../docs/qa/2026-10-07-motion-reference-page-review.md)).

## 언제 쓰나

첫 실행 소개·초기 설정처럼 **몇 단계를 차례로 넘기는 화면**에 쓴다. 현재 단계의 제목·설명·본문,
진행 문구(“2/4”), 다음·이전·건너뛰기·완료 행동을 [ScreenLayout](screen-layout.md) 위에 조합한다.
단계 범위가 틀리면 렌더 중 던진다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 단계 표시만 필요(본문은 자유 배치) | [Steps](steps.md) |
| 화면 위에 겹치는 기능 안내 | [Tour](tour.md) |
| 권한 하나를 요청하는 단계 | [PermissionScreen](permission-screen.md) |
| 좌우로 넘기는 이미지 소개 | [Carousel](carousel.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `OnboardingScreen` | supplemental, 루트 barrel에 없음 | `/screen-flows` | `/screen-flows` |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web
import { OnboardingScreen } from "@hjmds/react/screen-flows";

<OnboardingScreen
  steps={[
    { id: "welcome", title: t("onboarding.welcome.title"), description: t("onboarding.welcome.body"), content: welcomeArt },
    { id: "goal", title: t("onboarding.goal.title"), description: t("onboarding.goal.body"), content: goalPicker },
  ]}
  index={index}
  onIndexChange={setIndex}
  nextLabel={t("common.next")}
  backLabel={t("common.back")}
  complete={{ label: t("onboarding.start"), onAction: finish, pending: saving }}
  skip={{ label: t("common.skip"), onAction: finish }}
  progressLabel={(current, total) => t("onboarding.progress", { current, total })}
/>
```

```tsx
// Native — props는 Web과 같다
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";

<OnboardingScreen
  steps={[
    { id: "welcome", title: t("onboarding.welcome.title"), description: t("onboarding.welcome.body"), content: welcomeArt },
    { id: "goal", title: t("onboarding.goal.title"), description: t("onboarding.goal.body"), content: goalPicker },
  ]}
  index={index}
  onIndexChange={setIndex}
  nextLabel={t("common.next")}
  backLabel={t("common.back")}
  complete={{ label: t("onboarding.start"), onAction: finish, pending: saving }}
  skip={{ label: t("common.skip"), onAction: finish }}
  progressLabel={(current, total) => t("onboarding.progress", { current, total })}
/>
```

### 제품이 공급할 것

| prop | 내용 |
| --- | --- |
| `steps` | `{ id, title, description, content }[]`. 1개 이상. 제목·설명은 지역화 문자열, `content`는 단계 본문 |
| `index`, `onIndexChange` | 현재 단계(0부터, 제어형). 범위를 벗어나면 던진다 |
| `nextLabel`, `backLabel` | 다음·이전 문구. 첫 단계에는 이전이 없다 |
| `complete` | 마지막 단계의 주 행동 `{ label, onAction, disabled?, pending? }` |
| `skip` | 선택. Web은 헤더 actions, Native는 본문 진행 문구 다음에 보조 버튼으로 놓인다 |
| `progressLabel(current, total)` | 1부터 센 현재 단계와 전체 수로 진행 문구를 만든다 |
| `layoutStyle` | 선택. ScreenLayout 루트의 공개 배치 슬롯 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | ScreenLayout의 기본 최대 폭 720; 다음·완료·이전은 `Button` 기본 크기 | `screenPatternRecipe.maxWidth` |
| 간격 | 기본 화면 padding `spacing.md` 16; footer 다음/완료–이전 `spacing.sm` 12; Native 본문 제목·설명·진행·건너뛰기·content 사이 `spacing.md` 16. 단계 content 내부 간격은 제품 소유 | ScreenLayout·양 renderer OnboardingScreen |
| 순서·정렬 | Web: 헤더(제목·설명 → 건너뛰기) → 진행 문구 → content. Native: 본문(제목 → 설명 → 진행 문구 → 건너뛰기 → content). 둘 다 footer는 다음 또는 완료 → 이전, 첫 단계는 이전 없음 | 실제 렌더 순서 |
| 고정·스크롤 | Web은 헤더·진행 문구·footer가 본문 스크롤 밖. Native는 제목·설명·진행·건너뛰기·content가 함께 스크롤하고 footer만 고정 | Native의 빈 header·기본 scroll="screen" |
| 좁은 폭·큰 글자 | Web 헤더 제목 열은 최소 폭 120 × 글자 배율이며 actions가 줄바꿈한다. Native는 본문 세로 Stack을 사용한다. 둘 다 footer 버튼은 세로로 쌓인다 | ScreenLayout·OnboardingScreen |

## 꼭 지킬 것

- 단계에서 고른 값의 저장, 완료 여부 저장, 다시 보여 주지 않기는 제품 소유다. `complete.onAction`에서 처리한다.
- ScreenLayout의 `header`·`state`·`contentInset` 같은 화면 props는 받지 않는다. 화면 틀을 바꿔야 하면 ScreenLayout으로 직접 조합한다.
  배치 prop은 `layoutStyle` 하나이며 Web·Native 모두 화면 루트(ScreenLayout)에 넘긴다.
- 문구·일러스트·브랜드 이미지는 제품 소유다. `content`에 제품 자산을 넣는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 prop | `layoutStyle`(ScreenLayout 루트, 1.14.0 게시 확인) | `layoutStyle`(ScreenLayout 루트, 1.14.0 게시 확인) |
| 단계 안내 | 헤더와 notice | 스크롤 본문. 큰 글자에서 안내가 고정 영역을 모두 차지하지 않도록 기존 본문을 사용한다 |
