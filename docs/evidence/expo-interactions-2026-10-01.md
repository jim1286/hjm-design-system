# Expo 인터랙션 로컬 작업 기록

작성: 2026-10-01 · 미게시 작업 · 공유 main checkout의 기존 변경 보존

## 감사

루트/HJM AGENTS.md, 모듈 표준, 신규 앱 표준 §4–6, HJM README/CONTRIBUTING/
RELEASE_GOVERNANCE, foundation·content-transition·provider·swipe·sheet·keyboard 구현,
두 renderer export/API 지도, Expo 앱 manifest와 제품 DESIGN.md를 확인했다.
루트/HJM에는 `.agents/skills`가 없고, 발견한 앱 전용 QA/스토어 스킬은 이번 DS 변경에
적용하지 않았다. 개인 memory나 비밀 파일은 읽지 않았다.

HJM main은 착수 전부터 수백 개 파일의 기존 미커밋/미추적 변경이 있었다. 제품·루트
정책·dependency/lockfile은 이번 작업에서 수정하지 않았다. 새 공개 컴포넌트 대신 기존
content-transition subpath에 공간 token을 추가했고 native driver easing과 중단 경계를
보완했다. build 생성 파일에는 기존 다른 작업의 변경도 포함되어 있으므로 현재 전체
`git diff`를 이 작업의 소유 범위로 해석하지 않는다.

설치된 showcase: Expo 57.0.25, React 19.2.3, RN 0.86.2, Reanimated 4.5.1,
Worklets 0.10.1, RNGH 2.32.0, Gorhom 5.2.14, React Navigation 7.4.1,
Keyboard Controller 1.22.5. `require.resolve`로 해당 설치 package.json을 읽어 확인했다.
showcase에는 expo-router/@shopify/flash-list가 resolve되지 않았다.
소비 앱 manifest는 Expo 57.0.24–26, RN 0.86.2–3이며 제품 설치 바이너리 검증은 아니다.

## 검증

- Native lifecycle + 기존 interaction-adapters: 2 files / 16 tests 통과.
- Native typecheck 통과.
- Contracts build 및 bundle budget 통과. content-transition은 1 module / 약 1.1 kB raw / 0.5 kB gzip으로 기존 budget 유지.
- `pnpm ci:check`: 최종 exit 0. 첫 sandbox 실행은 browser server의 `listen EPERM ::1`으로 중단되어 로컬 포트 권한을 승인받아 재실행했다.
- 최종 전체 검사: contracts 85 files / 914 tests, Native 76 / 923, React SSR 17 / 180, React Chromium 88 / 977, Native showcase 3 / 12, Web showcase 10 / 28 통과.
- 전체 typecheck/build, contracts/generated drift, renderer import-graph budgets, workspace/evidence/docs/governance/API map 검사가 통과했다. Web Storybook build와 static 검증(103 canonical component stories, 13 navigation pages)도 통과했다.
- Native Metro Android production bundle: 674 modules, raw 1397.0 KiB / budget 1621.1 KiB, gzip 341.6 KiB / budget 400.4 KiB. pre-Hermes bundle이며 실제 Android 실행이나 GPU 성능 증거는 아니다.
- `pnpm api-map:sync` 후 `pnpm api-map:check`: 258 platform API names, 새 공개 컴포넌트 없음.
- `node scripts/check-module-standards.mjs --module hjm-design-system --json`: `contract-valid`, `execution=not-run`. 이는 별도로 성공한 로컬 `ci:check`와 구분한다.
- `git diff --check`는 이번 tracked 수정 경로에서 통과했다. 루트/제품/기존 dirty tree 전체를 clean이라고 주장하지 않는다.
- 최종 가이드 보완 후 `pnpm docs:check` 재확인. 전체 검사에는 기존 React act 경고와 Vite chunk 크기 경고가 있으나 실패하지 않았다.

## 이번 변경 파일

- `packages/design-contracts/src/content-transition.ts`와 해당 dist: 기존 geometry 공개 token.
- `packages/design-contracts/test/content-transition.test.ts`: 잘못된 preset 음성 사례.
- `packages/react-native/src/content-transition.tsx`와 해당 dist: 공통 easing·중단 정착.
- `packages/react-native/test/content-transition-lifecycle.test.tsx`: 미완료 엔진 기반 lifecycle 회귀.
- `showcase/native/src/ExpoInteractions.stories.tsx`: Default/Dark/LargeText 복구 예제.
- `docs/expo-interactions.md`, `docs/interaction-adapters.md`: 지원·선택·호환·모션 지침.
- `.changeset/expo-interaction-recovery.md`: additive token minor / Native patch; migration 불필요.
- 이 기록과 생성기가 갱신한 관련 출력.

## 미검증 및 남은 판단

이번 변경의 iOS/Android 기기·Expo Go/dev client UI 실행, VoiceOver/TalkBack 음성,
실제 gesture-scroll 경합, 큰 글자/RTL 시각, GPU·메모리·프레임 성능은 미검증이다.
기존 기기 증거를 이번 변경의 증거로 재사용하지 않았다. 새로운 기기·native build·서버·
원격 CI·게시·배포·push·스토어 작업을 하지 않았다. npm 소비 앱 반영도 없다.

후속 제품 채택은 앱별 DESIGN 제한, OS 입력/키보드와 back 동작, 이벤트/undo 정책,
정확한 SDK의 Go 모듈 포함 버전 및 실제 바이너리를 확인한 뒤 결정한다.

## 재현용 로컬 증거

- `/tmp/hjm-expo-ci-check-unrestricted.log` SHA-256: `a67922b74212a4f745863a503a91eea2bbc3a23a75934694078622ad423d9dde`
- `/tmp/hjm-expo-native-check.log` SHA-256: `b25262732d495e837515e9c1a9ba94e8682cb3c803cd82d5461fcd2930e455dd`

이 로그는 로컬 임시 파일이며 원격 CI artifact가 아니다. 최종 패키지를 게시하거나 소비 앱을 변경하지 않았다.
