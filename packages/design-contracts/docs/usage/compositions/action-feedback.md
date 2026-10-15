# 버튼 완료 피드백

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-15
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `배포/구성/피드백과 복구/버튼 완료 피드백`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

입력을 유지하며 저장의 진행·성공·재시도 가능 실패를 보여 줄 때 쓴다. 화면 wrapper 없이 아래 공개 컴포넌트와 `resolveSaveFeedback`을 조합한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Button · TextField · ContentTransition · action-session | 입력·표현·행동의 역할 분리 | [입력/동작](../components/button.md), [상태/전환](../components/content-transition.md) |

## 배치

```text
[제목]
[기록 제목 입력]
[저장 / 다시 저장 버튼]
[진행·실패·성공 결과]
[실패 체험 스위치 + 서버 요청 없음 안내]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap md=16px, 전체 폭 |
| 내용 | 해당 공개 API | 입력과 행동 사이 | 자체 recipe 크기, 줄바꿈 허용 |
| 행동 | Button/기존 컨트롤 | 관련 항목 바로 뒤 | inline일 때 wrap, md=16px |

## 흐름과 상태

1. 입력→요청→실제 결과에 따라 성공/실패. 다시 저장은 클릭한 시점의 현재 초안을 새 요청으로 보낸다.
   2026-10-07 실패 후 제목 수정·재저장 확인에서 기존 문서의 “같은 입력 재시도”와 구현이
   다른 것을 확인했다. 편집 가능한 초안에 맞춰 현재 값 저장을 유지한다. 실패한 요청의
   원래 값 재시도가 필요하면 별도 행동에서 action-session.retry를 연결하고 대상 값을 알린다.
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력과 사용 가능한 행동 | 조작 이름은 제품 언어 |
| 진행 중 | 실제 작업 상태에 맞는 loading 또는 열린 도구 | 중복 요청 차단, 입력 유지 |
| 실패 | 문구와 가능한 재시도 | 원래 입력/파일 유지, 결과 안내 |

## 현재 초안과 저장 응답 연결

`@hjmds/design-contracts/action-session`의 `resolveSaveFeedback`은 Web/Native 공통 순수 함수다.
알림 설정과 첫 기록 화면에서 반복하던 저장 응답·현재 초안 분기를 공유한다.
`phase`는 기존 action session 또는 제품 mutation의 상태, `dirty`는 **현재 초안과 마지막 확정 값**의 비교,
`valid`는 제품 검증 결과, `hasSaved`는 확정 값 존재 여부다. 낙관적 값과 비교해 저장 완료로 판단하지 않는다.
선택적 `disabled`는 권한 등 제품의 실행 잠금이며 기본값은 false다.

| 결과 | 의미 |
| --- | --- |
| `pending` | 요청 진행 중. 입력을 유지하고 제출은 막음 |
| `saved` | 성공한 확정 값과 현재 초안이 같음 |
| `saved-with-changes` | 이전 제출은 성공했지만 현재 초안은 아직 미저장 |
| `error` | 요청 실패 후 변경이 남음. 현재 초안을 다시 저장할 수 있음 |
| `unsaved` | 아직 저장하지 않은 변경이 있음 |
| `unchanged` | 새 변경이 없음. 저장값으로 되돌린 뒤에는 이전 오류를 다시 표시하지 않음 |

`feedback`과 별도로 `currentSaved`는 현재 초안이 확정 값과 같은지 나타낸다.
`canSubmit`은 변경됨·유효함·진행 중 아님·잠금 아님을 모두 만족할 때만 true다.
이 함수는 요청 잠금이나 응답 무효화를 구현하지 않는다. 기존 `session.run`이 중복 실행을 막고
`session.reset`이 늦은 응답을 무효화한다. 버튼의 `disabled`만으로 요청 경합을 제어하지 않는다.
제품은 비교·문구·영구 저장을 소유하고, 실패 후 현재 초안을 저장할 때 새 제출값을 캡처해 `run`한다.
`retry`는 기존 실패 요청의 값 재시도이므로 현재 초안 저장과 구분한다.

```ts
import { resolveSaveFeedback } from "@hjmds/design-contracts/action-session";
const feedback = resolveSaveFeedback({
  phase: state.status,
  dirty: !sameDraft(draft, confirmedValue),
  valid: isValid(draft),
  hasSaved,
});
```

## 코드 골격

```tsx
// Web
<Button loading={feedback.pending} disabled={!feedback.canSubmit} completion={{ confirmed: feedback.currentSaved, label: savedLabel }} onClick={save}>{saveLabel}</Button>
```

```tsx
// Native
<Button loading={feedback.pending} disabled={!feedback.canSubmit} completion={{ confirmed: feedback.currentSaved, label: savedLabel }} onPress={save}>{saveLabel}</Button>
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
Button의 실행 콜백은 Web `onClick`, Native `onPress`로 연결한다. 위 골격의 도메인 함수·변수는 제품이 제공한다.

예제 응답은 useDemoAction의 인위 지연이며 실제 네트워크·영구 저장이 아니다.
완료 문구는 응답 확정 뒤 표시한다. 저장 중 입력 편집이 가능하므로, 저장 결과는 현재
초안으로 바꿔 쓰지 말고 응답 값으로 표시한다. 현재 초안과 저장한 제목이 다르면 완료 체크를 제거하고
“현재 제목은 아직 저장하지 않았어요”와 마지막 저장 제목을 따로 보여 준다. 2026-10-13 실제 예제에서
진행 중 편집한 제목에도 이전 요청의 완료 체크가 남는 경로를 확인해 구분했다. 실패 체험 설정은 요청 중 바꾸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 좁은 폭 | 줄바꿈·단일 내용 | 같은 순서, OS 화면 검증은 별도 |


## 확정 라벨의 크기 예약 (npm 1.21.0 · 2026-10-15)

Lucian 001의 저장→진행→완료 프레임 유지를 기존 Button의 `completion` 옵션으로 보완한다.
기본 행동 문자열은 항상 같은 children으로 두고, 완료 문자열은 `completion.label`로 처음부터
알린다. `confirmed`는 `resolveSaveFeedback.currentSaved`처럼 **현재 입력과 마지막 확정
응답**을 비교한 결과다. 요청 진행 중 편집했다면 이전 응답이 성공해도 완료 라벨을 표시하지
않는다. 저장 중에는 중앙 로딩만 보이고, 실패하면 같은 기본 행동 문자열로 돌아온다.
서버가 확정하기 전에는 완료를 표시하지 않으며 자동 성공 타이머·중복 mutation 엔진을 넣지 않는다.

Web은 두 라벨을 겹쳐 측정하고 Native는 두 라벨의 고유 폭과 최대 높이를 미리 예약한다.
자세한 초기 Native 행 예약과 문자열 제한은 [Button](../components/button.md#저장-확정-라벨과-프레임-예약-npm-1210--2026-10-15)을 따른다.
기존 결과 영역이 live region을 소유한다. Button이 별도 자동 알림을 만들지 않아 저장 중·완료
안내가 중복 발표되지 않는다. Showcase는 같은 공개 Button API를 사용하며, 예제 요청임을
계속 밝힌다. 실제 제품은 자신의 네트워크 요청·정규화된 확정 응답을 기존 session에 전달한다.
