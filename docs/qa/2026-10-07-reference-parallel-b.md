# 병렬 레퍼런스 검토 B — 요청 범위 마무리

> 2026-10-09 QR 정리: 원시 URL 원장·캡처는 현재 보관하지 않는다. 과거의 원장/이미지 보존 문구는 당시 작업 기록이며, 현재 확인 가능한 결과·실패·미확인 범위는 이 문서 본문이다. 새 조사나 재검증을 수행한 것은 아니다.

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

[개별 URL 인덱스 — 본문 요약·미확인 범위](2026-10-07-reference-parallel-b.md)에 원본 URL·SHA-256·수집 시각·독해 범위·페이지별 판단을 보존한다. 프로그램 추출이나 유사 코드 분류를 독해로 계산하지 않는다. docs는 semantic main이 없는 원본이어서 `div[data-slot=docs]`의 본문을 읽었다. 활성 CLI 설치 탭·보이는 모든 예제 코드·Usage·Props·Credits가 범위이며, 비활성 Manual 탭의 구현은 별도로 센다.

| 범위 | 전체 분모 | 이번 독해 | 미확인 |
| --- | ---: | ---: | --- |
| Magic UI 수집 페이지 | 257 | 수집 본문 전체 257, 부분 0 | 수집 본문 미독해 0; 숨은 설치 탭·실제 상태는 별도 |
| 그중 docs | 92 | 수집 본문 전체 92 | 비활성 설치 탭과 실제 예제 상태는 별도 |
| 그중 홈페이지와 blog | 165 | 홈페이지 및 blog 164개, 총 165 | 공개 main 미독해 0 |
| 컴포넌트 Manual 구현 | 77 | 77페이지, URL별 범위와 판단은 인덱스 manualReview/Notes | MCP Manual·설치 provider 탭과 실제 예제 상태 |
| 실제 화면·선택 흐름 | 별도 | Ripple Button·Animated Theme Toggler·BentoGrid·HeroVideoDialog 4페이지의 데스크톱 선택 상태 | 나머지 페이지·모든 예제·환경 조합 |

본 사이트의 257페이지에는 blog 164개가 포함된다. 92 docs를 읽었다고 사이트 전체 검토로 올리지 않는다. Animated Beam/Dock은 아래 후속 checkpoint에서 긴 raw SVG geometry와 중간 구간까지 다시 읽어 수집 본문 전체 수에 포함했다. 숨은 설치 탭·실제 모든 예제 상태 완료를 뜻하지 않는다. 템플릿 9개는 판매 소개 본문을 읽은 범위이며, 연결 live preview나 유료 구현 소스는 아직 검토하지 않았다. Blog의 라이브러리 권고·성능·전환율 수치는 원문 주장이며 검증된 채택 근거가 아니다. `animation-libraries` 글의 `pnpm add magicui`·`import { Button, Card, Modal } from "magicui"` 안내는 현재 설치 docs의 shadcn registry 방식과 다르므로 이 글을 설치 근거로 채택하지 않는다.

현재 HJM EffectSurface의 실제 공개 layer는 mesh/glow/grain/noise 네 개다. Web 렌더러는 pointerEvents:none·aria-hidden·IntersectionObserver·document.hidden·reducedMotion·WAAPI 실패 fallback을 갖고 있다. Magic NoiseTexture의 SVG fractal noise를 별도 API로 복사할 이유는 아직 없다. Dot/Grid/Striped/Hexagon/Retro pattern은 기존 네 layer와 정확한 시각 동등성이 없으므로, 필요하면 기존 descriptor의 선택적 pattern 확장으로 조사할 후보이다. 원본들의 SSR·Native 동등성을 아직 주장하지 않는다.

Magic ProgressiveBlur/ScrollProgress/PixelImage는 각각 기존 ProgressiveBlur/ScrollProgress/GridReveal+Image부터 대조한다. ScrollVelocityRow docs의 offscreen·hidden·reduced-motion 계약은 HJM의 현재 EffectSurface lifecycle과 일관된 방향이다. SmoothCursor의 fine-pointer 조건은 참고할 수 있으나 글이 권하는 전역 `cursor:none!important`는 제품 기본 테마에 넣을 후보가 아니다. TextAnimate accessible label, TypingAnimation의 단어·cursor 상태 등은 실제 Manual과 locale grapheme 검토가 남아 있다.

추가 Manual 독해에서 AnimatedGrid의 실제 기본 numSquares=50/duration=4가 docs의 200/1과 달랐다. ResizeObserver·Math.random·square별 완료 재시작 구조를 읽었지만 이 컴포넌트 자체의 reduced/offscreen/hidden guard는 없다. Android의 clipPath id는 고정이고 video는 foreignObject여서 iPhone/Safari의 DOM overlay 방식과 다르다. CircularProgress는 min=max 나눗셈·범위 clamp·progressbar aria 계약이 없어 HJM Progress를 대체할 근거가 아니다. GradientText의 speed는 CSS 배경 크기를 바꾸고 animation duration은 8초로 고정된다. AnimatedList는 children prefix를 시간에 따라 늘리고 역순으로 표시할 뿐 실제 알림 상태를 소유하지 않는다. 모두 각 Manual 본문을 읽은 판단이며 해당 예외 입력의 실제 실행 검증은 남았다.

ShinyText의 CSS는 8초 무한 shimmer다. AuroraText는 sr-only children과 aria-hidden animated children을 나누고 10/speed 초를 적용한다. children이 ReactNode라서 interactive child를 전달할 때 중복 focus node가 생기는지, zero/negative speed를 어떻게 처리할지는 아직 실제 실행하지 않았다. 기존 HJM Text의 콘텐츠·접근성 계약 위에 시각 처리만 흡수하는 방향을 유지한다.

AvatarCircles Manual은 generic Avatar N alt/index key와 빈 href의 overflow 링크를 사용하고 numPeople 기본은 undefined여서 docs99와 다르다. 기존 AvatarGroup의 이름·overflow action 계약을 유지한다. Backlight는 useId 기반 SVG filter에 GaussianBlur·saturation=4·원본 composite를 조합한다. BlurFade/BorderBeam은 Motion의 진입·perimeter 표현이며 자체 reduced/offscreen/hidden guard는 없으므로 HJM ContentTransition/EffectSurface lifecycle을 우회해서 복사하지 않는다.

추가로 AnimatedBeam/ComicText/Confetti/CoolMode/DiaTextReveal/Dock/DotPattern/DottedMap/FileTree Manual을 읽었다. Confetti는 canvas instance를 unmount 때 reset하고 button origin을 client 좌표 대신 target rect 중앙으로 정한다. CoolMode는 idle에도 RAF를 계속 예약하고 mouse/touch listener만 둔다. particleCount는 선언됐지만 사용되지 않고 limit=45가 고정이다. keyboard·reduced·hidden 제어가 없고 cleanup은 입자가 빌 때까지 기다리므로 Button 엔진에 그대로 복사하지 않는다. DiaTextReveal은 useReducedMotion·stop·timeout cleanup이 있어 같은 부류로 처리하지 않는다. FileTree는 Radix Accordion과 내부 selected/expanded 상태를 사용하며 Intl.Collator("en")를 고정한다. Tree 의미·locale ordering은 기존 HJM Tree와 제품 계약을 유지해야 한다. 이 판단들은 source 독해이며 각 예외 입력 runtime 재현은 아직 아니다.

FlickeringGrid/Floating3DParticles/GlareHover/Globe/GlyphMatrix/GridPattern/HeroVideoDialog/HexagonPattern Manual도 읽었다. FlickeringGrid에는 IntersectionObserver 정지가 있고 Floating3DParticles에는 reduced-motion static frame·visibility·DPR 상한이 있다. 다만 Floating3DParticles는 정지 분기에서도 RAF를 예약하며 color만 바뀔 때 staticDirty를 갱신하지 않는다. GlyphMatrix의 mutationRate=0도 Math.max(1, ...) 때문에 최소 한 글자를 바꾸는 소스다. 이 조건을 실제 동작 오류로 재현한 것은 아직 아니다. GlareHover의 before overlay는 pointer-events-none으로 포인터를 막지 않는 것을 확인했다. Grid/Hexagon은 useId 기반 static SVG tile이어서 큰 DOM/canvas loop 복사 없이 descriptor 후보로 검토할 수 있다.

Highlighter/HyperText/IconCloud/InteractiveGrid/HoverButton/iPhone/KineticText/Lens/LightRays/LineShadowText Manual 10개를 이어서 전체 독해했다. IconCloud는 reduced-motion pause와 이름 있는 재생 버튼을 제공하지만 이미지 오류 callback이 없어 pending asset이 계속 RAF를 예약하는 경로가 있다. KineticText는 실제 문자열을 sr-only로 보존하는 반면 HyperText는 UTF-16 문자 분리·대문자 scramble 결과 자체를 접근 가능한 콘텐츠로 렌더한다. Lens는 확대 overlay에 children을 다시 렌더하므로 interactive children의 중복 포커스 여부를 실제 검증하기 전에는 범용 컴포넌트로 채택하지 않는다. InteractiveHoverButton의 두 label은 시각 opacity만 나누며 local disabled/focus/reduced 조건이 없다. LightRays/LineShadow는 표현 후보이지만 HJM의 lifecycle과 semantic Text를 유지한다. iPhone 프레임은 제품 이미지 프레젠테이션이지 Native 구현 증거가 아니다. 이 10개는 source 독해만 추가했으며 실제 시각·흐름 수는 늘리지 않았다.

Manual의 MagicCard부터 SmoothCursor까지 23개를 추가 독해했다(RippleButton은 기존 완료라 중복 제외). Particles의 initCanvas→resizeCanvas→drawParticles 경로는 quantity개 생성 뒤 동일 배열에 quantity개를 추가한다. 총 2배라는 소스 경로 추정이며 실제 수를 계측한 것은 아니다. ScrollVelocity는 offscreen/hidden에서는 이동을 중단하지만 reduced-motion은 speedMultiplier를 1로 낮출 뿐 baseVelocity 이동을 계속한다. 앞서 docs만 읽은 단계의 reduced-motion 설명을 정지 보장으로 해석하지 않는다. RetroGrid는 WebGL shader·DPR 상한·LOD·context 복원과 reduced static/IO 정지를 제공하고, CSS fallback에도 reduced 정지가 있다. ShineBorder에는 motion-safe 클래스가 있다. Marquee는 자식 네 번 복제에 aria-hidden/inert가 없고 PixelImage는 조각마다 이미지 alt를 반복한다. HJM의 의미·공통 lifecycle을 유지하는 구체적 후보 판단을 URL별로 보존했다.

Magic 77 컴포넌트의 보이는 Manual 구현 TSX/CSS를 모두 읽었다. 마지막 12개의 Text3DFlip은 Intl.Segmenter로 grapheme를 분리하지만 sr-only와 양쪽 문자 면 모두가 접근 가능한 텍스트로 남는다. TextAnimate는 visible segment aria-hidden과 전체 문자열을 보존한다. TypingAnimation의 Array.from은 code point이고 결합 grapheme 분리는 아니다. TweetCard의 enrichTweet HTML escaping 계약·영상 lifecycle과 VideoText XML mask escaping은 제품/의존성 경계 검증이 필요하다. WordRotate·MorphingText의 빈 배열 조건은 소스상 guard가 없다. 77개 Manual 독해는 77개 실제 화면·전수 flow 완료를 의미하지 않는다.

Blog app-landing-page부터 best-web-design-tools까지 6개 main 전체를 추가 독해했다. 첫 11개 blog의 권고를 기술 채택 근거로 그대로 사용하지 않는다. best-react-native-ui-library는 Web DOM Magic UI를 Native UI 권고에 포함하고 Firebase·Maps·starter도 함께 분류한다. best-react-ui-framework는 Fluent UI를 두 번 나열하고 CRA 권고를 포함한다. best-web-design-tools에는 본문 중 편집 지시가 남아 있다. 실제 linked 제품 화면·툴 상태·2024 수치의 현재성을 확인한 것은 아니다. Aura/Bellish의 자연·공예 분위기나 명확한 hero/CTA/pricing 구조는 제품 테마·기존 HJM 구성의 표현 후보로만 남긴다.

Blog best-web-developer-portfolios부터 cool-react-components까지 10개 main 전체를 추가 독해했다. cards-ui-design의 grid/list/masonry 목적은 기존 collection 구성을 대조하는 참고이다. carousel-user-interface는 magicui-react Carousel 설치를 안내하지만 현재 docs의 registry 경로와 다르며, 동적 fetch 예제는 schema·취소·cache·retry를 제공하지 않으므로 제품 Query 계약을 대체하지 않는다. 색 이론의 palette harmony·60/30/10은 참고 표현이며 90%/35% 성과 수치나 AAA UI 대비 표를 표준 근거로 복사하지 않는다. 이 checkpoint 뒤에는 parent 분업 요청대로 Aceternity501 main·Manual 원문 미검토를 줄인다. Magic143blog 및 raw SVG 일부·전체 시각/flow 잔여는 계속 미완료로 남긴다.

### BentoGrid 실제 키보드 CTA

URL: https://magicui.design/docs/components/bento-grid

Manual에서 desktop CTA는 opacity=0/translate-y-10이고 group-hover에서만 표시된다. 실제 1280×720 dark preview에서 첫 Learn more 링크에 focus한 뒤 Tab을 보내 다음 링크로 이동했다. activeElement는 `A`, text=Learn more, href=#, 부모 opacity=0, 위치 x=522.664/y=342이었다. 포커스된 CTA가 화면에서 보이지 않는 것을 스크린샷으로 확인했다. 키보드 상태 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함). 링크의 Enter 탐색은 실행하지 않았다. 기본/세로 bento 모든 card flow·touch/RTL/좁은 화면은 미검증이다. 기존 Grid/Card/action 슬롯에 같은 hover 표현을 채택한다면 focus-within에서도 CTA를 드러내는 조건이 필요하다.

### CodeComparison 미채택 근거

URL: https://magicui.design/docs/components/code-comparison

Manual 전체를 읽었다. Shiki 실패 catch는 원본 code를 `<pre>${beforeCode}</pre>` 또는 afterCode로 그대로 연결하고, 이후 highlighted 값을 dangerouslySetInnerHTML에 전달한다. 이 실패 경로에서 코드 입력이 HTML escape되지 않는 구현 근거가 있다. 외부 사이트에 입력 payload나 실패 유발은 실행하지 않았고 runtime exploit 완료로 보고하지 않는다. HJM [CodeBlock source](../../packages/react/src/code-block.tsx)는 token.text를 React text로 렌더하며 pre의 keyboard/LTR 계약도 유지한다. 비교 UI가 필요하면 기존 두 CodeBlock의 구성부터 시작하고 원본 fallback을 복사하지 않는다.

### HeroVideoDialog 실제 focus/Escape

URL: https://magicui.design/docs/components/hero-video-dialog

default dark preview에서 Play video에 Enter를 보내 overlay/iframe이 1개씩 생기는 것을 확인했다. activeElement는 뒤의 Play video trigger 그대로였다. 그 focus에서 Escape를 보내도 overlay/iframe이 남아 있었다. Escape 후 상태 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함). 원본 Manual은 overlay에 role=button/tabIndex=0과 keyDown을 두지만 dialog 의미·초기 focus·trap을 제공하지 않는다. overlay에 직접 focus한 뒤 Escape를 보내면 exit 후 둘 다 0으로 정리되는 것을 확인하고 agent가 연 preview를 닫았다. YouTube 재생은 시작하지 않았다. 8개 animation variant·close pointer·focus restore·반복 열기·좁은 화면은 아직 전수 검증하지 않았다. HJM Dialog와 motionOrigin/media 슬롯에 표현만 연결하는 방향을 유지한다.

## Aceternity 본문·Manual 증분 범위

수집 501 URL의 별도 상태를 같은 인덱스 additionalSites에 보존한다. 이번 B의 전체 공개 core 본문 독해 501, 부분 0, core 미독해 0이다. Manual 전체 112, 설치 안내 4, 실제 선택 화면 11·flow 5(선택 URL별 범위는 인덱스)이며 parent가 이전에 검토한 네 페이지는 중복 완료로 더하지 않는다. ai-recommendations는 마지막 checkpoint에서 동일 추출 426,340자의 전체 인간용 목록·raw JSON·Quick Reference까지 연속 독해했다. 아래 500+1 및 부분 offset 기록은 당시 진척의 역사이며 현재 미독해 수가 아니다.

URL: https://ui.aceternity.com/components/3d-card-effect

현재 본문 description·CLI·모든 CardContainer/Body/Item props, 기본과 With rotation 두 Code Usage 및 Manual TSX/util을 모두 읽었다. mouse 좌표를25로 나눈 tilt, perspective1000, fixed h-96/w-96 기본 크기, 자식 transform useEffect의 mouseEnter 의존성을 확인했다. focus·reduced·touch 제어는 local source에 없고 translate 문자열에도 px를 붙인다. 이는 실제 예외 동작 재현이 아닌 소스 판단이다. 기존 Card/semantic action 슬롯 위에 hover 깊이 표현만 검토한다. 데모 이미지·텍스트·CTA는 제품 소유이며 그대로 기본 테마로 복사하지 않는다. actual preview는 Loading 상태가 포함되어 이 페이지의 시각/flow 완료 수를 올리지 않았다.

## Aceternity: File Upload

URL: https://ui.aceternity.com/components/file-upload
독립 live preview: https://ui.aceternity.com/live-preview/file-upload-demo

본문·onChange props와 Manual 구현/util을 전부 읽었다. `useDropzone({multiple:false,noClick:true})`의 root props에 role=presentation/tabIndex=0이 붙고, 별도 display:none input은 내부 div의 mouse click으로 열린다. getInputProps는 사용하지 않는다. 전달 onChange는 새로 받은 File[]이고 내부 목록은 이전 파일에 추가한다. 업로드 통신·진행·취소·retry·accept/size 오류 상태를 제공하는 구현은 아니다.

실제 독립 preview의 light/dark 업로드 영역을 보았고, root `[role=presentation][tabindex=0]`에 Enter를 보냈다. key 입력은 완료됐지만 2초 filechooser 대기는 timeout이고 화면이 변하지 않았다. 이 특정 root 경로의 관찰이며 가능한 모든 키보드 경로를 검증한 것은 아니다. 파일 선택·전송은 실행하지 않았다. dark 선택 화면 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함).

기존 HJM UploadItem은 pending/uploading/success/error 및 product 측정 progress, uploading에서 cancel·error에서 retry를 파생하는 공통 계약을 이미 가진다. Aceternity 데모로 UploadItem을 교체하면 상태 계약을 잃는다. 필요하면 제품의 접근 가능한 file 선택 control과 UploadItem을 연결하는 구성으로 흡수하고, drop presentation은 선택 기능과 구분한다. Native picker 및 실제 전송은 제품 소유로 남긴다.

## 21st: 공개 메타데이터와 잠긴 구현 경계

URL: https://21st.dev/ 및 https://21st.dev/@kokonutd/components/button-colorful

홈 공개 본문, Colorful Button 상세의 author/library/license/dependency/Usage를 읽었다. 페이지 WebMCP는 메타데이터·설치 안내를 반환하지만 구현 본문은 반환하지 않았다. Usage.tsx는 ButtonColorful을 import/render하는 짧은 사용 예다. Component.tsx 선택은 `Component source is locked`와 로그인/Unlock UI를 보였으므로 구현 미검토를 유지한다.

초기 검은 thumbnail 이후 실제 `https://cdn.21st.dev/bundled/3.html?theme=light` iframe이 흰 배경 버튼을 렌더한 것을 구분해서 보았다. 실제 Explore Components 버튼에 Enter를 보내 focus outline을 확인했다. 화면/URL 변화는 없었다. 부모 iframe의 title은 없었다. 실제 구현 event·reduced-motion·disabled/loading 소스는 잠겨 있어 단정하지 않는다. 선택 상태 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함).

루트 AGENTS의 저장된 로그인 우선 규칙에 따라 Aside Vault로 기존 21st 로그인만 찾게 했다. 일치하는 저장 계정과 기존 21st 탭이 없다는 결과를 확인했다. 새 계정·결제·약관 수락·API-key quota 사용은 하지 않았다. 로그인 막힘은 공개 다른 원본 조사 중단 이유가 아니며, 이 사이트의 구현 전수 완료 근거도 아니다.

## Motion Primitives와 잔여

이번 추가 실행에서 Motion의 새 완료 수를 올리지 않았다. 기존 36 기본 페이지·33 구현·96 예제의 정적 조사 및 당시 선택 흐름 범위는 원 보고서 그대로다. Aceternity 기존 tabs/stateful-button/expandable-card/layout-grid 선택 동작도 이번 새 완료 수에 중복해서 넣지 않는다.

