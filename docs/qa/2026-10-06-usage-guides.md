# QA 리포트 — 사용 지침·Showcase 계층 정비

## 1. 최종 판정

- 판정: **부분 확인**. 브랜치 `fix/usage-doc-findings`(릴리스 전)의 사용 지침과 그 근거가 된 renderer·Showcase 수정을 정적 검사, 표본 독립 재구현, 전체 Web 스토리 렌더, Native 시뮬레이터 표본으로 확인했다. 디자인 시스템 전체의 시각·행동 검증 완료가 아니다.
- 확인한 범위와 주요 결론:
  - 사용 지침은 합친 뒤 `토큰 12 · 컴포넌트 135 · 구성 40 · 화면 21`이고 규격(`packages/design-contracts/docs/usage/STANDARD.md`) 검사를 통과한다.
  - Storybook은 새 규격(`docs/STORYBOOK_NAVIGATION.md`, 4단계 고정 제목·분류 어휘·스토리 이름)으로 재편했고 `실험/` 41개를 사용자 승인(2026-10-06)으로 모두 배포로 옮겼다. 제목 Web 209·Native 174, Web story 855개, `pnpm storybook:check` 통과.
  - 지침만 읽고 만든 1차 표본 6개는 실제 구현과 축별 56~89%(평균 약 80%) 일치했다. 지침 누락·오류를 규격 단위로 고쳤다. 2차 표본 9개(단계별 3개)는 엄격 타입 검사와 Web·Native 렌더·조작 흐름을 통과했다. 두 표본은 채점표가 달라 개선율로 비교하지 않는다.
  - 재편 후 Web 스토리 855개 전체 렌더: 페이지 오류 0, 가로 넘침 0(큰 글자 Showcase 문구 넘침 16건은 수정 후 재검사), axe 위반은 네이버 제공자 버튼 8건(기록된 제공자 색 예외)과 비활성 필드 도움말 1건 — 후자는 §4 수정 후 재검사.
  - 리뷰에서 찾은 renderer 결함은 §4와 §6에 처리 상태를 적었다.
- 마지막 실행 시각·시간대: 2026-10-06 21시대 KST(`pnpm ci:check`, 전체 Web 스토리 렌더).

## 2. 대상과 이력

- 기능·제품·표면: `@hjmds/design-contracts` 사용 지침, `@hjmds/react`·`@hjmds/react-native` renderer, Web·Native Showcase.
- 브랜치·검사 대상: worktree `fix/usage-doc-findings`, 기준 `origin/main` 6172d26(HJM 1.12.1 이후). 검사 대상 커밋 없음.
- 미커밋 변경 포함 여부: 전부 미커밋. main checkout에 있던 다른 작업(공통 화면·채팅·사진 선택 등)을 포함한다.
- 수행자: Claude Code 세션과 Codex 세션이 같은 worktree에서 순서대로 이어서 작업했다.

| 실행 시각(KST) | 변경/검사 대상 | 수정 전·후 | 판정과 주요 변화 |
| --- | --- | --- | --- |
| 10:40–11:35 | 지침 134→169개 작성, 규격·검사기 도입 | 작성 | 형식 검사 통과 |
| 11:10–11:20 | 1차 블라인드 6개(화면 2·구성 2·컴포넌트 2) | 수정 전 | 일치 56~89%, 지침 누락 33·오류 9 |
| 11:20–12:00 | 규격 개정(규칙/관찰 구분, 코드 예 타입 검사, 바깥 틀·실패 상태) 후 전 지침 개정 | 수정 후 | 개정 예제 파일별 타입 검사 통과 |
| 오후(Codex) | 2차 블라인드 9개, 공통 화면 통합, 레이어·그림자 토큰 연결 | 수정 후 | §5 수치 |
| 15:27–16:00 | 다른 세션 결과 독립 재검토(전체 검사·소스 리뷰 3건) | 검토 | 결함 §4 |
| 15:40–16:00 | Web 스토리 미리보기 분리 후 정적 빌드·전체 렌더 | 수정 후 | ID·제목 596/596 동일, 오류 0 |
| 16:00–18:30 | 리뷰 결함 수정(Web·Native), 검색 화면 개편, Native 버튼 혼합 텍스트 크래시 수정, 번들 바이트 상한 제거(사용자 결정) | 수정 후 | 회귀 테스트 수정 전 실패 확인 |
| 18:30–20:00 | Storybook 규격 확정·41개 승격·중복 합치기, 지침 Storybook 줄 이전 | 수정 후 | storybook·usage·링크 검사 통과 |
| 20:00–21:30 | SearchScreen 두 단계 검색 API, 레시피 불일치 후속 22건, 비활성 필드 대비 | 수정 후 | `pnpm ci:check` 종료 0 |

