# 기존 실험 17개 검토·승급·HJM 게시

2026-10-07 사용자 요청: "실험에 있는것들 검토후 승급 후 게시 먼저하자".
판정: 기존 17개 Storybook 배포 분류 승급·공개 배포 완료. npm 세 패키지 1.14.0 게시 및 latest 확인 완료.
기준 소스: main 8a75741 이후의 본 작업. 소비 앱 적용·스토어 출시는 포함하지 않는다.

## 환경과 검토 방법

Node 24.20.0 / pnpm 11.18.0. IAB Chromium, Web Storybook 6006.
17개 전체를 같은 시트에 모아 각 iframe 390×844 / dark / RTL / 글자 200% / reduced motion으로 직접 확인했다.
줄바꿈·본문·주 행동의 표시를 대조했고 이전 개별 QA 기록의 밝음·어두움·실패·복구 결과와 함께 판정했다.
전체 시트에서 화면보다 긴 예제는 스크롤 대상이며 전체 상태가 한 viewport에 들어간다고 주장하지 않는다.
별점은 Space 선택 후 RTL ArrowLeft로 3→4점 이동, disabled 4점 유지까지 다시 확인했다.
Web 시작 안내는 제목 입력→이전→다음에서 "승급 검토" 보존 및 완료 결과를 다시 확인했다.
빌드 중 HMR이 검토 화면을 재마운트하므로 CI 완료 후 동일 흐름을 다시 실행한 결과만 판정에 사용했다.

Native: 기존 iPhone 17 Pro / iOS 26.5, AC433031-1746-46C6-86A9-143A1FC839F8, Expo Go 57.0.9, Metro 8084.
Device Hub CUA 금지 지침에 따라 idb 접근성·입력과 simctl screenshot을 사용했다. Device Hub 검증·실물 기기·Release binary 결과가 아니다.
Storybook 공식 initialSelection / shouldPersistSelection 옵션을 잠시 써 미확인 예제를 직접 열었고 원본 설정을 복원했다.

## 17개 판정

| 항목 | 기존 근거와 이번 검토 | 결과 |
| --- | --- | --- |
| 별점 선택 | [별점 QA](2026-10-07-rating-reference.md), 전체 시트, RTL 키보드 선택·비활성 값 재확인 | 배포 |
| 이미지 전후 비교 | [비교 QA](2026-10-07-image-comparison.md), PNG Native fixture·드래그·양끝·RTL 캡션, 전체 시트 | 배포 |
| 가장자리 흐림 | [흐림 QA](2026-10-07-progressive-blur.md), iOS 끝 항목·짧은 목록·다크 합성, 전체 시트 | 배포 |
| 관련 입력 묶음 | [그룹 QA](2026-10-07-field-group-reference.md), 오류·잠금·순서 변경·기존 필드 재사용, 전체 시트 | 배포 |
| 날짜 직접 입력 | [날짜 QA](2026-10-07-date-entry-reference.md), 원문 초안·parser·오류·순서, 전체 시트 | 배포 |
| 버튼에서 이어지는 편집 | [origin QA](2026-10-07-overlay-origin-transition.md), 초안·닫기·초점 복귀·기존 Dialog, 전체 시트 | 배포 |
| 입력을 유지하는 도구 | [도구 QA](2026-10-07-toolbar-reference.md), 선택·접기 초점·키보드 중 초안, 전체 시트 | 배포 |
| 문서와 파일 | [문서 QA](2026-10-07-file-reference.md), 실제 iOS 파일 readback·공유 dismiss·준비 잠금·실패 복구, 전체 시트 | 배포 |
| 영상 미리보기 | [영상 QA](2026-10-07-video-dialog.md) + 이번 iOS 실제 재생 영상·재생/일시정지·손상 소스 오류·정상 fixture 재시도·바깥 초안 유지 | 배포 |
| 질감 비교 | [질감 QA](2026-10-07-noise-experiment.md), 장식 뒤 입력·버튼·강도·다크, 전체 시트 | 배포 |
| 추가해도 유지되는 목록 | [목록 QA](2026-10-07-live-list.md), 새 행·초안·재정렬·삭제·정지 회귀, 전체 시트 | 배포 |
| 그림과 시작 안내 | [그림 QA](2026-10-07-illustrated-outcome.md) + 이번 Web 완료·초안 및 iOS 200% 실제 입력·이전/다음·완료, 아래 배치 수정 | 배포 |
| 버튼 완료 피드백 | [피드백 QA](2026-10-07-feedback-panel-reference.md), 실패→현재 초안 편집→성공, 전체 시트 | 배포 |
| 선택과 오류 복구 | [업로드 QA](2026-10-07-upload-reference.md), Web chooser·중복·취소·재시도, Native 합성 상태 흐름, 전체 시트 | 배포 |
| 높이가 이어지는 패널 | [패널 QA](2026-10-07-native-panel-noise.md), 기존 입력 mount 유지·스크롤로 접근, 전체 시트 | 배포 |
| 선택 배경 이동 | [선택 QA](2026-10-07-selection-motion.md), RTL resize 배경·선택·초안·reduced motion, 전체 시트 | 배포 |
| 기능 카드와 주 행동 | [CTA QA](2026-10-07-cta-reference.md), 첫 행동·조건·실패/재시도·초안, 전체 시트 | 배포 |

