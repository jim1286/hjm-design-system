# 내용 전환 비교

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.14.0 이후)
- 검토일: 2026-10-08
- 근거: [Motion 검토](../../../../../docs/qa/2026-10-07-motion-reference-page-review.md), 양 Showcase `content-transition-comparison-preview.tsx`
- 스토리북: `배포/구성/비교와 검증/내용 전환 비교`

## 언제 쓰나

동일 내용의 전환 표현을 테마와 비교하거나 단계별 입력·완료·복구를 검토할 때 쓴다.
Motion Primitives Transition Panel의 두 제공 예제를 실제 검토한 후보 단위 등록이다.
11개 사이트 전체 조사 완료나 모든 환경 검증을 뜻하지 않는다. 제품은 Showcase를 import하지 않고
아래 공개 API에 자기 문구·데이터·완료 callback을 공급한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Heading | 비교 구역의 의미 있는 제목 | [제목](../components/heading.md) |
| Provider | 10개 테마의 내용 전환 기본값 상속 | [프로필 계약](../../design-profile.md) |
| Tabs·TabPanel | 수동 활성화와 선택 패널의 의미 | [탭](../components/tabs.md) |
| ContentTransition | 현재 본문 하나의 등장과 높이 전환 | [내용 전환](../components/content-transition.md) |
| OnboardingScreen | 이전·다음·마지막 완료와 진행 표시 | [안내 화면](../components/onboarding-screen.md) |
| TextField | 제품 상태에 보관한 같은 초안 | [텍스트 입력](../components/field.md) |
| SegmentedControl | 한 번에 하나의 전환 표현 선택 | [선택 입력](../components/segmented-control.md) |
| Button·Notice | 표현 선택·실패 예약·복구 결과 | [버튼](../components/button.md) · [알림](../components/notice.md) |

## 배치

```text
설명 → 현재 테마/다음 테마 → 전환 표현(줄바꿈)
탭 비교: 탭 목록 → 현재 패널 → 제목/내용/같은 초안
단계 비교: 안내 제목/설명/진행 → 본문 전환/초안 → 고정 이전·다음·완료
마지막 단계: 실패 재현 예약 → 실패 알림 → 같은 완료로 재시도
완료: 확인 알림 → 초안 → 다시 비교
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack·Native ScrollView | 세로, 비교 도구와 단계 viewport를 함께 스크롤 | `spacing.lg` 20 |
| 표현 선택 | SegmentedControl | 안내 아래 | 공개 `presentation="pills"`, 큰 글자·좁은 화면 줄바꿈 |
| 탭 본문 | TabPanel·ContentTransition·Stack | 탭 목록 아래 | `spacing.md` 16, 높이는 현재 내용 측정 |
| 단계 틀 | OnboardingScreen | 표현 선택 아래 | Web preview 70dvh/minHeight 360, Native preview 720. 이는 fixture viewport이며 제품은 실제 가용 높이 사용 |
| 주 행동 | OnboardingScreen footer | 본문 scroll 바깥 | [기존 안내 배치](../components/onboarding-screen.md#배치) |

## 흐름과 상태

1. 초안을 입력하고 탭을 바꾼다. Tabs는 수동 활성화여서 Web 화살표는 포커스만 이동하고 Enter/Space로 선택한다.
2. 테마를 순회하거나 나타남·떠오름·옆으로·확대·즉시를 선택한다. `preset` 생략은 테마 기본값, 명시 값은 우선한다.
3. 단계별 완료 스토리에서 다음·이전으로 이동한다. 화면 전체를 key로 다시 마운트하지 않고 본문만 전환한다.
4. 마지막 단계에서 완료 실패 재현을 예약하고 기록 확인을 누른다. 초안을 유지한 실패 알림 뒤 같은 완료를 다시 누른다.
5. 확인 결과와 초안을 보고 다시 비교한다. 완료는 로컬 fixture이며 서버 저장·라우팅 완료로 안내하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 선택한 내용 하나·같은 초안 | 탭/본문 이름 연결, 이전 내용을 복제하지 않음 |
| 진행 중 | 현재 내용 등장/높이 전환 | 화면 제목·탭 목록·footer는 전환 바깥. 모션 감소·즉시는 즉시 반영 |
| 실패 | 마지막 단계의 danger Notice | 초안 보존, Web alert·Native assertive; 완료 버튼으로 재시도. Web 성공 뒤 다시 비교에 포커스 |
| 성공 | success Notice·확인한 초안 | 다시 비교 가능; 서버 성공을 의미하지 않음 |

## 코드 골격

```tsx
// Web: 선택 상태와 초안은 전환 바깥의 제품 상태다.
import { Tabs, TabPanel } from "@hjmds/react/navigation";
import { ContentTransition } from "@hjmds/react/content-transition";
<Tabs id={id} label={label} items={items} value={value} onValueChange={setValue}
  activationMode="manual" panelMode="dynamic" renderPanels={false} />
