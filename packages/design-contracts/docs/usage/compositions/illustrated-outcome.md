# 그림과 시작 안내

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-07
- 근거: `showcase/web/src/patterns/illustrated-outcome-preview.tsx`, `showcase/native/src/illustrated-outcome-preview.tsx`
- 스토리북: `실험/구성/피드백과 복구/그림과 시작 안내`

## 언제 쓰나

빈 목록에서 시작을 안내하고 짧은 온보딩을 거쳐 결과를 보여 줄 때 쓴다. 3D 그림은 제품 자산이며
공통 컴포넌트의 의미·초점·버튼을 대체하지 않는다. 별도 wrapper 없이 기존 공개 API를 사용한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| EmptyState | 채울 수 있는 빈 목록과 첫 행동 | [빈 상태](../components/empty-state.md) |
| OnboardingScreen | 단계·이전·다음·완료 배치 | [시작 안내](../screens/flow-onboarding.md) |
| Result | 흐름이 끝난 결과와 다음 행동 | [결과](../components/result.md) |
| TextField | 제품이 소유하는 입력 초안 | [텍스트 필드](../components/field.md) |

## 배치

```text
[장식 그림]
[제목 + 설명]
[단계 본문: 그림 또는 입력]
[다음 / 완료]
[이전: 두 번째 단계부터]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 본문 전체 | gap lg=20px |
| 빈 상태 그림 | EmptyState 제품 슬롯 | 제목 위 | 120×120, Asset xlarge와 같은 크기 |
| 단계 본문 | OnboardingScreen | 제목과 하단 행동 사이 | 그림 120×120 또는 TextField |
| 완료 | Result | 흐름 종료 자리 | 체크 32×32, 공통 56px 아이콘 영역 안 |
| 버튼 | 각 공개 컴포넌트 | 화면의 기존 footer 또는 action 영역 | 기존 recipe 최소 터치 크기 유지 |

## 흐름과 상태

1. EmptyState 행동으로 시작 안내를 연다. 화면의 현재 단계는 제품이 제어한다.
2. 다음→입력→이전→다음에서도 초안은 상위 제품 상태에 남긴다.
3. 예제는 제목이 공백이면 완료를 비활성화한다. 실제 앱의 저장 결과는 서버 응답으로만 확정한다.
4. 그림 로딩 실패는 그림만 제거한다. 설명·입력·버튼은 유지하며 오류를 성공으로 바꾸지 않는다.
5. 완료 후 다시 시작해도 초안을 유지한다. 초안 삭제는 제품의 명시적인 정책이 있을 때만 한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 빈 상태 제목·장식 그림·첫 행동 | 제목으로 의미를 전달하고 그림은 장식으로 숨김 |
| 진행 중 | 단계 안내·입력·이전/다음 행동 | 초안을 유지하며 실제 저장 중에는 제품 pending 연결 |
| 실패 | 그림 실패 시 본문·행동 유지 | 장식 실패를 저장 실패와 혼동하지 않음 |
| 완료 | 결과 제목·입력 내용·다시 시작 | Result의 기본 status 의미 유지 |

## 코드 골격

```tsx
// Web
import { EmptyState, Result } from "@hjmds/react/feedback";
import { OnboardingScreen } from "@hjmds/react/screen-flows";
<EmptyState title={title} description={description} icon={decorativeArtwork} action={startButton} />
<Result status="success" title={completedTitle} icon={decorativeCheck} actions={actions} />
```

```tsx
// Native
import { EmptyState, Result } from "@hjmds/react-native/feedback";
import { OnboardingScreen } from "@hjmds/react-native/screen-flows";
<EmptyState title={title} description={description} illustration={decorativeArtwork} action={startButton} />
<Result status="success" title={completedTitle} renderIcon={() => decorativeCheck} actions={actions} />
```

OnboardingScreen에는 `steps`, `index`, `onIndexChange`, `nextLabel`, `backLabel`, `complete`,
`progressLabel`을 전달한다. 단계 구조·버튼 위치는 기존 화면 지침을 따른다. 제품 코드에서
Showcase를 import하지 않는다. 그림 호스트는 Web img의 빈 alt, Native Image의 accessible=false로 장식임을 명시한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 파일 | 로컬 파일 URL | Metro 정적 require |
| 그림 접근성 | 빈 alt | accessible=false |
| 장식 슬롯 | EmptyState.icon / Result.icon | EmptyState.illustration / Result.renderIcon |
| 실패 | 그림만 숨김 | 그림만 숨김 |

실제 기기의 자산 디코딩·큰 글자·접근성 검증은 타입 검사와 별도다.