## 발견과 수정 전후

1. Native Agreement 감사 테스트가 이전 Text "✓"를 찾았다. 현재 큰 글자 대응은 고정 View 그림이다.
   테스트를 실제 체크 그림의 semantic 색·접근성 제외와 disabled 상태를 검증하도록 수정했다. focused 7개 통과.
2. 실제 Metro 그래프 fixture가 DateEntry·FieldGroup·DocumentResource 공개 subpath를 빠뜨려 package 검사가 실패했다.
   import·reachability 목록에 세 경로를 연결했다. families 66 / modules 696 / raw 1475.5 KiB / gzip 363.2 KiB, 금지 peer 유입 없이 통과.
3. Native 그림 안내는 부모 높이가 없어 OnboardingScreen body가 접혔다. flex 높이를 배정해 기본 큰 글자를 복구했다.
   키보드와 200% 글자를 함께 켜자 고정 머리가 남은 본문을 모두 소비했다. 공통 Native OnboardingScreen에서 제목·설명·진행을
   기존 scroll body로 옮기고 완료·이전 footer는 유지했다. 예제의 그림 토글·설명도 intro에서는 그 scroll body에 배치했다.
   수정 후 키보드가 열린 실제 화면에서 제목 입력 전체를 스크롤로 노출하고 20261007을 입력·이전/다음에서 보존·완료했다.
   회귀 테스트는 안내·입력이 같은 ScrollView 안에 있고 완료 버튼이 그 밖에 있음을 200% renderer에서 검증한다. focused 24개 통과.

## 자동 검사와 게시 경계

수정 1·2 후 canonical pnpm ci:check 종료 0: contracts 1005, Native 1214, Web SSR 278 / browser 1121,
Native showcase 21 / Web showcase 43 테스트 및 생성물·bundle·문서·governance·usage·storybook·static 검사가 통과했다.
수정 3과 승급 후 같은 canonical 검사 및 release artifact 검사를 다시 실행한다. 마지막 실행 결과와 게시 영수증은 아래에 추가한다.

두 Storybook의 첫 마디만 실험→배포, Web 명시 ID 보존. 17개 usage 상태·경로·적용 버전 동시 갱신.
새 optional API가 포함되어 1.14.0을 선택하며 두 renderer의 contracts peer를 version 실행 전에 1.14 train으로 이동한다.
Storybook 승급은 catalog의 모든 API·OS 확장을 stable로 선언하거나 소비 앱 준수·운영 반영을 주장하는 것이 아니다.

## 미확인과 보존

Android 실제 화면, VoiceOver/TalkBack 실제 기기, 전체 제품 팔레트, 성능/메모리 장시간 측정, 유음 영상 자막,
실제 업로드 서버·Native 시스템 picker·공유 수신 완료는 이번 게시 검토로 증명하지 않는다. Optional host는 제품 설치·권한·오류 처리가 필요하다.
11개 사이트 전수 조사는 여전히 미완료이며 이번 17개 승급과 구분한다. Utilverse 의존성·제품 화면 이관도 게시 후 진행한다.
회원 미리보기 신규 후보의 미커밋 파일은 /Users/jimin/.codex/tmp/hjm-member-preview-followup-20261007에 보존해 이번 게시에서 제외했다.
이 Markdown과 기존 개별 보고서·회귀 fixture·원본 자산은 보존한다. 전체 시트 임시 HTML과 이번 임시 screenshot/log는 결과 기록 후 제거한다.

