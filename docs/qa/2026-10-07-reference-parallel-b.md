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
| Magic UI 수집 페이지 | 257 | 본문 전체 112, 부분 2 | 본문 143개 미검토 |
| 그중 docs | 92 | 전체 90, 부분 2 | Animated Beam/Dock의 긴 SVG 원시 geometry 및 일부 잘린 중간 구간 |
| 그중 홈페이지와 blog | 165 | 홈페이지 및 blog 첫 21개, 총 22 | blog 143개 |
| 컴포넌트 Manual 구현 | 77 | 77페이지, URL별 범위와 판단은 인덱스 manualReview/Notes | MCP Manual·설치 provider 탭과 실제 예제 상태 |
| 실제 화면·선택 흐름 | 별도 | Ripple Button·Animated Theme Toggler·BentoGrid·HeroVideoDialog 4페이지의 데스크톱 선택 상태 | 나머지 페이지·모든 예제·환경 조합 |

본 사이트의 257페이지에는 blog 164개가 포함된다. 92 docs를 읽었다고 사이트 전체 검토로 올리지 않는다. Animated Beam/Dock은 control structure와 Usage·Props를 읽었지만 raw SVG geometry와 잘린 구간이 있어 전체 읽기 수에 넣지 않았다. 템플릿 9개는 판매 소개 본문을 읽은 범위이며, 연결 live preview나 유료 구현 소스는 아직 검토하지 않았다. Blog의 라이브러리 권고·성능·전환율 수치는 원문 주장이며 검증된 채택 근거가 아니다. `animation-libraries` 글의 `pnpm add magicui`·`import { Button, Card, Modal } from "magicui"` 안내는 현재 설치 docs의 shadcn registry 방식과 다르므로 이 글을 설치 근거로 채택하지 않는다.

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

Manual에서 desktop CTA는 opacity=0/translate-y-10이고 group-hover에서만 표시된다. 실제 1280×720 dark preview에서 첫 Learn more 링크에 focus한 뒤 Tab을 보내 다음 링크로 이동했다. activeElement는 `A`, text=Learn more, href=#, 부모 opacity=0, 위치 x=522.664/y=342이었다. 포커스된 CTA가 화면에서 보이지 않는 것을 스크린샷으로 확인했다. [키보드 상태 증거](assets/parallel-b-magic-bento-keyboard.png). 링크의 Enter 탐색은 실행하지 않았다. 기본/세로 bento 모든 card flow·touch/RTL/좁은 화면은 미검증이다. 기존 Grid/Card/action 슬롯에 같은 hover 표현을 채택한다면 focus-within에서도 CTA를 드러내는 조건이 필요하다.

### CodeComparison 미채택 근거

URL: https://magicui.design/docs/components/code-comparison

Manual 전체를 읽었다. Shiki 실패 catch는 원본 code를 `<pre>${beforeCode}</pre>` 또는 afterCode로 그대로 연결하고, 이후 highlighted 값을 dangerouslySetInnerHTML에 전달한다. 이 실패 경로에서 코드 입력이 HTML escape되지 않는 구현 근거가 있다. 외부 사이트에 입력 payload나 실패 유발은 실행하지 않았고 runtime exploit 완료로 보고하지 않는다. HJM [CodeBlock source](../../packages/react/src/code-block.tsx)는 token.text를 React text로 렌더하며 pre의 keyboard/LTR 계약도 유지한다. 비교 UI가 필요하면 기존 두 CodeBlock의 구성부터 시작하고 원본 fallback을 복사하지 않는다.

### HeroVideoDialog 실제 focus/Escape

URL: https://magicui.design/docs/components/hero-video-dialog

default dark preview에서 Play video에 Enter를 보내 overlay/iframe이 1개씩 생기는 것을 확인했다. activeElement는 뒤의 Play video trigger 그대로였다. 그 focus에서 Escape를 보내도 overlay/iframe이 남아 있었다. [Escape 후 상태 증거](assets/parallel-b-magic-hero-dialog-escape.png). 원본 Manual은 overlay에 role=button/tabIndex=0과 keyDown을 두지만 dialog 의미·초기 focus·trap을 제공하지 않는다. overlay에 직접 focus한 뒤 Escape를 보내면 exit 후 둘 다 0으로 정리되는 것을 확인하고 agent가 연 preview를 닫았다. YouTube 재생은 시작하지 않았다. 8개 animation variant·close pointer·focus restore·반복 열기·좁은 화면은 아직 전수 검증하지 않았다. HJM Dialog와 motionOrigin/media 슬롯에 표현만 연결하는 방향을 유지한다.

## Aceternity 본문·Manual 증분 범위

수집 501 URL의 별도 상태를 같은 인덱스 additionalSites에 보존한다. 이번 B의 전체 본문 독해 484, 부분 1(ai-recommendations), 미검토 16이다. Manual 전체 10, 실제 선택 화면/flow 2(FileUpload·AnimatedModal)이며 parent가 이전에 검토한 네 페이지는 중복 완료로 더하지 않는다. ai-recommendations의 427,980자 catalog는 첫 구간 이후 출력이 잘려 전체 완료로 세지 않는다.