네 사이트 전체 페이지·연결 프리뷰·variant·키보드·focus·light/dark·좁은 화면·큰 글자·RTL·reduced motion은 전수 완료가 아니다. 이 문서는 다음 관찰을 계속 추가한다.

## Aceternity 3D·배경 본문 checkpoint

3D Globe·Marquee·Pin 및 add-utilities부터 background-ripple-effect까지 captured core 본문을 모두 읽었다. 숨긴 Manual·Code·Tailwind v3 탭은 자동 완료로 세지 않는다. 인덱스 URL별 scope와 pending 항목을 남겼다. 전체 본문 19/501, 부분 1, 미독해 481, Manual 5, 실제 선택 화면/flow는 여전히 FileUpload 1개이다.

- https://ui.aceternity.com/components/3d-globe: 16,833자 Manual 전체와 util/dependency를 읽었다. three/R3F/drei Canvas와 unpkg NASA texture, OrbitControls 자동회전, 마커 mouse div 및 frame별 visibility 계산은 데이터 시각화 별도 경계다. initialRotation·atmosphereBlur·markerSize 등 props의 실제 연결은 읽은 구현에서 확인되지 않았다. 모든 Code Usage와 실제 조작은 남아 있다.
- https://ui.aceternity.com/components/3d-marquee: Manual 전체와 top·Standard·Full screen 세 Usage를 따로 열어 읽었다. four slices/fixed1720 plane/infinite10·15s motion와 generic alt가 있다. Full screen은 pointer-none 배경과 overlay, focus ring 버튼을 둔다. HJM Image/AssetGroup·Grid·EffectSurface를 대체할 근거가 아니며 관성/3D 표현 후보로만 기록한다.
- https://ui.aceternity.com/components/3d-pin: Manual 전체와 Usage를 읽었다. outer anchor 안 inner anchor, hover-only 숨김, 무한 pulse 구현이다. 실제 keyboard/DOM 재현은 아직 하지 않았으며 HJM Card의 단일 링크·action 의미를 유지한다.

본문 범위의 add-utilities는 과거 motion12alpha/React19rc override 예제를 포함한다. 현재 지원성 확인 없이 dependency를 바꾸지 않는다. AnimatedModal/Testimonial/Tooltip·AppleCarousel·ASCII·Aurora·Beams/Collision·Boxes·Gradient/Animation·Lines·Ripple 모든 공개 props/CSS/예제 제목은 읽었으며 숨긴 구현과 모든 실제 화면은 별도 미검토다. 배경 계열은 HJM EffectSurface의 static/reduced/IO/document visibility 조건과 대조하는 방향을 유지한다.

## Aceternity Animated Modal 실제 상태와 39-page checkpoint

본문 core는 BentoGrid부터 DitherShader까지 20개를 추가 독해해 총 39/501, 부분 1, pending 461이다. URL마다 공개 description·CLI·모든 보이는 props/소스 snippet·예제 제목을 읽었으며 숨긴 Code/Manual/alternate tab은 따로 pending이다. CardSpotlight props 마지막 description은 원 수집본 자체가 `con`에서 끝나므로 그 이후 원문은 미확인이다. Manual은 Modal/Testimonial/Tooltip을 추가하여8개, 실제 선택 desktop/flow는2개이다.

https://ui.aceternity.com/components/animated-modal 의 Manual+전체 Usage를 읽고 실제 dark 1280×720에서 trigger Enter→Escape→Cancel Enter→unnamed close Enter 순서로 확인했다. 열기 후 focus는 배경 trigger이고 role=dialog0, body overflow hidden이다. Escape와 Cancel 후에도 내용이 남는다. Escape 상태 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함). close 버튼 Enter로 exit 후 heading0/overflow auto/activeBODY를 확인했다. Book Now·결제·예약 행동은 실행하지 않았다. HJM Dialog의 의미·초기 focus·trap·restore·Escape·scrolllock 계약을 유지하고 3D spring/blur 표현만 흡수한다.

https://ui.aceternity.com/components/animated-testimonials 의 전체 Manual+Usage는 모든 이미지, 랜덤 회전, 5s autoplay,28px 무명 arrow button, active name/quote 배열 접근을 제공한다. 빈배열·배열변경·pause/focus/reduced에 대한 실제 재현은 남아 있다. https://ui.aceternity.com/components/animated-tooltip 의 Manual+Usage는 hover-only div, mousemove RAF·name키를 사용하며 focus/tooltipARIA·unmount RAF cleanup은 없다. 이것도 소스 판단이며 아직 실제키보드 flow 완료 수를 올리지 않는다.

https://ui.aceternity.com/components/dither-shader 의 core props는 retro용 Bayer/halftone/noise/crosshatch, duotone/custom palette와 animated=false 기본을 제공한다. HJM Image에 제품/플랫폼별 정적 fallback을 가진 optional treatment로 표현을 흡수할 후보지만 Manual·실제 screenshot·image 실패·모션 검토가 남아 있어 채택 완료가 아니다. Cloud/Chromatic/Canvas 계열도 실제 GPU/lifecycle/readability 증거가 없는 상태에서 공통 기본으로 승급하지 않는다.

## Aceternity 68-page core checkpoint

DottedGlow부터 Keyboard까지 본문 core를 순서대로 읽었다(FileUpload는 기존 독해라 중복 증가 없음). 총68전체+1부분/501, core미독해432, Manual9, 실제선택2이다. 본문 완료는 현재 captured description/CLI/all visible props/snippets/all example headings 독해를 뜻하고 숨긴 구현·사용예제·전체실제검증 완료가 아니다. 각 URL의 범위를 index에 보존했다.

https://ui.aceternity.com/components/gooey-input 는 7,624자 Manual+단일Usage까지 읽었다. useId SVG/layout ID, native disabled,button type/focus ring,controlled value를 제공하지만 input이 button 내부에 있으며 placeholder 외 label이 없다. 빈 blur에서 collapse/값clear, nonempty blur 유지, Escape/닫기/search action 연결은 없다. actual 입력 flow는 아직 검증하지 않았다. HJM Search/TextField의 입력·검색·clear·error/focus 계약 위에 detached icon/width spring 표현을 흡수하는 후보로 남긴다.

Free feature/hero의 compliance/uptime/성과 카피는 예시다. Keyboard의 IO listener·사운드 및 Cloud/GitHubGlobe의 GPU 조건은 설명일 뿐 실제 검증 완료가 아니다. ImageGenerationLoader의 4s scan을 실제 업로드/생성 progress로 쓰거나 InfiniteMovingCards hover pause만으로 접근성 완료를 주장하지 않는다.

## Aceternity component core 전 페이지 독해 checkpoint

수집목록328~443의 `/components/`116 URL core본문을 전부 읽었다. 각 페이지 description/CLI/현재보이는props/CSS·util 소스/모든예제제목/보이는콘텐츠를 실제 독해한 범위다. 숨긴 Manual·Code·v3·package/provider 탭까지 읽은것은 아니며 각각 pending 상태를 유지했다. 소스가 길다고 키워드만 분류해서 완료로 세지 않았다. 전체Aceternity501분모에서는116본문전체+1부분,384미독해다. Manual9·실제선택2도 별도다.

Scales는 horizontal/vertical/diagonal과 size/color API의 정적패턴 후보다. Noise/Spotlight/Meteors/Stars/Vortex/Waves는 기존 EffectSurface의 bounded layer/static/reduced/visibility 조건과 대조한다. Notch·Sidebar·ResizableNavbar는 현재 Navigation/selection/Popover 계약을 조합하는 후보이며 branded제품 페이지를 복사하는결론이 아니다. Lens의 unused callback, MultiStep timer와 ImagesSlider autopause/keyboard claim은 문서와실제구현을 구분해 남겼다.

WebcamPixelGrid 설명/props만 읽었으며 카메라 권한 요청을 열거나 승인하지 않았다. Terminal/Keyboard 사운드도 실행하지 않았다. 필요한 interaction검증은사용자 의도와제품기능에 맞는 fixtures/정적fallback부터확인한다. TailwindButtons의 공개ButtonsCard source와 전체20이름은읽었으나 숨긴20버튼Code를 읽은것은 아니다.

## Aceternity 공개 block prose 30 URL checkpoint

Blocks catalog(9)부터 Cards category(38)까지30URL을 별도 core 독해했다. ShootingStars/SkewLines(19·20)은 batch출력 중 잘린부분을 다시 전체읽은뒤 완료처리했다. Backgrounds·Bento·Blog/TOC/검색/카드의 전체 공개설명/예제콘텐츠/모든제목을 읽었으나 Codepanel과 실제render는 pending이다. Catalog의 all-access 포함표시는 실제구매권한·잠긴source조사완료가 아니다. Aceternity 전체146core전체+1부분,354미독해/501; Manual10/actual선택2.

Scales Manual과5개UsageCode를 모두별도로열어읽었다. repeating-linear-gradient와0/90/315도,size/color의 정적표현이므로 HJMEffectSurface의 bounded staticpattern 후보로검토한다. 원본에는 decorative aria-hidden/pointer-events 없음,값clamp와nativefallback없음이므로 그대로공통채택하지않는다. 아직실제시각완료가아니다.

GooeyInput 비교를 HJM 실제공개 [SearchField](../../packages/react/src/forms.tsx)로확인했다. SearchField는 controlled/uncontrolled/nativeinput/clearLabel/loading으로입력을유지하며,clear버튼type·name·focus복구와aria-busy를제공한다. 따라서 Gooey의검색엔진복제는필요없고 기존 SearchField의독립surface/leading icon에표현만고려한다. Blog검색의fuzzy검색도제품데이터/Query/indexer를대체하지않는다.

## Aceternity Cards·Contact·CTA·Empty·FAQ·Feature prose checkpoint

수집목록39~68의30URL 공개 core를 추가 독해했다. Feature category(67)는 모든24개예제제목/현재보이는카피·모형콘텐츠·예시코드까지 읽었다. 총176core전체+1부분/501,324미독해; Manual10/actual선택2를 유지한다. Contact에는 입력·제출을하지않았으며 FAQ의환불/개인정보·Feature의SOC2/HIPAA/업무성과·더미모델라우팅문구는 실제제품근거로복사하지않는다.

CTA의 centered/masonry/split/dashed/noise/portrait 조합은 기존Grid/Card/Button/AvatarGroup 및EffectSurface 위composition slots 검토자료다. EmptyState의3paths·containedfan·portrait·dragswipe는 동일한실제create/docs/selector계약의표현차이다. FAQ의always-open3col·single-openAccordion·groupedFAQ는각semanticengine을유지하며reduced/focus/키보드/좁은화면을확인한후승급해야한다. 현재는소스Code및모든실제flow를읽거나검증하지않았으므로채택완료가아니다.

## Aceternity 186 core와 Block Code 접근 경계

수집69~78의10개Feature개별공개설명을추가독해해186core전체+1부분/501,314미독해다. Feature Motion/Tabs의hover+focus pause는문서에서읽은계약이며실제재현완료로세지않는다.

https://ui.aceternity.com/blocks/backgrounds/background-grid-with-dots 에서 Code를직접누르자 실제구현대신all-access Annual/Lifetime 구매UI가표시되었다. 이한URL의접근잠금을확인했으며다른블록이모두잠겼다고추정하지않는다. 공개설명완료와Code미독해를분리한다. 루트AGENTS에따라AsideVault에저장된Aceternity기존계정/세션을확인했다(세션 CKST4hGqrIUcPHlo). 저장된Aceternity계정이없고임시페이지도로그아웃상태였다. 임시Aside탭은닫았다. 결제/신규계정/약관수락을하지않으며권한없이잠긴코드를우회하지않는다.

## Aceternity 216 core checkpoint

79~108의30URL을추가독해했다. Feature 개별설명과Footers4variant,Hero category의26모든제목/보이는예제콘텐츠 및11개별Hero본문을읽었다. 전체216core전체+1부분/501,284미독해이며Manual10/실제선택2는그대로다. 숨긴Code및모든실제시각/상태조사는남아있다.

목적에맞는composition차이로 square-edge3panels·borderedgrid·centeredhero·media-split·masonry·hub-illustration을기록했다. Dither/mesh/noise/staticline은material표현축후보이고 Navbar/Tabs/Accordion/Field/Dialog/Progress의같은기능계약은기존HJM에남긴다. FlickeringLights의점멸, infinitecanvas의키보드/정적대체, FooterBigText의대형움직임은Source·실제reduced 검토없이는채택하지않는다.

## Aceternity 246 core checkpoint

109~138의30URL을추가독해했다. Hero나머지설명과Illustrations catalog22개의모든제목/현재보이는콘텐츠 및개별14설명을읽었다. 전체246core전체+1부분/501,254미독해; Manual10/실제선택2를유지한다. 이페이지들은OS기능/실제Chat/파일전송/meeting/presence가아닌제품설명용모형일수있으므로기존HJM상태·입력계약을이데모timer로대체하지않는다.

Folded-paper/noise·framedScales·rough-notation의종이테마표현, dither의레트로표현과SVGisometric/fan/3Dframe은한기능의material+composition 차이참고다. 필요하면decorative aria-hidden/pointer-events-none·정적/감소모션대체·안정적인텍스트및제품asset ownership을유지하는기존engine에표현만연결한다. 아직Code·실제contrast·focus·모든모션상태검증완료가아니다.

### Aceternity core 266 checkpoint

Illustrations의 Macbook icons부터 worldmap까지 8개, 로그인 catalog와 개별 form 7개, logo cloud catalog 및 앞 4개 예제까지 5개 공개 core 본문을 추가 전체 독해했다. 자동 탭/로고 교체·uptime/회의/계정 예시는 실제 상태 엔진 증거가 아니다. 로그인 화면의 social provider·terms는 제품 인증/LS 계약을 유지하고, logo marquee의 hover pause를 키보드 pause 보장으로 해석하지 않는다. 소스·Manual·실제 화면/flow 수는 이번 본문 batch로 늘리지 않았다.

### Aceternity core 306 checkpoint

Logo cloud 나머지 3개부터 navbars·pricing·shaders·sidebars·stats·team 전 catalogue와 개별 core, testimonials catalogue까지 40 URL을 추가 전체 독해했다. Navbar/Sidebar는 기존 navigation 및 disclosure, 가격/팀은 Card/Grid/Avatar/action, changelog는 Tabs/Timeline을 먼저 재사용한다. Pricing With Switch의 설명상 Starter/Basic/Pro/Enterprise와 실제 캡처 Starter/Medium/Influencer/Celebrity, Add On 설명 Growth와 preview Professional 불일치를 기록했다. 소스에서 확인하지 않은 애니메이션 정지·접근성·결제 동작을 보장하지 않는다. Manual 10·실제 flow 2는 유지한다.

### Aceternity core 326 checkpoint

Testimonials 개별 9개와 text animation catalogue/개별 5개, blog 목록·article/index 홍보 페이지와 blog 첫 3개 전체 본문/코드를 추가 읽었다. 출력이 잘린 blog 구간은 개별 semantic main 또는 전체 본문으로 다시 읽은 뒤 완료를 기록했다. Motion/GSAP 글의 shared card modal 예시는 dialog/focus/Escape 계약이 없으므로 HJM Dialog를 대체하지 않는다. Text Generate Typewriter의 음향 sprite는 읽기만 했고 다운로드·재생하지 않았다. 템플릿 글의 WCAG/Lighthouse 주장은 검증 완료가 아니며 채택 근거로 계산하지 않는다.

## 조사 후 실험 등록 제안 — 아직 등록 안 함

사용자의 2026-10-07 추가 요청으로 검토된 원본의 추가·개선·교체 후보를 인덱스 `experimentProposal`에 연결한다. Storybook 탐색 규격 §1에 따라 정확히 네 마디, 고정 단계/분류 어휘, 16자 이하 한글 항목으로 제안한다. 같은 기능의 원본 변형은 별도 엔진·항목을 복제하지 않고 동일 항목의 스토리로 흡수한다. 기본·어두운 테마·큰 글자는 필수이고 동작 줄이기·RTL 및 입력/진행/실패 상태는 실제 역할에 맞춰 추가한다. 부모가 기존 제목 충돌·지원 플랫폼·사용 지침과 최종 등록을 확인한다.

Magic Manual 77 URL을 빠짐 없이 매핑했다. 이 중 74 URL은 27개 기존 API 표현/구성 그룹으로, Pointer·SmoothCursor·TweetCard 3개는 원본 엔진 불채택 근거를 남겼다. 숫자는 실험 27개 구현 완료가 아니며 현재 비교 가능한 공개 API를 재사용하는 등록 제안이다. Aceternity와 이후 미독해 페이지의 매핑은 이어서 추가한다.

| 제안 경로 | 기존 API | 원본 변형 수 |
| --- | --- | ---: |
| 실험/구성/비교와 검증/기기 액자 비교 | Asset, AspectRatio, Image | 3 |
| 실험/구성/정보 표시/항목 연결선 | Grid, Card, EffectSurface | 1 |
| 실험/구성/비교와 검증/진행 표시 비교 | Progress | 1 |
| 실험/구성/비교와 검증/글자 표현 비교 | Text, ContentTransition | 18 |
| 실험/토큰/표면과 움직임/반복 무늬 | EffectSurface | 8 |
| 실험/구성/정보 표시/알림 진입 표현 | NotificationItem, List, ContentTransition | 1 |
| 실험/구성/비교와 검증/테마 전환 비교 | DesignSystemProvider | 1 |
| 실험/구성/정보 표시/사람 묶음 표시 | AvatarGroup | 1 |
| 실험/구성/비교와 검증/표면 빛 표현 | Card, EffectSurface | 6 |
| 실험/구성/정보 표시/기능 카드 묶음 | Grid, Card, Button, Link | 1 |
| 실험/컴포넌트/시각 효과/내용 진입 표현 | ContentTransition | 1 |
| 실험/구성/정보 표시/코드 전후 비교 | CodeBlock, Grid | 1 |
| 실험/구성/직접 조작과 모션/완료 순간 축하 | Celebration, Button | 2 |
| 실험/구성/비교와 검증/탐색 크기 비교 | BottomNavigation, Sidebar | 1 |
| 실험/구성/정보 표시/지역과 위치 표시 | Card, Tooltip | 2 |
| 실험/구성/정보 표시/파일 계층 탐색 | Tree | 1 |
| 실험/토큰/표면과 움직임/입자와 빛 | EffectSurface | 8 |
| 실험/구성/정보 표시/영상 미리보기 | Dialog, Asset, Button | 1 |
| 실험/구성/정보 표시/아이콘 공간 배치 | Asset, Grid, Button | 2 |
| 실험/구성/비교와 검증/누름 표현 비교 | Button | 6 |
| 실험/구성/정보 표시/이미지 확대 비교 | Image, Dialog | 1 |
| 실험/구성/정보 표시/흐르는 소개 목록 | List, Card, ContentTransition | 2 |
| 실험/구성/정보 표시/수치 변화 표현 | Statistic, ContentTransition | 1 |
| 실험/구성/정보 표시/이미지 조각 진입 | GridReveal, Image | 1 |
| 실험/구성/비교와 검증/가장자리 흐림 | ProgressiveBlur | 1 |
| 실험/구성/정보 표시/읽기 진행 표시 | ScrollProgress | 1 |
| 실험/구성/정보 표시/명령 기록 표시 | CodeBlock, ContentTransition | 1 |

### Aceternity core 376 checkpoint

Blog 마지막 두 글·Brand Facts·Card 홍보 FAQ와 category index 두 URL/44 상세를 추가 읽었다. Category 공통 navigation/footer를 제외한 핵심 heading/filter/모든 이름·설명·유료 label/Coming Soon을 실제 출력해 읽었으며 URL 유사성으로 생략하지 않았다. Category 목록은 새 후보·실험을 만드는 근거로 중복 계산하지 않는다. Brand Facts의 200+/100+/30+ 및 가격·사용자 수와 블로그의 166/17/120,000+ 등은 원문별 주장이고 현재 검증 수로 사용하지 않는다.

### Aceternity core 431 checkpoint

Category 상세 나머지 54개와 Components 전체 catalog를 실제 본문으로 추가 읽었다. Special/Card/Features 등 긴 목록도 이름·설명 전체를 읽었으며 별칭 URL을 유사하다고 생략하지 않았다. Changelog의 긴 출력은 중간이 잘려 완료에 올리지 않았고 다음 독해로 남겼다. 현재 Manual 10·실제 선택 flow 2이며 캡처된 501 URL의 core 미독해 69, AI recommendations 부분 1이다.