## 3. 환경과 검증 범위

- Web: Chromium(Playwright) 정적 Storybook, viewport 390×844, reduced motion. 2차 표본은 320/1200px × 기본/다크/2배 글자.
- Native: iPhone 17 Pro · iOS 26.5 개발 클라이언트 + Metro. 접근성 확인은 idb·simctl 대체 경로이며 Device Hub AX·VoiceOver 검증이 아니다.
- 합성 fixture(Showcase 예시 데이터). 실제 API·제품 계정 없음.
- 테마·글자: 기본/다크/2배 글자(표본), 전체 렌더는 기본만.
- 제외: Android 실기기, TalkBack/VoiceOver 낭독, 실제 IME, Release 성능, 소비 앱 적용, npm 게시.

## 4. 확인 결과·발견한 문제·재현과 수정

| 시나리오·조건 | 기대 동작 | 실제 결과 | 판정 |
| --- | --- | --- | --- |
| 지침만으로 표본 재구현(1차 6개) | 실제 구현과 같은 컴포넌트·배치·행동 | 56~89% 일치, 원인 대부분 지침 누락 | 수정 후 개정 |
| 지침만으로 표본 재구현(2차 9개) | 엄격 타입 검사·렌더·조작 통과 | 18 TSX 통과, Web 54·Native 27 조건 오류 0 | 통과(표본 한정) |
| 스토리 미리보기 분리 전후 | 스토리 ID·제목·이름·import 동일 | 596/596 동일 | 통과 |
| 분리 후 전체 Web 스토리 렌더 | 오류·axe 위반·넘침 없음 | 0 / 0 / 0(입력만 있는 작성 스토리 7개는 텍스트 없음으로 집계, 결함 아님) | 통과 |

### 발견한 문제

1차 블라인드에서 반복된 원인:
- 화면·구성 지침이 스토리 관찰값을 규칙처럼 옮겼다(제목을 `Text`로, Native ScrollView에 여백 직접). → 규격에 "규칙과 관찰 구분"을 넣고 어긋남은 각 지침 `## 함정`에 "현재 스토리는 …"으로 기록.
- 코드 예가 실제 타입과 달랐다(`Grid gap`, Web `onChange`). → 코드 예를 `strict + exactOptionalPropertyTypes`로 파일별 검사. 전체 하네스 실행은 다른 snippet의 구문 오류로 거짓 통과가 나서 파일별로만 판정.
- 콜백 시그니처·상태 객체 모양·바깥 틀·실패 상태 누락. → 규격 필수 행으로 추가.

renderer 결함(지침 작성·리뷰 중 발견, 재현 후 수정):
- Tree·DataTable 비제어 선택이 유지되지 않음, Tour 첫 단계 이전 버튼 포커스 손실, PasswordField 토글 상태 표시가 계약과 반대, Native Link 아이콘 미표시, CommandPalette 활성 행이 부모 재렌더마다 첫 항목으로 돌아감. 각 회귀 테스트 추가(수정 전 실패 확인).
- Native Button 큰 글자 줄바꿈 잘림(2차 블라인드에서 발견), Dialog 비동기 동작 설명 불일치.
- Web 겹침 순서가 `layer` 토큰을, 표면이 `shadow` 토큰을 읽지 않음 → 토큰 연결(숫자 변경은 §6 호환 항목).

다른 세션 결과 재검토에서 찾은 결함(처리 결과는 §6 표와 커밋 메시지로 갱신):
- Web: 채팅 반응이 메시지 안 버튼의 Enter/Space를 가로챔, 반응 선택 후 포커스가 body로 빠짐, ListDetailScreen 딥링크 마운트 시 포커스 탈취, 일부 컴포넌트에서 recipe 값이 `layoutStyle`을 덮음.
- Native: ChatMessage 본문이 답장·반응이 있을 때 낭독되지 않음, NotificationItem이 deprecated prop을 내부에서 써서 소비 앱에 경고, Dialog 액션 실패가 조용히 사라짐, TextArea 최소 높이 회귀(80→44).
- 지침: 코드 예 컴파일 실패 4건, 사진 선택 순서 반대 서술, 실험 표현을 배포 화면 기본값으로 서술, 검사기 우회 구멍 4종(묶음 스토리 담당 누락, `###` 강등, 한쪽 플랫폼 예만 있음, 상태·적용 값 미검증). → 검사기 강화 후 54건 수정, 216개 오류 0.

## 5. 검사·관찰 결과

