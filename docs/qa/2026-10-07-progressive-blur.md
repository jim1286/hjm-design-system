# 가장자리 블러 조사 및 경계 계산 검증

- 범위: Magic UI·Motion Primitives의 공개 Progressive Blur 예제, HJM ScrollMetrics 확장.
- 구현 시작점: 로컬 main b6feb70. 기존 EffectSurface/ScrollProgress 공개 API와 양 renderer 소스를 비교했다.
- 환경: Node 24.20.0, pnpm 11.18.0, IAB 1280×720, 원본 공개 사이트.
- 결론: 조건부 추천 유지. 효과 renderer·Native 합성·비용 검증은 아직 미완료이며 실험 수는 10개 그대로다.

## 관찰과 수정

Magic UI 목록을 실제 wheel로 끝까지 이동했다. clientHeight 400, scrollHeight 1784,
scrollTop 1384 상태에서 마지막 19번 행이 하단 블러에 가려졌다. 160px 범위의 8개 층은
끝에서도 남았다. pointer-events:none은 터치 통과만 보장하며 읽기 가능성을 보장하지 않는다.

HJM 기존 contracts의 scroll-progress subpath에 resolveScrollEdges를 추가했다.
0 크기 미측정 viewport와 맞춤 콘텐츠는 양쪽 힌트를 숨기고, 실제 스크롤 범위에 따라
before/after를 계산한다. 소수 offset 오차 1 logical pixel을 허용하며 overscroll은 제한한다.
기존 resolveScrollProgress의 미측정/완료/범위 계산은 유지하고 입력 검증을 공유했다.
이 함수가 원본 사이트를 고친 것은 아니며 HJM 블러 UI 구현을 완료했다는 뜻도 아니다.

Motion Primitives에서는 작품 hover로 블러와 설명이 나타나는 것을 확인했다. 방향별 예제는
사용자가 조절하는 range가 아닌 자동 이동 숫자 띠였다. reduced-motion 에뮬레이션과 reload 후에도
두 DOM 관찰의 translateX는 -1.8px와 -1097px로 달랐다. 원본에서 효과를 그대로 가져오지 않고,
항상 보이는 설명·정지/모션 감소·포커스 보호를 실험 조건으로 기록했다.

세부 관찰·Native 호스트 비교·실험 통과 조건은
[도입 검토](../plans/progressive-blur-adoption-2026-10-07.md)에 있다.

## 검사

- 직접 회귀: scroll-progress.test.ts 5개 통과. 기존 1개 + 새 4개.
- contracts check: 91 files / 953 tests, build·bundle 검사 통과.
- public API map: 298 platform component names, 새 component export는 없음.
- 사용 지침 및 문서 링크 검사 통과. 처음 추가한 지침 절의 깊이가 규격과 달라 수정 후 재검증했다.
- 전체 ci:check exit 0: contracts 953, Web node 278 / browser 1,086, Native 1,183,
  Showcase Native 17 / Web 43. 문서·경계·Storybook production build·static verify 포함.
  기존 전체 회귀 수이며 블러 renderer 검증 수가 아니다.

## 미확인 범위

블러 renderer, 실제 Native blur/mask 합성, 기기 성능, 제품 팔레트, 키보드/스크린리더의
최종 효과 보호, 다크·큰 글자 비교 시트는 아직 남았다. 순수 경계 계산 테스트를 이 범위의
통과 증거로 쓰지 않는다. 승격·npm 게시·Utilverse 적용은 미실행이다.

## 보관

URL별 관찰은 reference-component-review-ledger.json에 기록했다. 이미지·HTML 원문을 별도
파일로 저장하지 않았다. CDP reduced-motion 에뮬레이션은 기본으로 복원했다.
자동 검사 원시 로그는 최종 결과를 본 리포트에 반영한 뒤 제거한다. 생성된 dist는 게시 계약
산출물이므로 소스와 함께 유지한다.
