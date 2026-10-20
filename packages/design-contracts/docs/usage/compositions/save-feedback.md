# 저장 결과

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 1.37.0
- 검토일: 2026-10-20
- 근거: 사용자 요청으로 저장 결과 세 유형을 보존하고 모든 제품의 저장 피드백을 같은 선택 기준으로 연결했다.
- 스토리북: `실험/구성/피드백과 복구/저장 결과`

## 언제 쓰나

사용자 저장 요청의 성공이 확인된 뒤, 대상과 현재 화면에 맞는 피드백을 선택할 때 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Toast + Provider/Region | 컴팩트·대상 요약 알림 | [Toast](../components/toast.md) |
| Notice status | 항목 안의 작은 저장 상태 | [Notice](../components/notice.md) |
| Card·CompositionLayout·ListRow | 저장된 대상과 설명의 배치 | [구성 골격](../components/composition-layout.md) |

| 유형 | 쓰는 상황 | 기존 공개 API |
| --- | --- | --- |
| 컴팩트 토스트 | 현재 화면에서 저장 결과를 직접 볼 수 없고 짧은 완료 확인이면 충분함 | Toast `description`, `tone="success"`; 앱 루트의 ToastProvider/ToastRegion 사용 |
| 대상 요약 토스트 | 저장한 대상이나 변경 내용을 함께 확인해야 함 | 같은 Toast의 `title` + `description`; 필요 시 기존 `media` 사용 |
| 저장 카드에 바로 반영 | 저장된 카드·목록·폼이 보임 | Card/ListRow/CompositionLayout 슬롯의 Notice `appearance="status"`; 기존 저장 버튼의 체크·저장됨 표시도 이 유형 |

1·2는 별도 알림 엔진이나 토스트 변형 prop이 아니다. 기존 Toast의 내용 구성이다.
3은 기존 Notice의 작은 상태 표현이며 별도 타이머·큐가 없다. 같은 성공을 토스트와 카드에서 중복 알리지 않는다.
오류·경고·필수 안내는 기존 Notice 패널을 유지한다. 자동 저장의 처리 중·실패·미저장 상태를 성공으로 바꾸지 않는다.

## 배치

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ToastProvider/ToastRegion 또는 기존 Card·폼 | 화면 위 알림 층 또는 저장한 항목 안 | 토스트 가장자리 `spacing.md` 16 + 안전 영역 |
| 상태 | Toast 또는 Notice status | 토스트 내용 / CompositionLayout `badge` | 토스트 최소 높이 56, status 바깥 padding 0 |
| 보조 설명 | Toast description / CompositionLayout footer | 상태 아래 | 기본 구성의 `spacing.sm` 12 간격 |

```text
컴팩트: [ ✓  KE123 저장했어요                         × ]
요약:   [ ✓  항공편을 저장했어요                      × ]
        [    KE123 · 인천 → 도쿄                        ]
카드:   [ KE123                              (저장됨) ]
        [ 인천 → 도쿄                                 ]
        [ 내 항공편에 추가했어요                       ]
```

- 토스트는 기존 최대 폭 420, 최소 높이 56, 가장자리 `spacing.md` 16 + 안전 영역을 따른다. 기본 3초이며 요약이 길면 제품이 읽을 시간을 늘린다. 광고 footer가 있는 제품은 상단에 둔다.
- 카드는 기존 Card와 CompositionLayout이 배치한다. `badge`에 상태 Notice, `footer`에 보조 설명을 넣는다. Notice status는 바깥 padding·border가 0이고 배지는 기존 Badge `size="small"`을 쓴다. 색·높이·정렬을 제품에서 다시 만들지 않는다.
- 목록은 상태를 기존 행 슬롯에 둔다. 방금 저장한 항목이 현재 정렬에서 안 보이면 해당 결과를 보여 주되 기존 현재 항목의 우선순위를 바꾸지 않는다.
- 상태 문구와 보조 설명은 제품이 지역화한다. 짧은 상태는 `저장됨`, 대상 요약은 실제 저장한 식별자를 쓴다. 실제 저장 응답/영속 저장 완료 전에는 성공 표시를 만들지 않는다.

## 흐름과 상태

1. 수정하면 현재 초안의 저장 상태를 해제한다.
2. 저장 중에는 기존 제출 상태를 유지한다.
3. 성공한 스냅샷을 확인한 뒤 대상에 맞는 상태를 표시한다. 실패하면 초안을 유지하고 기존 오류 패널을 쓴다.
성공 후 다시 편집하면 현재 초안의 저장 표시를 해제한다. 목록의 저장된 사본은 그대로 보존한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 초안 또는 이전 저장 사본 | 새 성공 알림 없음 |
| 진행 중 | 기존 저장 버튼의 busy 상태 | 포커스 유지 |
| 완료 | 토스트 한 장 또는 해당 항목의 status | polite 낭독 한 번 |
| 실패 | 기존 오류 패널, 초안 유지 | 기존 오류 낭독·재시도 유지 |

## 코드 골격

실행 예제는 [Web](../../../../../showcase/web/src/components/save-feedback-preview.tsx), [Native](../../../../../showcase/native/src/save-feedback-preview.tsx), 공통 문구 fixture는 [shared](../../../../../showcase/shared/save-feedback.ts)를 참조한다. 예제의 `durationMs: null`은 비교용이며 제품 기본 타이머를 바꾸는 규칙이 아니다.

```tsx
// Web (Native는 같은 슬롯에 announcement="polite"를 연결한다)
<CompositionLayout title={subject} description={detail}
  badge={saved ? <Notice appearance="status" tone="success" title={savedLabel} /> : undefined}
  footer={saved ? <Text tone="muted">{savedDescription}</Text> : undefined} />
```

```tsx
// Native
<CompositionLayout title={subject} description={detail}
  badge={saved ? <Notice appearance="status" tone="success" announcement="polite" title={savedLabel} /> : undefined}
  footer={saved ? <Text tone="muted">{savedDescription}</Text> : undefined} />
```

Native에서는 새 성공에만 `announcement="polite"`를 연결한다. 이미 저장된 목록을 다시 그릴 때는 `none`이다.
Web은 Notice의 `role="status"`와 `aria-live="polite"`를 유지한다. 저장 결과를 없애려고 포커스를 이동하지 않는다.
현재 초안의 저장 판정은 기존 `resolveSaveFeedback` 계약을 따른다. 이전 초안 저장이 늦게 끝났다고 최신 초안을 저장됨으로 표시하지 않는다.

## 배포 경계

개발 소스 연결과 설치 패키지는 별개다. status prop은 1.37.0부터 제공한다. 앱·웹의 소스 채택을 각 제품의 운영 배포 완료로 판단하지 않는다.
