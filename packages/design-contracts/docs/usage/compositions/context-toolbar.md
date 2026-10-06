# 입력을 유지하는 도구

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-07
- 근거: 공개 API를 사용하는 `showcase/*/reference-adoption-previews.tsx`
- 스토리북: `배포/구성/입력과 작성/입력을 유지하는 도구`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

## 언제 쓰나

작성 중인 입력을 보존한 채 선택적 도구를 펼쳐야 할 때 쓴다. 별도 신규 wrapper API가 아니라 아래 공개 컴포넌트의 조합 규격이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| TextField · Collapsible · SegmentedControl | 입력·표현·행동의 역할 분리 | [입력](../components/field.md), [접기](../components/collapsible.md), [단일 선택](../components/segmented-control.md) |

## 배치

```text
[작성 중인 입력: 항상 유지]
[도구 펼침/접힘 버튼 · 현재 선택]
  [기본 | 인용 | 강조] 열린 동안만 표시
[선택한 표현 안내: 항상 유지]
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 화면의 본문 흐름 | gap md=16px, 전체 폭 |
| 도구 | Collapsible | 입력 바로 아래 | trigger 최소 높이44px, 공개 recipe 사용 |
| 선택 | SegmentedControl presentation=pills | 열린 도구 내용 | 최소 높이44px, 항목 간8px, 좁으면 줄바꿈 |
| 결과 안내 | Text | 도구 아래 | Web status/Native polite |

## 흐름과 상태

1. 입력→도구 펼침→단일 표현 선택→접힘; 입력은 도구 바깥에 유지. 선택 값도 접히는 내용의 바깥에서 소유한다.
   2026-10-07 실제 조작에서 개별 selected Button이 독립 토글로 안내되는 것을 확인해,
   묶음 이름·radio 의미·방향키 이동을 제공하는 SegmentedControl을 사용한다.
   여러 서식을 동시에 켜는 편집기는 ToggleGroup을 쓰며 이 단일 선택 예제를 복사하지 않는다.
2. 서버 응답·파일 권한·문구·브랜드는 제품이 전달한다. Showcase의 예제 응답과 고정 데이터를 가져오지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 접힌 도구: 입력·펼침 버튼·현재 선택 안내 | 숨긴 선택지는 탐색 대상에서 제거 |
| 진행 중 | 도구를 펼쳐 단일 선택; 비동기 pending 없음 | Web Tab으로 선택 진입, 방향키로 변경 |
| 선택 변경 | 정확히 하나 선택, 안내 갱신 | 초안 유지, 선택 값은 바깥 상태에 저장 |
| 다시 접힘/펼침 | 마지막 선택과 초안 복원 | Web 접기 버튼에 포커스 유지 |
| 실패 | 예제에 서버 작업 없음; 제품 저장 실패는 별도 연결 | 실제 저장 실패 시에도 초안·선택은 보존 |

## 코드 골격

```tsx
// Web
<TextField label={draftLabel} value={draft} onValueChange={setDraft} />
<Collapsible open={open} onOpenChange={setOpen} trigger={toolsLabel}>
  <SegmentedControl label={formatLabel} presentation="pills" items={formats}
    value={format} onValueChange={setFormat} />
</Collapsible>
```

```tsx
// Native
<TextField label={draftLabel} value={draft} onValueChange={setDraft} />
<Collapsible open={open} onOpenChange={setOpen} trigger={toolsLabel}>
  <SegmentedControl label={formatLabel} presentation="pills" items={formats}
    value={format} onValueChange={setFormat} />
</Collapsible>
```

Web은 `@hjmds/react`의 해당 granular entry, Native는 `@hjmds/react-native` entry를 쓴다.
초안과 선택 값은 접히는 내용 바깥에서 소유한다. 예제는 선택·입력 보존을 보여 주며,
본문 서식 변환·영구 저장·실패 복구는 구현하지 않는다. 이 동작이 필요한 제품은
실제 편집 모델과 저장 상태를 연결하고 따로 검증한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치/테마 | Stack과 HjmProvider | Stack과 HjmNativeProvider |
| 큰 글자·좁은 폭 | 줄바꿈·단일 내용 | 같은 순서, OS 화면 검증은 별도 |