### Aceternity 후보 매핑과 core 447 checkpoint

Components 116 URL 전체를 매핑했다. 111 URL은 32개 역할별 기존 API 표현/구성 그룹, 설치/utility 네 개와 Following Pointer는 비등록/불채택 근거를 기록했다. Manual 10개 이외는 public-body-only로 숨겨진 소스와 실제 상태를 확인했다고 주장하지 않는다. 기존 항목의 스토리로 변형을 합치기 우선이다.

Affiliate·비교/guide·설치·Labs 일곱 URL·Pro 라이선스까지 16개 core를 추가 읽었다. Labs 개별 6개는 모두 Loading playground로 구현·실제화면/flow 미확인이다. 설치의 legacy-peer-deps를 실행하거나 정책에 채택하지 않았다. `/licence`의 Pro Item 재배포/marketplace 파생 제한과 무료 OSS 계약은 구분한다. 후보는 기존 HJM 엔진에 아이디어를 흡수하는 제안이며 원본 복사가 아니다.

| 제안 경로 | 기존 API | 원본 변형 수 |
| --- | --- | ---: |
| 실험/구성/비교와 검증/카드 깊이 비교 | Card, EffectSurface | 9 |
| 실험/구성/정보 표시/지역과 위치 표시 | Card, Tooltip | 3 |
| 실험/구성/정보 표시/흐르는 소개 목록 | List, Card, ContentTransition | 2 |
| 실험/구성/정보 표시/목적지 카드 강조 | Card, Link | 1 |
| 실험/구성/직접 조작과 모션/카드 상세 연결 | Card, Dialog, ContentTransition | 3 |
| 실험/구성/정보 표시/고객 후기 탐색 | Carousel, Card, Avatar | 5 |
| 실험/구성/정보 표시/대상 설명과 미리보기 | Tooltip, Popover, Link | 3 |
| 실험/구성/비교와 검증/이미지 표현 비교 | Image, Asset, EffectSurface | 5 |
| 실험/토큰/표면과 움직임/입자와 빛 | EffectSurface | 25 |
| 실험/토큰/표면과 움직임/반복 무늬 | EffectSurface | 2 |
| 실험/구성/정보 표시/기능 카드 묶음 | Grid, Card, Button, Link | 4 |
| 실험/구성/비교와 검증/글자 표현 비교 | Text, ContentTransition | 14 |
| 실험/구성/정보 표시/이미지 전후 비교 | ImageComparison | 1 |
| 실험/구성/정보 표시/문구 뒤 강조 | Text, EffectSurface | 1 |
| 실험/구성/직접 조작과 모션/스크롤 장면 비교 | Affix, ScrollProgress, ContentTransition, Image | 7 |
| 실험/구성/직접 조작과 모션/카드 위치 조작 | Card, Button | 1 |
| 실험/구성/입력과 작성/파일 선택과 복구 | FilePicker, UploadItem | 1 |
| 실험/구성/비교와 검증/탐색 크기 비교 | BottomNavigation, Sidebar, Menu, Layout | 6 |
| 실험/구성/입력과 작성/펼쳐 쓰는 검색 | SearchField | 1 |
| 실험/구성/정보 표시/생성 이미지 진행 | Progress, GridReveal, Image | 1 |
| 실험/구성/정보 표시/미리보기 묶음 | AvatarGroup, Image | 1 |
| 실험/구성/정보 표시/입력 기기 모형 | Asset, Button | 1 |
| 실험/구성/정보 표시/이미지 확대 비교 | Image, Dialog | 1 |
| 실험/구성/피드백과 복구/대기 단계와 진행 | Spinner, Progress, Steps | 2 |
| 실험/구성/비교와 검증/누름 표현 비교 | Button | 3 |
| 실험/구성/입력과 작성/입력 전환과 유지 | TextField, Form | 1 |
| 실험/화면/계정/가입 정보 입력 | Form, AuthScreenLayout | 1 |
| 실험/구성/정보 표시/상단 고정 안내 | Notice, Affix | 1 |
| 실험/구성/비교와 검증/선택 표시 비교 | Tabs | 1 |
| 실험/구성/정보 표시/명령 기록 표시 | CodeBlock, ContentTransition | 2 |
| 실험/구성/정보 표시/날짜별 변화 기록 | Timeline, Tabs | 1 |
| 실험/구성/비교와 검증/카메라 화면 표현 | Asset, PermissionScreen | 1 |

### Aceternity core 466 checkpoint

Templates 목록과 17개 개별 판매 소개 및 Terms의 공개 본문 전체를 URL별로 읽었다. 반복되는 Features라도 개별 출력해 읽었고 내용이 같다는 이유로 완료 처리하지 않았다. Design/Development Studio와 Productized Agency는 heading Next16과 문단 Next15가 다르며 버전 현재성을 단정하지 않는다. 이 템플릿들은 `실험/화면/소개/서비스 목적별 소개` 한 항목의 목적별 변형 후보로 연결했으나 실제 linked preview/유료 코드/전체 페이지 상태는 미검토다. Startup의 Cal.com 예약은 설명만 읽고 실제 예약하지 않았다.

### Aceternity core 471 checkpoint

Changelog 날짜 목록과 44,731자 core를 세 겹침 구간으로 끝까지 읽었다. Privacy·Refunds·Sponsor·Box Shadow Generator의 공개 본문/FAQ/26 preset 이름·편집 control label도 전체 읽었다. Box Shadow는 `실험/토큰/편집 도구/그림자 편집` 후보로 매핑했지만 실제 CSS 값·키보드·복사·여러 layer 흐름은 아직 미검토다. Changelog의 2026-07-15 Next16 전수 업그레이드 선언을 개별 판매 페이지 Next15와 독립 기록하고 현재 source stack을 확인한 것으로 세지 않는다.

### Aceternity core 478 checkpoint

Home와 Tailwind/Motion·Background·Bento·AI SaaS·Motion·Minimal 일곱 aggregate 페이지의 전체 core/FAQ/related를 읽었다(반복 사이트 후기/YouTube/footer는 공통 promotion으로 범위 제외). Bento와 AI의 첫 문구 6개와 실제7개 목록 차이를 기록했다. AI SaaS FAQ는 실제 모델 chat API를 포함하지 않는다고 명시하므로 화면 mock을 기능 구현으로 등록하지 않는다. Minimal의 type/spacing 제한은 기존 토큰/제품 팔레트에서 표현하며 원본 고정 px·0.97 scale 등을 새 기본값으로 복사하지 않는다.

### Aceternity core 484 checkpoint

Contact·CTA·FAQ·Feature·Footer·Hero aggregate 여섯 페이지의 모든 개별 요약/가이드/FAQ/related를 읽었다. Hero22→실제26, Feature22→실제24, CTA6→실제7 차이를 기록했다. 원문의 SEO·보안·conversion·모든 모션이 transform-only라는 주장을 실제 구현 검증이나 HJM 새 정책으로 승격하지 않는다. linked block별 후보와 중복 등록하지 않는다.

### Aceternity core 500 + 1부분 checkpoint

남은 aggregate/Explore/Pages/Showcase/가격 페이지 16 URL을 모두 공개 core 본문으로 읽었다. 현재 캡처 501 URL 중 **500 전체 core, AI recommendations 한 URL 부분 독해**다. 공통 후기·YouTube·footer는 반복 promotion으로 범위를 명시해 제외하며 본문 전체라는 표현을 전체 DOM·숨겨진 코드·모든 UI 상태 완료로 쓰지 않는다. Manual 구현은 10 URL, 실제 선택 flow는 2 URL 그대로다.

Login의 제공자별 로딩 권고는 포트폴리오 LS의 카드 중앙 단일 로딩과 다르므로 LS를 유지한다. Navbar의 모든 키보드 지원 주장, pricing/marketing의 성과·SEO 문구는 실제 코드/동작 검증이 아니다. 가격표의 Annual은 yearly인데 머리말은 one-time이라 원문 불일치를 기록했다. Pricing6→7, Testimonial7→9, Logo6→7 차이도 남겼다. 외부 Showcase 36개 사이트와 Pro Show more 확장은 아직 조사하지 않았다.

Meeting Notes·SaaS Pages는 각각 9·8 section 목록/공유 브랜드/설치/FAQ를 끝까지 읽고 기존 `실험/화면/소개/서비스 목적별 소개`에 목적별 변형 후보로 매핑했다. 유료 source·live preview·모든 상태가 미확인이므로 실제 화면 등록 완료로 표시하지 않는다.

### Aceternity Blocks 180와 Labs 6 후보 매핑

개별 Blocks 180 URL 전부에 제안 경로·기존 API·표현/구성 범위·선행 조건을 기록했다. Category 22 URL은 중복 등록에서 제외했다. Labs 6개는 Loading playground와 짧은 설명만 있으므로 아이디어 후보로 매핑하고 소스·시각·flow 미확인을 유지한다. 각 URL의 원본 설명과 개별 판단은 index에 있고 아래 묶음은 실험을 새 엔진 180개로 복제하라는 뜻이 아니다. 기존/다른 사이트와 같은 경로는 해당 항목의 변형 스토리로 먼저 합친다. 가입·로그인은 LS pending 정책을 지키며 chat/파일/uptime/device illustration은 실제 업무·OS 상태 엔진으로 등록하지 않는다.

| 제안 경로 | Blocks 변형 수 | URL별 범위 |
| --- | ---: | --- |
| 실험/구성/비교와 검증/글자 표현 비교 | 4 | index source 번호 209, 210, 211, 212 |
| 실험/구성/비교와 검증/기기 액자 비교 | 4 | index source 번호 134, 135, 138, 139 |
| 실험/구성/비교와 검증/이미지 표현 비교 | 1 | index source 번호 131 |
| 실험/구성/비교와 검증/카드 깊이 비교 | 6 | index source 번호 39, 40, 42, 126, 136, 143 |
| 실험/구성/비교와 검증/탐색 크기 비교 | 10 | index source 번호 163, 164, 165, 166, 167, 168, 169, 184, 185, 186 |
| 실험/구성/선택과 필터/범위 선택 표현 | 1 | index source 번호 142 |
| 실험/구성/정보 표시/고객 후기 탐색 | 9 | index source 번호 199, 200, 201, 202, 203, 204, 205, 206, 207 |
| 실험/구성/정보 표시/기능 카드 묶음 | 28 | index source 번호 23, 24, 25, 26, 27, 28, 29, 68, 69, 70, 71, 72, 73, 74, 76, 77, 78, 79, 81, 82, 83, 84, 86, 88, 89, 90, 91, 133 |
| 실험/구성/정보 표시/날짜별 변화 기록 | 1 | index source 번호 188 |
| 실험/구성/정보 표시/마무리 행동 | 7 | index source 번호 49, 50, 51, 52, 53, 54, 55 |
| 실험/구성/정보 표시/명령 기록 표시 | 1 | index source 번호 75 |
| 실험/구성/정보 표시/수치 변화 표현 | 3 | index source 번호 189, 190, 191 |
| 실험/구성/정보 표시/입력 기기 모형 | 1 | index source 번호 137 |
| 실험/구성/정보 표시/지역과 위치 표시 | 1 | index source 번호 146 |
| 실험/구성/정보 표시/질문 답변 | 5 | index source 번호 63, 64, 65, 66, 80 |
| 실험/구성/정보 표시/팀 소개 | 4 | index source 번호 194, 195, 196, 197 |
| 실험/구성/정보 표시/항목 연결선 | 1 | index source 번호 125 |
| 실험/구성/정보 표시/협업 상태 모형 | 8 | index source 번호 127, 128, 130, 132, 140, 141, 144, 145 |
| 실험/구성/정보 표시/흐르는 소개 목록 | 7 | index source 번호 155, 156, 157, 158, 159, 160, 161 |
| 실험/구성/직접 조작과 모션/스크롤 장면 비교 | 2 | index source 번호 85, 87 |
| 실험/구성/직접 조작과 모션/카드 상세 연결 | 1 | index source 번호 41 |
| 실험/구성/직접 조작과 모션/카드 위치 조작 | 2 | index source 번호 129, 193 |
| 실험/구성/탐색과 이동/하단 링크 묶음 | 4 | index source 번호 93, 94, 95, 96 |
| 실험/구성/피드백과 복구/첫 사용 선택 | 5 | index source 번호 57, 58, 59, 60, 61 |
| 실험/토큰/표면과 움직임/반복 무늬 | 7 | index source 번호 11, 13, 14, 15, 18, 20, 21 |
| 실험/토큰/표면과 움직임/입자와 빛 | 7 | index source 번호 12, 17, 19, 179, 180, 181, 182 |
| 실험/화면/검색/글 목록과 검색 | 4 | index source 번호 34, 35, 36, 37 |
| 실험/화면/계정/가입 정보 입력 | 1 | index source 번호 152 |
| 실험/화면/계정/로그인 영역 표현 | 5 | index source 번호 148, 149, 150, 151, 153 |
| 실험/화면/소개/서비스 목적별 소개 | 27 | index source 번호 16, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123 |
| 실험/화면/소개/요금제 비교 | 7 | index source 번호 171, 172, 173, 174, 175, 176, 177 |
| 실험/화면/소통/문의 작성 | 4 | index source 번호 44, 45, 46, 47 |
| 실험/화면/콘텐츠/글과 목차 | 2 | index source 번호 31, 32 |

이 표는 조사 후 root 등록을 위한 제안이며 Storybook 등록·승격·npm 게시 완료가 아니다. 각 항목은 Default/Dark/LargeText와 해당 입력·motion·RTL·실패/복구 상태, 같은 변경의 사용 지침, 기존 제목/공개 API 확인을 요구한다. 원본 Pro source 재배포를 하지 않고 기존 HJM 엔진에 역할·표현 아이디어를 흡수한다.

공개 API 대응표를 다시 대조해 범위 입력 후보는 실제 `Slider`, 다중행 입력은 실제 `TextArea` 이름으로 매핑했다. `pnpm docs:check`는 577 Markdown 문서의 링크 검사 통과이며 컴포넌트 동작·CI·Storybook 등록 증거로 쓰지 않는다.

### Aceternity Manual 13 · 실제 시각 5 checkpoint

Aurora Background·Background Beams·Background Beams With Collision 세 페이지의 Manual TSX/utils·모든 현재 설정과 각각 한 Usage 예제를 전체 읽었다. Aurora는 Tailwind v4 CSS와 v3 config까지 각각 열어 확인했다. Dark desktop preview도 세 페이지에서 실제 보고 시각 확인은 5 URL로 늘렸지만 선택 flow는 FileUpload·Modal 2 그대로다. 각 배경의 full loop/hidden/offscreen/reduced/native/모바일 상태는 미확인이다.

Aurora는 `main`+100vh wrapper와 literal 색, background-position 무한 이동을 가지므로 토큰 배경으로 그대로 복사하지 않는다. Beams는 인덱스/상수 SVG ID와 render Math.random, 무한 gradient를 가지며 waitlist input은 placeholder-only/type=text이고 제출도 없다. Collision은 beam별50ms geometry polling과 미정리2000ms 두 timeout, 고정 X 위치, 무한 repeat를 가진다. 전부 현재 HJM EffectSurface의 static default/seed/aria-hidden/pointer-none/reduced/offscreen/hidden/cleanup 기준을 유지해 표현만 흡수할 후보이며 원본 엔진을 채택할 근거가 아니다. Source 부재 주장은 읽은 구현 파일 안의 범위이고 사이트 전체 CSS를 확인한 것은 아니다.

### Aceternity Manual 16 · 실제 시각 7 checkpoint

Background Boxes·Background Gradient·Background Gradient Animation의 Manual/단일 Usage를 전부 읽었고 Gradient Animation은 v4/v3 설정을 각각 열었다. 두 Gradient dark preview 실제 시각 확인을 더해 시각7·선택flow2이며 Boxes hover/전체 시각은 아직 미확인이다. Boxes source는150×100 motion cells와3,750SVG를 생성할 구조지만 이 수치는 실제 DOM/성능 실측이 아니다. Boxes 페이지에서는 stale AX와 input timeout이 있었고 fresh AX가 Code 전환을 확인했으므로 무작정 같은 클릭을 재시도하지 않았다.

Gradient는 animate=false가 있지만 기본 true의 두 무한 layer와 literal palette를 복사하지 않는다. Gradient Animation은 mount에서 body CSS 변수10개를 전역 변경하고 props 갱신/cleanup이 없어서 앱별·인스턴스별 테마 분리가 깨질 수 있다. 원본 source의 firstColor triplet가 rgba 없이 gradient에 들어가며 **실제 dark DOM의 첫 layer backgroundImage=none**도 확인했다. 나머지 네 색 layer와 pointer layer는 유효한 radial gradient이고 pointer-events는 여섯 layer 모두 auto였다. HJM scoped EffectSurface/static/고유ID/토큰/cleanup을 유지한 표현만 후보이다.

Gradient Animation dark 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함). 이 화면은 전체 loop·실제 pointer·Safari fallback·reduced/offscreen/hidden·복수 인스턴스 검증 완료를 뜻하지 않는다.

### Aceternity Manual 18 · 실제 시각 9 · 선택 flow 3

Background Lines Manual18,816자를 겹침 구간으로 끝까지 읽고 Usage/실제 dark 화면을 확인했다. 원본은 무한 path 두 묶음/render random delays이고 wrapper relative·SVG pointer-none·aria-hidden이 없으므로 HJM의 scoped decorative/lifecycle 기준으로 흡수한다.

Background Ripple Effect Manual/CSS/Usage 전체와 실제216개 cell의 클릭 반응을 확인했다. 실제 cell59 클릭 후 중심 delay0/duration200ms, 인접58/60 delay55/duration280ms, cell0 delay296.184/duration630.813ms가 CSS에 적용됐다. sampled DOM은 DIV/role=null/tabIndex=-1이고 source에 키보드 handler가 없다. 이는 pointer 반응 한 흐름이며 키보드·reduced·빠른 반복·offscreen·parameter 경계 전체 검증이 아니다. 기능 입력 엔진이 아니라 선택 가능한 장식 효과 후보로 기존 EffectSurface bounded cost/정적대안을 지킨다.

### AI catalog의 source501 밖 링크 확인

부분 독해 AI catalog에서 추출한332개 exact Aceternity URL 중 source501에 없는12개를 독립 read-only GET으로 확인했으며 **12개 모두HTTP404, redirect 없음**이었다. 해당 route는3d-card/cover/globe/glowing-stars/grid/input/label/lamp/moving-line/parallax-scroll-2/shooting-stars/stars-background다. 원본 crawler/source는 수정하지 않았고 결과를 index의 additionalDiscoveredUrls에 별도로 기록했다. HTTP 상태 확인은 본문/소스/시각/flow 독해를 늘리지 않는다. 카탈로그 installation 이름과 유효한 docs URL이 항상 같다는 가정을 쓰지 않으며501은 성공 캡처 분모다.

### Magic UI core 115 checkpoint

create-next-js-app·create-nextjs-app·create-react-component-library 세 blog의 semantic main과 모든 code/FAQ를 끝까지 읽었다. 첫 긴 batch가 잘렸으므로 앞/뒤 겹침으로 재독해한 후 완료에 올렸다. Magic 전체본문115·부분2·미독해140이며 Manual77·실제4는 그대로다. Card/Shimmer/Bento는 이미 개별 후보 항목이 있어 tutorial마다 중복 등록하지 않는다. 프레임워크 채택률·성과·배포 문구는 원사이트 주장이고 setup/install/publish 명령은 실행하지 않았다. Component library 글의 code block에는 escaped closing markup이 섞여 있어 검증된 build/Storybook recipe가 아니며 HJM의 기존 규격·공개API·사용 지침·release 계약을 유지한다.

### Magic UI core 117 checkpoint

Creating Next JS와 Creative Landing Page의 main을 끝까지 읽었다. 후자는46,715자를 세 겹침 구간으로 나눠45개 브랜드 예시·6개 요소·8단계·주의 사례 전체를 읽었다. 외부45사이트 실제 방문/이미지/flow를 확인한 것은 아니므로 article-summary-only로 남겼다. 고정CTA·조용한 소개·자료가 많은 행사·미디어 중심 소개 등은 기존 `서비스 목적별 소개` 화면의 역할별 변형 후보로 연결하며 브랜드마다 새 엔진/실험45개를 만들지 않는다. 원문의 headline 길이·페이지 단어수·성과 수치는 HJM 토큰·정책 근거가 아니다. 현재 Magic117전체+2부분,138blog 미독해이며 Manual77/실제4는 그대로다.

### Magic UI core 118 checkpoint

