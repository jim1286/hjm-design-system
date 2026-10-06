# QA 리포트 — Native 패널 입력 접근과 노이즈 대조

## 판정·범위

부분 확인. 2026-10-07, Codex, main d044b3d 위 Native 예제·사용 지침·조사 ledger 변경.
스크롤 없는 Native 실험의 입력 접근 문제를 수정했다. 노이즈 후보는 비교 근거를 추가했으며
아직 새 질감 구현·성능 판정·승격·릴리스·소비 앱 적용을 완료하지 않았다.

## Native 패널 재현

기존 iPhone17Pro/iOS26.5, Expo Go57.0.9/Metro8084, LargeText(textScale2), light.
idb·simctl 대체 도구 사용이며 Device Hub 창·실물 Release 검증이 아니다.

1. 요약 상태에서 메모42를 입력하고 키보드가 열린 채 상세를 선택했다.
2. 상세 문단이 늘어나며 입력란이 키보드 아래로 사라졌다. 본문 위로 swipe해도 움직이지 않았다.
3. 기존 예제의 Stack은 스크롤 없는 Storybook canvas에 바로 놓여 있었다.
4. ScreenLayout 본문 스크롤과 바깥 KeyboardAvoiding을 연결했다. ContentTransition의
   상태·측정·단일 subtree 엔진은 바꾸지 않았다. canvas gutter와 겹치지 않도록 contentInset=none.
5. 입력 끝 테두리가 scroll viewport 경계에 걸리는 것도 관찰해 본문 marginBottom에
   spacing.md(16)를 추가했다. layoutStyle paddingBottom은 타입 계약이 거부해 사용하지 않았다.

## 수정 후 확인

- Storybook 재진입 후 큰 글자 요약/상세에서 입력42→421 편집·전환 보존 확인.
- 상세에서 입력을 누르면 키보드가 열리고 입력 영역은 y372/height64로 올라왔다.
  이 시점 아래 테두리 일부는 스크롤 경계에 걸렸다. 이를 자동 초점 이동 완전 통과로 세지 않는다.
- 최종 끝 여백 적용 후 본문 안 y300→200 swipe로 입력 y355/height64까지 이동했고,
  키보드를 유지한 채 값42와 전체 테두리가 보이는 것을 캡처로 확인했다.
- y480부터 한 swipe는 키보드가 닫혔다. 본문 밖/키보드 인접 위치의 동작을 본문 스크롤과
  동일하게 보고하지 않는다. 키보드가 유지된 scroll은 위 별도 관측으로 증명했다.
- 최종 공개 배치 prop 적용 시 Native check exit0(story generation·typecheck·18 tests),
  Showcase token boundary 통과. 문서·사용 지침·Storybook·공백 검사 통과.

남은 범위: 필드 외곽까지 자동으로 노출하는 포커스 보정, Native RTL/다크/모션 감소/제품 팔레트,
VoiceOver·Android·실물 성능·빠른 연속 전환의 프레임 측정. 현재 수정은 수동 스크롤 접근을
회복한 것이며 위 범위까지 해결했다고 주장하지 않는다.

## 노이즈 원본 대조

출처: https://magicui.design/docs/components/noise-texture (2026-10-07 직접 열람).
공식 문서의 feTurbulence fractal noise 설명과 기본 frequency0.4/octaves6을 확인했다.
IAB light1280×720 기본 데모에는 불규칙한 미세 질감이 보였다. Input field 예제에
`texture demo` 입력 후 값·caret·질감이 함께 보였다. Subscribe는 누르지 않았다.

별도 HJM `components-display-effect-surface--default` 화면의 grain 영역을 스크롤해
확인했다. 기존 grain은 매우 옅은 반복 패턴이며 source의 circle pattern과 대응한다.
서로 배경·불투명도가 다른 화면이므로 동일 조건 대비·가독성·성능 비교 완료는 아니다.
이름만으로 같은 효과라고 분류하지 않고, EffectSurface 안의 별도 fractal texture 비교 후보를
유지한다. Native host 지원·동일 배경 비교·읽기 대비·비용을 확인한 뒤 구현/승격 판단한다.

## 보관

결과는 본 문서와 URL별 ledger에 보존했다. 확인에 사용한 Native 원시 캡처4개는 제거했다.
재사용 소스·fixture 및 실행 중 Metro/Storybook 로그는 보존한다.
