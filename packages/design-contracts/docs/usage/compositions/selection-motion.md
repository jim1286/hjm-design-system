# 선택 배경 이동

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/선택 배경 이동`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

짧은 단일 선택의 현재 항목을 이어지는 배경으로 보여 줄 때 쓴다. 선택 값·키보드·초점은 기존 SegmentedControl이 소유한다. 별도 신규 wrapper API가 아니라 아래 공개 컴포넌트의 조합 규격이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| SegmentedControl · Text · TextField | 입력·표현·행동의 역할 분리 | [입력/동작](../components/segmented-control.md), [상태/전환](../components/content-transition.md) |

## 배치

```text
[제목 또는 현재 입력]
[상태/내용 영역]
[관련 행동과 결과]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap lg=20px, 전체 폭 |
| 선택 | SegmentedControl 2개 | 제목 아래, 연결형 다음 필터형 | 기본 44px 터치 영역, 실제 글자에 따른 높이 |
| 결과·메모 | Text · TextField | 선택 컨트롤 아래 | 선택 변경 시 필드 재생성 없음 |
| Native 화면 host | ScreenLayout · KeyboardAvoiding | 본문 스크롤과 바깥 키보드 여백 | flex 1, 끝 여백 spacing.md=16 |

2026-10-07 iOS 2배 글자에서 Stack만 사용한 예제의 메모가 키보드 뒤에 가려졌다.
글자나 선택 항목을 줄이지 않고 위 화면 host를 연결해 입력·선택을 스크롤로 오가게 한다.
선택 배경 이동은 입력 초점·스크롤을 소유하지 않으므로 제품 화면도 이 경계를 연결해야 한다.

## 흐름과 상태

1. 현재 선택 측정→사용자가 선택→배경만 이동. 메모 필드는 유지한다.
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력과 사용 가능한 행동 | 조작 이름은 제품 언어 |
| 진행 중 | 실제 작업 상태에 맞는 loading 또는 열린 도구 | 중복 요청 차단, 입력 유지 |
| 실패 | 문구와 가능한 재시도 | 원래 입력/파일 유지, 결과 안내 |

## 코드 골격

```tsx
// Web
<SegmentedControl label={t("period")} items={items} value={value} onValueChange={setValue} selectionMotion="slide" />
```

```tsx
// Native
<SegmentedControl label={t("period")} items={items} value={value} onValueChange={setValue} selectionMotion="slide" />
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
선택 콜백은 두 플랫폼 모두 `onValueChange`다. 위 골격의 번역·항목·값은 제품이 제공한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 큰 글자·좁은 폭 | 줄바꿈·단일 내용 | 같은 순서, OS 화면 검증은 별도 |
