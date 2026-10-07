# 모든 소스 브랜치 main 통합 — 2026-10-07

## 범위와 근거

사용자가 모든 저장소의 모든 브랜치를 main에 병합하도록 요청했다. 공유 checkout의 미커밋 작업은 보존하고 별도 main checkout에서 통합했다. 자동 앱 배포·스토어 릴리스를 시작하지 않도록 최종 통합 커밋은 `[skip ci]`를 사용한다. 원격 CI 실행·운영 공개 완료를 뜻하지 않는다.

- 저장소: `packages/hjm-design-system`
- 시작 로컬 main: `909feb2864b5972a5e97160792341489eb0f4c35`
- 동기화 원격 main: `909feb2864b5972a5e97160792341489eb0f4c35`

## 브랜치 판정

| 브랜치 | 확인 SHA | 처리 |
| --- | --- | --- |
| `backup/pre-main-integration-20261006` | `1ba18ea0084657cbd57a0c61911acf41c7193c54` | main ancestry 확인 |
| `backup/stale-residue-2026-10-02` | `3bfbd00e887764111945a7e62a190da1cae2ac62` | main ancestry 확인 |
| `codex/daily-design-research-20261002` | `5b1f73c0982b6946bf1a2fd95cd6208d7dbb8202` | main ancestry 확인 |
| `codex/dark-contrast-091` | `beb5744f0579834b924bcf58e16f27f6a260978c` | main ancestry 확인 |
| `codex/hjm-1.11.0` | `1fd4e4275217e2de9837ffecbb656a6da267bd4b` | main ancestry 확인 |
| `codex/main-integration-20261006` | `340b9e4817e5578e51ae6a00bec13556c29b8fec` | main ancestry 확인 |
| `feat/hjm-1.9.0` | `3973394c40f29e6b8bf8d137cc945228da626fe2` | main ancestry 확인 |
| `feat/stable-components-and-data-layouts` | `f1d28a358c8b5aad9c86a5c9a58c7d5415bc7a54` | main ancestry 확인 |
| `feat/toast-refresh` | `8edd37971195235e44045d86a7d51a91834ecbd8` | main ancestry 확인 |
| `fix/1.13.1-adoption-gaps` | `4d7619082a2bcc346446918785655ba16e27d4a4` | main ancestry 확인 |
| `fix/1.13.2-recent-remove-icon` | `57a2364382fb01c01d8c79f283cd310fe9d20404` | main ancestry 확인 |
| `fix/usage-doc-findings` | `aac4c298914c32f2565307680395fc82e96d3361` | main ancestry 확인 |
| `release/1.10.0` | `b3d5a61a3bcee2fcff69d2bc729edda2d24b30f5` | main ancestry 확인 |
| `release/1.13.0` | `dd49d37ef3c7c303fa8f2b402bbe13d7a793aa81` | main ancestry 확인 |
| `release/1.9.0` | `0860149f029866237b8ac8278e0e410d52f63c7d` | main ancestry 확인 |
| `changeset-release/main` | `174f66ec30d8296379ff6e6b7395a39c57504519` | main ancestry 확인 |
| `chore/byte-budget-alarm` | `67e064bbd4795b48a3111202f547f049ebb9f7e5` | main ancestry 확인 |
| `docs/stea-close` | `71d40b0c0744a51414d0c6b4cef34e544d790ef7` | main ancestry 확인 |
| `feat/stea-compositions-and-fixes` | `2973f4ba8ffef537b643af4858d479cec1e2dbe3` | main ancestry 확인 |
| `fix/native-grid-subpixel` | `9d69223a33837593f640c30a557e15edd363d66a` | main ancestry 확인 |

## 충돌 처리

동일 패치는 `git cherry`의 동치 결과를 근거로 트리를 변경하지 않고 ancestry를 연결했다. 과거 HJM release/catalog 숫자는 게시가 확인된 1.14.0을 유지했다. 최신 main에 이미 흡수된 기능은 후속 수정과 삭제 결정을 유지한다. 브랜치 삭제는 하지 않았다.

- Toast badge/pill·usage 지침·공통 화면·Grid pixel floor는 이미 1.14.0 source에 포함되어 있다.
- 오래된 usage 루트 파일은 현재 `components/`, `compositions/`, `screens/`, `tokens/` 구조로 대체되었다.
- NavigationStudy 예제는 `docs/STORYBOOK_NAVIGATION.md`의 내비게이션 중복 정리 기록대로 canonical 표현으로 합쳐져 있어 복원하지 않았다.
- 소비된 changeset과 이전 peer train·visual baseline은 다시 넣지 않았다.
- QA 문서 추가 전의 최종 source tree는 공개 1.14.0 후속 main `909feb2` tree와 정확히 같다: `b128d1cf2408ff8357daa501595fab1e914074d0`. npm 재게시 없음.

## 검사와 한계

통합 후보의 검사는 아래 실행 결과로 갱신한다. 앱 기기 QA·스토어 릴리스·운영 배포는 이번 범위에서 수행하지 않는다. 공유 snapshot에서 수행한 HJM 1.14 검사와 이 통합 checkout 검사는 서로 다른 증거다.

## 보존

이 작업의 결과·명령·실패·미확인 범위는 이 보고서에 남긴다. 원시 검사 로그는 검사 완료 후 SHA-256 요약을 남기고 제거한다. 재사용 도구·제품 fixture·branch inventory는 보존한다.

## 통합 후보 실행 결과

| 명령/검사 | exit | 시간(초) | 로그 SHA-256 |
| --- | ---: | ---: | --- |

초기 실패와 재검사를 함께 보존한다. 의존 패키지 dist·Prisma client 생성 누락은 준비 후 재검사했고, 실제 수정과 남은 범위는 아래에 기록한다.
