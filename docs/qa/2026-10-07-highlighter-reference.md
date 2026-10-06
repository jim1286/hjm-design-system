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