승급 후 검사: contracts 1005·Native 1215·Web SSR 278 통과. Web browser는 1120/1121 통과, 기존 menubar keyboard 사례가 선택 종료 대신 새 문서라며 실패했다. 같은 소스의 해당 browser 사례 단독 재실행은 1/1 통과했다. 이 결과를 전체 성공으로 세지 않고 버전 확정 뒤 canonical release:check를 다시 실행한다.

## 최종 게시 영수증

- release SHA: `8d6f6651ea71450014f5ca5e484b6b78bea8828b`, main 원격 반영 확인. canonical v1.14.0 태그도 같은 SHA.
- [Release Packages run 37548646619](https://github.com/jim1286/hjm-design-system/actions/runs/37548646619): release commit·canonical release:check·세 package 게시·tag 모두 success.
- 실제 원격 테스트: contracts 1005, Native 1215, Web SSR 278 / Chromium 1121, Native Showcase 21 / Web Showcase 43 모두 통과.
- [Storybook run 37548645860](https://github.com/jim1286/hjm-design-system/actions/runs/37548645860): verify·deploy success. [공개 Storybook](https://jim1286.github.io/hjm-design-system/) index에서 17/17 Default가 배포 제목이며 실험 제목 0개, 기존 Web id 유지.
- npm exact version과 latest: @hjmds/design-contracts / @hjmds/react / @hjmds/react-native 모두 1.14.0. 게시 직후 registry는 수 분간 404·이전 latest를 반환했으나 전파 후 다시 조회해 확인했다.
- 중앙 sync-design-system.mjs는 세 tarball integrity·내부 manifest·Git tag/source manifest를 검증하고 release record 계획을 생성했다. 메타 checkout의 기존 main ahead 4 / behind 3 및 타 작업 dirty는 보존한다. 중앙 원격 동기화·소비 앱 설치/회귀는 후속 범위다.

첫 후보는 Native Showcase에서 Stack의 허용되지 않는 minHeight 배치 prop 때문에 차단됐다. 게시되지 않은 후보 workflow를 취소하고 해당 prop을 제거했다. Native Showcase check 21개·타입 검사 통과 후, 기존 Git history를 재작성하지 않고 Changeset 후보를 복원해 같은 1.14.0 릴리스 커밋을 새로 생성했다. 최종 원격 canonical 검사도 전부 통과했다.

보안 관측: workspace pnpm audit --prod는 Native Showcase의 기존 개발 도구 경로에서 critical 1 / high 6 / moderate 1 / low 1을 보고했다. shell-quote critical은 react-devtools-core/Expo CLI 경로다. 세 public package는 dependencies·bundledDependencies가 없으며 그 도구를 새 패키지 dependency로 포장하지 않는다. 이 관측을 소비 앱의 peer/runtime 무취약성으로 해석하지 않고 개발 도구 전이 의존성 부채로 남긴다. 이번 검증용 6006·8084 서버만 종료했고 다른 앱 서버·기기는 유지했다.

## 원시 산출물 정리 영수증

아래 이번 작업의 임시 파일은 SHA-256을 기록한 뒤 제거한다. 재사용 source·fixture·정식 PNG 자산·미완료 회원 미리보기 source는 보존한다.

| 임시 파일 | SHA-256 |
| --- | --- |
| hjm-experiment-release-ci-20261007.log | `2baadd2dc9385e2f97de54ec9e1e641813d02d76f7efcf178421bc5bf4330ca6` |
| hjm-experiment-release-ci-20261007-final.log | `67e66a210a975b6bcc099bfa60e45c35f56792cd1401b7ae6d1dba271bffa641` |
| hjm-experiment-release-ci-20261007-third.log | `4908139cddbe00d0e3c0867608426df33d368c8b1d780931f26a8bbe3c0c464a` |
| hjm-release-native-bundle.log | `61baefbbade2755d8be152882e02892f187d32f624c654c6ef1921de5f9a4d8c` |
| hjm-release-native-current.png | `27d7efc74a31cb68f7d73f80cf09eeb197e0606e4acf8077ebcd0b0ecf7ffebb` |
| hjm-release-native-menu.png | `1e9945f824c921db2e3138242478217a8d1028150dd6e358d9706d2b4562fe23` |
| hjm-release-native-video.png | `414539af20cdc192c64c316cb29d42ef42a294132a0f58c5854227adfe2c0a78` |
| hjm-release-native-video-error.png | `ea5a0221932a4c7e05aa5d38a8fe4858abce90618d74778ad553d823a89938ab` |
| hjm-release-native-video-retry.png | `6f0153b2c0564c526e38f46ba311fa7457850093de3e364237288e66e7a760a9` |
| hjm-release-native-intro-keyboard.png | `8ce2cd672a188cb577e0c686db66e26009cec471cc2e5ac09d1b19d80baa6e4d` |
| hjm-release-native-intro-fixed.png | `c01a43f1ab61a3dc20b7548ba67e769aa4f2dd8a8844027d9bb0f22d0f2ca319` |
| hjm-release-native-index-original.tsx | `9923377acc9991c1474aff018ff887c95ce8a4df01e15cf4ede77b47119fd9d4` |
| hjm-release-onboarding-build.log | `24c42b76aecef2c39c8a5639a3536efb936b03bdac9a8f8be50c0e71ffbc7af8` |
| hjm-release-onboarding-test.log | `54260aec9945c13fcc85a42a069711c9e1813856eea475e906ca83387abc1ce2` |
| hjm-release-usage.log | `0484e97dc190e86b9979ec7fe1ae9c6a55f8a702a736cf6738d9b0ab0d20d4c0` |
| hjm-release-promotion-ci.log | `fa44cc63e229c46cb5ad7968ab65a3b570f48ec4114755c9b6a2dffcd3598d73` |
| hjm-promotion-paths.txt | `e448e238538a0b4844e867f40e3eff0ad98db4d2a81889e011998d69f4d0b4de` |
| hjm-release-menubar-recheck.log | `cee4c11ee7672c0b3771e3fbd8cd819cb3feed64d766d413260b1089430885c6` |
| hjm-release-version-20261007.log | `e156bc5b1fea796f3b7de4488a12d69ce6f830fb8fc182b81ef649a47ac0500d` |
| hjm-release-final-check.log | `04b1cdb9423d6bcbd1c44354f1e964058a19a3fe54c21847c40a42d028cc49ca` |
| hjm-release-audit-prod.json | `2e2158484a7a06ae6c5b4548d6f138999a960225db4aa95da473b7ff592f1563` |
| hjm-release-version-repaired.log | `6c3a03ec1955bfb8cfd7780c4111f16381e8bd474c5c3f288c5656e8a73013fb` |
| hjm-release-native-showcase-recheck.log | `98f1b69e029ffddcb0dd66c06799ca5a4a14e80ede503de357643d5069960a7c` |
| hjm-release-artifacts-final.log | `60a83cb9cf7718b341533ad9eafa099464db03e38918eb7c7c89f33feb991eac` |
| hjm-release-workflow-watch.log | `1c61c8119ac0d5c5df1259599c6bc85af29fc7abe52e17ec8e4e725801e19fbb` |
| hjm-release-remote-complete.log | `3778eb788c1108c9d8320a4a0bf4b7935847f977f4e13949d1ce4acd71b8e8dc` |
| hjm-central-release-plan.json | `19e08211a798d833ae04e5af25b263f97ca7713c9dc7d8e74b1dfd16800721ab` |
| hjm-released-storybook-index.json | `64d0e374d372b14c55e3d887553bfdd496bd5c905c42235acb1916b22379989b` |
| hjm-central-release-write.json | `b35472ed73604a199456687f1f3898eb11cc0fc83f429bb0a128855bed884166` |
| hjm-central-release-test.log | `958193c29b3353bc1aa18a4639c98761fc8980fbe264b5b5ee4db384a0e59c8d` |
| hjm-central-doc-links.log | `159695f9ae8025539a81376cdc84b949a3c42152300caff8e5417e1435554230` |
| hjm-central-policy-consistency.log | `7f48d3d81d3562ea0f73d3c263c5b231ab8b046bc8957d1370b570546b32a070` |
| supports-browser-keyboard-focus--menu-navigation--disabled-state--and-action-activation-1.png | `27d480e209eb5f40aed6434a758295ebde0bd1a719b9b99ced647a827fdcfb52` |

중앙 등록 로컬 적용: sync-design-system --write 완료. release importer 회귀 10개, 루트 doc links 342개·policy consistency 87개 문서 검사 통과. 해당 네 파일만 메타 저장소에 로컬 커밋했으며 기존 4 ahead / 3 behind 이력·공유 dirty를 보존해 원격 push는 하지 않았다. HJM main 게시와 구분한다.
