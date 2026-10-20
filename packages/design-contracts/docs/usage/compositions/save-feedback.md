# 저장 결과

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 1.37.0 내용 구성, 새 표면은 개발 소스
- 검토일: 2026-10-20
- 근거: 사용자 요청으로 카드 안 저장 완료 예시(이전 3번)를 제거하고, 승인된 라이트·다크 토스트 시안으로 두 유형을 통일했다.
- 스토리북: `실험/구성/피드백과 복구/저장 결과`

## 언제 쓰나

실제 영속 저장 성공 뒤 짧게 결과를 알린다. 문구·대상·저장 판정은 제품이 소유하고, 표면·안전 영역·타이머·접근성은 기존 Toast가 소유한다.

## 구성 요소

| 유형 | 쓰는 상황 | 공개 API |
| --- | --- | --- |
| 1 · 한 줄 토스트 | 짧은 완료 확인 | Toast `description`, `tone="success"` |
| 2 · 요약 토스트 | 저장한 대상까지 확인 | 같은 Toast의 `title` + `description` |

두 유형은 별도 엔진이나 변형 prop이 아니다. 웹은 ToastProvider, Native는 ToastRegion을 앱 루트에 둔다. 카드형 저장 결과는 선택지에서 제거했다. 일반 Notice·Card·Badge의 다른 용도는 유지한다.

## 배치

| 영역 | 위치·크기 |
| --- | --- |
| 바깥 틀 | 최대 폭 420, 최소 높이 56, 모서리 24 |
| 화면 가장자리 | 16 + 안전 영역. 광고 footer가 있으면 상단 |
| 내부 | 가로 16·세로 12, 첫 줄 기준 정렬, 닫기 터치 영역 44 유지 |
| 한 줄 | 장식 아이콘 → 본문 → 닫기 |
| 요약 | 제목 → 보조 설명, 오른쪽 닫기. 장식 아이콘은 생략; 제품 media는 유지 |

```text
한 줄: [ ✓  KE123 저장했어요                  × ]
요약:  [ 항공편을 저장했어요                  × ]
       [ KE123 · 인천 → 도쿄                    ]
```

라이트는 우윳빛 표면·짙은 글자, 다크는 차콜 표면·밝은 글자다. 얇은 경계와 floating 그림자를 사용한다. 값은 toastRecipe.material이 소유한다. 웹은 지원 환경에서 backdrop blur를 사용하고 투명도 감소 설정에서는 불투명하다. Native 기본 renderer는 추가 blur 의존성 없이 같은 색의 불투명 표면을 사용한다. 실제 배경 흐림 효과로 보고하지 않는다.

## 흐름과 상태

| 상태 | 표시·행동 |
| --- | --- |
| 저장 중 | 기존 제출 상태, 성공 알림 없음 |
| 성공 | 저장 응답/영속 저장 완료 후 토스트 한 장, polite 낭독 한 번 |
| 실패 | 입력 보존, 기존 오류·재시도 |

기본 3초이며 긴 요약은 제품에서 시간을 늘린다. 같은 성공을 카드 상태와 토스트로 중복 알리지 않는다. 이전 초안의 늦은 응답을 새 초안의 성공으로 표시하지 않는다.

## 코드 골격

```tsx
// 영속 저장 성공 뒤; Native useToastRegion / Web useToast의 기존 publish.
toast.publish({ id: "saved", description: savedLabel, tone: "success", closeLabel });
toast.publish({ id: "saved", title: savedTitle, description: subjectSummary, tone: "success", closeLabel });
```

실행 예제: [Web](../../../../../showcase/web/src/components/save-feedback-preview.tsx), [Native](../../../../../showcase/native/src/save-feedback-preview.tsx), [공통 문구](../../../../../showcase/shared/save-feedback.ts). 비교 예제의 durationMs: null은 제품 기본 타이머를 바꾸지 않는다.

## 배포 경계

새 라이트·다크 표면은 개발 소스다. npm 게시·소비 제품의 패키지 갱신·제품 운영 배포를 각각 확인한다.
