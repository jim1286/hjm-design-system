# 병렬 레퍼런스 검토 B — 진행 중

검토일: 2026-10-07 · 담당: 21st.dev, Aceternity, Magic UI, Motion Primitives.
범위: 이번 추가 검토만. 수집 HTTP 200을 본문 독해·화면·동작 검토로 계산하지 않는다.
기존 Aceternity 네 페이지와 Motion 36 기본 페이지 검토는 기존 리포트의 당시 범위로 유지한다.
실행: IAB 임시 탭, 데스크톱 1280×720. Native 기기·릴리스·원격 CI 없음.

## Magic UI: Ripple Button

URL: https://magicui.design/docs/components/ripple-button

본문·props·Usage·Manual의 TSX와 CSS 전체를 읽고 Preview에서 마우스 클릭 및 Enter 실행을 관찰했다. 기본 light의 버튼 화면을 확인했다. 마우스 클릭은 width=95.8203px의 리플 span을 버튼 안에 만들었다(top=-26.6602px,left=0.0039px). 같은 버튼 Enter 실행은 top=-653.16px,left=-599.996px를 만들었다. 버튼 자체 기능은 실행되지만 ripple가 버튼 밖에서 시작한다. 원본 createRipple이 MouseEvent.clientX/Y를 그대로 쓰므로 키보드 합성 클릭의 0 좌표를 중앙으로 정규화하지 않은 결과다.

현재 HJM Web Button은 actions.tsx의 HTML button/type=button/aria-busy/aria-disabled/선택 의미를 갖고 CSS :active pressedOpacity를 사용한다. Native의 Pressable pressed 표현과 같은 기능을 유지하고, 표현 후보가 필요하면 기존 Button에서 공통 press feedback descriptor를 검토한다. RippleButton이라는 별도 선택·요청 엔진을 복제하지 않는다. 빠른 클릭 정리·disabled/loading·reduced motion·모바일 pointer·RTL은 원본에서 미검증. 원본 duration="600ms"는 HJM 토큰 기본값으로 그대로 복사하지 않는다.

## Magic UI: Animated Theme Toggler

URL: https://magicui.design/docs/components/animated-theme-toggler

본문·props·7가지 shape·next-themes controlled 설명과 Manual TSX/CSS 전체를 읽었다. circle/square/diamond/rectangle/hexagon/triangle/star와 controlled 예제, 총 8개 preview 버튼의 클릭 후 테마·Moon/Sun 상태를 확인했다. 각 shape의 중간 애니메이션 프레임은 캡처하지 않았으므로 clip 모양 자체의 실측 검증은 아니다. 구현은 startViewTransition 없으면 즉시 applyTheme, transition guard/cancel/cleanup, percentage clip geometry, controlled theme/onThemeChange가 있으면 persistence를 부모에게 맡긴다. 기본 duration=400ms; shape circle/square/triangle/diamond/rectangle/hexagon/star. 이 컴포넌트 원본 코드에는 prefers-reduced-motion 검사가 없다. 사이트 전체 CSS에 대한 부재 주장과는 구분한다.

HJM HjmProvider의 controlled theme/designProfile 및 environment.reducedMotion을 유지한다. 제품이 persistence를 소유한다는 원칙은 채택 가능. Web View Transition은 플랫폼 고유 프레젠테이션이므로 Native에 동일 API 성능/시각 동등성을 주장할 수 없다. 테마 전환이 제품 draft/state를 교체하지 않는지는 각 소비 구성에서 별도 검증한다.

## Magic UI URL별 본문 독해 진척

[개별 URL 인덱스](2026-10-07-reference-parallel-b-index.json)에 원본 URL·SHA-256·수집 시각·독해 범위·페이지별 판단을 보존한다. 프로그램 추출이나 유사 코드 분류를 독해로 계산하지 않는다. docs는 semantic main이 없는 원본이어서 `div[data-slot=docs]`의 본문을 읽었다. 활성 CLI 설치 탭·보이는 모든 예제 코드·Usage·Props·Credits가 범위이며, 비활성 Manual 탭의 구현은 별도로 센다.

