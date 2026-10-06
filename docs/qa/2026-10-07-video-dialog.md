# 영상 미리보기 실험 검증

- 대상: HJM main의 Web/Native `VideoDialogPreview`, 기존 Dialog를 사용한 10번째 레퍼런스 실험.
- 환경: Node 24.20.0, pnpm 11.18.0, 개발 Storybook localhost:6006, Codex IAB.
- 목적: Magic UI Hero Video Dialog의 짧은 영상 진입을 기존 HJM 모달 계약으로 흡수한다.
  원본의 포커스·Escape 동작을 복사하지 않는다. 영상 호스트·파일·설명은 제품 소유다.
- 구현: 공개 Dialog + TextField + Button. open일 때만 player mount, 닫기 즉시 해제,
  자동 재생 없음, 문서/앱 비활성 시 pause. Native expo-video는 Showcase에만 설치하며
  모듈 존재를 먼저 검사한다. 새 published renderer API나 동영상 peer는 없다.

## 확인한 흐름

| 검사 | 결과 |
| --- | --- |
| 메모 입력→열기→실제 재생 | 통과. duration 6초, paused=false, readyState 4, currentTime 0.388536 관찰 |
| 재생 중 Escape→닫기 | 통과. DOM video 0, 초점은 영상 미리보기, 메모 `닫아도 유지할 메모` 유지 |
| malformed MP4 실제 실패→다시 시도→재생 | 통과. 브라우저 미디어 실패와 오류 문구 표시, 정상 source로 교체 후 재생 중 확인 |
| 재시도 초점 | 첫 구현은 버튼 제거 후 body로 초점이 빠짐. 새 player의 재생 버튼에 초점을 옮겨 수정하고 실제 재검증 통과 |
| 390×844 / LargeText | 통과한 범위: 제목 computed font 36px, 문서 scrollWidth=innerWidth=390, Dialog 폭 358px, 닫기·재생 행동 확인 |
| Dark / RTL / reduced motion | 오른쪽 정렬과 왼쪽 닫기, 다크 배경·문구·행동을 화면으로 확인. 미디어는 사용자 재생 전 정지 |
| Native actual playback | 미검증. JS/type/Showcase 검사와 모듈 없을 때의 안내 소스만 확인 |

390px 검증 중 CDP 화면 크기 override를 썼고 검사 후 clear했다. HMR/package build가
열린 예제를 다시 렌더한 경우 새로 열어 확인했다. 시스템·다른 앱/Metro 설정은 바꾸지 않았다.

## 자동 검사

`pnpm ci:check` exit 0:

- contracts 91 files / 949 tests
- Web node 18 files / 278 tests, browser 99 files / 1,086 tests
- Native 97 files / 1,183 tests, Metro Android production bundle 검사
- Native Showcase 5 files / 17 tests, Web Showcase 14 files / 43 tests
- usage, story IDs, public API map, 문서·경계·token 검사, Storybook production build 및 static verify

이 테스트 수는 기존 전체 회귀 범위다. 신규 영상의 실제 브라우저 행동 증거는 위 수동 검증이며,
기존 테스트 개수를 영상 전용 테스트 수로 보고하지 않는다. 빌드에는 dependency의 `use client`
지시문 무시 경고가 있었고 최종 명령은 성공했다.

중앙 `node scripts/check-library-policies.mjs --module hjm-design-system` 통과:
6 manifests / 66 libraries / 0 Query runtimes. 현재 1.13 peer lane 누락도 함께 등록했다.
메타 저장소 commit 8670405에 이 두 등록과 별도 근거 리포트를 남겼다.

## 미확인 및 승격 조건

- Native 실제 기기에서 재생·완료·실패·재시도·닫기/백그라운드·초점 복귀 확인.
- 서로 다른 제품 팔레트, 전체 비교 시트, 화면 읽기 도구의 미디어 접근성 확인.
- 유음 제품 콘텐츠의 실제 자막/대본은 제품 player가 공급·검증한다. 자체 생성 무음 패턴의
  텍스트 설명을 자막 선택 기능 검증으로 세지 않는다.
- 신규 실험을 승격하거나 npm 게시하지 않았다. Utilverse 적용도 아직 아니다.
- 11개 사이트 전수 시각·동작 검토는 별도로 계속 남아 있다.

## 보관

원시 검사 로그는 결과를 위에 옮긴 뒤 제거한다. 스크린샷은 도구로 관찰했고 별도 파일로
보존하지 않았다. 6초 MP4는 반복 검증용 fixture이므로 유지한다(253,703 bytes,
SHA-256 `6a8a2bb3e3de057a1b7e1e2cbb81da2acfd8d78053528fc90eda6184319b563a`).
생성 명령과 출처는 인접 README에 있다. 다른 세션의 원시 파일·런타임은 건드리지 않았다.
