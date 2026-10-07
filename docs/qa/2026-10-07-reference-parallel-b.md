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
| Magic UI 수집 페이지 | 257 | 본문 전체 102, 부분 2 | 본문 153개 미검토 |
| 그중 docs | 92 | 전체 90, 부분 2 | Animated Beam/Dock의 긴 SVG 원시 geometry 및 일부 잘린 중간 구간 |
| 그중 홈페이지와 blog | 165 | 홈페이지 및 blog 첫 11개, 총 12 | blog 153개 |
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

### BentoGrid 실제 키보드 CTA

URL: https://magicui.design/docs/components/bento-grid

Manual에서 desktop CTA는 opacity=0/translate-y-10이고 group-hover에서만 표시된다. 실제 1280×720 dark preview에서 첫 Learn more 링크에 focus한 뒤 Tab을 보내 다음 링크로 이동했다. activeElement는 `A`, text=Learn more, href=#, 부모 opacity=0, 위치 x=522.664/y=342이었다. 포커스된 CTA가 화면에서 보이지 않는 것을 스크린샷으로 확인했다. [키보드 상태 증거](assets/parallel-b-magic-bento-keyboard.png). 링크의 Enter 탐색은 실행하지 않았다. 기본/세로 bento 모든 card flow·touch/RTL/좁은 화면은 미검증이다. 기존 Grid/Card/action 슬롯에 같은 hover 표현을 채택한다면 focus-within에서도 CTA를 드러내는 조건이 필요하다.

### CodeComparison 미채택 근거

URL: https://magicui.design/docs/components/code-comparison

Manual 전체를 읽었다. Shiki 실패 catch는 원본 code를 `<pre>${beforeCode}</pre>` 또는 afterCode로 그대로 연결하고, 이후 highlighted 값을 dangerouslySetInnerHTML에 전달한다. 이 실패 경로에서 코드 입력이 HTML escape되지 않는 구현 근거가 있다. 외부 사이트에 입력 payload나 실패 유발은 실행하지 않았고 runtime exploit 완료로 보고하지 않는다. HJM [CodeBlock source](../../packages/react/src/code-block.tsx)는 token.text를 React text로 렌더하며 pre의 keyboard/LTR 계약도 유지한다. 비교 UI가 필요하면 기존 두 CodeBlock의 구성부터 시작하고 원본 fallback을 복사하지 않는다.

### HeroVideoDialog 실제 focus/Escape

URL: https://magicui.design/docs/components/hero-video-dialog

default dark preview에서 Play video에 Enter를 보내 overlay/iframe이 1개씩 생기는 것을 확인했다. activeElement는 뒤의 Play video trigger 그대로였다. 그 focus에서 Escape를 보내도 overlay/iframe이 남아 있었다. [Escape 후 상태 증거](assets/parallel-b-magic-hero-dialog-escape.png). 원본 Manual은 overlay에 role=button/tabIndex=0과 keyDown을 두지만 dialog 의미·초기 focus·trap을 제공하지 않는다. overlay에 직접 focus한 뒤 Escape를 보내면 exit 후 둘 다 0으로 정리되는 것을 확인하고 agent가 연 preview를 닫았다. YouTube 재생은 시작하지 않았다. 8개 animation variant·close pointer·focus restore·반복 열기·좁은 화면은 아직 전수 검증하지 않았다. HJM Dialog와 motionOrigin/media 슬롯에 표현만 연결하는 방향을 유지한다.

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
