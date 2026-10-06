# Overlay 형태 전환 원본 조사와 geometry 검증

- 판정: 부분 확인. 원본 두 페이지의 일부 실제 동작과 공통 geometry를 확인했다. 새 실험 등록·승격은 미완료다.
- 대상: HJM main 87e8ea2 이후 미커밋, 2026-10-07 Codex 수행.
- 환경: IAB 1280×720, 밝은 테마, 공개 원본 fixture. 로컬 Node 24.20.0 / pnpm 11.18.0.
- 출처: [Morphing Dialog](https://motion-primitives.com/docs/morphing-dialog),
  [Morphing Popover](https://motion-primitives.com/docs/morphing-popover),
  [공식 소스](https://github.com/ibelick/motion-primitives/blob/main/components/core/morphing-popover.tsx).

## 실제 관찰

두 페이지는 web fetch에서 403이지만 IAB에서는 열렸다. 접근 경로별 결과를 구분한다.
Dialog 페이지에는 기본 램프·책·이미지 세 예제가 있다. 램프 카드를 열면 중앙의
500×658.6px 상세 화면으로 바뀌고 첫 링크가 초점을 받았다. Escape 후 dialog가
제거되었지만 activeElement는 트리거가 아닌 BODY였다. 이 결과를 모든 변형으로 확대하지 않는다.

Popover 페이지에는 기본·custom transition·textarea 세 예제가 있다. Add Note를 열면
textarea가 초점을 받았다. 시험 문자열을 입력한 뒤 Escape로 닫았을 때 BODY가 초점을
받았고, 다시 열면 값이 빈 문자열이었다. 제출 버튼은 누르지 않았다. 별도 쓰기·계정 변경은 없다.

## HJM 대조와 결정

- Web Popover는 anchored portal·dismiss policy·nested parent session·초점 복귀를 이미 소유한다.
- Web Dialog는 modal priority·useModalFocus·onDismissComplete를 소유한다.
- Native Dialog는 native Modal onShow/onDismiss·재열기 세대·teardown 후 초점 복귀를 소유한다.
- Native SharedTransitionElement는 라우터 stack의 공유 요소 전환이다. 같은 화면의 overlay에
  이 navigation 엔진을 추가하지 않는다.
- 기존 content-transition subpath에 resolveOriginTransition만 추가했다. 같은 물리 좌표계에서
  도착 중심 기준 역변환을 계산하고 측정 누락·0 크기·overflow·모션 감소는 null로 돌려준다.
  renderer 통합·초안 보존을 아직 구현했다고 해석하지 않는다.

## Geometry 단계 검증 (feef594)

직접 회귀는 모서리·중심이 원점 경계와 일치하는지, 동일 좌표계 이동에 결과가 변하지
않는지, 잘못된 측정/모션 감소가 일반 표현으로 돌아가는지를 확인했다.

- contracts check: typecheck·92 files / 960 tests·build·생성 계약·bundle 검사 통과.
  content-transition 직접 회귀는 기존 2개 + 신규 3개다.
- content-transition bundle: 1 module / raw 2.3 kB / gzip 1.0 kB. 바이트는 보고값이다.
- docs:check: 514 Markdown 문서 통과. 사용 지침의 새 2단계 절은 규격 밖이라
  기존 함정 절의 하위 절로 고친 뒤 usage:check를 재실행했다.
- renderer는 변경하지 않았다. 전체 renderer CI·Native 기기·실제 morph UI는 미실행이다.

남은 일: 두 원본의 나머지 변형·좁은 폭·다크·모션 감소 검토, 기존 overlay renderer에
선택적 표현 연결, 빠른 열기/닫기·스크롤·키보드·초안 유지·중첩 overlay 검증, 양 플랫폼
실험·지침·기기 UI/성능 검사. geometry helper만으로 실험 수를 12개로 올리지 않는다.

## 보관

원본 스크린샷은 도구로 관찰했으며 파일로 저장하지 않았다. 원문·입력 문자열은 별도
산출물로 보관하지 않는다. 검사 원시 로그는 결과를 반영한 뒤 제거한다.

## Dialog renderer·12번째 실험 후속 (feef594 이후 미커밋)

2026-10-07 02:23–02:35 KST. 양 renderer의 기존 Dialog에 optional motionOrigin을 추가하고
`실험/구성/입력과 작성/버튼에서 이어지는 편집`을 등록했다. Popover 형태 전환은 아직 미구현이다.
새 엔진·별도 모달 wrapper 없이 기존 Dialog를 사용하며 제품 상태가 입력 초안을 소유한다.

- Web: geometry로 WAAPI transform을 만들고 종료까지 한 실제 subtree를 유지한다.
  닫는 중 inert, 실제 제거 이후 초점 복귀·onDismissComplete. 빠른 재열기는 이전 animation을
  취소하고 현재 transform에서 이어가며 오래된 완료는 무시한다.
- Native: 실제 modal content의 measureInWindow 결과를 사용한다. host 응답 누락은 기존
  enter duration 안에 일반 표시로 복귀하고 늦은 응답은 무시한다. 오류 문구·키보드·회전으로
  크기가 바뀌면 기존 geometry를 버리고 일반 fade로 닫는다. 다음 open에서 다시 측정한다.
- 기존 Native 테스트가 View라는 구현 종류로 modal boundary를 찾던 부분은 role=dialog를
  찾아 같은 이름·접근성·닫기 단언을 유지하도록 수정했다. Animated.View도 실제 Native View다.

### 직접 사용자 흐름

| 환경·흐름 | 결과 | 범위 |
| --- | --- | --- |
| Web IAB 기본, 실패 예약→입력→저장 | 오류와 수정한 입력 유지 | 실제 UI 통과 |
| Web 입력→Escape→재열기 | 열기 버튼으로 초점 복귀, 수정한 입력 유지 | 실제 UI 통과 |
| iOS 입력→실패 예약 저장 | 오류와 수정한 입력 유지 | 실제 UI 통과 |
| iOS 닫기→재열기→다시 저장 | 초안 유지, 성공 후 원래 화면에 저장 결과 표시 | 실제 UI 통과 |

Native 환경은 기존 iPhone 17 Pro / iOS 26.5, Expo Go 57.0.9, localhost:8084 개발 Metro다.
idb로 조작했으며 직접 Device Hub 창·실물 기기·Release 검증이 아니다. 입력은 현 기기의
한국어 키보드 배열로 수정했으며 특정 영문 문자열과 일치한다고 주장하지 않는다.
Web 첫 확인 도중 package build의 HMR로 화면이 초기화돼 그 구간은 취소하고 흐름을 재검증했다.

### 검사 진행과 한계

- Web 신규 회귀 2개: 한 subtree·재열기·오래된 완료 취소·초점 복귀·모션 감소.
- Native 신규 회귀 3개: 실제 좌표 전달·크기 변경 fallback·host 응답 누락/늦은 응답·모션 감소.
- Native 기존 Dialog actions/viewport/modal lifecycle와 합쳐 20개 직접 회귀 통과.
- 전체 `pnpm ci:check` exit 0. contracts 960, Web node 278 / browser 1,089,
  Native 1,188, Showcase Native 18 / Web 43. 문서·usage·API map·bundle·Storybook
  production build와 static verify까지 통과했다. 마지막 interruption 정리/크기 변경 회귀는
  Web 2개·Native 3개를 최종 소스로 다시 실행해 통과했다.
- Web overlays graph 9 modules / raw 99.3 kB / gzip 21.5 kB, Native overlays
  10 modules / raw 97.5 kB / gzip 20.8 kB. 추가 optional peer 누출 없음.
- Storybook 407 files / Web ids 892 정적 등록 검사 통과. canonical static verify는
  103 stories / 13 navigation pages이며 실험 UI 전수 검사 수가 아니다.
- 타입 검사에서 테스트의 act 반환값·unused import·
  uncontrolled Dialog의 trigger 누락을 수정했다. Web bundle에는 1개 내부 lifecycle helper가
  추가되어 해당 실제 파일을 소비하는 경로에만 module allowance를 기록했다. optional peer는 추가하지 않았다.

남은 검증: 실제 애니메이션 구간의 프레임·성능, 다크·큰 글자·두 제품 팔레트·RTL·모션 감소
전체 시트, resize/키보드·중첩 모달·Android 실제 UI, Popover renderer 통합. 현재 기본 UI 확인을
전체 승격 증거로 사용하지 않는다. 승격·npm 게시·Utilverse 적용은 미실행이다.

완료한 자동 검사·타입·build 로그는 위 결과와 대조 후 제거했다. 실제 앱과 Storybook의
개발 서버는 다른 검증에서 재사용하도록 유지했다. 이번 단계는 원시 스크린샷 파일을 만들지 않았다.
