# 문장 주석 — 구현 중

검토일: 2026-10-07. Web 내부 renderer는 구현했고 공개 renderer·Storybook 실험은 아직 없다.

사용자가 제공한 Magic UI Highlighter를 조사한 결과 기존 TextFormat은 Web의
단축키·코드·인용 요소를 위한 계약이라 손그림 주석을 직접 대체하지 못했다.
조사 근거는 [원본 검토](../../../docs/qa/2026-10-07-highlighter-reference.md)다.

## 공통 구현

`src/text-annotation.ts`는 renderer가 측정한 시각적 줄 조각의 x/y/width/height에서
SVG 경로를 만든다. `@hjmds/design-contracts/text-annotation` subpath로 공개하며 root에는
추가하지 않는다. renderer에서 같은 경로 계산을 사용하면서 기본 소비 번들에는 들어가지
않도록 한 선택이다. 이 export 추가가 renderer 사용 가능 또는 npm 게시를 뜻하지 않는다.

- highlight는 뒤쪽 채움, underline/box/circle/strike-through/crossed-off/bracket은
  두 번 그린 외곽 경로다. 무작위 값 대신 결정적인 작은 오프셋을 쓴다.
- 줄 사이 빈 영역을 한 덩어리로 칠하지 않는다. 동일 줄의 bidi 조각도 호스트가 측정한
  물리 좌표 그대로 받으며 문자열 길이로 위치를 추측하거나 RTL을 한 번 더 뒤집지 않는다.
- 기본 strokeWidth=1.5, padding=2는 장식 경로 단위다. 문장 레이아웃이나 전역 토큰을
  바꾸지 않는다. 작은 구두점에는 흔들림을 줄이고 빈 줄에는 경로를 만들지 않는다.
- 반환 bounds는 경로 제어점·두 번 그린 선·선 굵기를 포함한다. 호스트는 이를 SVG
  영역에 반영해야 하며 원래 Text의 크기나 줄바꿈 폭을 늘려서는 안 된다.
- circle의 초기 내접 타원이 32px 글자의 양 끝을 가로질러 바깥으로 휜 루프로 수정했다.
  여백 0이나 굵은 펜에서도 해당 줄의 글자 영역 밖에 선을 두도록 최소 간격을 계산한다.
  현재 모양은 타원보다 둥근 테두리에 가깝다. 원본과의 시각적 차이, 조밀한 줄 간격에서
  이웃 줄과의 충돌 및 팔레트 검증은 남아 있으며 원본 동등 표현으로 주장하지 않는다.
- 음수 크기, 비유한 좌표와 계산 overflow는 렌더링 전 거부한다. 스크롤·상대 위치 때문에
  음수 x/y는 유효하며 소수 단위 측정도 유지한다.
- `mergeTextAnnotationFragments`는 같은 실제 줄(lineIndex)의 맞닿은 글꼴 조각을 합친다.
  Native Skia가 한글·공백 fallback을 23개 조각으로 반환해 marker padding이 겹친 실측을
  반영한 기능이다. Float32 경계 오차만 흡수하도록 0.01px 허용 오차를 사용하며 선택하지
  않은 gap이나 다른 줄은 합치지 않는다. 이 함수가 줄 번호를 문자열에서 추측하지 않는다.

## Web 내부 renderer와 Native의 남은 계약

`packages/react/src/text-annotation.tsx`는 inline span의 실제 Range 사각형을 측정한다.
문장 조각을 inline-block으로 바꾸지 않는다. 절대 위치 기준점과 SVG를 접근성·hit-test에서
제외하고, 문구·앞 문장·조상 크기 및 스타일·글꼴 로드 변화에 재측정한다. 새 문구가 이전
문구 경로를 받지 않도록 측정 세대를 나눈다. 동일 geometry에는 state 갱신을 보내지 않는다.
진입 모션은 motion.slow=320ms, 모션 감소 또는 숨겨진 문서에서는 즉시 표시하며,
리사이즈에는 다시 재생하지 않는다. highlight의 20% brand wash는 실험값이고 제품 팔레트
대비 검증이 남았다. renderer는 아직 package exports에 넣지 않았다.

Native 0.86.2/Expo Go 57.0.9/iOS 26.5에서 진단 fixture를 실행했다. 부모의 onTextLayout은
폭 280→184에서 2→3줄을 보고했으나 중첩 Text의 onTextLayout/onLayout은 관찰되지 않았고
measure는 0×0이었다. 이 경로를 실제 줄별 측정으로 사용할 수 없다. 진단 소스는
`showcase/native/src/devtools/TextAnnotationMeasurementProbe.tsx`에 보존했다.

후속 `TextAnnotationSkiaProbe.tsx`는 Skia 2.6.2의 Paragraph로 측정하고 **같은 Paragraph**를
그린다. getRectsForRange와 실제 line metrics를 이용해 한글 23→3, emoji 9→2, 혼합 RTL
21→3개의 표시 영역을 얻었다. RTL 폭 280→184에서 5줄로 다시 배치했다. 이 좌표를 다른
Native Text 위에 올리는 것은 금지한다. 비교 fixture에서 두 엔진의 줄바꿈이 달랐다.
이는 Native renderer 후보의 측정 증거이며 일반 Text 대체가 아니다. Canvas의 읽기 이름만으로
Native Text 선택·복사 기능이 생기지 않는다. 폰트·스케일·외곽 잘림·선택·접근성·Android를
해결하고 공개 API/실험으로 연결하는 일이 남았다.

Web은 inline 문장과 Range.getClientRects의 줄 조각, Native는 실제 텍스트 레이아웃에서
문장 일부의 줄별 위치를 얻어야 한다. 전체 문단을 주석으로 바꾸는 것으로 이 요구를
대체하지 않는다. 글꼴 로드·문구 교체·글자 크기·폭 변경마다 최신 geometry를 공급한다.

본문은 처음부터 읽고 선택할 수 있어야 한다. 주석은 접근성 트리와 pointer hit-testing에서
제외하며 highlight는 글자 뒤에 둔다. 색은 제품 팔레트의 의미 색으로 공급하고 대비를
검증한다. 취소선이 데이터의 삭제 상태를 대신 전달하지 않도록 제품 문구를 유지한다.
모션 감소에서는 즉시 완성된 주석을 보인다. 비활성 화면·unmount 시 animation과 관찰자를
정리한다. 리사이즈로 geometry만 바뀔 때 진입 모션을 반복하지 않는다.

## 검증 범위

현재 계약 테스트 15개는 줄 조각 분리/병합, RTL 물리 좌표 유지, 7가지 경로의 결정성, 소수·음수
좌표, 빈 상태, 재측정, 비정상 입력을 확인한다. 실제 글자 측정, 글자 대비, 모션, 성능,
스크린리더 또는 소비 앱 채택의 증거는 아니다. 별도 Web 브라우저 테스트 7개는 실제
DOM 측정·줄바꿈·선택·RTL·폭 변경·문구 교체·모션 감소를 검증했다. 전체 스타일·기기·성능
검증을 마쳤다는 뜻은 아니다. 추가된 큰 글자 회귀는 선 경로를 0.5px 간격으로 샘플링해
선 두께까지 해당 줄의 글자 사각형 바깥에 있는지 검사한다. 이는 이웃 줄까지 포함한
모든 배치 조합의 가독성 검증은 아니다.

공개 export·양 renderer·사용 지침·실험 스토리·UI 및 행동 증거가 연결된 다음에 실험 수에
포함한다. 안정화·npm 게시·Utilverse 적용은 사용자 요청의 후속 단계로 남아 있다.