| 범위 | 전체 분모 | 이번 독해 | 미확인 |
| --- | ---: | ---: | --- |
| Magic UI 수집 페이지 | 257 | 본문 전체 96, 부분 2 | 본문 159개 미검토 |
| 그중 docs | 92 | 전체 90, 부분 2 | Animated Beam/Dock의 긴 SVG 원시 geometry 및 일부 잘린 중간 구간 |
| 그중 홈페이지와 blog | 165 | 홈페이지 및 blog 첫 5개, 총 6 | blog 159개 |
| 비활성 Manual 구현 | 페이지별 필요 | Ripple Button·Animated Theme Toggler와 Android/CircularProgress/GradientText/AnimatedGrid/AnimatedList/ShinyText/AuroraText, 총 9 | 나머지 Manual·설치 provider 탭 |
| 실제 화면·선택 흐름 | 별도 | 위 2페이지의 데스크톱 선택 상태 | 나머지 페이지·모든 예제·환경 조합 |

본 사이트의 257페이지에는 blog 164개가 포함된다. 92 docs를 읽었다고 사이트 전체 검토로 올리지 않는다. Animated Beam/Dock은 control structure와 Usage·Props를 읽었지만 raw SVG geometry와 잘린 구간이 있어 전체 읽기 수에 넣지 않았다. 템플릿 9개는 판매 소개 본문을 읽은 범위이며, 연결 live preview나 유료 구현 소스는 아직 검토하지 않았다. Blog의 라이브러리 권고·성능·전환율 수치는 원문 주장이며 검증된 채택 근거가 아니다. `animation-libraries` 글의 `pnpm add magicui`·`import { Button, Card, Modal } from "magicui"` 안내는 현재 설치 docs의 shadcn registry 방식과 다르므로 이 글을 설치 근거로 채택하지 않는다.

현재 HJM EffectSurface의 실제 공개 layer는 mesh/glow/grain/noise 네 개다. Web 렌더러는 pointerEvents:none·aria-hidden·IntersectionObserver·document.hidden·reducedMotion·WAAPI 실패 fallback을 갖고 있다. Magic NoiseTexture의 SVG fractal noise를 별도 API로 복사할 이유는 아직 없다. Dot/Grid/Striped/Hexagon/Retro pattern은 기존 네 layer와 정확한 시각 동등성이 없으므로, 필요하면 기존 descriptor의 선택적 pattern 확장으로 조사할 후보이다. 원본들의 SSR·Native 동등성을 아직 주장하지 않는다.

Magic ProgressiveBlur/ScrollProgress/PixelImage는 각각 기존 ProgressiveBlur/ScrollProgress/GridReveal+Image부터 대조한다. ScrollVelocityRow docs의 offscreen·hidden·reduced-motion 계약은 HJM의 현재 EffectSurface lifecycle과 일관된 방향이다. SmoothCursor의 fine-pointer 조건은 참고할 수 있으나 글이 권하는 전역 `cursor:none!important`는 제품 기본 테마에 넣을 후보가 아니다. TextAnimate accessible label, TypingAnimation의 단어·cursor 상태 등은 실제 Manual과 locale grapheme 검토가 남아 있다.

추가 Manual 독해에서 AnimatedGrid의 실제 기본 numSquares=50/duration=4가 docs의 200/1과 달랐다. ResizeObserver·Math.random·square별 완료 재시작 구조를 읽었지만 이 컴포넌트 자체의 reduced/offscreen/hidden guard는 없다. Android의 clipPath id는 고정이고 video는 foreignObject여서 iPhone/Safari의 DOM overlay 방식과 다르다. CircularProgress는 min=max 나눗셈·범위 clamp·progressbar aria 계약이 없어 HJM Progress를 대체할 근거가 아니다. GradientText의 speed는 CSS 배경 크기를 바꾸고 animation duration은 8초로 고정된다. AnimatedList는 children prefix를 시간에 따라 늘리고 역순으로 표시할 뿐 실제 알림 상태를 소유하지 않는다. 모두 각 Manual 본문을 읽은 판단이며 해당 예외 입력의 실제 실행 검증은 남았다.

