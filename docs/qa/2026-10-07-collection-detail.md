# QA 리포트 — 카드 탐색과 상세 연결

## 1. 최종 판정

부분 확인: 공통 계약·Web/Native renderer·양 Showcase 실험 등록 및 로컬 회귀 통과.
Web 실제 fixture 흐름을 확인했다. Native 기기 UI/OS touch·읽기 순서·키보드·모달 복귀와 승급·npm 게시·소비 앱 적용은 미확인이다.
2026-10-07 18:39~19:15 KST root 수행. 사용자 “필요한것만 조사해”에 따라 새로운 사이트 전수 조사는 하지 않았다.
최대 OS 글자 및 최대값을 모사한 확대는 설계·실행·후속·완료/릴리스 차단에서 제외했다. LargeText는 규격상 등록만 하고 실행하지 않았다.

## 2. 대상과 변경

main 9aa33e2063dc65d0427697fb5a20b48ab7cba387 + 이번 미커밋 소스. package version1.15.0은 유지했으며 새 `/collection-rail` 진입점은 해당 게시물에 포함되지 않는다.
공유 checkout의 다른 세션 Comment/screen-flows 변경도 빌드 환경에 있으므로 그 기능의 검증으로 확대하지 않는다.
List의 세로 행·Carousel의 단일 active/hidden/inert 계약과 달리 여러 카드의 독립 행동을 함께 노출한다.
공통 finite geometry/안정 ID/논리 offset/초점 노출만 새 계약이 소유하고 Card·TextField·Dialog의 상태/초점/배경 lock은 기존 API를 합성한다.
canonical catalog·root export·optional peer는 늘리지 않았다. 공개 대응표에는 List companion으로 분류했다.
양 실험 경로: `실험/구성/직접 조작과 모션/카드 상세 연결`; Default/Empty/Dark/LargeText/ReducedMotion/Rtl 6개 변형.
후기/영상/상품의 데이터와 목적별 변형까지 구현 완료했다고 표시하지 않는다.

| 검사 대상 | SHA-256 |
| --- | --- |
| contracts collection-rail.ts | 21df5377a436b02d782ebf8bf2a15a1b2db0f679c887391dcdd458da5f944cac |
| Web collection-rail.tsx | cc65b01d5b9049af0d24e9a229332613f82790fa382b8edaa5b21d8fe9deac26 |
| Native collection-rail.tsx | 3a779c33c7dac009b666cc58fe35bc1a78a64692ef2aa8509e9a4d6557e1c9b6 |
| Web collection-detail-preview.tsx | e37ac8b347338bdc1e284125f74b9629a0afd5b17a320859b0318e60967eed64 |
| Native collection-detail-preview.tsx | 045e73f5d4354f07c8fdac928251825f6f7d52056b44a6c93053a68da80e9d08 |

## 3. 환경과 범위

MCP Playwright 소유 신규 tab1, Chromium/macOS, DPR1. frozen Storybook/Vite preview6028의 정적 artifact를 사용했다.
공유 contracts/Native watch·Expo·시뮬레이터는 조작하지 않았다. 기존 blank tab0을 보존했다.
합성 기록5개, 실제 서버·계정·영구 저장 없음. 1200×900 light/ltr/full 및 390×844 dark/rtl/reduced, textScale1을 확인했다.
최종 frozen index SHA: 1e87014440afa16003dfeb5bb6c0abd4ec2a480c10ac2d443d5fbf25053f114a.

## 4. 실제 흐름과 수정 전후

| 흐름 | 실제 관찰 | 판정 |
| --- | --- | --- |
| 10종 light + 10종 dark/RTL/reduced | retro/paper/forest/minimal/editorial/brutalist/glass/aurora/terminal/clay 모두 동일 입력 DOM·초안 유지, 항목5개, 페이지 가로 overflow 없음 | 통과 |
| 폭1200→390 | viewport1104/card360→viewport326/card302. 동일 입력·초안 유지, 8px 다음 카드 힌트 | 통과 |
| 좁은 RTL Next→End→Home | 실제 scrollLeft -1248/max1248 도착 후 next aria-disabled=true, Home0. 초안 유지 | 통과 |
| 넓은 기본 모션 Next→End | 이동 중 offset376.5/max760에서는 next 비활성화하지 않음. 도착760 후 aria-disabled=true | 통과 |
| Dialog 메모→테마 변경→Escape | 상세 `상세 초안도 유지`와 본문 `RTL 카드 초안 유지` 유지, 종이 테마 전파. 닫힌 후 `산책 상세 보기`로 초점 복귀 | 통과 |
| 비어 있음/좁은 light | 항목0, 비어 있음 안내, 두 탐색 버튼 비활성, 가로 overflow 없음 | 통과 |
| VQ 한 장 비교 | 최종20테마 화면+끝/Dialog/empty/좁은 상태의1400×4600 contact sheet 검토. 종이 light와 좁은 dark Dialog 원본도 확대 확인. 제목·본문·입력·닫기·주 행동 잘림 관찰 없음 | 확인 범위 통과 |

