# 레퍼런스 추가 조사와 선택 배경 이동 실험

2026-10-07 · 진행 중. 전체 조사·승격·npm 게시·Utilverse 적용 완료 보고가 아니다.

## 이번 변경

- 기존 네 공식 목록 283개 항목의 개별 검토 ledger와 5개 사이트맵 6,136 URL inventory를 추가했다.
  단순 목록 분류·URL 확보와 실제 UI/동작 검토를 각각 추적한다.
- IAB에서 Uiverse /elements를 열어 현재 4,489개 표시와 Recent 정렬을 확인했다.
  Galaxy 소스 3,802개가 현재 사이트 전체와 같다는 가정을 폐기했다.
- Motion Primitives Animated Background의 Week 버튼 선택을 실제 조작했다.
  시각 data-checked만 바뀌고 aria-pressed/aria-selected는 없었다. HJM 라디오 엔진을 교체하지 않고
  SegmentedControl `selectionMotion="slide"`로 선택 배경만 이동하도록 양 renderer에 추가했다.
- 기존 기본값 none, 실제 측정 위치 사용, 최초/resize 즉시 정렬, 모션 감소·비활성 시 정지.
  connected/pills 모두 같은 API이며 별도 상태·모션 의존성을 추가하지 않는다.
- 양쪽 실험/구성/직접 조작과 모션/선택 배경 이동에 Default/Dark/LargeText를 추가했다.

## 발견 → 수정 → 확인

1. Web 장식 위의 글자 레이어가 라디오 직접 클릭을 가로막았다. 장식용 라벨 span에 pointer-events:none을
   적용하고 기존 radio의 키보드·FormData 동작을 다시 확인했다.
2. IAB large-text에서 pill 선택의 글자 줄 40px / 배경 28px를 DOM과 화면으로 확인했다.
   Native처럼 세로 padding에도 8px inset을 적용해 글자 줄 전체를 배경 안에 놓도록 수정했다.
   수정 후 2배에서 pill 56px / 글자 줄 40px / 배경 40px를 확인했다.
   1/2/3배 글자의 실제 bounding box 회귀 검사도 통과했다.

## 검증 범위

- Node 24.20.0 / pnpm 11.18.0, 패키지 typecheck 통과.
- Native host 회귀 3개 통과: 라디오 값·행동 유지, measured layout/resize, 모션 감소/비활성,
  기본 모드에 측정 listener·장식 host가 없음. 실기기 동작으로 보고하지 않는다.
- Web 브라우저 회귀: 키보드·disabled·FormData, RTL·큰 글자·resize, pills inset·기본 복귀,
  1/2/3배 전체 글자 배경 범위. 4개 모두 통과했다.
- IAB 1280×720에서 기본·다크·큰 글자 실제 렌더를 확인했고, 메모를 입력한 뒤 일주일로 전환해
  메모 유지와 두 컨트롤의 선택 동기화를 확인했다.

## 남은 검증

좁은 화면/여러 제품 팔레트 전체 시트, iPhone·Android 실제 접근성·빠른 전환·프레임 비용,
전체 레퍼런스 UI 조사, 나머지 권장 후보 구현, 승인 조건을 충족한 승격·게시·Utilverse 채택은 남았다.
결과 상태·실제 동작을 확인하지 않은 항목을 승격하지 않는다.

## 최종 로컬 게이트 (선택 배경 이동 변경)

`pnpm ci:check` 종료 코드 0을 확인했다. contracts 949, Web SSR 278,
Web browser 1,086, Native host 1,180 테스트가 통과했다. 양쪽 Showcase 검사와
Web Storybook production build 및 static verify도 통과했다. 원격 CI·실기기·게시 증거는 아니다.
빌드에는 기존 번들 크기와 use-client directive 경고가 있으며 실패로 종료하지 않았다.

## 다음 후보: 영상 다이얼로그

2026-10-07 Magic UI Hero Video Dialog 기본 예제를 IAB 1280×720에서 열고 닫았다.
썸네일에서 YouTube iframe으로 확장되고 닫기 아이콘 이후 iframe이 제거됐다.
열린 DOM에 dialog 역할이 없고 초점은 Play video 트리거에 남았으며, 그 트리거에서
Escape를 눌러도 닫히지 않았다. 이 예제의 외형만 참고하고 HJM Dialog의 기존
focus/stack/Escape 계약을 재사용한다. 실제 재생·자막·오류·두 번째 전환·테마·좁은 화면은 미확인이다.
Asset은 image 의미와 decorative 자식 숨김을 소유하므로 조작 가능한 플레이어를
그 안에 넣지 않는다. Dialog.children의 제품 플레이어 host로 구성하며 Native
Showcase에 현재 영상 host 의존성이 없다는 점을 실험 준비 항목으로 기록했다.
