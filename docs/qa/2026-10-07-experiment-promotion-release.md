# 기존 실험 17개 검토·승급·HJM 게시

2026-10-07 사용자 요청: "실험에 있는것들 검토후 승급 후 게시 먼저하자".
판정: 기존 17개 Storybook 배포 분류를 승인 범위로 승급. npm 1.14.0 후보 검증 중.
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
회원 미리보기 신규 후보의 미커밋 파일은 /tmp/hjm-member-preview-followup-20261007에 보존해 이번 게시에서 제외했다.
이 Markdown과 기존 개별 보고서·회귀 fixture·원본 자산은 보존한다. 전체 시트 임시 HTML과 이번 임시 screenshot/log는 결과 기록 후 제거한다.

승급 후 검사: contracts 1005·Native 1215·Web SSR 278 통과. Web browser는 1120/1121 통과, 기존 menubar keyboard 사례가 선택 종료 대신 새 문서라며 실패했다. 같은 소스의 해당 browser 사례 단독 재실행은 1/1 통과했다. 이 결과를 전체 성공으로 세지 않고 버전 확정 뒤 canonical release:check를 다시 실행한다.
