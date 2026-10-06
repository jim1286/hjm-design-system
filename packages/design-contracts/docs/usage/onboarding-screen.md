# OnboardingScreen 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [반복 화면 조합](../screen-patterns.md) (supplemental)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `OnboardingScreen` | `/screen-flows` | `/screen-flows` | supplemental, 루트 barrel에 없음 |

`@hjmds/react/screen-flows`, `@hjmds/react-native/screen-flows`로만 import한다. 추가 optional peer는 없다.

## 최소 사용 예

```tsx
// Web (Native는 import 경로만 @hjmds/react-native/screen-flows)
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

## 제품이 공급할 것

| prop | 내용 |
| --- | --- |
| `steps` | `{ id, title, description, content }[]`. 1개 이상. 제목·설명은 지역화 문자열, `content`는 단계 본문 |
| `index`, `onIndexChange` | 현재 단계(0부터, 제어형). 범위를 벗어나면 던진다 |
| `nextLabel`, `backLabel` | 다음·이전 문구. 첫 단계에는 이전이 없다 |
| `complete` | 마지막 단계의 주 행동 `{ label, onAction, disabled?, pending? }` |
| `skip` | 선택. 상단 actions 자리에 보조 버튼으로 놓인다 |
| `progressLabel(current, total)` | 1부터 센 현재 단계와 전체 수로 진행 문구를 만든다 |

## 꼭 지킬 것

- 단계에서 고른 값의 저장, 완료 여부 저장, 다시 보여 주지 않기는 제품 소유다. `complete.onAction`에서 처리한다.
- ScreenLayout의 `header`·`state`·`contentInset`·`layoutStyle` 같은 화면 props는 받지 않는다. 화면 틀을 바꿔야 하면 ScreenLayout으로 직접 조합한다.
- 문구·일러스트·브랜드 이미지는 제품 소유다. `content`에 제품 자산을 넣는다.
