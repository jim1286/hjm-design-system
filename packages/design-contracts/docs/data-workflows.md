# 데이터 해석과 가져오기 구성

검토일: 2026-10-15 · Storybook 배포 · Web/Native · npm 1.21.0

Lucian 130·160–164를 검토하면서 기존 표·차트·통계의 실제 데이터 연결을 재사용할 필요를 확인했다.
별도의 표/차트 엔진을 만들지 않고 DataTable, BarChart, Statistic, Progress, Select를 합성한다.
MatrixTable은 팀 간 비교에서 대각선을 숨기는 계약이므로 직사각형 코호트나 자기상관 보존에 쓰지 않는다.
공개 진입점은 `@hjmds/{react,react-native}/data-workflows`, 계산은 `@hjmds/design-contracts/data-workflows`다.
Native 진입점은 BarChart(`/chart`)를 합성하므로 `/chart`와 같은 optional peer `react-native-svg@15.15.5`가 필요하다(2026-10-18 Metro 번들 검사 복구 때 확인).

| API | 계약과 선택 기준 |
| --- | --- |
| ImportFieldMapping | stable source/target ID, 중복 target·필수 누락이면 가져오기/미리보기 차단. 명시적 skip 지원. 실제 parser/importer는 제품 소유. onImport에 동결된 연결 snapshot 전달. reject 시 연결 유지·재시도 |
| ConversionFunnel | 순차 단계의 감소하는 실제 정수 count만 허용. 첫 단계/직전 단계 분모 0은 null. 원인은 제품에서 공급하며 자동 추정하지 않음. 선택한 단계의 실제 detailLabel 표시 |
| CohortRetentionTable | size가 분모. retained의 null/빠진 미래 기간은 미관측, 관측 0은 0%. size 0은 비율 미정. 직사각형 기간을 모두 보존 |
| CorrelationMatrix | [-1,1] 대칭 정방행렬, 관측된 대각선 1. null 보존. 수치와 dataviz 양/음 색을 함께 제공. 상관 계산·인과 판정은 제품 소유 |
| TargetSummary | 실제값·목표는 유한한 비음수. 목표 0은 ratio/progress null이며 Progress 생략. 초과 달성 ratio를 보존하고 표시 막대만 1로 제한 |
| HistogramExplorer | 1–100개 동폭 bin, 마지막 상한 포함. null·범위 밖 값 수 별도 집계. 동일 samples/domain과 모든 구간 선택의 최대 count를 사용해 y축 유지 |

모든 문구·수치 formatter·데이터는 제품에서 제공한다. Native 가져오기 선택 창의 dismissLabel도 제품 문구다.
오류/검증 문구는 구성의 중앙에 놓고 임의 상단 여백을 추가하지 않는다.
연결의 서버 검증, CSV 보안/인코딩, 저장·인증·권한·멱등성은 실제 제품 importer가 소유한다.

검증: 계산 6건, Web 브라우저 5건, Native host 2건 통과. 비동기 공통 helper 추출 후 기존 목록 편집 Web 7건/Native 5건 통과.
Native 실제 기기·제품 연결·운영 배포는 미실행이다. npm 1.21.0 게시·artifact 확인은 도입 기록을 따른다.

신규 6개 개발 Storybook 화면 확인. 두 제품 팔레트 light/dark 및 375px host 검사 통과. 본 작업의 6012 검사용 서버·탭 종료, 기존 6006 서버 보존.
