# main 통합 검증

2026-10-06 · 사용자 범위: 모든 변경을 main에 머지, 릴리스 실행 금지.

## 통합 기준

- 최신 기준은 origin/main 57a2364 (HJM 1.13.1). 패키지 버전·태그·npm 게시 workflow는 바꾸거나 실행하지 않는다.
- 과거 기능/릴리스 브랜치는 PR #1, #41~#54의 MERGED 상태를 대조했다. squash로 ancestry가 달라도
  같은 내용을 다시 합치지 않는다. 오래된 0.9.1 버전 커밋과 stale-residue 백업은 복구 자료이며 최신 소스를 되돌리지 않는다.
- 공유 main의 미커밋 상태는 backup/pre-main-integration-20261006 (1ba18ea)으로 보존했다.
  이미 1.13.0/1.13.1에 들어간 화면·가이드·수정과 소비된 changeset을 다시 추가하지 않는다.
- 아직 미게시인 레퍼런스 API/예제는 최신 main의 배치 prop·사용 지침 폴더·Storybook 규격에 맞춰 통합한다.
  정수별 선택은 Slider 기반 기존 별점 예제와 별도로 실험/컴포넌트/입력/별점 선택에 둔다.
- 별도 fix/1.13.2-recent-remove-icon 작업 트리는 그대로 두고 미커밋 FixedGlyph/메시지/검색 수정과 테스트를
  통합 복사본에 가져왔다. 누락된 SearchField·TagsInput·적용 필터의 내장 삭제 기호도 연결한다.
  Chip 체크·Toast 닫기는 이미 비확대 NativeText여서 구현을 중복 교체하지 않고 회귀 검사에 포함한다.

## 수정 이유와 검증

- 고정 아이콘 프레임 안 HJM Text는 controlled textScale/OS 폰트 확대 시 기호가 잘린다.
  내장 기호만 private FixedGlyph의 비확대 NativeText로 유지하고 주변 라벨과 컨트롤 접근성 이름은 유지한다.
- Native 1배·2배·3배·OS scaling 모드에서 검색 삭제, 필드 초기화, 태그 삭제, Chip 체크, Toast 닫기,
  답장 취소, 첨부 제거, 반응 메뉴 8개 회귀 사례가 통과했다. 이는 host 검증이며 기기 화면 증거가 아니다.
- 새 내부 helper를 실제 참조하는 import graph에만 모듈 1개를 반영했다. optional peer나 의존성을 추가하지 않았다.
- Web 높이 전환은 최신 main의 layoutStyle 배치를 별도 wrapper에 유지하며, 배치 보존 회귀를 추가했다.
- Node 24.20.0 / pnpm 11.18.0에서 `pnpm ci:check` 전체 통과.
  Contracts 949, Web SSR 278, Web browser 1,082, Native 1,177,
  Native showcase 17, Web showcase 43 tests가 통과했다.
- Native Metro Android production bundle은 687 modules / raw 1455.9 KiB / gzip 358.1 KiB로 통과했다.
  API 대응표 298개 이름, 사용 지침 12/137/44/22개, Web story id 877개와 양쪽 showcase 검사,
  Storybook production build 및 canonical 103개·navigation 13개 static 검증이 통과했다.
- 공유 checkout은 다른 세션의 미커밋 자료 보존을 위해 직접 편집하지 않고 임시 통합 worktree에서 검사했다.
  PR의 원격 CI와 main 반영 상태는 GitHub PR 기록에서 확인한다.
- 처음 실행에서 회귀 fixture의 필수 busyLabel 누락과 기존 TagsInput 큰 글자 검사의 삭제 기호 예외 누락을
  발견해 보완했다. 최종 전체 검사로 재확인했으며 생성 로그·스크린샷 임시 파일은 결과 기록 뒤 제거한다.

## 미확인

이 작업은 원본 시뮬레이터와 개발 런타임을 조작하지 않았다. 새 Native 실기기·VoiceOver·TalkBack 검증,
라이브러리 게시·소비 9개 저장소 반영·릴리스는 이 결과에 포함하지 않는다.