<TabPanel tabsId={id} activeValue={value} mode="dynamic">
  <ContentTransition stateKey={value} animateHeight>{body}</ContentTransition>
</TabPanel>
```

```tsx
// Native: label로 현재 패널 이름도 공급한다. 완료/오류는 제품이 소유한다.
import { TabPanel } from "@hjmds/react-native/navigation";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";
<TabPanel tabsId={id} activeValue={value} label={currentLabel} mode="dynamic">
  <ContentTransition stateKey={value} animateHeight>{body}</ContentTransition>
</TabPanel>
<OnboardingScreen steps={steps} index={index} onIndexChange={setIndex}
  nextLabel={nextLabel} backLabel={backLabel} complete={complete}
  progressLabel={progressLabel} />
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 표현 엔진 | optional framer-motion·높이 측정 | core Animated·높이는 opt-in JS driver |
| 전환 본문 | 키가 바뀌면 내부 subtree remount | 현재 children 하나 유지. 실기기 포커스/AT 확인 별도 |
| 안내 배치 | 제목·설명·진행은 body scroll 위 | 안내도 body 안 scroll, footer 고정 |
| 포커스 | 탭 동작 유지. 본문 내부 행동이 본문을 교체하면 공개 focusTarget 검토 | focusTarget 없음; 같은 동작이라고 추정하지 않음 |

## 함정

동적 패널의 입력은 controlled 제품 상태로 보존한다. DOM identity가 필요한 입력은 전환 바깥에
두거나 keyed/visited Tabs를 쓴다. 원본의 exit 복제·이름 없는 탭 버튼·마지막 Close의 빈 callback은
복사하지 않는다. 무거운 내용과 실제 키보드·스크린리더·Native 기기의 높이 전환 검증은 별도다.

2026-10-07 로컬 토큰 감사에서 Web preview 최소 높이360이 raw-length로 검출됐다.
이는 짧은 viewport에서도 body scroll과 footer를 함께 검증하려는 fixture 한계값이며
제품의 spacing/width 토큰을 높이로 전용하지 않는다. token-boundary-exceptions.json에
해당 selector·minHeight·360만 한정해 등록했다. 제품 host는 실제 가용 높이를 공급한다.

2026-10-07 실제 iOS 개발 검수에서 비교 도구 아래 720unit 단계 viewport의 footer가
Canvas 바깥에 있어 다음 버튼에 도달할 수 없었다. Native 비교 host에 바깥 ScrollView를
추가해 도구와 viewport를 함께 내리며, OnboardingScreen의 내부 본문 scroll과 footer 소유권은
유지한다. viewport 축소로 실제 화면의 본문/행동 배치를 바꾸는 대안은 사용하지 않았다.
제품 host는 이 fixture 높이를 복사하지 않고 실제 가용 높이를 공급한다.