URL: https://ui.aceternity.com/components/3d-card-effect

현재 본문 description·CLI·모든 CardContainer/Body/Item props, 기본과 With rotation 두 Code Usage 및 Manual TSX/util을 모두 읽었다. mouse 좌표를25로 나눈 tilt, perspective1000, fixed h-96/w-96 기본 크기, 자식 transform useEffect의 mouseEnter 의존성을 확인했다. focus·reduced·touch 제어는 local source에 없고 translate 문자열에도 px를 붙인다. 이는 실제 예외 동작 재현이 아닌 소스 판단이다. 기존 Card/semantic action 슬롯 위에 hover 깊이 표현만 검토한다. 데모 이미지·텍스트·CTA는 제품 소유이며 그대로 기본 테마로 복사하지 않는다. actual preview는 Loading 상태가 포함되어 이 페이지의 시각/flow 완료 수를 올리지 않았다.

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

## Aceternity 3D·배경 본문 checkpoint

3D Globe·Marquee·Pin 및 add-utilities부터 background-ripple-effect까지 captured core 본문을 모두 읽었다. 숨긴 Manual·Code·Tailwind v3 탭은 자동 완료로 세지 않는다. 인덱스 URL별 scope와 pending 항목을 남겼다. 전체 본문 19/501, 부분 1, 미독해 481, Manual 5, 실제 선택 화면/flow는 여전히 FileUpload 1개이다.

- https://ui.aceternity.com/components/3d-globe: 16,833자 Manual 전체와 util/dependency를 읽었다. three/R3F/drei Canvas와 unpkg NASA texture, OrbitControls 자동회전, 마커 mouse div 및 frame별 visibility 계산은 데이터 시각화 별도 경계다. initialRotation·atmosphereBlur·markerSize 등 props의 실제 연결은 읽은 구현에서 확인되지 않았다. 모든 Code Usage와 실제 조작은 남아 있다.
- https://ui.aceternity.com/components/3d-marquee: Manual 전체와 top·Standard·Full screen 세 Usage를 따로 열어 읽었다. four slices/fixed1720 plane/infinite10·15s motion와 generic alt가 있다. Full screen은 pointer-none 배경과 overlay, focus ring 버튼을 둔다. HJM Image/AssetGroup·Grid·EffectSurface를 대체할 근거가 아니며 관성/3D 표현 후보로만 기록한다.
- https://ui.aceternity.com/components/3d-pin: Manual 전체와 Usage를 읽었다. outer anchor 안 inner anchor, hover-only 숨김, 무한 pulse 구현이다. 실제 keyboard/DOM 재현은 아직 하지 않았으며 HJM Card의 단일 링크·action 의미를 유지한다.

본문 범위의 add-utilities는 과거 motion12alpha/React19rc override 예제를 포함한다. 현재 지원성 확인 없이 dependency를 바꾸지 않는다. AnimatedModal/Testimonial/Tooltip·AppleCarousel·ASCII·Aurora·Beams/Collision·Boxes·Gradient/Animation·Lines·Ripple 모든 공개 props/CSS/예제 제목은 읽었으며 숨긴 구현과 모든 실제 화면은 별도 미검토다. 배경 계열은 HJM EffectSurface의 static/reduced/IO/document visibility 조건과 대조하는 방향을 유지한다.

## Aceternity Animated Modal 실제 상태와 39-page checkpoint

본문 core는 BentoGrid부터 DitherShader까지 20개를 추가 독해해 총 39/501, 부분 1, pending 461이다. URL마다 공개 description·CLI·모든 보이는 props/소스 snippet·예제 제목을 읽었으며 숨긴 Code/Manual/alternate tab은 따로 pending이다. CardSpotlight props 마지막 description은 원 수집본 자체가 `con`에서 끝나므로 그 이후 원문은 미확인이다. Manual은 Modal/Testimonial/Tooltip을 추가하여8개, 실제 선택 desktop/flow는2개이다.

https://ui.aceternity.com/components/animated-modal 의 Manual+전체 Usage를 읽고 실제 dark 1280×720에서 trigger Enter→Escape→Cancel Enter→unnamed close Enter 순서로 확인했다. 열기 후 focus는 배경 trigger이고 role=dialog0, body overflow hidden이다. Escape와 Cancel 후에도 내용이 남는다. [Escape 상태 증거](assets/parallel-b-aceternity-modal-escape.png). close 버튼 Enter로 exit 후 heading0/overflow auto/activeBODY를 확인했다. Book Now·결제·예약 행동은 실행하지 않았다. HJM Dialog의 의미·초기 focus·trap·restore·Escape·scrolllock 계약을 유지하고 3D spring/blur 표현만 흡수한다.

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