처음 Web theme.tokens.spacing 접근은 공개 타입에 없는 값이었다. 공통 rail recipe의 spacing.md를 사용하도록 수정해 두 renderer와 일치시켰다.
Web에서 초점 카드 reveal 후 unchanged 초기 ResizeObserver 알림이 anchor를 다시 맞춰 카드 오른쪽112px를 가렸다.
초기 변경 없는 알림을 건너뛰고 폭 변경에서 이전 anchor와 초점 카드가 함께 들어가지 못하면 초점 노출을 우선했다. 실제 browser bounds 회귀 통과.
처음 smooth scroll 목적지를 바로 발행해 실제376/max760인데 End가 비활성화됐다. 대기 목적지와 실제 host 관찰을 분리했다.
연속 버튼은 대기 목적지를 사용하지만 callback/끝 상태는 실제 scroll 응답으로만 갱신한다. Web 지연 host·Native 응답 지연 회귀 통과.
Native TextField import와 callback은 실제 `/inputs`·onValueChange로 수정했다. 공개 타입 확인 없이 입력 API를 추정한 실패 뒤 타입 검사 통과.
패키지 경계 검사의 export 순서와 CLI 실행 경로를 수정해 다시 통과했다. 관련 실패를 UI 동작 실패로 확대하지 않는다.
초기 빌드 handle은 turn 중단으로 완료 상태를 읽지 못했다. 최종 source를 다시 build-storybook하여 exit0/9.90s를 확인했다.
처음 임시 artifact/favicon404를 관찰했으나 최종 artifact 각 navigation의 console error/warning0. 공유 HMR 대신 frozen artifact에서 상태를 검증했다.

## 5. 로컬 검사

| 검사 (각 대상 workspace의 Node24.20.0) | 결과 |
| --- | --- |
| contracts vitest test/collection-rail.test.ts | 5검사 통과: ID/finite/끝/RTL/reveal |
| Web vitest --config vitest.browser.config.ts test/collection-rail.browser.test.tsx | 5검사 통과: 실제 focus/resize/RTL/입력/이동 관찰 |
| Native vitest test/collection-rail.test.tsx | 4검사 통과: host 좌표/응답/height/touch/empty. 실제 OS 검증 아님 |
| Web vitest --config vitest.ssr.config.ts test/package-boundary.ssr.test.tsx | 1검사 통과: granular exports/CSS/root 경계 |
| Web/Native tsc build 및 noEmit, 양 Showcase tsc noEmit | 모두 통과 |
| Native sb-rn-get-stories | 통과: 새6변형 등록 |
| Web verify-token-boundary | 309source·70 exact declarations 통과 |
| Web build-storybook (본인 temp outDir) | exit0, 9.90s. 기존 use-client/chunk 경고 |
| contracts/renderer import graph 검사 | 통과. contracts3modules/13795raw/4638gzip, Web5/35037/9277, Native7/53520/13476. metadata/root/private/platform/optional peer 누출 없음 |

바이트는 보고 기준만 추가했고 상한을 만들지 않았다. 새 module count와 import 경계를 실제 graph로 검토했다.
일반 개발 원격 CI/dispatch·버전 상승·게시를 실행하지 않았다. 최종 정적 검사 통과: 문서582개, usage 토큰12/컴포넌트139/구성58/화면22, Storybook429파일/958ID, 공개 지도310platform API. 149후보·출처 SHA 보존과 실제 등록5항목(신규4+기존 개선1)의 양 플랫폼 변형/지침/증거 연결도 통과했다.

## 6. 미확인과 후속 조건

Native 실제 touch/VoiceOver/읽기 순서/OS 키보드·입력/모달 복귀를 확인하고 제공 행동을 검수 후 승급한다.
미디어 재생·고객 후기·실제 데이터/자산/서버 저장·대용량 가상화·loop/autoplay/shared-element motion은 이 합성 구성의 완료 범위가 아니다.
미독해 외부 페이지는 현 완료나 릴리스 차단 항목이 아니다. 새 공개 rail의 npm 게시 후 소비 앱에서 dependency/lock/contract를 갱신한다.

## 7. 보관 처리

37PNG 총1981822bytes(초기 artifact10light/Dialog 포함). 이름·크기·SHA 정렬 manifest SHA:32efe7a51627a71f5c274c45842d995321e2954adc4fb7996fc5e8f58014e5d6.
최종 contact sheet SHA:f640dd561744df770cdebb706a2ed715d0ec522ba423c11dc90fb8fdf72ebd21.
잘못된 screenshot 경로의 본인 파일45278bytes/SHA3402175f814d786b1ad78bf71fd40935e843e5e114bd44020c4f4a5658ceb810은 이미 제거했다.
QR 지침에 따라 위 원시 이미지·임시 static/log·확인 가능한 본인 snapshots는 결과 대조 후 제거한다. 재사용 fixture·출처·계약·회귀 소스는 보존한다.

본인tab1 닫기 후 기존blank tab0 보존 확인. 본인 preview6028 PID84110의 정확한 임시 artifact 명령을 다시 대조하여 종료했다. 37PNG·본인 임시 static/log를 제거했다. 다른 세션 watch/Expo/원시 기록은 보존했다.

| 확인 후 제거한 본인 snapshot | bytes | SHA-256 |
| --- | --- | --- |
| page-2026-10-07T10-10-59-465Z.yml | 4306 | a469548c50fe95f30b76ecb8e58276f369c2bf108466efb43d5bedaaba78b5b6 |
| page-2026-10-07T10-11-17-381Z.yml | 4306 | 418de3c30a1811e616cb4c542b7e81a2d0f4410ef02983d887ac4289550b29ba |
| page-2026-10-07T10-11-27-179Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |
| page-2026-10-07T10-11-53-278Z.yml | 3557 | 6ba55f54c6e0220b109f264c451fadb32b90a06a1f489819d5a969398dc83a88 |
| page-2026-10-07T10-12-31-092Z.yml | 0 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |

최종 diff 확인에서 tsc가 JSX attribute 사이의 근거 주석 뒤에 trailing space를 방출했다. 같은 주석을 JSX 앞쪽으로 옮겨 Native tsc build와 renderer 경계 검사를 재실행해 통과했다. 동작 변경은 없다. Web frozen artifact에는 영향이 없다.
