# 높이가 이어지는 패널

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/높이가 이어지는 패널`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

패널의 길이가 달라질 때 아래 행동이 새 높이로 이동해야 하는 작은 내용 영역에 쓴다. 별도 신규 wrapper API가 아니라 아래 공개 컴포넌트의 조합 규격이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| SegmentedControl · ContentTransition · Surface · TextField | 입력·표현·행동의 역할 분리 | [입력/동작](../components/segmented-control.md), [상태/전환](../components/content-transition.md) |

## 배치

```text
[요약 / 상세 단일 선택]
[높이가 바뀌는 콘텐츠 패널]
[전환 바깥의 메모 입력: 유지]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap md=16px, 전체 폭 |
| 내용 | 해당 공개 API | 입력과 행동 사이 | 자체 recipe 크기, 줄바꿈 허용 |
| 행동 | Button/기존 컨트롤 | 관련 항목 바로 뒤 | inline일 때 wrap, md=16px |

## 흐름과 상태

1. 선택→내용 교체→입력은 바깥에서 유지
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력과 사용 가능한 행동 | 조작 이름은 제품 언어 |
| 진행 중 | 실제 작업 상태에 맞는 loading 또는 열린 도구 | 중복 요청 차단, 입력 유지 |
| 실패 | 문구와 가능한 재시도 | 원래 입력/파일 유지, 결과 안내 |

## 코드 골격

```tsx
// Web
<ContentTransition stateKey={panel} animateHeight><Panel /></ContentTransition>
```

```tsx
// Native
<ContentTransition stateKey={panel} animateHeight><Panel /></ContentTransition>
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
선택은 SegmentedControl의 onValueChange로 연결한다. 패널 바깥 입력은 unmount하지 않는다.
2026-10-07 Web 390px·큰 글자에서 상세→요약 방향키 연속 전환 뒤 단일 내용과 초안 보존을
확인했다. 이 확인은 프레임 속도나 Native 성능 동등성의 근거가 아니다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 큰 글자·좁은 폭 | 줄바꿈·단일 내용 | 동일 순서와 스크롤 host 필요 |


### Native 입력과 화면 끝

2026-10-07 큰 글자에서 상세 패널이 늘어나면 키보드 아래로 메모가 밀려났고,
스크롤 없는 Showcase canvas에서는 다시 접근할 수 없었다. Native 예제는
ScreenLayout의 본문 스크롤과 바깥 KeyboardAvoiding으로 사용 가능한 높이를 확보한다.
Storybook의 기존 gutter 때문에 contentInset=none을 쓰고, 마지막 입력의 테두리가
스크롤 경계에 걸리지 않도록 본문 끝에 spacing.md(16) 여백을 둔다.
본문 조합 자체에 두 번째 scroll view를 만들지 말고 제품의 기존 화면 host를 재사용한다.
KeyboardAvoiding은 아래 여백을 제공하며 포커스된 필드를 자동 탐색하는 API는 아니다.
