# 2.0 호환 API 제거 검증 — 2026-10-02

이 기록은 미커밋 source 후보를 검증한 결과다. npm 게시·소비 lock 갱신·운영 배포 증거가 아니다.
[제거/대체 표](../../../packages/design-contracts/docs/migration-native-legacy-removal.md)를 따른다.

## 결과

- HJM `pnpm ci:check` 통과: contracts 914, Web SSR 180, Web browser 978,
  Native 926, Native showcase 12, Web showcase 28. Web 정적 빌드 103개 컴포넌트/13개 탐색 페이지 확인.
- 이후 Card clipping 보완: Native 전체 927개 및 Android Metro production bundle 통과.
  675개 모듈, 1395.6 KiB raw / 341.3 KiB gzip. 원래 Metro 한도는 변경하지 않았다.
- HJM의 선언 후보를 연결한 관리 소비 대상 11곳 타입 검사 통과. 제품 tsconfig와 alias를 유지하고
  React/React Native peer는 각 앱의 설치본을 사용했다. 대상과 파일 수는 `consumer-typechecks.json`.
- 다에리 새 후보 renderer를 Vite alias로 연결해 WriteScreen·CommunityRulesGate 22개 통과.
- 번뚝 입력·탭·HJM 채택 관련 14개 회귀 검사 통과. 별도로 전체 suite는 198개 통과/11개 실패.
  실패 목록은 `burntok-full-suite.json`; 초기 아바타의 `roll` 미정의, 라우트/헤더/세션/복구 등의
  source 기대값 오류가 남아 있다. 전체 번뚝 제품 gate가 통과했다고 보고하지 않는다.
- 모바일 Web viewport 390×844에서 Button·Select·Tabs·Menu 렌더, pageerror 0. `web-runtime.json`.
- 기존 iPhone 17 / iOS 27.0에서 Switch 상태 변경과 LiquidToast 게시 확인. Device Hub CUA가
  -10005 timeout으로 연결되지 않아 idb 접근성/입력과 simctl 캡처를 보조 사용했다.
  `Refreshing…` 개발 배너가 남아 있어 이를 해결한 기기 증거로 사용하지 않는다.

## 비공개 Button 조합과 크기

공개 Button의 raw paint 통로를 제거하고 FAB/LoadMore가 비공개 RecipeButton을 사용한다.
같은 행동을 제품 공개 prop으로 재노출하는 대안은 제거 목적에 어긋나므로 채택하지 않았다.
공개 JS spread로 내부 style에 접근하면 안내 오류를 내며 별도 회귀 검사로 확인한다.

렌더러 import graph에는 해당 내부 파일을 실제로 포함하는 경로만 1개 모듈이 추가된다.
실측 navigation 154.3 kB raw / 31.8 kB gzip, sheet-gesture 41.8/10.2 kB다.
이 wrapper/import 비용에만 512 raw / 256 gzip bytes를 더하고 다른 그래프·optional peer·Metro
한도는 유지한다. Card 내용은 내부 프레임에서 clip하고 raised Surface의 외부 그림자는 보존한다.

## 릴리스와 남은 단계

`release-plan.json`은 세 패키지 모두 1.10.0 → 2.0.0을 계산한다. 두 renderer의 contracts
peer는 다음 major train `>=2.0.0 <2.1.0`으로 준비했다. 패키지 실제 version은 아직 1.10.0이다.
Changeset이 있는 authored source와 generated release commit을 분리하는 기존 절차를 유지한다.

npm 게시와 canonical tag가 생긴 뒤 중앙 `sync-design-system.mjs`의 계획/쓰기, 각 앱의
정확한 dependency·lock·contract 갱신 및 `sync-standard` 검증이 필요하다. 아직 게시되지 않은
2.0의 registry integrity를 만들거나 소비 앱이 이미 2.0을 설치했다고 기록하지 않았다.
