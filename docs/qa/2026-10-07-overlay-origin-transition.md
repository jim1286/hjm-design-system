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

## 검증과 후속

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
