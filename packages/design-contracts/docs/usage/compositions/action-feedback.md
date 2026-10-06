# 버튼 완료 피드백

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-06
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `실험/구성/피드백과 복구/버튼 완료 피드백`

## 언제 쓰나

입력을 유지하며 저장의 진행·성공·재시도 가능 실패를 보여 줄 때 쓴다. 별도 신규 wrapper API가 아니라 아래 공개 컴포넌트의 조합 규격이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Button · TextField · ContentTransition · action-session | 입력·표현·행동의 역할 분리 | [입력/동작](../components/button.md), [상태/전환](../components/content-transition.md) |

## 배치

```text
[제목 또는 현재 입력]
[상태/내용 영역]
[관련 행동과 결과]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap md=16px, 전체 폭 |
| 내용 | 해당 공개 API | 입력과 행동 사이 | 자체 recipe 크기, 줄바꿈 허용 |
| 행동 | Button/기존 컨트롤 | 관련 항목 바로 뒤 | inline일 때 wrap, md=16px |

## 흐름과 상태

1. 입력→요청→실제 결과에 따라 성공/실패; 재시도도 같은 입력
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력과 사용 가능한 행동 | 조작 이름은 제품 언어 |
| 진행 중 | 실제 작업 상태에 맞는 loading 또는 열린 도구 | 중복 요청 차단, 입력 유지 |
| 실패 | 문구와 가능한 재시도 | 원래 입력/파일 유지, 결과 안내 |

## 코드 골격

```tsx
// Web
<Button loading={busy} onClick={save}>{saveLabel}</Button>
```

```tsx
// Native
<Button loading={busy} onPress={save}>{saveLabel}</Button>
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
Button의 실행 콜백은 Web `onClick`, Native `onPress`로 연결한다. 위 골격의 도메인 함수·변수는 제품이 제공한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 큰 글자·좁은 폭 | 줄바꿈·단일 내용 | 같은 순서, OS 화면 검증은 별도 |