ShinyText의 CSS는 8초 무한 shimmer다. AuroraText는 sr-only children과 aria-hidden animated children을 나누고 10/speed 초를 적용한다. children이 ReactNode라서 interactive child를 전달할 때 중복 focus node가 생기는지, zero/negative speed를 어떻게 처리할지는 아직 실제 실행하지 않았다. 기존 HJM Text의 콘텐츠·접근성 계약 위에 시각 처리만 흡수하는 방향을 유지한다.

## Aceternity: File Upload

URL: https://ui.aceternity.com/components/file-upload
독립 live preview: https://ui.aceternity.com/live-preview/file-upload-demo

본문·onChange props와 Manual 구현/util을 전부 읽었다. `useDropzone({multiple:false,noClick:true})`의 root props에 role=presentation/tabIndex=0이 붙고, 별도 display:none input은 내부 div의 mouse click으로 열린다. getInputProps는 사용하지 않는다. 전달 onChange는 새로 받은 File[]이고 내부 목록은 이전 파일에 추가한다. 업로드 통신·진행·취소·retry·accept/size 오류 상태를 제공하는 구현은 아니다.

실제 독립 preview의 light/dark 업로드 영역을 보았고, root `[role=presentation][tabindex=0]`에 Enter를 보냈다. key 입력은 완료됐지만 2초 filechooser 대기는 timeout이고 화면이 변하지 않았다. 이 특정 root 경로의 관찰이며 가능한 모든 키보드 경로를 검증한 것은 아니다. 파일 선택·전송은 실행하지 않았다. [dark 선택 화면 증거](assets/parallel-b-aceternity-upload-dark.png).

기존 HJM UploadItem은 pending/uploading/success/error 및 product 측정 progress, uploading에서 cancel·error에서 retry를 파생하는 공통 계약을 이미 가진다. Aceternity 데모로 UploadItem을 교체하면 상태 계약을 잃는다. 필요하면 제품의 접근 가능한 file 선택 control과 UploadItem을 연결하는 구성으로 흡수하고, drop presentation은 선택 기능과 구분한다. Native picker 및 실제 전송은 제품 소유로 남긴다.

## 21st: 공개 메타데이터와 잠긴 구현 경계

URL: https://21st.dev/ 및 https://21st.dev/@kokonutd/components/button-colorful

홈 공개 본문, Colorful Button 상세의 author/library/license/dependency/Usage를 읽었다. 페이지 WebMCP는 메타데이터·설치 안내를 반환하지만 구현 본문은 반환하지 않았다. Usage.tsx는 ButtonColorful을 import/render하는 짧은 사용 예다. Component.tsx 선택은 `Component source is locked`와 로그인/Unlock UI를 보였으므로 구현 미검토를 유지한다.

초기 검은 thumbnail 이후 실제 `https://cdn.21st.dev/bundled/3.html?theme=light` iframe이 흰 배경 버튼을 렌더한 것을 구분해서 보았다. 실제 Explore Components 버튼에 Enter를 보내 focus outline을 확인했다. 화면/URL 변화는 없었다. 부모 iframe의 title은 없었다. 실제 구현 event·reduced-motion·disabled/loading 소스는 잠겨 있어 단정하지 않는다. [선택 상태 증거](assets/parallel-b-21st-keyboard.png).

루트 AGENTS의 저장된 로그인 우선 규칙에 따라 Aside Vault로 기존 21st 로그인만 찾게 했다. 일치하는 저장 계정과 기존 21st 탭이 없다는 결과를 확인했다. 새 계정·결제·약관 수락·API-key quota 사용은 하지 않았다. 로그인 막힘은 공개 다른 원본 조사 중단 이유가 아니며, 이 사이트의 구현 전수 완료 근거도 아니다.

## Motion Primitives와 잔여

이번 추가 실행에서 Motion의 새 완료 수를 올리지 않았다. 기존 36 기본 페이지·33 구현·96 예제의 정적 조사 및 당시 선택 흐름 범위는 원 보고서 그대로다. Aceternity 기존 tabs/stateful-button/expandable-card/layout-grid 선택 동작도 이번 새 완료 수에 중복해서 넣지 않는다.

네 사이트 전체 페이지·연결 프리뷰·variant·키보드·focus·light/dark·좁은 화면·큰 글자·RTL·reduced motion은 전수 완료가 아니다. 이 문서는 다음 관찰을 계속 추가한다.
