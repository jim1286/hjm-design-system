# 가장자리 블러 조사·실험 구현 및 검증

- 범위: Magic UI·Motion Primitives의 공개 Progressive Blur 예제, HJM ScrollMetrics 확장.
- 구현 시작점: 로컬 main b6feb70. 기존 EffectSurface/ScrollProgress 공개 API와 양 renderer 소스를 비교했다.
- 환경: Node 24.20.0, pnpm 11.18.0, IAB 1280×720, 원본 공개 사이트.
- 최종 판정: 부분 확인. 양 renderer와 11번째 실험 구현, iOS 실제 합성·기본 흐름 확인.
  Android·접근성·제품 팔레트·비용 비교가 남아 승격하지 않았다.

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

## 경계 계산 단계의 검사 (98ff957)

- 직접 회귀: scroll-progress.test.ts 5개 통과. 기존 1개 + 새 4개.
- contracts check: 91 files / 953 tests, build·bundle 검사 통과.
- public API map: 298 platform component names, 새 component export는 없음.
- 사용 지침 및 문서 링크 검사 통과. 처음 추가한 지침 절의 깊이가 규격과 달라 수정 후 재검증했다.
- 전체 ci:check exit 0: contracts 953, Web node 278 / browser 1,086, Native 1,183,
  Showcase Native 17 / Web 43. 문서·경계·Storybook production build·static verify 포함.
  기존 전체 회귀 수이며 블러 renderer 검증 수가 아니다.

## 미확인 범위

Android의 실제 blur/mask 합성, 기기 성능, 제품 팔레트, 키보드/스크린리더의
최종 효과 보호, 전체 환경 비교 시트는 아직 남았다. 순수 경계 계산 테스트를 이 범위의
통과 증거로 쓰지 않는다. 승격·npm 게시·Utilverse 적용은 미실행이다.

## 보관

URL별 관찰은 reference-component-review-ledger.json에 기록했다. 이미지·HTML 원문을 별도
파일로 저장하지 않았다. CDP reduced-motion 에뮬레이션은 기본으로 복원했다.
자동 검사 원시 로그는 최종 결과를 본 리포트에 반영한 뒤 제거한다. 생성된 dist는 게시 계약
산출물이므로 소스와 함께 유지한다.

## Renderer 후속 구현·재검증 (98ff957 이후 미커밋)

2026-10-07, Codex 수행. Node 24.20.0 / pnpm 11.18.0. Expo Go 57.0.9,
기존 iPhone 17 Pro / iOS 26.5 시뮬레이터, localhost:8084 개발 Metro의 합성 목록 fixture.
idb 조작과 simctl 캡처를 사용했으며 직접 Device Hub 창 검증이나 실물 기기 검증은 아니다.

| 흐름 | 확인 결과 | 판정 |
| --- | --- | --- |
| 기본 목록 끝으로 swipe | 12번 메모·버튼이 선명하고 위쪽 효과만 남음 | 통과 |
| 마지막 항목 선택 | `기록 12 선택됨` 결과 표시 | 통과 |
| 끝에서 목록 1개로 축소 | 처음으로 복원, 양쪽 효과 없음, 선택 결과 유지 | 통과 |
| 다크 | OS 기본 tint의 밝은 띠 발견 → HJM theme 전달 후 같은 화면 재검증 | 수정 후 통과 |
| 큰 글자 2배 | 안내 줄바꿈, 메모·선택 버튼 표시 | 해당 초기 화면 확인 |

공통 계약은 기존 ScrollMetrics를 재사용한다. Web CSS blur/mask와 Native 제품 renderLayer는
별도 subpath로 제공하며 Expo·MaskedView는 공개 renderer의 peer가 아니다. host 실패 시
형제 콘텐츠가 유지되는 회귀를 추가했다.

전체 검사에서 공개 subpath 등록을 세 패키지 경계 테스트와 Native Metro 소비 fixture에
추가하지 않은 누락이 드러나 보완했다. 검사 목록을 완화하지 않고 실제 granular import가
Metro Android 번들에 포함되는 것을 확인하도록 했다. Web 토큰 검사는 320px 스크롤 fixture 높이를 지적했다. Native와 같은
측정 영역을 유지하는 실험 전용 geometry임을 정확한 파일·속성·값 예외에 기록했다.
제품 크기 토큰을 새로 만들거나 검사를 끄지 않았다.

최종 검사는 실패 지점 이후 명령을 다시 실행해 마쳤다. 마지막 `pnpm ci:check` 전체 호출은
Web fixture geometry 검사에서 exit 1이며, 이를 한 번에 exit 0인 결과로 보고하지 않는다.
수정 후 Web check와 build/static verify를 별도로 통과했다.

- pnpm check 단계: contracts 957, Web node 278 / browser 1,087, Native 1,185 통과.
  bundle·workspace·evidence·docs·governance·API map·usage·Storybook 정적 검사 통과.
- Native Metro Android production JS: 63 families / 689 modules / raw 1461.0 KiB /
  gzip 359.4 KiB, Expo·SVG 엔진 비포함 검사 통과. Android 화면 검증은 아니다.
- pnpm showcase:native:check: 18 tests와 typecheck 통과.
- 수정 후 pnpm showcase:web:check: 43 tests·typecheck·69개의 정확한 geometry 예외 검사 통과.
- pnpm showcase:web:build: production build 및 103 canonical stories / 13 navigation pages
  static verify 통과. 실제 UI 전수 검토를 뜻하지 않는다.
- pnpm docs:check: 512 Markdown 문서 링크 통과.
- 중앙 library policy: 6 manifests / 68 libraries 통과. 등록은 root 4e948b1.
- Web 회귀의 기존 act 경고는 남아 있으며 테스트 실패는 없었다.

Native Storybook 시작 오류는 includeStories가 default meta를 제거하는 10.4.4 동작이었다.
그림·영상·블러 세 파일에서 옵션을 제거했다. 같은 실수를 거부하는 정적 검사와 negative
fixture를 추가했으며 실제 Expo Go에서 블러의 기본·다크·큰 글자 진입을 재검증했다.

후속 원시 시뮬레이터 캡처와 종료한 검사·설치 로그는 내용을 위에 옮긴 뒤 제거했다.
개발 미리보기를 제공하는 자체 localhost:8084 Metro 로그는 프로세스가 쓰는 중이므로 유지한다.
