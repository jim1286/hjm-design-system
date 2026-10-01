# 레거시 제거 검증

검토일: 2026-10-02 · 로컬 소스 및 개발 Storybook

## 제거 범위

- Web/Native 프로필 편집 Playground 중복 예제. Default·Dark·LargeText 3개 유지.
- Web showcase 이전 색상 변수 17개. 생성·참조를 `--hjm-color-*`로 일치시킴.
- Native Switch 구형 상태 속성, Tag.label, Image.source 및 LegacyImageRenderProps/legacySource, ToastRegionController.show.
- 번뚝 AppSwitch 두 호출, AppToast와 제품 토스트 예제를 canonical API로 이관.

공개 API 삭제는 `.changeset/remove-native-legacy-aliases.md`의 major 변경이다.
[이관 문서](../../../packages/design-contracts/docs/migration-native-legacy-removal.md)에 대상과 대안을 기록했다.
raw style·collection options 등 다른 호환 경계는 이번 제거 목록과 구분한다.

## 검증 결과

- 전체 `VITEST_MAX_WORKERS=2 pnpm ci:check` exit 0.
- 계약 914, Web SSR 180, Web browser 978, Native 925, Native showcase 12, Web showcase 28 tests PASS.
- Web 정적 Storybook: canonical 103개 및 탐색 페이지 13개 검증 PASS.
- Native Metro Android production JS bundle: 674 modules, raw 1395.9 KiB / gzip 341.3 KiB, 기존 예산 이내.
- Web 실제 프로필 기본·어두운 테마·큰 글자 확인. 옛 `--hjm-bg` 없음, 새 색상 값 정상, 브라우저 pageerror 없음. `web-runtime.json` 및 PNG 참고.
- 기존 iPhone 17 / iOS 27.0 개발 Storybook: Switch 터치 후 접근성 값 변경, publish 호출 후 리퀴드 토스트의 저장 완료 문구 확인. JSON·PNG 참고. Device Hub 연결 장애에 따라 기존 idb/simctl 경로 사용.
- 번뚝 설치된 HJM 1.10.0 기준 mobile/web TypeScript 검사 exit 0. HJM wrapper 계약 3 tests PASS. 문서 링크 293개 PASS. Node 26.9 실행으로 저장소 지정 Node 24.20과 다른 engine 경고가 있었으나 검사는 성공했다.

## 경계

패키지 게시·버전/lock 갱신·운영 배포는 수행하지 않았다. 번뚝은 설치된 버전에서도 지원하는 canonical 호출로 선이관했으며 다음 major를 설치한 전체 제품 QA 완료를 의미하지 않는다. 포트폴리오 직접 HJM import 조사만으로 외부 npm 소비자 이관을 주장하지 않는다.
모바일 개발용 Refreshing 배너가 캡처에 남는 현상은 별도 환경 문제이며 이 변경으로 해결됐다고 보고하지 않는다.