CSS Animation on Scroll blog main22,331자와 Observer/CSS/AnimatedSection/구성 snippet·FAQ 전체를 두 겹침 구간으로 읽었다. Existing ContentTransition의 내용 진입 표현 후보에 연결했다. 샘플은 IO 부재 fallback이 없고 기본opacity0이어서 실패시 내용이 숨을 수 있으며, inline options dependency로 observer가 반복 재설정될 수 있다. Prose는 reduced를 권고하지만 샘플 CSS에는 그 fallback이 없다. `@magiclabs/ui` 설치와 BlurIn/ShinyCard import는 검증한 현재 Magic registry API가 아니어서 실행·채택하지 않는다. 성과 수치는 검증 근거가 아니다. 현재118전체+2부분/137미독해·Manual77/실제4.

후속 API 이름 대조: 토큰 편집의 `foundations.elevation`은 컴포넌트 API가 아니라 existingTokenPaths로 분리했고, 테마 공급자 실제 export는 Web `HjmProvider`·Native `HjmNativeProvider`로 기록했다. 제안63경로의4마디·항목16자 제한 검사 통과. 이는 실제 Storybook 등록·사용 지침·모든 플랫폼 지원 검증을 대신하지 않는다.

### Magic UI core 128 · 10개 batch checkpoint

Blog source 번호28~37의 semantic main·모든 code/table/FAQ를 전체 읽었다. 10개 원문을 각각 확보한 뒤 겹침 구간으로 읽었으며, 첫 출력에서 잘린28말미/29앞부분도 다시 읽어 완료에 반영했다. 현재128전체+2부분/127미독해이며 Manual77·실제 시각4·선택flow4는 그대로다. 설치·샘플 실행·외부 예시 사이트 방문은 하지 않았다.

- css-buttons-hover/framer-motion-react: 기존 `누름 표현 비교`에 합친다. Hover-only sample과 draggable div의 키보드·비활성·reduced 동작은 prose 권장과 실제 구현을 구분한다. 별도 Button/drag 엔진을 복사하지 않는다.
- css-loader-animation/css-loading-animation: 기존 `대기 단계와 진행` 구성에 Spinner/Skeleton/Progress/Steps 변형을 합친다. Source timeout은 cleanup·오류·복구가 없고 width-fill은 실제 진행률이 아니다. 순환 fade를 reduced의 충분한 정적 대안으로 가정하지 않는다.
- cta-design: 7요소·21원칙·6브랜드 예시를 읽었다. 배치 조언끼리 충돌하므로 기존 `서비스 목적별 소개`의 주 행동 역할부터 정한다. 항상solid/83%성과/긴급성을 토큰·정책으로 고정하지 않는다.
- dashboard-design-ui: 기존 [대시보드 지침](../../packages/design-contracts/docs/usage/screens/dashboard.md)은 활동요약·히트맵·목록이며 차트·비교·목표가 없다고 명시한다. `실험/화면/콘텐츠/지표 요약과 탐색`은 역할별 요약→기간 선택→정확한 raw-data 탐색의 다른 목적 후보다. 공개 Statistic/DataTable/DateRangePicker/Sheet/ScreenLayout을 사용하며 없는 DashboardScreen·Chart API를 제안하지 않는다.
- disable-textarea-resize: `실험/구성/입력과 작성/여러 줄 높이 비교`에 기존 TextArea/Form/MessageComposer를 비교한다. [현재 TextArea 지침](../../packages/design-contracts/docs/usage/components/text-area.md)은 입력에 따라 자란다고 적지만 Web forms.tsx는 scrollHeight 처리 없고 multiline CSS에는 field-sizing:content가 없다. Native는 minVisibleLines가 있을 때만 contentHeight로 자란다. 이는 **정적 문서/구현 대조이며 runtime 결함 재현은 아직 아니다**. 전역resize:none, 픽셀고정, 제출 즉시 영구비활성 sample은 채택하지 않는다.
- drop-down-menu-in-js/dropdown-in-react-js: `실험/구성/선택과 필터/목록 선택 비교`로 Menu·Select·NativeSelect·Combobox·CheckboxGroup·TransferList 역할을 나눈다. Tutorial은 internally-selected를 controlled라 부르고 clickable li와 키보드 설명이 분리됐으며 request cancellation/stale/error/retry 코드가 없다. 기존 상태·접근성 엔진을 그대로 사용한다.
- faq-template: 10원칙·10외부브랜드 설명을 읽었다. 기존 `질문 답변` 구성에 Accordion/SearchField/Tabs/EmptyState의 분류·검색·문의대안 변형으로 연결한다. 외부 사이트 실제 화면·SEO 효과는 검증하지 않았다.

이번 batch는 신규 엔진 10개가 아니라 기존 역할 후보에 연결하며, 후보 경로는 두 사이트 합계 **66개**다(이전63에 목적이 다른 지표탐색·여러줄높이·목록선택3개 추가). 실제 실험 등록은 여전히0/미완이고 root가 조사 이후 같은 변경에서 사용지침·양 플랫폼 예제·상태를 검토해 등록한다. 모든10URL별 출처·독해/시각/flow 상태·후보 경로는 index에 보존했다.

### Magic UI core 138 · 다음10개 batch

Blog38~47 전체 main·모든 visible code/table/FAQ·promotion을 읽었다. Testimonials는 긴 원문을 겹침 구간으로 끝까지 읽었다. 현재138전체+2부분/117미독해·Manual77·실제 시각4/선택flow4이며 고유후보66개 그대로다. 모든URL별 notes/proposal에 정확한 출처와 남은 범위를 보존했다.

Hero/landing 작성·설계4글은 `서비스 목적별 소개`, drop-down tutorial은 `목록 선택 비교`, HTML nav는 `탐색 크기 비교`, testimonials는 `고객 후기 탐색`, performance animation은 `내용 진입 표현`의 기존그룹에 흡수한다. FreeReact21library/techstack 선택2글은 UI역할 추가가 없는 정보글로 비등록 사유를 기록했다.

코드 수준에서는 hero DockIcon이 span만 있고 실제 목적지 동작이 없으며, dropdown React sample은 focus/Escape/ARIA 구현이 prose와 분리됐다. HTML nav의 CSS-hover-only submenu·클릭하는 i hamburger·전역ul CSS·href#·literal768/z1000은 HJM 계약/토큰으로 복사하지 않는다. 사진필수/8단어헤드라인/5단어CTA/30fps/성과수치도 원사이트 조언과 실제 검증 근거를 구분한다. Testimonials는 정적quote·video·case-study·후기카드의 표시 변형이며 실제 후기서비스·수집·이메일·게시를 실행한 것이 아니다. 외부브랜드/도구사이트·이미지·flow는 미확인이다.

### Magic UI core 148 · 다음10개 batch

Blog48~57의 main 전체·code/table/FAQ를 읽었다(긴 원문은 겹침 구간으로 끝까지). 현재148전체+2부분/107미독해·Manual77·실제시각4/flow4, 후보고유67개다. 출처URL/메모/실험연결/정보글 비등록 판단을 각각 index에 보존했다.

Conversion/interactive 글은 서비스목적별소개, animation은 내용진입, artbackground는 입자와빛/제품자산 경계, image는 이미지표현비교에 합친다. Framework교육·setup·일반hosting/CDN/performance4글은 별도UI역할이 없는 정보글로 남겼다. Tutorial install/config는 실행하지 않았고 v4설명과 구버전init/directives 예시 혼합은 검증된 설치방법으로 채택하지 않는다. Source성과·이미지예산·브라우저지원·통계는 HJM토큰/quality threshold 근거가 아니다.

Infinite Scroll의 새 후보 `실험/구성/탐색과 이동/계속 읽기와 복구`는 **기존 LoadMore**의 requestKey 중복억제·automatic/manual/error/complete와 List/VirtualList/Pagination을 실제 API별로 비교한다. [VirtualList 지침](../../packages/design-contracts/docs/usage/components/virtual-list.md)과 [LoadMore 지침](../../packages/design-contracts/docs/usage/components/load-more.md)을 전체 읽어 고정행 높이·Native VirtualList 끝도달callback 부재·manual 또는 제품FlatList 연결 경계를 확인했다. Footertrap을 막는 제한적자동→수동전환과 오류후행유지/재시도/끝표시를 검토하며 같은scroll/observer/query 엔진은 추가하지 않는다. 데이터cursor·취소·돌아왔을때 위치복구는 제품소유다. 실제 source infinite flow는 미확인이다.

### Magic UI core 158 · 다음10개 batch

Blog58~67의 semantic main·모든 code/table/FAQ·promotion을 전체 읽었다. 긴 CTA/copy/template/sections를 겹침 구간으로 끝까지 읽고 URL별 notes를 index에 남겼다. 현재158전체+2부분/97미독해·Manual77·실제시각4/flow4, 후보고유67개 그대로다. 설치·외부43브랜드 화면·전환 성과·실제 form 흐름을 확인한 수치는 아니다.

Tailwind setup2개와 Mantine/Chakra 비교는 별도UI역할 없는 정보글로 비등록이다. 나머지7개는 `서비스 목적별 소개`의 역할·section 순서·primary action 변형에 흡수한다. 13개section을 모든화면 필수로 만들거나43개브랜드마다 새엔진을 추가하지 않는다. Button class/padding/font 직접override는 공개HJM Button/profile으로 대체하고 product copy·가격·증언·데이터·동의·실제 urgency를 예제에서 정책으로 고정하지 않는다. Headline10단어·color psychology·conversion통계·premium품질 주장은 검증된HJM 기준이 아니다. CLI setup/version/backend/analytics/heatmap 명령을 실행하지 않았다.

