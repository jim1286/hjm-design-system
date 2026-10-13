# 목록과 상세

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 구성 API 지침 참조
- 검토일: 2026-10-13
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/화면/기본 흐름/목록과 상세`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/콘텐츠/목록과 상세`

## 목적

ListDetailScreen을 사용해 목록과 상세 흐름을 구성한다. 제품이 데이터·권한·서버 확정·문구를 공급하며, 예제의 메모리 저장을 운영 저장으로 취급하지 않는다.

## 영역 구조

```text
host: 남은 높이·safe area·키보드
└─ 목록 헤더 → 목록 → 더 보기 / 상세 헤더 → 상세
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ListDetailScreen | route 본문 | [API 배치 규칙](../components/list-detail-screen.md#배치), host 남은 높이 |
| 내용 | 공개 슬롯 | 목록 헤더 → 목록 → 더 보기 / 상세 헤더 → 상세 | 화면 recipe의 sectionGap·itemGap; 슬롯 안은 각 지침 토큰 |
| 상태 | state 또는 해당 API 상태 | 본문 자리·비차단 notice | 입력 중 실패는 본문 높이와 초안을 유지 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 작업 | ListDetailScreen 공개 행동 슬롯 | 새로고침은 actions, 상세 뒤로는 leading | 같은 표면에 경쟁하는 primary 하나만 |
| 복구 | Button·secondary | 오류 근처 | 재시도할 대상과 범위를 표시 |

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | 목록 헤더 → 목록 → 더 보기 / 상세 헤더 → 상세 | 각 공개 콜백을 제품 상태에 연결 |
| 로딩 | 최초 조회는 본문 상태, 저장은 해당 행동 pending | 중복 제출 차단; 성공을 먼저 표시하지 않음 |
| 빈 | 실제 조회 0건 또는 아직 작성하지 않은 상태 안내 | 시작·조건 해제 등 맥락에 맞는 대안 |
| 오류 | 목록 pane 유지; 상세 실패는 detail.state·detail.stateAction으로 복구 | 실패 원인과 재시도 경로 제공 |

### 목록과 상세의 독립 상태

`state`는 목록에, `detail.state`는 상세에만 적용한다. 새 상세 prop은 미게시(1.18.0 이후)이며
기존 `detail: { title, content }` 사용법은 그대로 유지한다. 목록 입력·스크롤을 보존한 채
상세의 최초 조회·오류·재시도를 중앙 상태로 표현하려고 추가했다.

| 상황 | 공개 슬롯 | 남겨야 하는 것 |
| --- | --- | --- |
| 상세 최초 조회 | detail.state=loading | 숨겨진 목록의 검색·선택·스크롤 |
| 상세 조회 실패 | detail.state=error + detail.stateAction | 상세 제목·목록으로 돌아가기 |
| 이미 읽은 상세 재조회 실패 | detail.state=ready + detail.notice | 기존 상세 내용 |
| 목록 추가 조회 실패 | list 안 LoadMore | 이미 표시된 행·페이지 cursor |
| 상세 닫기 | detail 생략 | 원래 목록으로 복귀, Web 원래 포커스 복원 |

선택 id가 바뀌거나 상세를 닫으면 해당 요청을 취소하거나 늦은 응답을 무시한다.
상세 요청 실패를 목록 `state=error`로 넘기면 복귀한 목록까지 사라진다.

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [ListDetailScreen](../components/list-detail-screen.md) | 필수 props·슬롯·플랫폼 차이 |
| [Button](../components/button.md) | 동작·로딩·보조 행동 |
| [ScreenLayout](../components/screen-layout.md) | 화면 높이·본문 교체·스크롤 소유 |

## 코드 골격

```tsx
// Web
import { List } from "@hjmds/react/display";
import { ListDetailScreen } from "@hjmds/react/screen-flows";

<ListDetailScreen
  title={t("orders.title")}
  list={<List label={t("orders.list")}>{rows}</List>}
  {...(selected ? { detail: { title: selected.name, content: <OrderDetail order={selected} />, state: detailState, stateAction: detailRetry, notice: detailNotice } } : {})}
  back={{ label: t("common.back"), onAction: () => setSelected(null) }}
  refresh={{ label: t("common.refresh"), onAction: refetch, pending: isRefetching }}
/>
```

```tsx
// Native
import { List } from "@hjmds/react-native/data-display";
import { ListDetailScreen } from "@hjmds/react-native/screen-flows";

<ListDetailScreen
  title={t("orders.title")}
  list={<List label={t("orders.list")}>{rows}</List>}
  {...(selected ? { detail: { title: selected.name, content: <OrderDetail order={selected} />, state: detailState, stateAction: detailRetry, notice: detailNotice } } : {})}
  back={{ label: t("common.back"), onAction: () => setSelected(null) }}
  refresh={{ label: t("common.refresh"), onAction: refetch, pending: isRefetching }}
/>
```

`detailState`는 `{ kind: "ready" }` 또는 지역화된 title을 가진 loading/error/restricted 상태다.
`detailRetry`는 해당 id만 다시 조회하는 Button, `detailNotice`는 기존 상세를 유지하는 Notice다.

<!-- usage-example: Web ../../../../../showcase/web/src/patterns/list-detail-recovery-preview.tsx -->
- [Web 상세 복구 실행 예제](../../../../../showcase/web/src/patterns/list-detail-recovery-preview.tsx)
<!-- usage-example: Native ../../../../../showcase/native/src/list-detail-recovery-preview.tsx -->
- [Native 상세 복구 실행 예제](../../../../../showcase/native/src/list-detail-recovery-preview.tsx)

스토리 `상세 조회 실패와 복구`: 목록 메모 입력 → 다음 상세 조회 실패시키기 → 항목 열기 →
상세만 다시 불러오기 → 목록으로 복귀해 메모 유지 확인. 예제의 지연·서버 응답은 메모리 모의다.

콜백·데이터·지역화 함수는 제품에서 공급한다. Web·Native import와 필수 props는 위 API 지침에서 확인한다.

## 다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 다크 | semantic 색으로 내용과 표면을 함께 전환; 예제 브랜드 색을 제품 기본값으로 복사하지 않음 |
| 좁은 폭 | 320px부터 한 열로 읽기 순서 유지. 가상화 본문은 scroll=content, 중첩 스크롤 금지 |
| 키보드 | Native host가 safe area와 키보드를 한 번 처리; Web은 포커스된 입력과 footer 가림 확인 |

## 함정

- 목록 pane 유지; 상세 실패는 detail.state·detail.stateAction으로 복구.
- Storybook은 실제 서버·OS 권한·라우터 연동 증거가 아니다. 기본·다크와 실패/복구를 각각 확인한다.

2026-10-13 실제 예제 연결 검수: 새 기록은 빈 초안으로 시작하고, 성공한 제목·본문을 고유 ID의 목록 항목에 함께 보관한다. 다른 기록 상세는 현재 편집 초안을 읽지 않는다. 저장 성공 시 전체 목록으로 돌아가 새 항목을 보이며, 빈 목록에서 작성한 뒤에는 ready로 전환한다. 필터와 새 기록 행동을 표시해도 새로고침 실패 Notice를 덮어쓰지 않는다.
