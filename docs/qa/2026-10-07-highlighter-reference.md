# QA 리포트 — 문장 강조 레퍼런스

## 1. 최종 판정

2026-10-07 부분 조사. 신규 실험 후보로 유지하며 구현·승격 완료가 아니다.
HJM main 3c75c87의 TextFormat은 Web kbd/code/quote만 지원한다. Native 대응이
없으므로 기존 API 이름을 대응표에 적은 것을 기능 제공으로 해석하지 않는다.

## 2. 대상과 환경

[Magic UI Highlighter](https://magicui.design/docs/components/highlighter)의 기본 데모를
Codex IAB에서 열고 restart를 실행했다. 기본 화면과 390×844를 관찰했다.
공식 소스는 magicuidesign/magicui commit cdb348cb4c72a9b54b554d8617801e479fbc8714의
`apps/www/registry/magicui/highlighter.tsx`를 읽었다. 원본 코드를 HJM에 복사하지 않았다.

## 3. 실제 관찰

- 주황 밑줄과 파랑 강조가 본문 뒤에 표시됐다. 재시작 후에도 전체 문장이 유지됐다.
  캡처로 애니메이션의 프레임별 부드러움이나 실제 duration은 판단하지 않는다.
- 390px에서 문장은 여러 줄로 바뀌었다. 두 강조 조각 자체는 각각 한 줄이므로
  여러 줄에 걸친 한 주석을 검증한 결과는 아니다.
- 두 장식 SVG의 aria-hidden/role은 없었고 AX에는 이름 없는 image 두 개가 있었다.
  실제 스크린리더 발화가 방해되는지는 별도 검증이 필요하다.

## 4. 소스 대조와 구현 방향

원본은 motion/react의 useInView와 rough-notation을 사용한다. effect 안에서 span을
annotate하고 element 및 document.body의 ResizeObserver가 hide/show를 실행한다.
cleanup은 annotation.remove와 observer.disconnect를 호출한다. children 자체는 effect
dependency가 아니며 텍스트 변경 갱신을 ResizeObserver에 의존하는지 실제 재현은 남아 있다.
해당 wrapper에는 reduced-motion 조회가 없다. 하위 라이브러리까지 조사한 결론은 아니다.
문서의 기본 animationDuration은 500ms이고 이 source는 600ms다.

HJM은 의미 있는 HTML 요소를 제공하는 기존 TextFormat과 문장 위 장식을 구분해야 한다.
새 실험은 Web/Native 공통 주석 의미와 줄별 측정을 먼저 정의하고 기존 Text의 문장 흐름을
보존해야 한다. 정적 배경색만 추가하거나 Web DOM 라이브러리를 Native에 연결하는 방안은
손그림·여러 줄 주석 또는 플랫폼 지원 요구를 충족하지 못하므로 완료 대안으로 쓰지 않는다.

## 5. 남은 검증

한국어 긴 문장·RTL·큰 글자·다크·서로 다른 제품 팔레트, 모든 action, 여러 줄 주석,
동적 문구·폰트 로드·리사이즈, 모션 감소·화면 비활성, 텍스트 선택과 접근성, Native
줄별 측정 및 기기 성능은 미확인이다. 실험 구현 후 UI·기능 검증을 거쳐 승격한다.

## 6. 보관

관측 결과는 이 리포트와 URL별 ledger에 보존했다. 원본 미디어는 저장·재배포하지 않았다.
이번 변경은 조사 문서뿐이며 기능 테스트나 릴리스 검증 통과로 집계하지 않는다.

## 7. 공통 geometry 구현 후 검사

`src/text-annotation.ts`에 7개 주석의 경로 계산을 추가했다. 원본 rough-notation을
복사하지 않고 renderer가 공급하는 줄별 사각형을 사용한다. 난수 없는 두 번 그리기로
재렌더마다 선이 흔들리는 것을 방지한다. 빈 줄은 제외하고 경로 외곽까지 bounds에 포함한다.

Node 24.20.0 / pnpm 11.18.0에서 계약 테스트 12개 통과, contracts typecheck 통과.
첫 typecheck에서 forEach 클로저 안 bounds 변경에 대한 타입 추론 오류를 발견했고
for-of 루프로 바꾼 뒤 통과했다. 이 검사는 실제 글꼴 측정·모션·화면 렌더링 검증이 아니다.
공개 export와 Web/Native renderer 연결은 아직 남아 있다.

## 8. Web 연결 및 Native 측정 조사

Web 내부 renderer를 추가하고 contracts의 순수 geometry subpath를 연결했다.
Web renderer는 package exports 및 Storybook에 아직 등록하지 않았다.
`packages/react/test/fixtures/text-annotation.html`은 내부 렌더러 QA용이며 소비 예제가 아니다.

- Chromium 브라우저 테스트 6개: 실제 줄별 경로, 본문 선택·복사, 원래 줄바꿈 유지,
  7가지 action, RTL/큰 글자, 280→184 폭 변경, 앞 문장 변경, 짧은 문구/빈 문구,
  모션 감소 전환 시 animation 취소를 확인했다. 최종 재실행은 act 경고 없이 통과했다.
- Web typecheck/build, Native Showcase typecheck, API 대응표·workspace sync 통과.
- contracts bundle 검사는 새 subpath 1 module, 약 5.5kB raw / 2.0kB gzip을 보고했다.
  모듈 수 gate 통과이며 크기는 정보다. 전체 ci:check는 이번에 실행하지 않았다.
- IAB 1280×720 기본 화면에 7가지 형태를 함께 표시해 확인했다. dark/RTL/32px 및
  390×844에서 highlight/underline/box의 줄별 위치를 확인했다. 원형 주석은 끝 글자에
  선이 겹쳐 보이므로 곡률·여백의 시각적 다듬기가 남았다. 전체 형태의 작은 화면 완료가 아니다.
- HMR 뒤 옵션이 초기화되어 dark/RTL/큰 글자를 다시 선택한 후 390px 화면을 확인했다.
  설정했었다는 이력만으로 최종 화면 환경을 판단하지 않았다.

Native는 기존 iPhone 17 Pro/iOS 26.5, Expo Go 57.0.9, RN 0.86.2, Metro 8084에서
측정 fixture를 실행했다. Device Hub CUA 사용 금지에 따라 simctl/idb를 사용했으며
Device Hub UI 검증이나 실물 기기 증거로 세지 않는다. 280px 부모 문단은 2줄(높이 40),
184px은 3줄(높이 60)이었으나 중첩 조각의 onTextLayout/onLayout은 관찰되지 않았고
measure는 x=0/y=0/width=0/height=0이었다. 부모 전체 문단의 좌표를 조각 좌표로
대용하면 앞/뒤 문장까지 칠해지므로 그 대안은 채택하지 않았다.

일시적으로 기본 선택 배경 스토리의 render에 fixture를 연결했다가 검사 후 원복했다.
재현 가능한 fixture 소스만 보존한다. Native 측정의 다음 후보는 공개된 범위 측정 엔진이나
동일한 텍스트 레이아웃을 사용하는 선택적 native host이며 정확한 범위·폰트·접근성을
확인하기 전에는 문자열 길이 추정 또는 전체 문단 강조로 대체하지 않는다.

## 9. 둘러싸기 선과 끝 글자 겹침 수정

회귀 테스트를 먼저 추가하여 수정 전 실패를 확인했다. 단순 path bounding box 비교로는
원인인 타원 내부 곡선을 잡을 수 없어, 실제 SVG 경로를 0.5px 간격으로 샘플링하고
선 굵기까지 각 줄의 글자 사각형 밖인지 검사한다. 수정 전 첫 겹침은 viewport 좌표
34.1223, 55.5342에서 검출됐다.

circle 경로를 padded corner 바깥으로 휘는 루프로 바꾸고 최소 간격에 선 두께와
두 번 그린 오프셋을 반영했다. 새 곡선 제어점까지 SVG bounds에 포함했다.
타원을 단순 확대하면 긴 줄의 폭에 비례해 이웃 문장이나 화면 밖으로 크게 나가므로
그 방식은 채택하지 않았다. 현재 결과가 원본 타원과 똑같다는 뜻은 아니다.

수정 후 계약 테스트 12개, 브라우저 테스트 7개, contracts typecheck/build 통과.
IAB 1280×720 dark/RTL/32px/line-height=1.8 화면에서 이전에 끝 글자를 가로지르던
선이 바깥으로 이동한 것을 확인했다. 형태는 타원보다 둥근 테두리에 가까워졌으므로
표현 선택은 실험 검토로 남긴다. 좁은 줄 간격의 이웃 줄 충돌, 모든 팔레트와 Native는
이번 통과 범위에 포함하지 않는다. 재현 테스트와 fixture를 보존하고 실패 캡처는 정리한다.

## 10. Native Skia 범위 측정 후보

기존 기기/Expo Go/Metro를 그대로 사용해 `TextAnnotationSkiaProbe.tsx`를 실행했다.
추가 설치·native build 없이 이미 설치된 Skia 2.6.2의 ParagraphBuilder, getRectsForRange,
getLineMetrics, getGlyphPositionAtCoordinate와 Canvas/Paragraph를 사용했다. 측정한
Paragraph를 그대로 그리며 아래 Native Text는 독립적인 비교 자료다.

| 문장 | UTF-16 범위 | 폭 | 원시 run → 병합 영역 | 관찰 |
| --- | --- | --- | --- | --- |
| 한글 | 5–42 | 280 | 23→3 | 수정 전 run 경계가 겹쳐 진했음. 같은 줄의 맞닿은 run 병합 후 연속 강조, 앞/뒤 문장 제외 |
| 접두부 emoji + 피부색/ZWJ emoji | 5–31 | 280 | 9→2 | 앞 🙂 제외, 강조 안 👩🏽‍💻 포함, 뒤 문장 제외 |
| 아랍어 + English 123 | 4–64 | 280 | 21→3 | 혼합 방향에도 앞/뒤 문장 제외 |
| 같은 RTL 문장 | 4–64 | 184 | 21→5 | 폭 변경 뒤 5줄로 재측정·재표시 |

병합은 measured line identity 안에서 수행한다. Native fixture는 실제 line metrics와
rect의 수직 교집합이 가장 큰 줄을 선택한다. 이 매핑은 여러 baseline·첨자·큰 inline
이미지 등을 전수 검증한 일반 알고리즘이 아니다. 공통 계약은 이미 결정된 lineIndex만
받고, gap 보존/논리 입력 순서와 무관한 물리 정렬/Float32 인접 오차/유효성/overflow를
검사한다. 계약 테스트는 총 15개 통과했다.

Canvas와 Native Text의 줄바꿈이 다르므로 Skia 좌표를 Native Text 위에 적용하는 방안은
배제했다. Canvas에는 본문 읽기 이름을 주고 그림 자식은 접근성에서 숨겼으나 실제
VoiceOver·TalkBack 발화나 선택·복사는 미검증이다. Canvas 자체는 Native Text의
selectable 동작을 제공하지 않는다. 본문 교체나 Native 공개 API 완료의 근거가 아니다.
또한 RTL 원시 rect 하나가 x=-6.38로 나와 Canvas 경계와 장식 외곽의 처리도 남아 있다.

contracts 빌드 전 fixture HMR가 새 helper를 먼저 참조해 undefined 함수 오류가 한 번
발생했다. 빌드 후 정상 실행을 확인하고 기존 오류 오버레이를 닫았다. 반복적인 runtime
실패로 판단하거나 Metro/기기를 새로 띄우지 않았다. 임시 story render는 원래대로 복구했다.
진단 fixture와 계약 테스트는 보존하고 원시 캡처 및 임시 story 백업은 정리한다.

## 11. 제품 팔레트와 Web 혼합 방향 조각 (2026-10-07)

HJM 기본·Utilverse indigo-violet·BurnTok 제품 표면을 재사용 가능한 fixture에 추가했다.
각 light/dark × bg/surface × body/muted의 24가지 조합에서 브라우저가 계산한 실제 색과
20% marker 합성 뒤 본문 대비가 모두 4.5:1 이상이었다. 제품 팔레트 전체 규칙·모든
표면·이미지 배경을 검증한 주장은 아니다. 새 모션 검사는 reducedMotion=false에서
최초 애니메이션 완료 후 폭만 변경하면 재생하지 않고 새 문구에는 재생하는 것을 확인했다.

IAB 1280px Utilverse light 16px·dark 32px 보조 본문, 390×844 BurnTok dark 32px
혼합 아랍어/English 및 light 16px에서 일곱 형태를 한 장에 모아 확인했다.
혼합 문장의 같은 줄 두 run이 같은 y=399.0390625/height=38, x=95.6328125/185.375에서
맞닿지만 각각 enclosure를 그려 중간에 세로선이 생겼다. 단일 줄 bidi 회귀 테스트를 먼저
추가해 2개여야 할 pen path가 6개로 실패하는 것을 확인했다.

Web Range rect 중 top/height가 0.01px 이내로 같은 수직 대역만 동일 lineIndex로 묶어
기존 mergeTextAnnotationFragments에 연결했다. 실제 수평 gap은 보존한다. 단순 수직
겹침이나 문자열 순서로 줄을 추측하지 않으므로 좁은 line-height의 서로 다른 줄을 합치지 않는다.
높이가 다른 fallback run까지 일반화한 줄 식별은 아니며 후속 엔진/폰트 검증 대상이다.

수정 후 브라우저 테스트 총 10개와 React typecheck/build 통과. IAB HMR가 옵션을 초기화해
BurnTok/dark/RTL/32px/보조 본문/아랍어 문장을 다시 선택하고, 390px에서 box·circle·bracket의
중간 세로선 및 crossed-off의 분할이 사라진 것을 확인했다. Native 공개 API·선택·복사·기기
낭독과 전체 환경 승격 검증은 미완료다. 공개 실험 수를 늘리지 않는다. 재사용 fixture·테스트와
이 기록을 보존하고 임시 Vite/탭/viewport override 및 실패 원시 캡처는 정리한다.