출처: [Tailwind React](https://magicui.design/blog/install-tailwind-react), [Tailwind 설치](https://magicui.design/blog/installing-tailwind-css), [인터랙티브 소개](https://magicui.design/blog/interactive-landing-page), [주 행동](https://magicui.design/blog/landing-page-call-to-action), [소개 문구](https://magicui.design/blog/landing-page-copywriting), [템플릿 선택](https://magicui.design/blog/landing-page-design-templates), [43개 소개 예시](https://magicui.design/blog/landing-page-examples), [13개 영역](https://magicui.design/blog/landing-page-sections), [소개 UI](https://magicui.design/blog/landing-page-ui), [라이브러리 비교](https://magicui.design/blog/mantine-vs-chakra).

### Magic UI core 168 · 다음10개 batch

Blog68~77 main·모든code/table/FAQ를 전체 읽었다. 현재168전체+2부분/87미독해·Manual77·실제시각4/flow4, 후보67경로 그대로다. MUI대안·MUIReact·Joy비교·Box·MUI소개5개는 정보글 비등록. Card는 기능카드묶음, Table은 지표요약과탐색, transition은 내용진입, navbar2개는 탐색크기비교 기존그룹으로 연결했다. 각 URL·기존API·기대상태·미확인 범위는 index에 보존했다.

실제본문에는 @material-ui/core 설치와 @mui/system/sx/legacy ReactDOM.render 혼합, 존재검증하지않은 generic Transition/`@magicui/react`/`magic-ui-react` import, 클릭div와 뒤FAQ의 button 접근성 권장 불일치가 있다. Library가 알아서 responsive/accessibility/native parity를 보장한다는 주장으로 HJM검증을 대체하지 않는다. Table의 semantic rowheader와 숫자정렬은 참고하지만 정렬·필터·가상화는 prose만 있고 실행예제는 basic이다. 고정픽셀/색/전역스타일은 HJM token으로 바꾸며 실제router/상태복구/키보드/모션·큰글자 검증은 남았다. 원문 설치나 외부사이트를 실행하지 않았다.

### Magic UI core 178 · 다음10개 batch

Blog78~87의 semantic main·모든code/table/FAQ·promotion을 끝까지 읽었다. 현재178전체+2부분/77미독해, Manual77·실제시각4/flow4·후보67경로는 그대로다. Nav→탐색크기비교, 12개Next템플릿→서비스목적별소개 기존후보에 합쳤다. Next프레임워크/구조7글과 1줄placeholder1글은 정보·미제공 콘텐츠로 비등록이다.

[Next Tailwind 글](https://magicui.design/blog/next-js-tailwind)은19min 가이드라는머리말 뒤에 `Next.js and Tailwind are working!` 한문장만 있어, **캡처본문 전체독해**와 실제가이드확보를 구분했다. 다른원문은 generic package/import·캐시·SSR보장·라우팅버전·TSaliasunderscore·성능 통계의 미검증 상태를 각각 index에 기록했다. Next라우팅/권한/세션/data/cache/deploy는 제품소유이며 HJM컴포넌트교체나 CI·설치·게시를 실행한 것이 아니다. 12개외부템플릿 live/유료source 및 실제navigation state는 미확인이다.

### Magic UI core 188 · 다음10개 batch

Blog88~97의 main·모든code/table/FAQ를 끝까지 읽었다. 현재188전체+2부분/67미독해, Manual77·실제시각4/flow4·후보67경로 그대로다. Portfolio/template3글→서비스목적별소개, Pricing21브랜드→요금제비교, Reactanimation13역할→내용진입 및 이미연결된기존효과 구성에 묶었다. Framework/코딩권장5글은 별도UI역할 없는 정보글 비등록. Index에 URL별 범위·후보·미확인·비등록 이유를 보존했다.

가격 비교는 audience/product Tabs, 기간전환, 사용량 Slider/input, 확대 featurecomparison과 FAQ의 역할로 나누고 실제가격계산·결제·환불·증언은 제품이 공급한다. 외부21개 pricing사이트 실제가입/결제를 검증한 것은 아니다. Animation글의 [Source]/[Percentage] 빈통계, SSR이면JS없이animation가능하다는설명, Bootstrap3/5 혼합·전체접근성보장, React권장35제목/34본문 차이도 실제source판단으로 기록했다. 원문제안 라이브러리·CDN·설치·배포는 실행하지 않았다.


## Magic blog 98–107 본문 독해 checkpoint

수집257개 중 본문 전체198·부분2·미독해57. 홈페이지와 blog 첫107개까지 실제 semantic main 전체를 읽었다. Manual77·실제 화면4·선택 flow4는 그대로이며, 전수 완료·실험 등록 완료가 아니다. URL별 전체 독해 범위와 현재 판정을 인덱스에 보존했다.

- React design patterns/frameworks는 정보성 가이드다. HOC props/ref 미전달, container/fetch placeholder, 온도 render-prop의 입력 문자열 `value+273.15` 결합, React16.8을 최신으로 부르는 문장, Router 항목의 virtualization 혼합 등을 그대로 규격으로 채택하지 않는다.
- header/navbar/navigation은 기존 `실험/구성/비교와 검증/탐색 크기 비교`, hero/React landing21개는 `실험/화면/소개/서비스 목적별 소개`에 연결한다. JSX의 고정 색·글꼴·spacing, action 없는 CTA, 설명만 있는 mobile overlay와 keyboard/focus 계약을 기존 HJM 탐색/화면 규격으로 보완한다. 외부21개 live/source는 미검토다.
- infinite-scroll은 `실험/구성/탐색과 이동/계속 읽기와 복구`에 합친다. 본문 전체에 실제 observer/hook 구현은 없고 설명·비교·FAQ다. 기존 LoadMore requestKey·manual fallback·오류 중 행 유지·complete/empty 상태, VirtualList 고정 행/Native endpoint 제한을 유지하고 cursor/query/cancel/back-position은 제품이 소유한다.
- file-upload는 `실험/구성/입력과 작성/파일 선택과 복구`에 합친다. FilePicker의 accepted/rejected와 UploadItem의 `progress: 0..1|null`을 재사용한다. 원본 sample의 라벨 없는 file input·role/value 없는 progress div·완성되지 않은 ProgressUploader·취소/늦은 응답/preview 정리가 없는 조각을 복사하지 않는다. 실제 전송 바이트와 서버 확정 성공은 구분하며 chunk/transport는 제품 소유다. FilePicker·UploadItem·선택과 오류 복구 usage 전체를 대조했다.
- form-validation은 `실험/구성/입력과 작성/입력 전환과 유지`에 연결한다. custom hook은 상태 초기화까지만, RHF는 오류 표시 없이 register까지만, Formik sample은 라벨·password 판정 없는 조각이다. HJM Form/Field/TextField의 첫 오류 초점·중복 제출·진행·실패 계약을 유지하고 검증 schema와 요청은 제품이 갖는다. 가이드의 일반화된 library API/성능 주장으로 새 엔진을 만들지 않는다.

Form 사용 지침을 다시 읽은 현재 시점에는 Native에 대한 오래된 ‘밖에서 제출 불가/내장 버튼 숨김 불가’ 문단과 아래의 `FormHandle.submit()`/`actions={null}` 지침이 함께 있어 문서 내부 모순을 root에 전달했다. B는 실제 Native 재현이나 공용 문서 수정을 하지 않았다. 후보 경로는 기존67개 그대로이며 모두 조사 후 root 등록 대기다.


## Magic blog 108–117 본문 독해 checkpoint

257수집 페이지 중 본문 전체208·부분2·미독해47. 홈페이지와 blog 첫117개까지 전체 semantic main을 실제 읽었다. Manual77·실제 화면4·선택 flow4는 바뀌지 않았다. 전수 완료나 실험 등록 완료가 아니다. 모든 source별 범위·불채택 사유·경로는 인덱스에 남겼다.

React libraries24/Native libraries21/beginner projects7/tips/UX19는 기존 역할을 설명하는 정보성 자료다. Router의 virtualization 혼합, Web Magic을 Native 라이브러리로 추천하는 문장, Lottie는 항상 성능 영향 없다는 주장, tips 제목15개와 실제6개·중복4/5, client const의 API key 권고를 HJM 규격으로 가져오지 않는다. native module·camera·Firebase·라우팅·스토리지·알림 권한은 제품 소유이며 설치·native build를 하지 않았다.

Portfolio19개·responsive template7개·SaaS practices7개는 기존 `실험/화면/소개/서비스 목적별 소개`에서 audience/section/media/dark 표현을 비교한다. 외부 live19개·marketplace/template/source·라이선스는 미검토다. framework 비교 글의 shiny-button JSX는 기존 버튼 표현 경로에 합치며 새 스타일 엔진을 만들지 않는다. 브랜드500만 선언하고600을 쓰는 snippet, ∞회전 장식·fixed높이·type/reduced/pending 미구현을 그대로 채택하지 않는다.

Search input with icon은 `실험/구성/입력과 작성/펼쳐 쓰는 검색`에 합쳤다. SearchField usage 전체와 대조했다. 원본 앞 문장은 icon이면 label 불필요라고 하지만 뒤 문장은 label 필수라 하고, 최종 ‘production-ready’ TSX에는 앞 예제의 label도 접근성 이름도 빠져 있다. Enter 제출 설명에도 form은 없으며 clear 설명은 `setQuery('')`만 있어 `onSearchChange` 반영이 없다. HJM의 필수 접근성 이름·clearLabel·입력 유지·loading/busy·제품 query/cancel 계약을 재사용한다. fixed left/width를 RTL·token 규격으로 채택하지 않는다. 후보67경로는 그대로이며 실제 등록은 root 대기다.


## Magic blog 118–127 본문 독해 checkpoint

257수집 페이지 중 본문 전체218·부분2·미독해37. 홈페이지와 blog 첫127개까지 전체 semantic main을 실제 읽었다. Manual77·실제 화면4·선택 flow4는 그대로다. source 수집·독해·실제 검증·등록 완료를 분리한다.

Semantic/MUI·shadcn·Tailwind component library·CDN은 정보성 설명으로 기록했다. Material Design과 MUI package 혼합, shadcn은 외부 의존성이 없다는 문장과 Radix/CLI dependency 설명의 모순, script 설치 후 link를 찾으라는 CDN 검증 설명, 현재지원/성능/접근성 보증은 그대로 채택하지 않는다. generic dialog JSX는 설명만 있으며 위험행동의 confirm/cancel 흐름을 구현하지 않는다. 새 framework나 per-app 복제 엔진은 없다.

sidebar는 기존 탐색 크기 비교에 연결한다. 실제 sidebar/Escape/focus-trap/useBreakpoint는 구현 코드 없이 설명까지만이며 mobile modal과 desktop persistent navigation의 초점 범위를 구분해야 한다. aria-hidden만으로 숨긴 focusable을 제거했다고 판단하지 않는다. social-proof41개는 기존 고객 후기 탐색으로 합친다. 실제 제품의 quote·media·판매/stock/count 데이터와 permission을 가져와야 하며 fixture를 운영 사회적 증거처럼 표시하지 않는다. 이 글이 예시로 설명하는 Amazon/Airbnb/Yelp/LinkedIn을 방문했다고 세지 않는다. startup11요소/7brand는 기존 목적별 소개로 합치고 광고·CRM·동의·외부 form transport를 HJM에 넣지 않는다.

radius tutorial은 기존 누름 표현/프로필 geometry 비교 안에서 Button/Card의 rounded/md/full/none을 비교할 후보로 연결했다. 새 반경 숫자나 hover 전용 engine을 만들지 않는다. 버튼 guide는 기존 Button 동작·진행·disabled·token 규격을 유지하고 config의 escaped/underscore glob과 ‘Cancel=destructive’ 일반화를 채택하지 않는다. Grid tutorial은 column snippet `grid-col-3`와 설명 `grid-cols-3`의 차이를 기록하고 기존 기능 카드 묶음/Grid/Card로 합친다. DOM 순서·큰 글자·좁은 폭을 실제로 검증하기 전 완료로 세지 않는다. 후보67경로 그대로, 모두 root 등록 대기다.


## Magic blog 128–137 본문 독해 checkpoint

257수집 페이지 중 본문 전체228·부분2·미독해27. 홈페이지 및 blog 첫137개까지 실제 semantic main 전체를 읽었다. Manual77·실제 화면4·선택 flow4는 그대로다. 전수 완료·실험 등록 완료가 아니다. URL별 범위와 조건은 인덱스에 보존했다.

설치/React/template12/free12/theme/dark/font/landing12/landing-template/portfolio12 글을 모두 읽었다. 버전 경계 없이 Tailwind4 언급과 init/PostCSS/@tailwind 설정을 함께 쓰는 설치 조각, placeholder href·mobile menu 부재, 외부 provider 비용/라이선스/현재 지원/시장 점유/전환 수치는 실행하거나 검증한 사실이 아니다. 136글은 featuresData.js를 만들라고 하지만 실제 data code는 보이지 않는 범위로 기록했다. 템플릿 링크를 열거나 12개씩의 실제 화면을 검사했다고 세지 않는다. 소개·기능 카드·테마 전환의 기존 경로로 합치며 새 엔진을 만들지 않는다.

Dark guide의 hex값 CSS 변수를 hsl(var(...))에 넣는 코드 조합은 맞지 않는다. 이 판단은 소스 독해이며 실제 브라우저 재현이 아니다. Provider는 light 초기값, 별도 script는 dark 추가만 하고 saved/system 초기화·저장 실패·system 변경·다중 provider 정리를 하나의 흐름으로 구현하지 않는다. 전역300ms transition에는 감소 모션 guard도 없다. 기존 `실험/구성/비교와 검증/테마 전환 비교`에서 HjmProvider/HjmNativeProvider controlled theme를 재사용하고 persistence는 제품이 갖는다. 폰트의10px xxs나 fixed h-screen은 HJM 큰 글자 검증 없이 token으로 넣지 않는다. 모든 후보67경로는 조사 후 root 등록 대기다.


## Magic blog 138–147 본문 독해 checkpoint

257수집 페이지 중 본문 전체238·부분2·미독해17. 홈페이지와 blog 첫147개 전체를 실제 읽었다. Manual77·실제 화면4·선택flow4는 그대로다. 글자15표현은 기존 글자 표현 비교, card의product/content/profile 역할은 기존 기능 카드 묶음, 모션은 기존 내용 진입 표현, 로딩은 기존 대기 단계와 진행으로 합쳤다. generic framework9/library15/Tailwind–Bootstrap/TS–JS/React framework 비교는 정보성으로 기록했다. 별도 library/컴파일러를 설치하지 않았다.

text-loading-bar는 실제로는 Loading60%/Processing75% rendered markup·타이머 JS·React interface 설명뿐이며 완성 React TSX는 없다. 앞의 width transition과 뒤 scaleX 권고가 다르고 blend-mode difference의 대비 보장 주장은 검증되지 않았다. Progress usage 전체와 대조해 label/value/max/valueText, 불확정 value 생략, 실제 처리량만 표시하는 기존 계약을 유지한다. 글자 예제는 h1의무한360도 회전과 미검증 magicui FadeIn/Typewriter import를 복사하지 않는다.

새68번째 후보 `실험/구성/선택과 필터/날짜와 시각 선택`은 DatePicker·Select·Section·Stack·Text·Button·Notice와 배포 시간 선택 구성을 합쳐 비교한다. DatePicker와 시간 선택 usage 전체를 대조했다. 원본141은 DatePickerProps외에달력/time/keyboard 구현이 설명뿐이며 opacity/pointer-events-none은 키보드 비활성 보장이 아니다. 기존 ISO날짜와 시·분 controlled값, 달 이동 시 선택 유지, 진행 잠금·실패 값 보존·재시도를 재사용한다. 민간 날짜·예약 시간대·DST·로캘·서버 규칙은 제품 소유이며 DateTimePicker 새 엔진이나 date library를 넣지 않는다. 실제 이 구성의화면/동작은 아직 미검증, root 등록 대기다.

TypeScript글의 `100 * "2"`를1002/NaN이라 설명하는 오류, typecheck와 transpile성능 혼합, magic-ui-cli·AnimatedGrid설치 조각은 HJM 근거로채택하지 않는다. 해당 값의브라우저 재현/공식compiler지원/외부 framework 성능은 이번 source독해 범위에없다. 모든 source별 판단은 인덱스에 남겼다.


## Magic blog 148–157 본문 독해 checkpoint

257수집 페이지 중 본문 전체248·부분2·미독해7. 홈페이지 및 blog 첫157개전체를실제읽었다. Manual77·실제시각4·선택flow4는변경없다.68고유후보경로는그대로이며전수완료/실험등록완료아니다.

패턴·theme·hierarchy·waitlist·animation-tools·webapp·bestpractices·trend15·animation15·footer7/22/6/13의모든보이는본문과코드를읽었다. 기능카드/테마전환/목적별소개/내용진입/하단링크의기존경로로합쳤다. theme는정의상색이외상태·동작까지설명하지만실제예제는두색Card와주석useState뿐이다. retro/pixel/Memphis/neon/glass/skeuomorph/gradient/duotone목록은기존profile/EffectSurface/Text 표현 후보로연결하며새토큰/엔진구현근거로세지않는다. theme의neverpureblack·UIkit항상unstyled 주장은공유규격으로가져오지않는다.

Footer는기존 `실험/구성/탐색과 이동/하단 링크 묶음`에합쳤다. footer7유형/22요소/6지침/13브랜드를읽은것이며13실제외부화면을검토했다는뜻이아니다. NoFooter가능문장과모든사이트footer필수문장이함께있으며copyright/약관/쿠키문구가법적준수증거는아니다. 실제linkgroup·법률문구·contact/newsletter전송·권한은제품이갖는다. waitlist3브랜드도소개본문뿐이며타이머/stock/가짜후기·CRM·메시지를자동도입하지않는다.

성능/SEO/시장/행동숫자와Magic의접근성·반응형보장은source주장이다. Animation-tools제목10개에실제본문은Magic중심이고, webapp에는편집지시문이남아있으며trend마지막번호5·security설명만있는구간을기록했다. 원문브랜드mascot사실/성능을독립검증하지않았다. HJM은기존semantic/input/focus/lifecycle계약을유지하고analytics/auth/server/cache/deploy는제품규격소유다.


## Magic blog 공개 main 본문 1단계 완료 — 158–164 checkpoint

수집257개 중 본문전체255·부분2·미독해0. homepage1+blog164개는모든캡처semanticmain본문을실제읽었다. docs90전체+2부분은기존범위그대로다. **사이트전수검토완료가아니다.** 숨은MCP/provider tabs·Manual외부원본·모든예제·실제시각과상호작용은남았다. Manual77·실제시각4·선택flow4·68고유후보경로는그대로다. 홈페이지/blog의수집과실제독해를구분해미독해분모를없앴다.

마지막header25·logo50·resource7·UIcomponents·componentlibrary·mobilefirst·Next설명의전체본문과보이는코드를읽었다. Header는탐색크기비교,logo는이미지표현비교, mobilefirst는기능카드묶음으로합치고 나머지generic정보는별도UI역할없음으로기록했다. logo50/헤더25/resource7외부URL을방문하거나실제자산을검토했다고세지않는다. 제품logo/권리/문구/media는제품소유이며공유Asset/Image의이름·배치·dark/large 상태계약으로보여준다.

Mobilefirst본문은sidebar가모바일에서하단으로이동한다고하지만CSS는display:none이고, JSX BentoGridItem은기존검토BentoCard API와다르다. 작은폭에서필요한내용을없애거나물리margin-left·고정10px/768/1024를HJMtoken에넣지않는다. Next의next export/pages API버전·analytics outofbox/자동번역/자동확장·UIkit를framework대안으로드는설명은현재지원/실제동작근거가아니다. Storybook도componentlibrary자체와혼합돼있다. 모든글의sourceclaim와채택판단/미확인은URL별인덱스에보존했다.

## 후속 checkpoint: Magic 수집 본문 257/257

https://magicui.design/docs/components/animated-beam 의 79,105자와 https://magicui.design/docs/components/dock 의 24,530자를 겹치는 구간으로 끝까지 다시 읽었다. 설치 활성 CLI, raw SVG geometry, 모든 보이는 예제 TSX, Usage·Props·Credits를 포함한다. 이전 255전체+2부분은 이 checkpoint로 257전체+0부분이 됐다. 비활성 MCP/provider 설치 탭, premium 구현·preview와 실제 모든 상태는 미완료여서 allReviewComplete=false를 유지한다. Manual77·실제 화면4·선택 흐름4는 늘리지 않았다.

AnimatedBeam Multiple Outputs는 user를 왼쪽·OpenAI를 중앙·출력 서비스들을 오른쪽에 놓지만 fromRef는 오른쪽 출력→중앙, 중앙→왼쪽 user이며 reverse가 없다. 소스의 방향 설정과 제목의 의미를 실제로 확인할 조건이며, 시각 오류를 재현했다고 주장하지 않는다. Default·uni/bidirectional·multiple inputs/outputs의 고정 높이·overflow-hidden, 이름 없는 노드와 의미 전달·텍스트 확대·RTL·정지 표현은 실험/구성/정보 표시/항목 연결선에서 기존 Grid/Card/EffectSurface와 대조한다.

Dock 기본은 이름 있는 Link/Tooltip이지만 href=#이다. custom direction/magnification·Usage의 bare 아이콘 자체에는 실제 탐색 동작이 없으므로 기존 BottomNavigation/Sidebar의 행동·선택·포커스를 재사용한다(실험/구성/비교와 검증/탐색 크기 비교). 두 문서의 WhatsApp SVG는 자신의 defs에 없는 linearGradient1780을 참조하는 path 뒤에 올바른 b-gradient path도 덧그린다. 따라서 원시 참조 부재만으로 실제 아이콘 누락을 주장하지 않는다. b/a 및 GoogleDocs의 고정 path/mask/filter ID도 여러 예제 인스턴스에서 충돌할 가능성을 가진 소스 관찰이며 실제 재현은 남았다. 제품 소유 브랜드 자산을 사용하고 HJM Asset/Image 계약을 유지한다.

## Magic 설치 숨은 탭: 실행 없이 독해

https://magicui.design/docs/mcp 의 Manual 탭을 실제 열어 mcpServers.magicuidesign-mcp의 command=npx, args=[-y,@magicuidesign/mcp@latest]와 IDE 재시작 안내를 읽었다. CLI Cursor/Windsurf/Claude/Cline/Roo-Cline × pnpm/npm/yarn/bun의 20조합을 실제 선택하고 각 선택 상태·보이는 명령을 읽었다. pnpm dlx, npx, yarn, bunx --bun @magicuidesign/cli@latest install {IDE}이며 설치는 실행하지 않았다. 명령 독해를 MCP 구현 소스나 생성 결과 검증으로 계산하지 않는다. 컴포넌트 Manual77·화면4·흐름4는 그대로다.

https://magicui.design/docs/installation 의 init/add 두 블록 × 네 패키지 명령 8개도 실제 선택해 읽었다. 선택이 두 블록에 같이 적용된다. shadcn@latest init 및 add @magicui/globe, 로컬 @/components/ui/globe import 구조다. Blog가 제안했던 magicui 패키지 일괄 import를 채택하지 않는 기존 판단을 뒷받침하지만 버전 고정·설치 성공·호환성의 증거는 아니다. 프로젝트·IDE·패키지 설정을 바꾸지 않았다. 나머지 컴포넌트 provider 설치 탭, 실제 모든 예제 및 premium preview/source는 별도 미완료다.

## Aceternity Manual 후속: 24페이지

다음 여섯 URL의 Manual TSX/CSS/셰이더 원문 전체를 실제 탭에서 열어 읽었다. 공개 core500전체+1부분, 실제 시각9·선택flow3은 그대로다. 원문 독해로 예외 입력 실행·실제 동작 검증 수를 늘리지 않는다. HJM Card/Carousel/Text/Grid/ContentTransition/EffectSurface 사용 지침 전체와 대조했다.

| URL | 실제 읽은 구현과 기존 API 기준 | 실험 경로 |
| --- | --- | --- |
| https://ui.aceternity.com/components/bento-grid | grid1→3열·md18rem 고정행, div제목·본문·hover translate-x. HJM Grid의 minColumnWidth·row-major와 Card media/title/body/actions·headingLevel을 유지한다. 기존 Grid가 임의 bento span을 지원한다고 주장하지 않는다 | 실험/구성/정보 표시/기능 카드 묶음 |
| https://ui.aceternity.com/components/canvas-reveal-effect | GLSL3·uniform 준비·useFrame 전체. speed.toFixed(1),6color/10opacity배열, memo uniforms누락, resolution=size*2·maxFps60. 소스 자체 reduced/offscreen/hidden guard 없음; EffectSurface lifecycle/fallback을 유지하고 Three엔진복제 안 함 | 실험/토큰/표면과 움직임/입자와 빛 |
| https://ui.aceternity.com/components/canvas-text | font/dimension ResizeObserver·rootclass MutationObserver·DPR·fillText·매RAF·unmount취소. lineGap0의 무한 loop bound·duration0 비유한 phase는 실행하지 않은 소스 경로다. 정적 semantic Text/Heading·locale줄바꿈을 유지하고 장식은 숨김/모션감소/가시성 조건을 갖춰야 한다 | 실험/구성/비교와 검증/글자 표현 비교 |
| https://ui.aceternity.com/components/card-hover-effect | anchor+mouse hoveredIndex, 고정 layoutId·지연exit·hardcodedh4. 포커스동등성/다중instance 실제 미검증. HJM Card에 없는 onClick/onPress를 추가한 것으로 안내하지 않고 Link/Button 행동을 유지 | 실험/구성/비교와 검증/카드 깊이 비교 |
| https://ui.aceternity.com/components/card-spotlight | pointer-none mousemask·hover때Canvasmount·props가내부handler덮음; CanvasReveal 셰이더 중복 원문도 읽음. 내용은 항상 읽히고 EffectSurface 장식은 정지·fallback을 유지 | 실험/구성/비교와 검증/카드 깊이 비교 |
| https://ui.aceternity.com/components/card-stack | module-global interval·5초회전·빈배열non-nullpop·초기items복사·0값을무시하는||·고정카드높이. HJM Carousel은 currentKey·명시라벨·이전/다음과 선택autoplay 정지/재개를 소유하므로 timer복제 대신 content-sizedCard와 재사용 | 실험/구성/정보 표시/고객 후기 탐색 |

CardStack 다중 instance 정리·빈 입력, Canvas 계열 잘못된 배열/0입력·uniform갱신·줄바꿈·local theme 변경은 소스의 확인 필요 조건이며 재현 완료가 아니다. 기존 Carousel의 단일 active panel과 접근 가능한 컨트롤을 겹친 카드 자동회전으로 대체하지 않는다. CanvasText의 canvas role=img/aria-label을 semantic Text·Heading과 동등하다고 보지 않는다. EffectSurface는 현재 mesh/glow/grain/noise 네 layer만 공개하며 shader/pattern 동등성이나 Native canvas 동등성은 아직 없다. 새로운 고유 경로를 추가하지 않았고 기존68후보에 URL별 구체적 판단을 보강했다.

## Aceternity Manual 후속: 27페이지

https://ui.aceternity.com/components/cards-free 는 Manual의 util·Tailwindv4CSS·v3config를 모두 읽고 Code 세 개를 실제 열어 Feature Block Animated Card(rawSVG포함)·Background Overlays·Author Card 원문 전체를 읽었다. 전역 .circle-N animation은 infinite이며 effect가 stop을 반환하지 않고, GIF/author카드의 cursor-pointer div에는 실제 행동이 없다. Card/이미지·제품브랜드자산·Link/Button 행동 계약을 유지한다. CSS move5초 및 render-random장식은 모션감소·숨김·정지 기준을 갖추기 전에는 복사하지 않는다(기존 실험/구성/정보 표시/기능 카드 묶음).

https://ui.aceternity.com/components/carousel Manual6,798자를 전체 읽었다. 내부index순환, 클릭만 있는li, ul직접자식div,70vmin고정크기,모든슬라이드항상RAF/eager이미지,이미지onLoad의opacity1,없는headingID를aria-labelledby참조,inner버튼행동없음을 확인했다. 예외 입력을 실행하거나 실제 화면 결함을 재현한 결과는 아니다. Tablerimport를설치명령이누락하고 force/legacy-peer-deps를권하는문구도 현재HJM설치근거가 아니다. HJM Carousel의 stableid/라벨/수동선택/단일activepanel을 재사용하며 여러 항목을 동시에 보는 strip은 별도 명시구성 검토조건이다(기존 실험/구성/정보 표시/고객 후기 탐색).

https://ui.aceternity.com/components/chromatic-image Manual10,844자 WebGL/GLSL과 fallback전체를 읽었다. on-demandRAF·DPR상한2·정상cleanupGPU자원삭제·실제imgalt/aria-hiddenCanvas는 참고 가능하다. 초기reducedMotion만읽고설정변경·offscreen/hidden/contextlost는없다. 초기셰이더실패시정리이전return,disposed미검사onerror,hex만받는backgroundparse는 소스의 확인 조건이다. 기존 Image/Asset의의미·읽기·실패fallback을 보존하고 이미지표현비교의 선택적장식으로만 연결했다. NativeWebGL동등성을주장하지않는다. 공개core500+1부분·실제시각9·flow3과68경로는 그대로다.

## Aceternity Manual 후속: 32페이지

다음5개 숨은 Manual의 TSX/GLSL/설정원문 전체를 실제 열어 읽었다. 공개core500전체+1부분/실제시각9/flow3/후보68경로는 유지한다.

| URL | 실제 source 독해와 기존 API 대조 | 경로 |
| --- | --- | --- |
| https://ui.aceternity.com/components/cloud-shader | GLSL·cleanup전체11,034자. Count1~6/DPR2/paramsRef갱신은있지만 reducedMotion초기값·time0상태에서도 매프레임RAF/draw, hidden/offscreen/contextloss처리없음. 기존 EffectSurface scoped lifecycle/fallback대조 | 실험/토큰/표면과 움직임/입자와 빛 |
| https://ui.aceternity.com/components/code-block | CodeBlock·dependencies·override15.0.0 전체. 이름없는아이콘복사·clipboard거부미처리·timeout정리없음·tabs있으면복사버튼없음·index축소정합성미처리. HJM CodeBlock의원문검증/선택·ClipboardButton오류응답·기존Tabs를재사용 | 실험/구성/정보 표시/명령 기록 표시 |
| https://ui.aceternity.com/components/colourful-text | splitUTF16·5초count키remount·randomsortpalette·글자별지연/blur전체. 타이머cleanup은있고 local모션감소/숨김은없음. semanticText/Heading·localegrapheme/테마대비 조건 유지 | 실험/구성/비교와 검증/글자 표현 비교 |
| https://ui.aceternity.com/components/comet-card | mouse좌표spring·17.5도/20px·hover1.05scale/z50·pointer-noneglare전체. 0크기나fine-pointer/focus/touch/reduced가드없음은소스조건이며실제오류재현아님. 기존Card내용/행동·profile연결 유지 | 실험/구성/비교와 검증/카드 깊이 비교 |
| https://ui.aceternity.com/components/compare | Compare+SparklesCore전체19,392자. 내부percent·마우스/터치·16msautoplay·전체particle설정까지독해. keyboard/sliderrole/handle이름없음·autoplay켜면touchhandler차단·0duration미검증. 현재배포ImageComparison1.14의controlledvalue·Slider키보드/adjustable·제품이미지라벨을그대로재사용 | 실험/구성/정보 표시/이미지 전후 비교 |

Cloud의정상GPUcleanup을초기compile/link실패의cleanup보장으로해석하지않는다. Compare의fpsLimit120/density1200/push4는설정독해이고실제입자수/성능계측이아니며 외부엔진의기본가시성정지를부재로단정하지않는다. HJM CodeBlock 사용지침도전체읽었으며 highlighter·clipboard엔진을추가하는대신제품tokens가원문과일치하고copyAction이실패를알리도록기존계약을유지한다. 기존배포ImageComparison을새실험컴포넌트로중복등록할근거는없고출처/표현비교만후보로연결한다.

## Aceternity Manual 후속: 36페이지

https://ui.aceternity.com/components/container-cover 의 Cover/Beam/CircleIcon 및SparklesCore전체18,279자까지읽었다. ref.current효과의크기측정은resize/font갱신을감시하지않고, hovered키로children을remount하며±30px를0.2초주기로반복한다. ReactNode입력의초안/포커스소실가능성은실제재현이아니다. 정적semanticText와배경장식을분리하고HJMlifecycle을유지한다(실험/구성/정보 표시/문구 뒤 강조).

https://ui.aceternity.com/components/container-scroll-animation 전체Manual은scroll20도→0/scale·768px창분기·titleY-100,60/80rem영역과30/40rem고정card의overflowhidden이다. Card에넘긴translate는읽지않는다. 모션감소·큰글자·실제스크롤/가시성조건은남았으며 HJM ScrollProgress/ContentTransition/Affix합성만으로동일3Dscene을지원한다고말하지않는다(실험/구성/직접 조작과 모션/스크롤 장면 비교).

https://ui.aceternity.com/components/container-text-flip 전체Manual은3초interval,word변경때scrollWidth+30,UTF16split/blur·p아래div다. utils/cn import와실제설치안내lib/utils가다르다. 빈배열의undefined.split경로·글자확대/prop바뀔때너비측정은실행하지않은확인조건이다. 기존TextTransition/ContentTransition semantic단일내용을유지한다(실험/구성/비교와 검증/글자 표현 비교).

https://ui.aceternity.com/components/direction-aware-hover 전체Manual은rect방향계산·물리방향20px이동·genericimagealt·hover전childrenopacity0이다. localfocus/touch/reduced동등성없음·대화형children의보이지않는focus가능성은실제검증미완이다. 핵심본문은항상보이게하고Card/Link/Button/Image계약을유지한다(실험/구성/비교와 검증/카드 깊이 비교). 공개core500+1부분/실제9/flow3·기존68경로는동일하다.

## Aceternity Manual 후속: 41페이지

| URL | 원문 전체 독해와 기존 API 기준 |
| --- | --- |
| https://ui.aceternity.com/components/dither-shader | Manual15,220자전체. 이름과달리Canvas2D CPU픽셀처리이며WebGL아님. 4패턴/4색모드/fit·오프스크린처리·CORS/cleanup읽음. newSrc와비교하지않고complete이미지cache를다시쓰는경로·grid0/빈palette·고정접근성라벨·정적원본실패fallback없음은소스조건. Image/Asset읽기/실패계약과기존이미지표현비교 연결 |
| https://ui.aceternity.com/components/dotted-glow-background | Canvasdot·CSSvar/rootclass/style/systemdark·DPR2·IO를읽었다. IO밖에서는그리기만생략하며RAF유지, ResizeObserver는dot재생성을하지않음·gap0반복bound미검증. EffectSurface장식의pointer/AX/lifecycle/밀도상한 유지 |
| https://ui.aceternity.com/components/draggable-card | viewport절반drag경계·tilt·bodycursor변경·endnumberanimate전체. animate결과가카드위치에연결되는onUpdate없음; 실제관성효과증거아님. 정렬/drop/keyboard엔진이아닌장식카드이며기존Card행동계약·입력/본문보존 |
| https://ui.aceternity.com/components/encrypted-text | InViewonce·완료RAF/cleanup·문자charset·원문aria-label·scramble자식전체. UTF16분리·반복시ref만갱신되는flip·모션감소/숨김 조건은실제미검증. 암호화기능아닌표현이고semanticText/글자표현비교 유지 |
| https://ui.aceternity.com/components/evervault-card | 1500random문자매mousemove·250pxmask·pointer-none·hover표현전체. 장식문단aria-hidden이없어보조기기noise가능성미검증. 정적Text/Card·bounded/seededEffectSurface와대조, 보안/암호화기능으로해석하지않음 |

위소스입력예외는실행하지않았다. Dither의끝부분에나오는bare export DitherShader 문법도컴파일성공으로간주하지않는다. 공개core500전체+1부분·실제9/flow3·후보68경로는변하지않았고다섯경로의구체적근거를같은URL인덱스기존proposal에보강했다.

## Aceternity Manual 후속: 46페이지

FlipWords(https://ui.aceternity.com/components/flip-words) 전체Manual에서 cleanup없는timeout·indexOf기반다음문구·exit/enter복사·UTF16분리를읽었다. HJM TextTransition 사용지침전체와대조했으며 기존API는state문자열전환만제공하고timer/배열/자동순환은제공하지않는다. 단일/빈/중복words가멈추거나실패할가능성은소스조건이고실제로실행하지않았다. 홍보문구순환은정지·읽기시간·정적대체·locale줄바꿈이별도필요하다.

FloatingDock(https://ui.aceternity.com/components/floating-dock) 전체Manual과HJM BottomNavigation지침전체를대조했다. desktop40→80pxspring·pageX/viewport좌표·hover때만title, mobile40pxlinks/toggle의이름·expanded/Escape/focus처리부족은소스관찰이다. HJM의router확정selectedKey·이름·disabled·safearea·keyboard·aria-current·52px이상항목·profilefloating/capsule을재사용하며 새Dock엔진을만들지않는다.

FloatingNavbar(https://ui.aceternity.com/components/floating-navbar) 전체Manual은스크롤위5%에서숨김/위로움직일때표시이고opacity0/y-100에도links는mounted다. mobile은이름을숨기며icon이선택사항, Login은hardcoded행동없는button이다. FocusCards(https://ui.aceternity.com/components/focus-cards) 전체Manual은hover에따른blur·시각titleopacity0이며이미지alt는항상title이다. 이를실제keyboard결함재현이나선택엔진으로계산하지않는다. 기존탐색/카드/이미지의의미·필수내용과본문높이를유지한다.

FollowingPointer(https://ui.aceternity.com/components/following-pointer) 전체Manual은mount때rect·현재scroll좌표·cursor:none·pointer-nonebubble·randomcolor와default고유명사다. 제목ReactNode와cursorgeometry의읽기/가시성·fine-pointer·resize/scroll은실제미검증이다. 제품기본cursor나필수설명을숨기지않고단순장식만옵션으로검토한다. 공개core500+1부분·실제9/flow3·기존68경로는유지하며이번5개후보도인덱스기존경로에합쳤다.

## Floating Dock 실제 데스크톱 키보드 선택 흐름

URL: https://ui.aceternity.com/components/floating-dock

IAB1280×720 dark preview에서7링크의DOM경계가모두40×40px였다. 첫링크에서Tab을실행해두번째Terminal링크에초점이옮겨짐을확인했다. 초점A는href=#,텍스트/aria-label/title없음이며SVG에도이름이없다. 실제AX는7개중6개를이름없는link로보이고AceternityLogo하나만imgalt이름을갖는다. 모든링크는keyboardfocus에도40×40이고hover툴팁/크기확대가나타나지않았으며기본포커스외곽선은보였다.

캡처 설명(원시 이미지 정리): Floating Dock dark keyboard focus. 관찰 결과와 검증 한계는 이 문서의 본문에 보존한다.

이것은선택키보드초점한흐름이며pointeractivation·mobile·터치·RTL·큰글자·모션감소·가로스크롤좌표검증이아니다. sourceonly였던link이름/keyboard표현중이범위만실제확인으로옮겼다. Aceternity선택시각10/flow4로갱신했고Manual46/공개core500+1부분은동일하다. 기존BottomNavigation의명시라벨/selectedKey/aria-current와상호작용최소크기를재사용하며 탐색크기비교의별도실험등록완료는아니다.

## Aceternity 후속 Manual checkpoint — 50

공개 본문 500전체+1부분과 실제 선택 화면10·flow4는 유지한다. 아래 4 URL은 숨겨진 Manual TSX/CSS 전체를 직접 열어 읽은 추가 범위다. 실제 위험 입력을 실행하거나 문제를 재현한 것으로 세지 않는다.

- https://ui.aceternity.com/components/glare-card : width320/aspect17:21/radius48 고정과 ref 기반 포인터 회전을 확인했다. 300ms timeout 정리와 overlay pointer-events:none이 없으므로 중첩 입력 가림·unmount는 소스상 점검 후보다. 기존 Card 내용/버튼/프로필 geometry + EffectSurface에 표현만 흡수한다.
- https://ui.aceternity.com/components/glowing-effect : disabled=true 기본이며 활성화 시 body pointermove/window scroll과 RAF는 정리한다. 각 angle animate 반환 handle을 보존/중지하지 않는 점은 실제 연속 입력·unmount 재현이 남았다. 기존 EffectSurface의 영역·환경 lifecycle을 유지한다.
- https://ui.aceternity.com/components/glowing-stars-effect : 108개 star/18열, 3초마다 5 index 선택과 interval cleanup을 읽었다. 중복 index와 hover+selected glow 중복 가능성은 소스 판단이다. 고정 max-height·색·정지되지 않는 로컬 애니메이션을 기본 Card 계약으로 복사하지 않는다.
- https://ui.aceternity.com/components/google-gemini-effect : 11,574자 Manual의 10개 SVG path geometry와 filter까지 모두 읽었다. pathLengths[0..4]를 길이 검증 없이 참조하고 blurMe id가 고정이다. sticky/890px absolute 장면·동작 없는 button·local reduced guard 미표시를 확인했지만 scroll·200%·키보드 실제 상태는 미확인이다. Section/Text/Button/ScrollProgress/EffectSurface 합성부터 검토하며 별도 Gemini 기능이나 scroll 엔진을 추가하지 않는다.

이 4 URL의 기존 후보 경로는 각각 카드 깊이 비교/입자와 빛이며 새 경로 수68을 늘리지 않았다. 날짜와 시각 선택은 root가 기존 DatePicker/Select 합성으로 Web·Native 7스토리를 등록했다는 근거만 해당 Magic URL proposal에 연결했다. [사용 지침](../../packages/design-contracts/docs/usage/compositions/date-time-selection.md)·[검증 범위](2026-10-07-date-time-selection.md); Native 기기·승급·게시 및 나머지 후보 등록 완료를 뜻하지 않는다.

## Aceternity 배경·히어로 후속 checkpoint — Manual53

- https://ui.aceternity.com/components/grid-and-dot-backgrounds : 실제 Code 토글4개(상단 중복 Grid 포함)를 각각 열고 전체 읽었다. CSS grid40/20px·dot20px·radial fade이며 motion 런타임을 사용하지 않는다. 고정50rem·literal 색은 기본 토큰으로 복사하지 않는다. 후보 `실험/토큰/표면과 움직임/반복 무늬`의 EffectSurface 선택 표현부터 검토한다.
- https://ui.aceternity.com/components/hero-highlight : 모든 SVG data URL까지 Manual 전체 읽었다. essential text는 유지하고 pointer-events-none의 200px mask·dots와 Highlight span background2초/.5초delay를 쓴다. 실제 contrast/RTL·focus·touch와 모션 감소는 미검증이다. `글자 표현 비교`의 Text 콘텐츠 계약과 배경 표현을 분리한다.
- https://ui.aceternity.com/components/hero-parallax : Manual 전체 읽었다. 데이터15개 초과를 자르고300vh·카드30rem·이동±1000px·hardcoded Header를 사용한다. 이미지 alt/anchor는 있으나 제목은 hover만 보인다. `스크롤 장면 비교`에서 제품 데이터·기존 Section/Grid/Image/Link/ScrollProgress 등부터 합성하며 원본 spring/3D 엔진을 복제하지 않는다.

Dock 키보드 증거 이미지(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함)의 SHA-256: `52a1c4431ebf226a3bc4b22dc5a0225042dc7e57751af9b5db95ba4a76e4e2e2`. 같은 hash를 URL별 인덱스 proofSha256에 저장했다. 현재 공개본문500전체+1부분/Manual53/실제10/선택flow4이며 전체 완료·모든 Usage·실험68개 등록 완료는 여전히 false다.

## Aceternity 후속 Manual checkpoint — 58

다음 5 URL의 숨은 Manual과 Hero의 실제 Code를 전체 읽었다. 공개본문500전체+1부분/실제10/선택flow4/68고유후보는 그대로이며 위험 입력의 runtime 재현은 아직 없다.

- https://ui.aceternity.com/components/hero-sections-free : 설치utils와 Simple entry animation의 유일한 Code 전체를 읽었다. Navbar/본문 h1 중복·동작 없는 버튼·단어 space split blur가 있다. 기존 화면/Section/TopBar/Text/Button/Image/ContentTransition을 재사용하고 브랜드와 문구는 제품 소유로 둔다.
- https://ui.aceternity.com/components/hover-border-gradient : interval cleanup은 있으나 effect deps가 hovered만이어서 duration/clockwise 갱신은 소스상 재현 후보다. Button disabled/type·키보드·local reduced 계약을 대체하지 않는다.
- https://ui.aceternity.com/components/image-generation-loader : 19,377자 Manual의 glyph/Bezier/Canvas까지 전체 읽었다. DPR2·seeded random·ResizeObserver·IntersectionObserver·reduced static/change·cleanup이 있어 다른 무한 효과와 구분했다. A-Z/digit 이외는 ?로 그리며 장식 canvas는 aria-hidden이다. 실제 요청 진행·실패·재시도·결과는 없으므로 Dialog/Progress/Notice/Spinner의 의미와 optional EffectSurface 표현을 합성한다.
- https://ui.aceternity.com/components/images-badge : 최대3개·native anchor/noopener·상시 text를 확인했다. href 없으면 cursorpointer div이고 mouse hover fan뿐이다. AssetGroup/Image/Link의 이름·입력 의미를 유지한다.
- https://ui.aceternity.com/components/images-slider : global window ArrowKeys·5초 autoplay·mount-only preload를 읽었다. 한 이미지 실패 시 로그만 남기고 loaded 여부가 회복되지 않는 경로, props 갱신과 unmount 처리 누락·alt 없는 motion.img는 소스 위험이며 실행 재현은 남았다. 기존 Carousel의 controlled ID·수동 controls·pause/reduced·Image 실패 계약부터 재사용한다.

## Aceternity 후속 Manual checkpoint — 63

- https://ui.aceternity.com/components/infinite-moving-cards : TSX·Tailwind4 CSS·실제 전환한 Tailwind3 config 전체 읽었다. cloneNode로 접근 가능한 동일 quote를 추가하고 clone cleanup/props update가 없다. hover pause만 제공하므로 기존 List/Card의 의미와 정적·사용자 제어 전환을 유지한다. StrictMode 중복 위험은 소스 판단이며 실행 재현은 없다.
- https://ui.aceternity.com/components/keyboard : 27,725자 Manual의 모든 sound timing/key 행까지 읽었다. sound=false와 gesture AudioContext/abort/close·IO guard가 있다. 다만 보이는 동안 document keydown/up을 받아 showPreview가 다른 입력의 물리 key.code도 표시할 수 있다. 실제 비밀번호 입력은 하지 않았다. `입력 기기 모형` 후보는 정적 자산 또는 해당 모형 안에서만 명시 입력을 받는 Button 합성으로 제한하고 전역 키 수집·음성 기본 활성화를 채택하지 않는다.
- https://ui.aceternity.com/components/lamp-effect : 모든 conic mask/blur CSS까지 읽었다. min-h-screen/translate-80·width30rem·literal palette·whileInView를 테마 기본 레이아웃으로 복사하지 않는다. 기존 EffectSurface 장식과 Section/Text 의미를 분리한다.
- https://ui.aceternity.com/components/layout-grid : 숨은 Manual 전체 읽었고 parent의 기존 실제 흐름을 중복으로 세지 않았다. div click·선택 object snapshot·id truthiness(0)·고정 half-height 장면·dialog focus/Escape 미표시가 있다. Grid/Card/Button/Dialog/ContentTransition의 controlled stable ID 계약을 재사용한다.
- https://ui.aceternity.com/components/layout-text-flip : interval cleanup은 있으나 words/duration deps는 없고 layoutId subtext가 전역이다. empty/shrink/다중 인스턴스·locale·reduced는 소스상 점검 후보이며 아직 실제 재현하지 않았다. TextTransition의 단일 문자열과 제품 controlled timing을 유지한다.

현재 공개본문500전체+1부분/Manual63/실제10/flow4이며 전체 완료 false와 68고유후보 미등록 상태는 그대로다.

## Aceternity 후속 Manual checkpoint — 68

- https://ui.aceternity.com/components/lens : 전체 읽었다. arbitrary children을 원본과 mask 확대층에 두 번 mount하며 duplicate에 aria-hidden/inert/pointer-none이 없다. 입력·ID·focus 충돌은 소스상 위험이며 실행 재현은 아니다. 기능 확대는 Image + Dialog/Sheet (functional zoom gap; not existing zoom API), 장식 복제는 정적 Asset/Image 표현부터 검토한다.
- https://ui.aceternity.com/components/link-preview : TSX·nextconfig·의존성 전체 읽었다. 기본은 mount 때 hidden img로 전체 encoded URL을 Microlink screenshot 서비스에 보내고 static option이 있다. 제품 비공개 URL/query를 외부로 보내는 방식은 채택하지 않는다. product-owned 정적 미리보기와 기존 Link/Tooltip/Card/Image부터 합성한다.
- https://ui.aceternity.com/components/loader : 6,204자 Manual의 Loader1~5 전체 읽었다. 무한 이동·SVG path·글리치 동일문구3겹·UTF16 split을 확인했다. 요청/진행/실패 의미는 기존 Spinner/Notice/Progress/Dialog가 소유하고 표현만 후보로 둔다. AT·reduced 실제 검증은 남았다.
- https://ui.aceternity.com/components/macbook-scroll : 19,517자 모든 키행/SVG까지 읽었다. 모바일 width를 mount 때만 읽고200vh·1500px 이동을 사용한다. Keypad는 div 장식이고 선택/입력 엔진이 아니다. Asset/Image 기기 모형 및 scoped scroll 표현으로 제한한다.
- https://ui.aceternity.com/components/magnetic-button : 실제는 arbitrary children을 움직이는 div wrapper다. 움직이는 inner rect에 상대 좌표를 잡고 spring을 적용한다. 기존 Button의 안정된 입력 영역·disabled/pending·키보드/focus 계약에 장식만 붙일 수 있으며 별도 버튼을 복제하지 않는다.

현재 공개본문500전체+1부분/Manual68/실제10/선택flow4를 유지한다. Manual68은 URL 구현 독해 수이고 고유 실험후보68과 우연히 같을 뿐 등록완료 수가 아니다. 전체 완료 false.

## Aceternity 후속 Manual checkpoint — 73

- https://ui.aceternity.com/components/meteors : TSX·Tailwind4와 실제 전환한3 전체 읽었다. number||20·고정800px범위·render random·무한 CSS를 seed/bounded count와 기존 EffectSurface 환경 lifecycle로 대조한다. invalid input·SSR·reduced 실행 검증은 없다.
- https://ui.aceternity.com/components/moving-border : export Button과 MovingBorder 전체 읽었다. 매프레임 SVGlength 조회·duration0 나눗셈·고정size/radius는 source 점검 후보다. 기존 Button의 입력·진행 의미와 상속 geometry 위에 장식만 붙인다.
- https://ui.aceternity.com/components/multi-step-loader : 모든 SVG·타이머·overlay 읽었다. 시간만으로 현재 단계까지 filled check를 표시하므로 실제 작업 완료 의미로 채택하지 않는다. Dialog/Notice/Progress/Steps/Spinner는 제품 실제 상태로 제어한다. 타이머 cleanup이 있는 점과 modal/focus/live 표시가 없는 점을 별도 기록했다.
- https://ui.aceternity.com/components/navbar-menu : controlled active는 있으나 trigger motion.p/mouse enter·leave만 제공한다. TopBar/Popover/Menu/Link 등 기존 공개 입력·focus 계약부터 재사용한다. 실제 키보드·RTL·200%·touch는 남았다.
- https://ui.aceternity.com/components/noise-background : 7,161자 전체 읽었다. static noise 이미지와 gradient spring을 조합하며 deltaTime=16을 가정한다. animating=false 선택은 있지만 로컬 reduced/offscreen/hidden guard는 미표시다. 현재 EffectSurface mesh/glow/noise와 palette/profile을 재사용하는 후보로 남긴다.

현재 공개본문500전체+1부분/Manual73/실제10/flow4이며 source상 위험을 실제 결함 재현으로 세지 않는다. 모든Usage·환경·premium·21st전체와 실험 등록은 미완이다. 최초 저장은 ENOSPC로 실패했고 volume1.3GiB 여유 확인 후 이 MD/index에 다시 저장했다. 원본·다른 세션 파일은 삭제하지 않았다.

## Aceternity 후속 Manual checkpoint — 77

- https://ui.aceternity.com/components/notch : 10,486자 Manual 전체 읽었다. stable IDs·controlled values·safe-area·outside/Escape cleanup·listbox/option 의미가 있다. trigger를 열 때 unmount하고 explicit focus 이동/복구·방향키·disabled는 구현에 보이지 않는다. 기존 Select/SegmentedControl/Popover/Button의 선택 계약 위에 표현만 올리며 단순선택을 BottomNavigation route로 바꾸지 않는다. 실제 focus 손실은 아직 재현하지 않았다.
- https://ui.aceternity.com/components/parallax-hero-images : 전체 읽었다. 장식 images는 alt빈값/lazy/async/pointer-none이고 max8이다. global window mousemove/viewport정규화 대신 scoped EffectSurface·AssetGroup/Image와 finepointer/reduced 환경을 유지한다.
- https://ui.aceternity.com/components/parallax-scroll : 첫·둘째 TSX 모두 전체 읽었다. 동일 ref를 바깥 스크롤과 안쪽 grid에 부여한 점은 실제 스크롤 대상 검증 후보다. 데이터 순서·의미를 Grid/Image가 소유하고 고정40rem/±200px 장면을 기본 테마 layout으로 복사하지 않는다.
- https://ui.aceternity.com/components/pixelated-canvas : 18,568자 모든 CPU sampling/fit/tint/dropout/RAF/cleanup 읽었다. CORS getImageData 실패 시 원본 그리기 fallback과 interactive=false가 있다. cellSize0 loop·무제한DPR·interactive 무한RAF·responsive고정width는 소스 점검 후보이며 실제 위험 입력은 실행하지 않았다. Image의 의미·fallback와 장식 처리만 분리한다.

현재 공개본문500전체+1부분/Manual77/실제10/flow4, 전체완료false. Magic Manual77과 Aceternity Manual77은 사이트별 수이고 고유 실험후보68 등록 수와는 별개다. 추가 캡처·대량 수집을 만들지 않았다.

## Aceternity 후속 Manual checkpoint — 82

- https://ui.aceternity.com/components/placeholders-and-vanish-input : 8,766자 전체 읽었다. placeholder hidden 정지/cleanup은 있으나 Enter keydown와 formsubmit이 각 vanish를 실행하고 IME 검사가 없다. animation 끝에 요청 성공 여부와 관계없이 draft를 지우며 pending button·RAF cancel·label 의미가 부족한 소스다. 위험 입력은 실행하지 않았으며 기존 TextField/Form/Button의 IME·draft-on-success·실패 복구 계약을 유지한다.
- https://ui.aceternity.com/components/pointer-highlight : rawSVG 포함 전체 읽었다. essential children은 상시 유지하고 장식은 pointer-none이다. observer cleanup·physical 끝좌표·reduced는 소스 점검 후보이며 실제 leak/가림으로 세지 않는다.
- https://ui.aceternity.com/components/resizable-navbar : 8,533자 모든 desktop/mobile/logo/button 읽었다. mobile toggle은 clickableSVG이며 Menu의 onClose가 연결되지 않는다. 기존 TopBar/Affix/Popover/Sheet/Button/Link focus/close/route 계약을 재사용한다.
- https://ui.aceternity.com/components/shooting-stars-and-stars-background : 7,618자 두 파일 모두 읽었다. ShootingStars recursive timeout cleanup은 빈 함수이며 Star RAF와 StarsBackground RAF/observer는 각각 정리한다. 모두 누락으로 뭉뚱그리지 않는다. EffectSurface scoped seed/count/환경 정지에 흡수할 후보이며 실제 timer 재현은 남았다.
- https://ui.aceternity.com/components/sidebar : context/desktop/mobile/link 전체 읽었다. 동일 children 두 mount와 collapsed label display:none·mobile SVG/div 클릭·overlay focus/scroll 미표시를 확인했다. 기존 Sidebar/Sheet/Popover/Button/Link의 의미와 입력을 유지한다.

현재 공개본문500전체+1부분/Manual82/실제10/flow4, 전체완료false. 조사 독해수와 고유 후보68·실제 등록은 구분한다.

## 공개 API 이름 재대조

후속 Manual 서술을 실제 Web/Native 공개 index와 대조했다. HJM 공개 이름은 TopBar·Sheet·Popover/Menu·Dialog·TextField·Spinner/Notice/Progress다. 조사 중 쓴 Header/Drawer/NavigationMenu/Modal/TextInput/LoadingOverlay/Status 일반 표현은 이 공개 API 이름으로 교정했다. ImageViewer라는 공개 zoom API는 확인되지 않으므로 Image+Dialog/Sheet의 미디어 표시와 기능 확대 gap을 구분한다. 이 용어 교정은 원본의 Header 함수/Modal 명칭이나 실제 미검증 상태를 변경하지 않는다. 실험 proposal existingApis 목록은 이미 실제 API 이름을 사용했으므로 경로/후보68 수는 유지한다.

## Aceternity 후속 Manual checkpoint — 87

- https://ui.aceternity.com/components/signup-form : Manual Input/Label·CSS4·실제CSS3·유일한 SignupForm Code 모두 읽었다. native input/focus/label은 있지만 submit은 console log뿐이고 제공자도 type=submit이다. 외부 Twitter password 필드와 invalid type은 제품 인증으로 채택하지 않는다. Form/TextField/PasswordField/AuthProviderButton/AuthScreenLayout 및 제품 인증을 유지한다. 실제 인증/비밀번호 입력은 실행하지 않았다.
- https://ui.aceternity.com/components/sparkles : 고유 페이지에서 모든 tsparticles options를 다시 실제 읽었다. Compare/Cover 안 중복을 페이지 완료로 대체하지 않았다. useId/fps120/density/push4와 초기화 promise를 확인했다. 엔진 기본 guard는 미검토이므로 라이브러리 전체에 없다고 주장하지 않는다.
- https://ui.aceternity.com/components/spotlight : 모든 SVG·CSS4·실제CSS3 전체 읽었다. one-entry animation과 pointer-none·고정filter ID를 확인했다.
- https://ui.aceternity.com/components/spotlight-new : six gradients·양쪽7초무한 왕복·pointer-none 전체 읽었다. 이전 Spotlight의 1회 진입과 구분한다.
- https://ui.aceternity.com/components/squiggly-text : 3,637자 전체 읽었다. useId/hiddenSVG/single actual children은 있지만 80ms filter 순환과 reduced·zero 옵션 검증이 남았다. force/legacy install 권고는 채택하지 않는다.

[Sidebar](../../packages/design-contracts/docs/usage/components/sidebar.md)·[Sheet](../../packages/design-contracts/docs/usage/components/sheet.md)·[Menu](../../packages/design-contracts/docs/usage/components/menu.md)·[Field](../../packages/design-contracts/docs/usage/components/field.md) 실제 사용 지침도 전체 읽었다(첫 출력의 잘린 Menu/Sheet tail은 별도 다시 읽었다). Sidebar는 Web-only이며 Native는 BottomNavigation/navigator를 사용한다. Web rich link panel은 Popover+Link, Native는 Sheet/route shell로 구분한다. Menu를 arbitrary rich navigation engine으로 바꾸거나 Sheet를 비모달 SidePanel과 동일시하지 않는다.

현재 공개본문500전체+1부분/Manual87/실제10/flow4, 전체완료false/68고유후보 유지.

## Aceternity 후속 Manual checkpoint — 92

- https://ui.aceternity.com/components/stateful-button : 전체 animation/SVG/await 순서 읽었다. 로딩 표현 await 뒤 요청 callback, 성공 표시 순서지만 error finally·pending single-flight·busy 의미는 없다. 기존 Button과 제품 실패/복구 상태를 유지한다. parent 기존 flow 완료를 B 새 실제검토로 더하지 않는다.
- https://ui.aceternity.com/components/sticky-banner : close와 scroll 모두 같은 open을 덮는다. 수동닫기 이후 scroll reopen·opacity0 상태 focus·닫기icon 이름은 소스 점검 후보다. Notice/IconButton+Affix에 controlled dismiss를 구분한다.
- https://ui.aceternity.com/components/sticky-scroll-reveal : empty/prop-shrink에서 content[index] 접근과 lg 아래 unique content 숨김은 소스 위험이다. essential text/media는 모든 폭에 유지하고 Section/Grid/Affix/ScrollProgress/ContentTransition 합성을 쓴다.
- https://ui.aceternity.com/components/svg-mask-effect : maskSVG·전체TSX 읽었다. arbitrary children을 tiny mask로 숨긴다고 의미/focus도 숨겨지는 것은 아니므로 essential Text와 장식을 분리한다. 실제 touch/keyboard/AT는 미검증이다.
- https://ui.aceternity.com/components/tabs : 전체FadeInDiv 및 optional CSS 읽었다. active.value key로 선택 때 자식을 모두 remount하고 미선택 panel도 opacity/z만 다르다. 기존 Tabs의 ID·키보드·패널 의미·내용 상태 계약을 유지한다. parent 기존 actualflow는 중복 완료로 세지 않았다.

현재 공개본문500전체+1부분/Manual92/실제10/flow4, 전체완료false/68고유후보 유지.

## Aceternity 후속 Manual checkpoint — 97

- https://ui.aceternity.com/components/tailwindcss-buttons : optional card/config와 실제11,237자 Code의21개 버튼·SVG·Shimmer literal까지 읽었다. nativebutton 표현·Clipboard promise/Toast는 있으나 state/type/focus/reduced 계약은 부족하다. HJM Button profile/feedback과 ClipboardButton/Toast를 재사용하며 브랜드색이나 별도 버튼21개를 복제하지 않는다.
- https://ui.aceternity.com/components/terminal : 14,505자 모든 sound table/tokenizer/단계 타이머 읽었다. 명령은 문자열을 표시할 뿐 실행하지 않는다. gesture audio cleanup과 once IO 시작은 있지만 offscreen/done cursor 타이머·reduced 정지/사용자 pause는 없다. CodeBlock·ClipboardButton·Text/ContentTransition을 재사용하는 표현 후보다.
- https://ui.aceternity.com/components/text-flipping-board : 14,673자 모든 flap/wrap/color/132cell 읽었다. Latin 제한·22자 word 나머지 절단·6행 이후 절단·문자 여러 겹을 실제 본문으로 대체하지 않는다. 원문 Text 의미와 선택적 장식을 분리하고 locale/AT/reduced 실행은 남긴다.
- https://ui.aceternity.com/components/text-generate-effect : 전체 읽었다. scope.current만 deps라 words/filter/duration 갱신은 소스상 위험 후보다. 고정 space split은 다국어 스트리밍 엔진이 아니며 실제 문자열/상태는 Text와 제품이 소유한다.
- https://ui.aceternity.com/components/text-hover-effect : 모든 SVG/gradient/mask 전체 읽었다. global IDs·3겹text·fixed viewBox/Helvetica·mouse-only를 HJM Text의 semantic 원문과 scoped 장식으로 나눈다. actual contrast/AT/RTL/zero rect는 아직 실행하지 않았다.

현재 공개본문500전체+1부분/Manual97/실제10/flow4, 전체완료false/68고유후보 유지.

## Aceternity 후속 Manual checkpoint — 102

- https://ui.aceternity.com/components/text-reveal-card : 전체 touch/mouse/stars 읽었다. touch 입력은 있으나 rect 한번측정·scroll preventDefault·keyboard 없음·두 본문 의미·fixed40rem이 있다. essential Card/Text를 숨기지 않고 기능 비교가 필요하면 Slider의 의미부터 쓴다.
- https://ui.aceternity.com/components/timeline : 전체 읽었다. 제품 데이터/제목·내용 의미는 참고 가능하지만 height 한번측정과 hardcoded marketing copy는 기존 Timeline/Section/Text 계약으로 대조한다.
- https://ui.aceternity.com/components/tooltip-card : 6,238자 전체 읽었다. pointer-none 표면에 arbitrary children을 넣고 focus/Escape/role연결이 없다. Tooltip의 도움말과 interactive Popover/Sheet를 구분한다. touch timeout/placement 문제는 실제 재현 전 소스 위험이다.
- https://ui.aceternity.com/components/tracing-beam : 전체SVG 읽었다. aria-hidden/motion-reduce:hidden이 실제 있어 모두 reduced없음으로 분류하지 않는다. 높이1회측정·globalgradientID·indicator get()은 source점검 후보이다.
- https://ui.aceternity.com/components/typewriter-effect : 기본·Smooth 두 전체 읽었다. UTF16/NBSP/nowrap/숨김진입·무한cursor는 Text의 원문/locale 의미와 별도로 표현만 검토한다. 실제 언어·RTL·reduced·prop update는 미확인이다.

현재 공개본문500전체+1부분/Manual102/실제10/flow4, 전체완료false/68고유후보 유지.


## Aceternity 후속 Manual checkpoint — 107

- https://ui.aceternity.com/components/vortex : Full visible Manual 7533 chars read: Float32Array700 particles/defaults via || reject zero values; canvas uses global window dimensions, 3 self draw glow passes, perpetual RAF with cancellation+resize cleanup but no local visibility/reduced guards. Effect parameters captured once on mount; no equivalent Native canvas evidence. Reuse EffectSurface optional bounded decoration; do not copy engine or make essential content depend on it. SOURCE ONLY actual lifecycle/performance pending.
- https://ui.aceternity.com/components/wavy-background : Full visible Manual3450 chars read: 5 simplex paths every RAF, global window dimensions, window.onresize overwritten and not restored by cleanup; RAF is cancelled; zero opacity/width replaced by || defaults; initial effect captures palette/speed. Safari user-agent branch applies CSS filter. No local reduced/visibility guard shown. Reuse EffectSurface static/optional bounded waves; source only no actual Safari/resize/multi-instance verification.
- https://ui.aceternity.com/components/webcam-pixel-grid : Full visible Manual17516 chars read; mount getUserMedia user camera640x480,64x48 CPU pixel motion+elevation/uncapped DPR/frame canvas resize, callback identity changes re-request camera; tracks stopped on effect cleanup but late async resolution after unmount and multiple retry stream replacement not guarded in visible source. Error Retry/dismiss present; close icon lacks label, hidden video/canvases not semantic-hidden. No camera permission granted or camera data transmitted during review. Keep product camera/permission/lifecycle owner, PermissionScreen/Notice/Button/Asset fixture composition; reject automatic branded background permission; no camera engine copy. SOURCE ONLY actual camera grant/deny/performance/retry pending.
- https://ui.aceternity.com/components/wobble-card : Full visible Manual3019 chars incl Noise read; section mouse movement rect each event, outer translation/inner opposite with1.03scale, .1s CSStransition; hardcoded indigo/radius/shadow/padding and /noise.webp overlay not pointer-none. No focus/fine-pointer/reduced branch visible. Reuse Card/EffectSurface surface and bounded fine-pointer optional depth; essential focus/content stays static. SOURCE ONLY actual hit testing/performance pending.
- https://ui.aceternity.com/components/world-map : Full visible Manual5740 chars read incl all circles/SMIL: DottedMap rebuilt render, next-themes raw theme (system resolved state not checked), labels declared unused, unvalidated linear lat/lng projection, global path-gradient id, motion path+1.5s SMIL infinite pulse. React19 note pins motion alpha and legacy-peer-deps; not adopted. Reuse Card/Image/Text/Tooltip geographic summary; map projection/data+engine remain product/optional library; location must have accessible text/list and reduced static. SOURCE ONLY actual map/coords/theme/instances pending.

공개본문500전체+1부분/Manual107/실제10/flow4를 유지한다. 모든 결과는 화면·동작 완료와 분리하며 카메라 권한을 허용하지 않았다. 남은 components9개 중 설치4개는 별도 안내 독해로 기록한다.


## Aceternity 후속 Manual checkpoint — 112

- https://ui.aceternity.com/components/apple-cards-carousel : Full Manual9913 incl hook all read: arbitrary JSX indexed strip, physical scrollLeft/300px arrows; onclose computes230/384+4/8 assumed widths+gap, no resize RO. Card uses true button+imagealt but unnamed arrows/close, global per-card Escape+bodyoverflow auto overwrites other locks; no focus trap/restore/dialog role visible. Stable title-based IDs not supplied dataID. HJM Carousel/CarouselMotion source+usage read: only oneactive finite slide/inert others, not equivalent simultaneousstrip. Reuse current Card/Button/Dialog motionOrigin for detail and List for multi-card browse; strip is explicit shared composition gap, not CSS overwrite. SOURCE ONLY actual arrow/end/width/focus pending.
- https://ui.aceternity.com/components/ascii-art : Full Manual14362 incl charsets/CSS resolver/static variant read: image CORS/cancel guards, CPU luminance chars/resolution80 fixedsquare crop, uncapped DPR canvas each draw; font custom and loading/error present. Canvas generic role img/aria-label lacks product descriptive alt prop; error is not reset on src change and hasAnimated is retained; once IO/RO cleanup exists but no local reduced guard. Text decoding UTF16 customcharset not grapheme. Reuse Asset/Image with product alt and pre-generated optional ascii texture; do not treat reading bitmap as semantic text or copy conversion engine. SOURCE ONLY src recovery/performance pending.
- https://ui.aceternity.com/components/expandable-card : Manual951 hook and all3 Code11866/11866/10836 chars actually opened/read incl complete data+SVG; first2 identical source still individually read. Active object snapshot+title/useId, clickablediv/grid vs one button in list; closebutton lg:hidden+24px+unnamed; bodyoverflow hidden/auto global not restored unmount, Escape+outside listeners cleanup but focus trap/return/dialog role absent. Preserve root prior actual selectedflow separately. Reuse Card/Grid/List/Button/Dialog controlled stableid+motionOrigin; no new expansion engine. SOURCE ONLY new allvariant keyboard/large/RTL flow pending.
- https://ui.aceternity.com/components/feature-sections-free : Manual all util/deps and all3Code9777/4599/3581 chars opened/read including globe/images/SVG/list copy. 1st cobe Globe destroy cleanup but perpetual .01autoRotate/600pxDPR2/unsplash randomrotate mount render/generic alt;2nd SVG aria-hidden+useId good but random pattern;3rd static8featurehoveronlydecoration good essentialtext visible. Compliance/uptime/password-sharing source demo copy not product truth/adopted text. Reuse Section/Grid/Card/Text/Icon/Image/EffectSurface functional productdata, productpurpose determines ordering. No new feature API engine. SOURCE ONLY all actual breakpoints/flow pending.
- https://ui.aceternity.com/components/github-globe : Full Manual9068 read all types/material/data/rings/Canvas/utility. three/three-globe/R3Falpha/drei+external globe.json required, JSON actualdata not yetread. Ring interval2s clear cleanup present; OrbitControls hardcodesautoRotate true/speed1 ignoring declared config initialPosition/autoRotate/speed; pointRadius2 ignorespointSize later; zero emissive/shininess replaced. Canvas globalDPR uncapped, imperative ThreeGlobe added togroup no explicit dispose visible in this file but do not claim engine internal absence. No semantic location summary/reduced/visibility contract in source. Reuse Card/Text/Image/List+product optional map engine; no sharedgeneric globe core addition. SOURCE ONLY WebGL disposal/coords/focus/performance pending.

112개 구현의 visible Manual을 읽었다. 나머지 components4개(add-utilities/cli/install-nextjs/install-tailwindcss)는 설치 안내로 별도 검사하며 구현 TSX 완료 수에 넣지 않는다. 모든 Usage 패키지/예제 탭·원본 JSON/이미지 등 연결된 콘텐츠·전체 실제 시각과 흐름은 남아 있어 전수 완료false다. 가로 strip은 현행 Carousel 단일 activepanel과 다른 기능이므로 기존 고객 후기 탐색 후보/C의 filmstrip과 통합 검토하며 별도 새 API나69번째 경로를 등록한 것이 아니다.


## Aceternity 설치 안내 별도 checkpoint — 4

- https://ui.aceternity.com/components/add-utilities : Full current visible installation main read. cn util; stale React19 unsupported claim pins Next15.0.3/React19RC/motion12alpha+overrides. These compatibility values/override bypass not adopted; HJM actual supported package policy and contracts own dependency choice. No install or runtime checks performed.
- https://ui.aceternity.com/components/cli : Full visible guide/options/namespace/registry/MCP read; all12 command groups x4 package manager tabs=48 selected/read, plus Cursor/ClaudeDesktop/VSCode3 IDE commands selected/read. Includes force/overwrite/latest remote registry commands; none executed or external MCP installed. HJM imports/public props and library policy remain adoption path, not copy registry engine. Hidden JSX/JS language translations elsewhere still pending.
- https://ui.aceternity.com/components/install-nextjs : Full current main create-next-app prompts/start read; no tabs. Guide describes scaffold prompts, not verified current generator behavior. No dependency/project creation performed. Product framework owned by product/library policy, not theme requirement.
- https://ui.aceternity.com/components/install-tailwindcss : Full current main v4+legacyv3 inclCSS/PostCSS/utility/variant/plugin snippets read; no tabs. Example arbitrary font/color/spacing not HJM semantic tokens/default theme adoption. No build/package install or config overwrite performed.

현재 수집 components116URL은112visible구현Manual+4설치안내로 나뉜다. CLI48패키지패널+3IDE 안내를 실제 열어 읽었으나 명령 실행/라이브러리 설치는 하지 않았다. 전체공개본문500전체+1부분, 실제화면10·flow4 및 전체완료false/68고유실험후보(등록과구분)는 유지한다.


## AI catalog 연속 독해 checkpoint — 145,000자

https://ui.aceternity.com/ai-recommendations 의 인간용 카탈로그 전체와 raw JSON 앞 구간까지 실제로 읽었다. 이번 추출은 main 안 비어있지 않은 text node를 newline으로 연결한 `HTMLParser-main-nonblank-newline-v1`로 전체426,340자다. 예전427,980자와 공백처리가 달라 동일 offset을 섞지 않는다. 추출 text SHA256은 `dc1f74e1de0ab4aceb25d458d368667f0a6a0696ea1172a7f3af925a0fb0970d`이며 [0,145000) 연속구간을 중첩출력으로 확인했다. 나머지281,340자는 아직 독해하지 않아 부분1을 유지한다.

카탈로그의 성능 최적화·Mercator 정확도·production-ready·전환 효과는 원문 주장이고 실제 검증 완료가 아니다. Tabs의 Radix dependency 안내처럼 현재 Manual 구현과 다른 metadata도 있어 카탈로그를 API/설치의 단독 근거로 삼지 않는다. Pro block180·템플릿17·유료범주는 기존 URL 후보 매핑으로 연결하며 원본 소스·전체 실제 흐름은 남겨 둔다.


## AI catalog 연속 독해 checkpoint — 255,000자

같은 main 추출 SHA256/426,340자 분모에서 [0,255000)까지 읽었다. Free112/Pro23/Template17 raw JSON 전체와 ProBlocks의 초기 JSON까지 독해했고 다음은 Empty State Vertical부터 이어지는171,340자다. 숨은 구현이나 실제 상태를 추가 완료 처리하지 않는다. 일반 목록의6개 키워드 이후 `+n more`로 줄인 항목도 JSON에서는 전부 읽는다. 이 구간에서 신규 엔진/테마 기본값을 추가할 근거는 없고, 상세 설치 소스가 metadata보다 우선한다.

## Aceternity 수집 공개 본문 완료 checkpoint — 501

https://ui.aceternity.com/ai-recommendations 동일 추출426,340자/SHA256 `dc1f74e1de0ab4aceb25d458d368667f0a6a0696ea1172a7f3af925a0fb0970d`의 [255000,426340) 나머지까지 중첩 출력으로 실제 읽었다. 마지막 END MAIN426340을 확인했다. 인간용 목록·Free112/Pro23/Template17/ProBlocks180 raw JSON과 Quick Reference Table 전 항목을 유사·중복 이유로 생략하지 않았다. 수집501URL 공개core본문은501전체/부분0/미독해0이다. Manual112/설치4/실제화면10/선택flow4는 그대로다.

이는 수집 본문 완료이며 전체 사이트·연결원본·유료소스·숨은 모든 Usage·실제 전수화면/flow 완료가 아니다. `allReviewComplete=false` 및68고유실험후보의 등록 미완료를 유지한다. 카탈로그 dependency/분류/성능·전환 주장에는 실제 Manual과 불일치가 있고, 현재 HJM 공개API와 정책을 대체하지 않는다. 새 엔진/69번째 경로를 추가하지 않았다. 가로 strip은 기존 List에 horizontal 계약이 없는 것을 parent가 양 플랫폼에서 확인했으므로 스타일 덮기로 등록했다고 계산하지 않는다. 고객 후기 탐색·카드 상세 연결과 통합하여 다중 가시 항목 의미/초점/끝 경계/resize를 별도 설계할 후보다.

## Apple 가로 목록 실제 키보드 checkpoint

https://ui.aceternity.com/live-preview/apple-cards-carousel-demo 을1280×720 dark에서 실제 보았다. 카드384×640/gap16, 가로로3개 전체+4번째 부분 노출이며 시작의 이전 화살표는 disabled였다. 첫AI카드 Enter로 상세를 열면 body overflow hidden이고 초점은 첫 배경카드에 남는다. Tab은 Productivity 배경카드로 이동했으며 상세 overlay가 여전히 보이는 상태에서 dialog role은0이었다. Escape 후 상세내용은 사라지고 bodyoverflow auto, 초점은 호출카드가 아닌 두 번째 배경카드에 그대로 남았다. 이것은 실제 선택 흐름 확인이며 source 추정만이 아니다. 상세 표시 중 배경 초점 증거(원시 캡처는 정리했으며 관찰 결과는 연결된 조사 리포트 본문에 보존함) SHA256 `6457a4cb1868434cf61ef323ed33817bf58ff230e9aa691ee4d03728ca00db3c`.

이후 실제 선택 화면11/flow5, 수집 공개본문501전체/Manual112/설치4이다. 끝 경계·화살표 전체·resize·touch·RTL·큰글자·reduced·Layout Changes 예제는 미확인이다. 기존 고객 후기 탐색/카드 상세 연결 후보로 통합하고, 상세는 기존 HJM Dialog의 이름·초점 이동/복귀·배경 비활성 계약을 유지한다. List 양 플랫폼에 horizontal 계약이 없어 스타일 덮기로 가로 strip 등록을 완료했다고 주장하지 않는다. 새로운69번째 경로/엔진 및 전체 조사완료는 없다.

## 21st 수집 인덱스 관찰과 독립 복구 metadata

기존 `/Users/jimin/.codex/tmp/hjm-reference-full-audit-20261007/21st.dev-source/pages.json`은0byte로 관찰했다. 원인은 미확인이고 원본 파일/crawler를 수정·재시작·종료하지 않았다. [별도 B 복구 인덱스 — 본문 요약·미확인 범위](2026-10-07-reference-parallel-b.md)에 기존 inventory12,460 URL→URL SHA256 파일 경로·gzip byte·원문 byte/SHA256·읽는 동안 파일 변경 여부를 보존했다. 관찰 snapshot에서11,398원본 metadata 일치/1,062원본누락이다. HTTP상태·수집시각·정상 전체수집을 복구했다고 주장하지 않는다. collector가 이후 추가할 수 있어 이 분모는 snapshot이다. Metadata 해시를 읽은 행은 콘텐츠 독해로 세지 않는다.

첫20개(@0xUrvish author1+detail19)의 공개문구·보이는 Usage wrapper·dependency/license/source·similar counts를 URL 순서대로 전체 읽었다. 각URL 독해/원본hash와 기존 실험경로·API 매핑은 복구 인덱스에 따로 있다. author의 featured22 vs 전체24/Multi-StepForm·StatusButton 및 자동index/미가입 안내도 읽었다. uselayouts 독립원본 링크를 발견했으나 아직 구현을 읽지 않았고, Component.tsx/실제화면·flow 완료로 세지 않는다. 삭제버튼 gesture는 Button/Dialog의 확인/복구를 유지하고, InlineEdit/MorphingInput은 TextField controlled draft·IME·실제성공 이후 상태를 먼저 대조한다. 기존68경로에 출처를 연결하며 새 엔진·경로·등록완료 수를 늘리지 않았다.

## 명령 기록 표시 parent 등록 연결

parent가 `실험/구성/정보 표시/명령 기록 표시`의 MagicTerminal·AceternityCodeBlock 두출처 연결을 main `548f4bd1494515d0c48ef882c4baf4cf00bcd1de` commit/push·remoteSHA 확인으로 알렸다. [실제 등록 QA](2026-10-07-command-records.md): 양 Showcase8변형과 사용지침, Web ClipboardButton 원문변경/언마운트/중복 OS복사 및 Menu 늦은mouseenter 키보드선택 결함을 실제재현/수정한 범위다. 이 후보만 인덱스 등록증거로 연결했다. 다른68후보 전체등록·승급·Native실제기기·게시완료로 확대하지 않는다. 버전1.14.0 유지·미게시다. 21st 후보의 API명도 공개index/사용지침과 대조해 FilePicker를 사용하고 Tree는Web전용으로 기록했다.

## 사용자 범위 제외 — 최대 글자

2026-10-07 갱신 AGENTS에 따라 최대 OS 접근성 글자와 최대값을 모사한 확대 조건은 설계·구현·테스트·검증·후속·완료/릴리스 차단에서 완전 제외한다. 이전 checkpoint의 큰글자/확대 관련 수행 증거는 과거 기록이고, 최대값 검증을 반복하거나 등록 조건으로 삼지 않는다. 인덱스의 향후 요구상태에서 의미가 불명확했던 LargeText도 제거했으며 실제 API/기존 과거 QA는 변경하지 않았다.

연결원본 https://uselayouts.com/docs/components/inline-edit 의 실제 default 입력 화면은 보았으나 Code 선택은 Login to copy 창으로 막혔다. 로그인 상태·구현을 읽었다고 세지 않는다. Aside Vault 지원 확인은 `aside skills list`에서 Aside 미실행으로 실패했다. 자격증명 입력·가입·권한 허용 없이 다른 독립 공개 원문 검토를 계속한다.

## 21st 원문 독해와 누락 확인 후속 checkpoint

새 누락 확인은 B소유 별도 temp `parallel-b-21st-missing-readonly`에서2 URL을 직렬로 읽었다. https://21st.dev/community/components/s/shadow 는HTTP200/본문3141자 전체를 읽었고 title64+ vs본문6·반복목록은 카탈로그 불일치로 남겼다. https://21st.dev/@bee4/components/spray-paint-canvas 는20초 요청TimeoutError이며 접근차단/404/로그인필수로 단정하지 않는다. 공백URL9개는 기존 `21st.dev-repaired-source` 원문byte/hash와 보존 metadata가 일치했다. 새요청 없이 대체원본 링크를 붙였으며 기본원본missing1062snapshot을 정상수집으로 바꾸지 않았다. 기존 원본/crawler에는 변경없다.

추가10URL의 캡처본문을 읽었다. 세theme페이지 Modern Minimal remix/Azure Pro remix/Aurora Circuit는 Loading+제목/설명뿐이므로 실제theme본문/토큰완료가 아니라shell독해3으로 분리한다. Chromatic Lens(https://21st.dev/@16inam06/components/chromatic-lens)29409자TSX/GLSL 전체는 초기batch중간출력이 잘려3중첩구간을 다시읽어 완료했다. 지금새B독해는 공개본문28(처음20+후속7+shadow1), LoadingShell3, 캡처visible구현1이며 실제21st시각/flow0이다. uselayouts InlineEdit default실제화면1은 독립연결원본이라21st완료수에 넣지 않았다.

Lens는ROdisconnect/RAFcancel은있지만 초기화effect의GPU자원dispose·이미지이전src/unmountcallbackguard·접근가능canvaslabel은 보이는source에 없다. uncappedDPR/default무한wobble/mouse-only/localvisibility/reduced부재는SOURCE독해이며 실제GPU/오류재현이 아니다. 기존 이미지표현비교에Image/Asset/EffectSurface계약과 연결하고새WebGL엔진·Native동등성·mpl라이선스승인·고성능보장을 주장하지 않는다. Layouts라이브러리본문은registry0 vs22/24/누락2 컴포넌트의metadata불일치와 GitHub독립원본을 발견했으나 Github구현은미독해다. 전체사이트/숨은모든소스/실제상태완료false를 유지한다.

## 21st URL順 공개 독해 후속 — 43본문 + 8shell

다음20URL 전체 visibletext/Usage/catalogue/readme를 실제로 읽었다. 그중5theme는Loading뿐이라shell로분리해 현재 새B공개본문43·LoadingShell8·캡처visible구현1이다. @21st Agent Elements22unique vs62display, 8starlabs 공개2 vsregistry14 및나머지12소개를 모두읽었다. Paddle Billing Starter의Supabase/Paddle auth/webhook은제품backend범위라디자인시스템엔진으로등록하지않고결제다운로드/명령실행도하지않았다. ASCII Volna/test는루프영상소개이지GPU연산없는접근성·배터리보장의증거가아니다.

연결된 공식공개registry https://ui.8starlabs.com/r/partition-bar.json (SHA256 `9a68d58244183bda0b596e66500586967d9170c22ad100dc0c0509073174adb9`)의4600자TSX와 https://ui.8starlabs.com/r/open-in-chat.json (SHA256 `bb3c494a73c7741a7f081d4db5f598a2a6d427233bc23503f78b1a8e34f43654`)의7969자TSX+3202자SVG파일전체를읽었다. 연결구현2URL/3files로따로센다. Partition은전체부분의비율이지작업진행률이므로HJMProgress로복제하지않는다. StatisticGroup/DescriptionList의이름·값을기반으로지표요약후보에통합하되 비례분할geometry는현행APIgap으로명시한다. 100%flexBasis+4pxgap/flexShrink0의overflow·음수/NaN·라벨비율불일치는SOURCE추정이며실제재현이아니다.

OpenInChat는URL.searchParams encoding·namedlink/iconaria-hidden·noreferrer가있고engine은기존Menu/Button/Link/Tooltip에합칠수있다. 전달할prompt와대상서비스는제품이소유하며원본브랜드SVG를HJM자산으로복사하지않는다.24pxiconlink는기존터치기준대체근거가아니다. 원본추가button/menu/tooltip3파일과서비스URL동작은미독해/미검증이고실제링크를열어prompt를보내지않았다.

중단후CUA재연결시기존browser2가없고inventorybrowsers=[]였다. 사용자가보던탭/DeviceHub는조작하지않았고새실제UI검토는미완으로남겼다. sourceHTTP독해는독립적으로계속가능하다. 최대OS글자/최대모사확대는후속조건에서제외했다. 기존68경로재사용이며전체조사/실험등록완료false다.

## useLayouts 공개 GitHub 연결 구현 — 추가2

사이트Code는로그인창이었으나 Layouts본문에서공개GitHub주소를발견해공식Contents/Tree API를읽었다. treeSHA `07cc4f4fb8e064643168e6fc8792127af92637f5` 고정으로 registry/default/example/inline-edit.tsx(2990byte,SHA256 `86f419edd38e714f316656e8a5139b2bb261d00534bad1e8aff3bd6d1f22150f`)와delete-button.tsx(7684byte,SHA256 `693ce3f55f442f5f9827c224d5fbbd63ab639863cf566428f2d1d479a45029c9`)전체를실제읽었다. 공개연결구현은총4URL/5files이며21st시각/flow완료는늘리지않는다. 현재repo버전을읽은것이고21stlive/복사패널과동일hash를확인한것이아니다.

InlineEdit는readonlyInput/내부value와클릭가능motion.span2개뿐이고keyboardbutton역할/이름/tabindex/취소원문/저장API·성공실패계약이없다. 기존TextField+Button으로편집/저장/취소를명시하고제품async성공까지draft를보존하는기존입력전환후보로합친다. DeleteButton은진짜button이지만type미지정, 전환중pointerEventsnone, 마감0에서삭제callback/완료상태가없고animationguardtimeout정리가없다. UTF16분리·중복layoutId·reduced부재는source판단이다. 캡처description의swipe와현재repo클릭카운트다운도달라같은live동작으로보고하지않는다. 기존Button/Dialog/Notice의실제확인·취소·복구에표현만합치며계정삭제엔진이나실제서버변경을수행하지않았다. 브라우저현재연결없음이므로실제키보드/입력재현은남겼고최대글자제외는유지한다.

## 21st 다음20URL 독해 — 53본문/10shell/8내용없음

URL index52–71의캡처 visible본문/Usage/metadata 전체를실제읽었다. AskAI는4표현 defaultOpen/Default/compact/blobOnly·clipboardfallback 소개, ModelPicker는controlledmodelId+onValueChange, SaveButton은100confetti/spread70 demo설정이다. 실제원격저장성공·클립보드·외부provider전달·선택가능모델정보를검증하지않았다. 마무리행동/목록선택비교/누름표현+완료순간축하 기존후보로합치고상태·제품prompt/provider소유를유지한다.

새2theme는LoadingShell, Ali-Hussein-dev의7componentURL은Component Not Found,1library는Library not found였다. 이는캡처본문의표시이며HTTP404를확인한것이아니다. slug의pattern이름만으로새테마/컴포넌트를제안하거나읽기완료내용으로날조하지않는다. 지금새B본문53/LoadingShell10/내용없음메시지8, 캡처visible구현1·연결공식구현4URL5files이다. 모든실제UI추가0/전체완료false이며최대OS글자제외를유지한다. A의전용브라우저를동시에조작하지않고소스독해를계속한다.

## 사용자 범위 변경에 따른 조사 마무리

최신 요청 `이제 조사 마무리해`·`필요한것만 조사해`에 따라 추가 일괄 독해/URL수집은 중단했다. 현재 확인한 자료와 미확인 원장을 보존하고 실제 필요한 구현 판단으로 범위를 좁혔다. 전체 전수 완료는false이며 숫자를 늘리기 위한 조사는 하지 않는다. main인덱스 finalCandidateDisposition에기존고유68경로각각 disposition·공개API·이유·필수확인·출처를구조화했다. 새source/mapping을68경로에통합했으며제안으로실제등록완료를올리지않았다.

분류수: deferred 9, improve-existing 9, new-experiment 3, reuse-existing 47. reject경로는0이다. 기능후보자체를폐기하지않았다는뜻이며 부적합원본엔진/unsafefallback/가짜저장·지도·협업주장은각URL에서미채택근거로남아있다. 고유신규gap은유한가로다중카드·전체부분비율geometry·측정항목연결선이다. 확대/자유드래그/실시간camera/map의gap은보류이유로보존했다.

| 우선 | 경로 | 현재/필요 행동 | 최소 근거와 확인 |
| --- | --- | --- | --- |
| 1 | 실험/구성/비교와 검증/내용 전환 비교 | 기등록 실험 재사용; 새 엔진/중복 스토리 불필요 | docs/qa/2026-10-07-content-transition-comparison.md |
| 2 | 실험/구성/선택과 필터/날짜와 시각 선택 | 기등록 실험 재사용; 새 엔진/중복 스토리 불필요 | docs/qa/2026-10-07-date-time-selection.md |
| 3 | 실험/구성/정보 표시/명령 기록 표시 | 기등록 실험 재사용; 새 엔진/중복 스토리 불필요 | docs/qa/2026-10-07-command-records.md |
| 4 | 실험/구성/정보 표시/고객 후기 탐색 | 유한 다중 가시 가로 목록의 새 공통 계약/구성을 검토하고 기존 Dialog 상세로 연결 | Apple9913Manual + realEnter/Tab/Escape backgroundfocus proof; bothListnohorizontal + Carouselsingleactive |
| 5 | 실험/구성/정보 표시/기능 카드 묶음 | 기존 Card/Grid action 슬롯의 CTA를 기본/초점/터치에서 보이게 흡수 | MagicBento realTab focusedLink parentopacity0 proof; existingHJM Card/Grid/Button/Link |

기등록3단위는 [내용전환](2026-10-07-content-transition-comparison.md), [날짜와시각](2026-10-07-date-time-selection.md), [명령기록](2026-10-07-command-records.md)이며등록근거는parent확인범위다. Native실제기기·승급·게시완료와구분한다. 내용전환은rootMotion단위여서B기존68경로에69번째로추가하지않았다. 나머지65/66 숫자로등록을역산하지않으며B68전체등록완료는false다. 최대OS글자/최대모사확대는모든필수확인·완료조건에서제외한다. 우선4는Card상세원본실제초점결함을보존한새기능판단이고우선5는MagicBento실제보이지않는CTA확인을기존공개API표현으로흡수하는판단이다.