| 실행 명령·조건 | 검사 수·판정 | 핵심 오류/수치와 해석 |
| --- | --- | --- |
| `pnpm ci:check`(21시대, 최종) | 종료 0 | 계약 947, Web SSR 278·브라우저 1058, Native 1144, Showcase Web 43·Native 17+21, 정적 Storybook canonical 103·story 855, 모듈 수·금지 모듈 통과(바이트는 보고만) |
| `pnpm check`(15:27, Node 24.20.0) | 종료 0 | 계약 941, Web SSR 276·브라우저 1022, Native 1108, 사용 지침 216, 문서 링크 490. 번들 경보 39건(최대 `styles.css` -5.6%, 110% 경보 범위 안) |
| `pnpm ci:check`(Codex, 토큰 연결 후) | 종료 0 | 위 수치 + Web/Native Showcase 34/24, 정적 Storybook canonical 103·탐색 13 |
| `pnpm showcase:web:build` + `verify:static`(미리보기 분리 후) | 종료 0 | canonical 103, 탐색 페이지 13 |
| 정적 Storybook 전체 렌더(Playwright 3 worker) | 596 | 오류 0, axe 0, 넘침 0 |
| `node scripts/audit-showcase-hierarchy.mjs` | 328 제목 | HJM 미사용 0, 분리로 의존 파일 목록 41행 변경 |
| 레이어 회귀(Web 실제 브라우저, Codex) | 12 조건 | 메뉴·대화상자·선택 목록·툴팁 z-index 400/900/400/950 |
| Native Surface 그림자(시뮬레이터, Codex) | 3 조건 | 기본/다크/2배 글자 렌더 |

## 6. 미확인 범위와 후속 조건

| 미확인/실패/보류 항목 | 이유 | 후속 담당·재검증 조건 |
| --- | --- | --- |
| 216개 지침 전체 독립 재구현·전체 코드 예 컴파일 | 사용자가 표본(단계별 3개)으로 범위를 좁힘 | 지침을 크게 바꿀 때 표본 재실행 |
| 레이어 z-index 숫자 변경의 소비 앱 영향 | 앱이 직접 정한 z-index와 순서가 바뀔 수 있음 | 릴리스 전 소비 앱별 확인, changeset 마이그레이션 표 |
| 소셜 로그인 라벨 | 오후에 20 heavy로 바뀌었다가 사용자 위임 결정으로 body(14)로 복원, 네이버 녹색 대비(3.09:1)는 제공자 색 예외로 `docs/provider-button.md`에 기록 | 렌더 검사에서 계속 8건으로 보인다 |
| Native Storybook 메뉴 정렬·81개 Native 링크 변경 | 정렬은 코드로 확인, 기기 메뉴는 미확인. Native는 제목 기반 ID라 옛 링크가 바뀐다 | 기기에서 메뉴 확인 |
| Android 실기기, VoiceOver/TalkBack, 실제 IME, Release 성능 | 미수행 | 릴리스 전 |
| npm 게시·소비 앱 반영 | 사용자 지시로 하지 않음 | 사용자가 검토 후 직접 |

## 7. 보관 처리

- 원본과 리포트 대조: Codex 세션의 감사 문서·검증 메타데이터·블라인드 보고서·렌더/조작 결과 JSON·로그와 이 세션의 비교 보고서를 읽고 수치·실패·한계를 §4~6에 옮겼다.
- 제거한 원시 산출물: `docs/evidence/hierarchy-2026-10-06/`(PNG 52, JPG 3, JSON 26, 로그 6, 실험 스크립트·TSX), `showcase/{web,native}/.usage-audit/`(412), `showcase/web/.saved-qa.mjs`·`.full-audit.mjs`. main checkout의 정리(2026-10-06 13:32)와 맞춰 `docs/evidence/{chat-replies,comment-composer,photo-source,reusable-screens,social-composition}-2026-10-05/`, `reference-flows-2026-10-03/`, `diairy-modal-focus-2026-10-03.*`도 제거하고 `docs/qa/` 리포트 7개를 가져왔다. 원시 파일은 저장소 밖 세션 임시 폴더로 옮겼다.
- 별도 보관한 계약 증거: 없음. 기존 `docs/evidence/*-2026-10-0[12]/`는 이번 작업 대상이 아니라 그대로 둔다.
- 새 리포트로 갱신한 참조: `docs/audits/showcase-hierarchy-2026-10-06.md`의 증거 링크, `docs/plans/` 3개, 캡처 도구 두 개(`scripts/capture-screen-patterns.mjs`, `packages/react/test/photo-source-evidence.browser.test.tsx`)의 출력 경로를 저장소 밖으로 변경.
