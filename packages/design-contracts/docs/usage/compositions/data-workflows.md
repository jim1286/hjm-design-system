# 데이터 해석과 가져오기

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [데이터 구성 계약](../../data-workflows.md), `src/data-workflows.ts`, 양 renderer의 `src/data-workflows.tsx`
- 스토리북: `배포/구성/입력과 작성/가져오기 열 연결`, `배포/구성/정보 표시/전환 퍼널`, `배포/구성/정보 표시/코호트 잔존율`, `배포/구성/정보 표시/상관 행렬`, `배포/구성/정보 표시/목표 달성 요약`, `배포/구성/정보 표시/분포 구간 탐색`

## 언제 쓰나

CSV 열 연결, 순차 퍼널, 가입 시점별 잔존율, 지표 상관, 목표, 분포 구간 탐색에 쓴다.
단순 표/통계/막대 그래프만 필요하면 기존 DataTable/Statistic/BarChart를 직접 쓴다.
같은 구성의 비율 계산과 검증을 제품마다 복사하지 않기 위해 도입했다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| ImportFieldMapping | Select, DataTable, Button | 제품 parser·실제 importer와 controlled mapping |
| ConversionFunnel | BarChart, Button, Text | 제품 순차 count·이탈 사유 |
| CohortRetentionTable / CorrelationMatrix | DataTable | 실제 분모/관측값·상관값 |
| TargetSummary | Statistic, Progress | 실제값·목표 |
| HistogramExplorer | BarChart, Button | 원본 samples·범위·선택 구간 수 |

## 배치

```text
가져오기: 원본별 선택 → 검증 → 변환 미리보기 → 실제 가져오기
퍼널: 실제 단계 막대 → 단계 선택 → 선택한 단계 설명
표: 고정 행 제목 | 기간/변수 열 (가로 스크롤)
목표: 실제 수치·설명 → 목표가 있을 때 진행 막대
분포: 구간 수 선택 → 동일 y축 분포 → 관측/누락/범위 밖 요약
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 기존 본문·카드 안 | md, 목표는 sm |
| 선택/행동 | Button/Select | 데이터 위 또는 연결 마지막 | Stack inline sm wrap |
| 상태 | Text | 해당 구성 중앙 | 중앙 정렬, 임의 상단 margin 없음 |
| 표 | DataTable | 본문 폭 안 스크롤 | 첫 열 pinned start; 대각선도 실제 셀 |

## 흐름과 상태

1. 제품이 실제 데이터와 formatter를 전달한다.
2. 가져오기 연결/분포 구간 수는 제품의 controlled 상태로 반영한다.
3. 중복 연결·필수 누락이면 미리보기/실행을 막고 실제 원인을 표시한다.
4. 가져오기 resolve까지 중복 실행을 차단한다. reject하면 연결은 유지하고 오류 뒤 같은 행동으로 재시도한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 실제 데이터와 controlled 선택 | 실제 표/차트의 기존 접근성 계약 |
| 진행 중 | 가져오기 버튼 내부 로딩 | 중복 실행 차단, 연결 선택 잠금 |
| 실패 | 연결 유지·중앙 오류 | Web alert / Native assertive, 같은 행동 재시도 |

## 코드 골격

```tsx
// Web
import { TargetSummary } from "@hjmds/react/data-workflows";
<TargetSummary label={t("goal.title")} actual={actual} target={target}
  formatActual={formatCount} summaryLabel={formatGoalSummary} />;
```

```tsx
// Native
import { TargetSummary } from "@hjmds/react-native/data-workflows";
<TargetSummary label={t("goal.title")} actual={actual} target={target}
  formatActual={formatCount} summaryLabel={formatGoalSummary} />;
```

실행 예제는 Web `showcase/web/src/patterns/DataWorkflows.previews.tsx`, Native `showcase/native/src/data-workflows-preview.tsx`다.
각각 공개 진입점을 소비한다. 제품에서 showcase 원본을 import하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 계산·데이터 | 공유 contracts | 공유 contracts |
| 연결 선택 | Select popover | Select 창, dismissLabel 필수 |
| 차트 host | SVG | react-native-svg optional peer |
Native 차트는 기존 react-native-svg optional peer를 사용한다. 새 제스처나 자체 차트 엔진을 추가하지 않는다.

## 함정

- null 미래 관측을 0%로 채우거나 목표 0을 100%로 만들지 않는다.
- 순차가 아닌 지표를 퍼널에 넣지 않는다. 실제 원인 데이터 없이 이탈 사유를 생성하지 않는다.
- 히스토그램 전체 선택에서 같은 domain을 유지한다. 누락값·범위 밖 count를 제품 summaryLabel에 표현한다.
- mapping 변경만으로 저장을 실행하지 않는다. 서버 확정·권한·멱등성은 실제 importer 책임이다.
- 미게시 개발 API이므로 현재 설치된 소비 앱에서 사용할 수 있다고 보고하지 않는다.
