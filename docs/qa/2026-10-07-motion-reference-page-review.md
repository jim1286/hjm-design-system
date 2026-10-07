# QA 리포트 — Motion Primitives 공개 페이지 검토

## 1. 최종 판정

**부분 확인. 11개 사이트 전수조사는 미완료다.** 이번 기록은 Motion Primitives에서 공개 내비게이션으로 발견한 HTML 36페이지의 기본 화면과 일부 구현·동작을 검토한 결과다. URL 수집, 소스 추출, 화면 캡처를 전수 검토 완료의 근거로 쓰지 않는다.

2026-10-07 사용자가 처음 요청한 전체 페이지 검토가 뒤로 밀렸음을 지적했다. 기존 일부 레퍼런스 적용·npm 게시·소비 앱 변경은 이 사이트 전수 검토의 완료 근거가 아니므로, 페이지별 검토 상태를 분리해 기록한다.

## 2. 대상과 이력

- 기준 HJM: main `55db5b6b4f51f782d73d7f35e5e96924d2a92fdf`. HJM 제품 코드를 바꾸거나 새 릴리스를 수행하지 않았다.
- 대상: 공개 실제 사이트 `https://motion-primitives.com/` 및 `/docs` 내비게이션. 외부 서비스 제출·가입·Open in v0·설치 명령은 실행하지 않았다.
- 실행: 2026-10-07 10:11–10:19 KST, Codex. 외부 사이트 source SHA는 제공되지 않아 페이지 본문·캡처·추출 소스 digest를 작업 중 보유한다.

## 3. 환경과 검증 범위

- 별도 headless Google Chrome 154.0.8037.98, 기본 데스크톱/light 화면 1440×1000; 후속 키보드 재현 1280×720. 실제 외부 사이트, 로그인 없음.
- Native·모바일·dark·큰 글자·RTL·모션 감소·스크린리더는 이번 실행에 포함하지 않았다.
- 공개 HTML anchor 순회: seed 36, 방문 36, 추가 발견 0, HTTP 200 36. sitemap/robots 주소는 앞서 404였으므로 내비게이션을 사용했다.
- 컴포넌트 33페이지에서 Code 96예제와 Manual 구현 31개를 추출했다. 후속 10-07 검토에서 Manual 31개와 두 toolbar의 Code 예제 전체를 읽었다. 후속 검토에서 Code 96예제 전체(140,086자)도 읽었다. 화면에서 변형을 모두 조작한 결과와는 구분한다.
- 기본 화면은 16장 구획별 모음과 홈·설치 본문 추가 2장으로 모든 페이지를 읽었다. In View처럼 아직 나타나지 않은 상태, pointer spotlight/cursor/tilt의 hover 상태, 자동 재생의 시간 축은 미확인이다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 페이지·흐름 | 실제 관찰 | 판정·흡수 판단 |
| --- | --- | --- |
| Accordion 첫 기본 예제 | Enter로 aria-expanded false→true, Space로 false | 기본 열고 닫기 확인. 원본 내용 연결 ID 부재; HJM 기존 API 유지 |
| Dialog 첫 기본 예제 | 키보드로 열림, INPUT 초점. Escape로 닫힌 뒤 초점 BODY. 클릭/키보드 양쪽 반복에서 트리거 복귀 false | 원본 초점 복구 문제 기록. HJM Dialog 계약 보존 |
| Disclosure 기본 예제 | Show more 이후 설명·코드 예제 내용 노출 | 펼침만 확인. 재접힘·모든 변형·초점 이동은 미확인 |
| Text Morph | Continue→Confirm. 입력 한글 테스트와 전체 문장의 aria-label 일치 1개 | innerText에 문장이 연속하지 않은 것은 문자별 span 때문이며 실패로 판정하지 않음. 결합 문자·emoji pending |
| Morphing Dialog 첫 기본 예제 | 키보드 열림/Escape 닫힘. aria-labelledby·aria-describedby 대상 각각 0개, 닫힌 뒤 BODY 초점 | 원본 ID/복귀 문제. HJM Dialog.motionOrigin 구성 유지 |
| Image Comparison 기본 예제 | drag 전 clip 50/50%, 후 약79.868/20.132%. role=slider 0 | pointer 비교는 작동. 키보드 경로 없는 원본 엔진을 HJM Slider 대신 쓰지 않음 |

외부 원본 문제를 HJM의 실패로 취급하거나 이번 문서 변경으로 수정됐다고 표현하지 않는다. MorphingDialog trigger는 제품 이름 대신 생성 ID를 접근성 이름에 사용했다. Title/Description 구현의 ID와 Content의 aria 참조가 연결되지 않는다. Dialog·MorphingDialog는 처음 트리거를 focus하고 Enter로 연 후 Escape로 닫고 activeElement=BODY를 재확인했다.

홈·Morphing Dialog·Text Loop 기본 캡처에서 React hydration error 418이 관찰됐다. 원인을 확정하지 않았으며 렌더 성공으로 오류를 지우지 않는다. Tilt API 문서의 제목은 Border Trail, Toolbar Expandable 페이지 제목은 Toolbar Dynamic으로 표기돼 있었다.

### 페이지별 검토 상태

모든 행의 화면 관찰은 기본 데스크톱/light 한 상태다. 소스·동작의 미완료는 화면 관찰과 별개다.

| 페이지 | 구현 검토 | 동작 검토 | HJM 선택·남은 판단 |
| --- | --- | --- |
| /docs | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| / | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| /docs/accordion | Manual 전체 읽음 | 기본 흐름 부분 확인 | Accordion / Collapsible — 기존 API 유지. 높이/opacity 전환과 아이콘 회전만 표현 후보. 원본 trigger에는 aria-expanded만 있고 내용 연결 ID가 없으므로 원본 상태 엔진을 교체 도입하지 않는다. |
| /docs/animated-background | Manual 전체 읽음 | 미완료/비상호작용 문서 | Tabs / SegmentedControl; 최종 채택 판단 미완료 |
| /docs/animated-group | Manual 전체 읽음 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |
| /docs/animated-number | Manual 전체 읽음 | 미완료/비상호작용 문서 | AnimatedStatistic (optional statistic-motion) — 기존 API 유지. 원본은 매 프레임 Math.round(...).toLocaleString()으로 암묵 locale을 사용한다. HJM의 명시 locale·Intl format·모션 감소·RTL fallback을 유지한다. |
| /docs/border-trail | Manual 전체 읽음 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/carousel | Manual 전체 읽음 | 미완료/비상호작용 문서 | Carousel / CarouselMotion; 최종 채택 판단 미완료 |
| /docs/cursor | Manual 전체 읽음 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/dialog | Manual 전체 읽음 | 기본 흐름 부분 확인 | Dialog — 기존 API 유지. 키보드 열기/Escape 닫기 확인; 닫은 뒤 BODY로 초점 이동. 전환 표현만 비교하며 기존 닫기·초점 복귀 계약은 보존한다. |
| /docs/disclosure | Manual 전체 읽음 | 기본 흐름 부분 확인 | Accordion / Collapsible; 최종 채택 판단 미완료 |
| /docs/dock | Manual 전체 읽음 | 미완료/비상호작용 문서 | NavigationBar / BottomNavigation; 최종 채택 판단 미완료 |
| /docs/glow-effect | Manual 전체 읽음 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/image-comparison | Manual 전체 읽음 | 기본 흐름 부분 확인 | ImageComparison — 기존 1.14 API 유지. 원본 mouse drag는 50%→약80% 작동하지만 role=slider와 키보드 조절이 없다. HJM은 기존 Slider로 range/키보드/Native adjustable를 유지한다. 이미지 위 drag 표현 필요성은 별도 실험 판단으로 남긴다. |
| /docs/in-view | Manual 전체 읽음 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |
| /docs/infinite-slider | Manual 전체 읽음 | 미완료/비상호작용 문서 | 제품 마케팅 구성; 최종 채택 판단 미완료 |
| /docs/installation | 문서 본문 읽음 | 미완료/비상호작용 문서 | 설치/소개 문서: 제품 dependency 직접 도입 아님; 최종 채택 판단 미완료 |
| /docs/magnetic | Manual 전체 읽음 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/morphing-dialog | Manual 전체 읽음 | 기본 흐름 부분 확인 | Dialog.motionOrigin / 버튼에서 이어지는 편집 구성 — 별도 MorphingDialog API를 만들지 않는다. 원본 제목·설명 aria ID 대상 없음, Escape 뒤 트리거 초점 복귀 없음. 기존 Dialog.motionOrigin과 제품 소유 초안 구성에 흡수한다. |
| /docs/morphing-popover | Manual 전체 읽음 | 미완료/비상호작용 문서 | Dialog / Popover / MorphingMenu; 최종 채택 판단 미완료 |
| /docs/progressive-blur | Manual 전체 읽음 | 미완료/비상호작용 문서 | 목록·이미지 장식; 최종 채택 판단 미완료 |
| /docs/scroll-progress | Manual 전체 읽음 | 미완료/비상호작용 문서 | ScrollProgress / Timeline; 최종 채택 판단 미완료 |
| /docs/sliding-number | Manual 전체 읽음 | 미완료/비상호작용 문서 | AnimatedStatistic; 최종 채택 판단 미완료 |
| /docs/spinning-text | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/spotlight | Manual 전체 읽음 | 미완료/비상호작용 문서 | EffectSurface / Card; 최종 채택 판단 미완료 |
| /docs/text-effect | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-loop | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-morph | Manual 전체 읽음 | 기본 흐름 부분 확인 | Text / TextTransition — 공통 텍스트 전환 표현 후보. Continue→Confirm과 한글 입력의 aria-label 갱신 확인. 원본은 split('')으로 코드 유닛을 나누므로 emoji·결합 문자·모션 감소를 확인하기 전 채택 확정하지 않는다. |
| /docs/text-roll | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-scramble | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-shimmer | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/text-shimmer-wave | Manual 전체 읽음 | 미완료/비상호작용 문서 | Text / TextTransition / 제품 소개 표현; 최종 채택 판단 미완료 |
| /docs/tilt | Manual 전체 읽음 | 미완료/비상호작용 문서 | 제품 장식 또는 optional 표현; 최종 채택 판단 미완료 |
| /docs/toolbar-dynamic | Code 전체 읽음 | 미완료/비상호작용 문서 | EditorScreen / MessageComposer; 최종 채택 판단 미완료 |
| /docs/toolbar-expandable | Code 전체 읽음 | 미완료/비상호작용 문서 | EditorScreen / MessageComposer; 최종 채택 판단 미완료 |
| /docs/transition-panel | Manual 전체 읽음 | 미완료/비상호작용 문서 | ContentTransition / Grid / List; 최종 채택 판단 미완료 |

## 5. 검사·관찰 결과

- 실행 도구: `motion-capture.cjs`(내비게이션 순회/렌더), `motion-source.cjs`(로컬 Code·Manual 탭 추출), `motion-behavior.cjs`, 키보드·한글 재확인 실행. 설치나 원격 양식 제출 없음.
- 단순 pointer 열림/닫힘을 통과 테스트로 부풀리지 않았다. 동작 관찰 6페이지, 키보드 복귀 문제 2페이지, 확인되지 않은 변형은 ledger에 남긴다.
- 최초 조사 스크립트가 Code를 button role로 찾아 timeout했다. 실제 role=tab으로 수정한 source 추출은 33/33페이지, 96예제, 추출 오류 0이다. 해당 도구 수정은 외부 컴포넌트 수정이 아니다.
- 비교에 읽은 HJM 원본: ImageComparison 사용 지침/Web 구현, AnimatedStatistic Web 구현, 버튼에서 이어지는 편집 구성, 입력을 유지하는 도구 구성. OriginDialog·ContextToolbar를 독립 공개 API라고 안내하지 않는다.


### 후속 구현 읽기와 표현 후보

2026-10-07 후속 검토: 남은 27항목을 읽어 구현 읽기를 33/33으로 갱신했다(Manual 31 + toolbar Code 2). 이는 사이트의 모든 예제·상태·플랫폼 검토 완료가 아니다. 아래 권장 후보는 전체 11개 사이트 비교 후 실험에 넣을 목록이며, 기존 엔진을 무조건 복제하거나 현재 fade 표현으로 새 표현을 대체 완료 처리하지 않는다.

| 원본 | 대응·분류 | 권장 표현과 남은 계약 |
| --- | --- | --- |
| animated-background | Tabs / SegmentedControl; 권장 표현 흡수 실험 | layoutId로 선택 배경이 이어지는 표현. 원본 cloneElement가 child onClick을 교체하고 data-checked만 사용하므로 선택 엔진은 HJM을 유지한다. hover는 선택 확정과 분리한다. |
| animated-group | ContentTransition / Grid / List; 권장 표현 흡수 실험 | fade/slide/scale/blur 및 stagger 진입을 비교한다. index key와 추가 wrapper 때문에 재정렬·의미 구조가 달라질 수 있어 기존 stable key와 레이아웃을 유지한다. |
| border-trail | EffectSurface / 장식 레이어; 권장 신규 표현 실험 | offsetPath를 따라 도는 테두리 표현. 원본 기본 repeat Infinity, 5초이며 구현 내부 모션 감소/가시성 분기가 없다. 의미 있는 진행은 기존 busy 상태가 소유하고 테두리는 장식이다. |
| carousel | Carousel / CarouselMotion; 기존 API + 표현 비교 | 부분 노출·custom indicator·spring 전환을 비교한다. 8px dot, hover opacity, 비활성 슬라이드 focus/AX 처리와 IntersectionObserver visible count를 실제 상태에서 확인하기 전 engine 교체를 확정하지 않는다. |
| cursor | 제품 장식 / pointer 표현 adapter 후보; 조건부 실험 후보 | global body cursor 숨김이 cleanup에서 복원되지 않고 parent enter/leave는 익명 함수가 달라 제거되지 않는다. pointer-capability·복원·정적 대체를 갖춘 독립 장식 표현으로만 검토한다. |
| disclosure | Collapsible; 기존 API + 표현 비교 | height auto와 opacity 전환을 흡수한다. trigger와 content ID 연결, child handler 조합, controlled open 소유는 HJM을 유지한다. 원본은 내부 open을 토글한 뒤 외부 callback에 통지한다. |
| dock | NavigationBar / BottomNavigation / Toolbar; 조건부 표현 실험 후보 | 가까운 아이콘 확대와 label 전환을 비교한다. 원본 DockItem은 div role=button이고 Enter/Space handler가 없으며 demo navigation도 구현하지 않는다. 실제 navigation 의미·label·고정 touch target을 보존해야 한다. |
| glow-effect | EffectSurface; 권장 표현 흡수 실험 | rotate/pulse/breathe/colorShift/flowHorizontal/static을 기존 glow와 비교한다. 임의 hex 기본색과 numeric blur의 동적 Tailwind class를 복사하지 않고 semantic palette·장식 강도·가시성·모션 감소에 연결한다. |
| in-view | ContentTransition / 제품 진입 구성; 권장 표현 흡수 실험 | useInView·once·margin으로 진입 시점을 정하는 표현. 필수 콘텐츠를 opacity 0으로 계속 숨기지 않도록 실패/모션 감소/지원 누락의 정적 노출을 확인한다. |
| infinite-slider | Carousel / 로고·추천 목록 구성 후보; 권장 별도 구성 실험 | 자동 루프와 hover 속도 변경을 비교한다. 원본은 children을 접근성 구분 없이 두 번 렌더하며 speedOnHover=0은 falsy라 정지되지 않는다. 정지·focus/hover·중복 AX 제거·정적 목록을 구성 계약으로 검토한다. |
| magnetic | 제품 장식 / pointer 표현 adapter 후보; 조건부 실험 후보 | self/parent/global 범위의 spring 이동을 비교한다. 안정된 hit frame·기본 누르기·pointer 지원·모션 감소와 복귀를 유지하며 버튼 행동 계약을 교체하지 않는다. |
| morphing-popover | Popover.motionOrigin / 버튼에서 이어지는 편집; 기존 API 유지·표현 흡수 | 원본은 aria-modal=true이지만 focus trap/inert/초점 복귀를 자체 제공하지 않는다. asChild의 onClick도 덮는다. HJM의 non-modal 편집·바깥 클릭·초점 복귀와 제품 draft를 유지한다. |
| progressive-blur | ProgressiveBlur; 기존 1.14 API 유지 | 원본 방향별 mask/backdropFilter 레이어 표현을 비교한다. 원본 layer clamp와 segment 계산이 다른 입력을 사용하고 상한이 없다. HJM의 경계·초점 시 제거·2~8층·Native host 계약을 유지한다. |
| scroll-progress | ScrollProgress; 기존 API 유지·표현 비교 | 문서나 내부 scroll container의 읽기 위치 표현이다. 원본 origin-left와 scaleX는 물리 방향이므로 RTL과 실제 container를 확인한다. 서버 작업 완료율로 사용하지 않는다. |
| sliding-number | AnimatedStatistic; 기존 API 유지·표현 비교 | 세로 숫자 rolling 표현. 원본은 자리마다 10개의 숫자를 렌더하고 spoken value를 별도로 숨기지 않으며 toString/parseInt에 의존한다. 기존 locale·finite value·Intl·단일 spoken value를 유지한다. |
| spinning-text | Text / 장식 텍스트 전환 후보; 조건부 표현 실험 후보 | 원형 배치와 회전. 원본은 문자 aria-hidden + 전체 sr-only로 읽기 중복을 피한다. code-unit 분할·반경·모션 감소·자동 재생 정지를 검토하고 중요 본문을 원형으로 대체하지 않는다. |
| spotlight | EffectSurface / pointer 장식 후보; 권장 표현 흡수 실험 | 마우스를 따라 움직이는 radial highlight. 원본이 parent position/overflow를 직접 바꾸고 복원하지 않으므로 원래 레이아웃·overflow를 보존하는 scoped layer로 비교한다. |
| text-loop | TextTransition / 제품 순환 문구 구성 후보; 권장 별도 구성 실험 | interval/trigger/onIndexChange 순환. 원본은 빈 children·interval 경계 검증이 없고 nowrap이다. 정지·줄바꿈·읽기 시간·내용의 단일 AX 값과 실제 작업 상태 분리를 검토한다. |
| text-effect | TextTransition; 권장 표현 흡수 실험 | word/char/line reveal·preset·delay·speed 축을 기존 전체 문장 fade와 비교한다. 원본 char는 split(''), speed는 나눗셈에 사용된다. grapheme·검증된 시간·선택/줄바꿈·단일 spoken value·모션 감소를 제공해야 한다. |
| text-roll | TextTransition; 권장 표현 흡수 실험 | char rotateX 전환. 원본은 이중 시각 문자를 aria-hidden으로 숨기고 sr-only 전체 문장을 제공한다. grapheme·실제 line height·텍스트 선택·모션 감소를 확인한다. |
| text-scramble | TextTransition; 권장 표현 흡수 실험 | 짧은 문구의 scramble 후 복원. 원본 interval은 unmount cleanup이 없고 children 변경은 effect dependency에 없다. 새 값/중단/언마운트·grapheme·안정된 AX 문장을 다룬 표현으로 검토한다. |
| text-shimmer | TextTransition / 상태 문구 표현 후보; 권장 표현 흡수 실험 | 문장 전체에 이동 gradient. 기존 plain text와 나란히 비교하고 semantic text color·실제 대비·모션 감소·정지/가시성을 검증한다. 표현이 임의로 busy 상태를 만들지 않는다. |
| text-shimmer-wave | TextTransition / 상태 문구 표현 후보; 권장 표현 흡수 실험 | 각 문자의 3D 이동/색/scale wave. 원본은 code-unit 분할, 무한 반복, 기본 muted hex를 사용한다. grapheme·단일 AX 문장·줄바꿈·브랜드 대비·모션 감소를 함께 검토한다. |
| tilt | 제품 장식 / pointer 표현 adapter 후보; 조건부 실험 후보 | mouse 위치에 따른 perspective 회전과 leave 복귀. 원본 transform이 외부 style.transform을 덮으므로 안정된 frame과 합성·정적/touch 대체를 비교한다. |
| toolbar-dynamic | SearchField / Collapsible / 입력을 유지하는 도구 구성; 기존 구성 + 표현 비교 | 98→300px 폭 전환. uncontrolled input이 닫힘 때 unmount되므로 재열기 시 검색어 보존이 없다. 제품 소유 query·responsive 폭·Escape/초점 복귀·44px hit target을 유지한다. |
| toolbar-expandable | Collapsible / SegmentedControl / 입력을 유지하는 도구 구성; 기존 구성 + 표현 비교 | 선택한 도구의 측정 높이 전환. 초기 maxWidth를 한 번만 고정하고 selected/expanded ARIA를 주지 않는다. 입력/선택 유지와 실제 변화하는 폭·큰 글자·선택 의미를 기존 구성에서 제공한다. |
| transition-panel | ContentTransition / Tabs / 온보딩 구성; 기존 API + 표현 비교 | activeIndex에 따른 keyed enter/exit. 원본은 index 범위 검증·입력 보존·출력 확정·초점 이동을 별도 제공하지 않는다. 기존 단일 active subtree·제품 상태·focusTarget·height motion을 유지한다. |

원본 구현에 자체 모션 감소 분기가 없다는 소스 관찰과 실제 사이트 전체의 모션 감소 동작은 다르다. 상위 MotionConfig·CSS·브라우저 media 환경 실측 전 사이트 차원의 미지원으로 확정하지 않는다.

### 예제 Code 96개 전체 읽기

후속 검토에서 모든 Code 예제를 읽었다(33페이지, 96예제, 140,086자). 반복 문구·스타일을 포함한 전체 추출 텍스트를 확인했다. Manual 구현 31개 및 두 toolbar Code 읽기와 별도로, 각 예제의 상태 연결·의미·자산·사용 조건을 대조했다. 실제 브라우저의 각 변형 동작은 계속 미완료다.

- AnimatedBackground의 icon 탭은 36px 버튼에 이름이 없고 선택 의미도 data-checked만 쓴다. hover 카드와 확정 선택을 구분해 기존 Tabs/SegmentedControl 엔진에 표현을 흡수한다.
- AnimatedGroup의 National Geographic/Sony 이미지 alt가 각각 Apple Music/Chrome으로 남아 있다. Tilt+Spotlight 예제의 표시 제목 2001: A Space Odyssey와 alt Ghost in the Shell도 다르다. 외부 예제의 자산·alt를 제품에 그대로 복사하지 않는다.
- BorderTrail 예제의 Submit은 장식 animationComplete로 loading을 종료한다. GlowEffect의 Submit도 glow 표시를 토글할 뿐 실제 요청 결과가 없다. 전환 시간과 실제 작업 확정을 연결하지 않는다. BorderTrail textarea에 label 연결이 없는 것도 별도 기록한다.
- Carousel의 부분 노출·별도 배치 탐색·48px custom indicator를 비교 후보로 둔다. 각 인디케이터의 선택 의미·비활성 slide 초점은 원본 행동을 추가 확인한다.
- Disclosure 이미지 클릭은 div onClick이며 Learn More 행동이 비어 있다. Dock 데이터의 href는 렌더된 항목에 연결되지 않는다. 보여 주는 효과와 제공되는 실제 기능을 구분한다.
- MorphingDialog의 확대 카드·90vh 책 설명·90vw 이미지 lightbox는 서로 다른 구성 예시다. 책 팝업의 500px 고정 폭, trigger 내부 작은 plus 버튼과 의미 연결을 실제 mobile/keyboard에서 확인해야 한다.
- MorphingPopover 치수 입력은 defaultValue로만 유지된다. Note 예제의 닫기/Submit은 note를 지우고 닫으며 form 제출은 preventDefault다. 저장 성공/실패/재시도 기능이 아니다. 제품 draft·실제 확정 결과를 기존 구성에 연결한다.
- ProgressiveBlur hover 예제는 설명을 mouse enter에서만 보인다. 키보드/touch에서 필수 내용을 볼 수 있어야 하고 300px 카드·양쪽 200px 흐림 영역을 작은 화면에서 별도 확인한다.
- InView는 내부 스크롤·반복 진입·once 이미지 grid를 제공한다. 기본 screenshot만으로 숨겨진 영역의 reveal이 정상이라고 보고하지 않는다.
- SlidingNumber의 slider 예제는 초기값 100인데 min=500이다. 실제 range 값/숫자 표시 정합성을 확인한다. 시계·자동 0→100은 제품의 실제 진행률을 의미하지 않는다.
- TextEffect는 char/word/line·blur/slide·지연·custom random 색·exit 반복·speed 조절을 구분한다. TextLoop의 방향/interval, TextRoll의 delay/variant, TextScramble의 hover/custom 문자, Shimmer/Wave의 semantic 대비 축을 각각 비교한다. 자동 재생·읽기 시간·grapheme·정지는 공통 요구다.
- TransitionPanel의 마지막 Close 버튼은 onClick에서 null을 반환해 실제 닫기 동작이 없다. Next/Previous의 표현과 완료/닫기의 제품 행동을 분리한다. Tabs 예제의 선택 역할도 HJM Tabs 계약으로 보존한다.

전체 예제 읽기는 source review 완료 범위이며 UI·기능 검증·실험 구현·승격의 완료 근거가 아니다.

### 96개 Preview 기본 화면 직접 확인

Code와 대응하는 Preview 96패널을 각각 캡처하고 6개씩 모은 16장을 모두 읽었다. 데스크톱 1440×1000/light 기본 화면이다. 자동 실행 중의 한 프레임은 애니메이션 완료/정지 검증이 아니며, Dialog/Popover는 닫힌 트리거 상태, InView는 내부 scroll 전 상태, Cursor/Spotlight는 hover 전 상태다. 이 조건을 원장에 명시했다.

- Accordion 3종, 배경 선택 4종, 그룹 진입 3종, 숫자 3종, 테두리 3종, Carousel 4종, Cursor 3종의 기본 표시를 확인했다.
- Dialog 5종·Disclosure 2종·Dock 1종·Glow 3종·ImageComparison 4종·InView 3종·InfiniteSlider 3종·Magnetic 2종도 각 Preview를 확인했다. 이미지 slider 4종은 모두 초기 양쪽 분할이며 내부 scroll/hover는 별도 확인한다.
- MorphingDialog 3종·MorphingPopover 3종·ProgressiveBlur 3종·ScrollProgress 3종·SlidingNumber 3종·SpinningText 3종·Spotlight 3종을 확인했다. 그림 hover 설명과 pointer highlight가 아직 보이지 않는 상태를 누락이나 기능 통과로 처리하지 않는다.
- TextLoop 3종·TextEffect 8종·TextMorph 2종·TextRoll 3종·TextScramble 3종·TextShimmer 2종·Wave 2종·Tilt 2종·두 toolbar 각 1종·TransitionPanel 2종을 확인했다. 정적 화면에서는 TextRoll의 중간 전환 글자 위치, shimmer gradient·wave의 일부 프레임만 볼 수 있다. 시간이 흐르는 전체 품질은 추가 검증한다.

패널 캡처 총 96개/Code 총 96개로 수는 일치한다. 해당 대응은 예제 개수 확인이며 browser 동작 전수 통과가 아니다. 모음 caption에서 긴 함수 이름이 옆 칸과 겹치는 것은 리포트 산출물 문제이고 원본 컴포넌트 UI 결함으로 분류하지 않는다.

### 추가 실제 동작 확인

- ToolbarDynamic에서 `검토용 메모`를 입력하고 Back으로 닫은 뒤 다시 열었다. 입력은 빈 값으로 돌아갔으며 닫힌 뒤 activeElement는 BODY였다. 재열린 화면도 직접 확인했다. 제품 query/draft 보존과 초점 복귀를 원본 표현에 맡기지 않는다.
- TransitionPanel의 Next를 세 번 누른 뒤 Close를 눌렀다. 최종 Design System 카드와 Close 버튼이 계속 보이는 화면을 확인했다. 전후 텍스트 차이는 이전 패널 exit가 정리되면서 생겼으므로 닫기 성공으로 계산하지 않는다. 소스의 Close handler는 null을 반환한다.
- SlidingNumber 예제의 실제 range DOM 값은 500(min=500/max=100000/step=50)이었다. 읽은 소스 초기 상태와 기본 화면의 표시 100과 다르다. DOM 텍스트에 각 자리의 0~9가 모두 있었지만 실제 screen-reader 발화는 아직 확인하지 않았다.
- InView 세 예제의 내부 scroll을 0/25/50/75/100%로 이동해 computed style을 관찰했다. 첫 예제는 후반에 opacity=1, 세 번째 grid는 중간 이후 opacity=1이었다. 두 번째의 Athletics는 중간에서 보였지만 다른 두 항목은 이 거친 간격에서 보이지 않았다. 더 촘촘한 위치·정착 시간 검토 전 실패로 확정하지 않는다. 이 scroll 관찰의 모든 캡처를 시각 검토했다고 계산하지 않는다.

위 기록은 특정 시나리오의 관찰이며 모션 감소·모든 변형·접근성 통과 판정이 아니다.

### 병렬 조사 후속: Carousel 네 변형과 MorphingPopover 세 변형

2026-10-07 14:32–14:42 KST, root가 IAB의 실제 사이트를 확인했다(HJM main `e7e418a8`).
기존 추출본의 두 Manual과 각4/3 예제 전체를 재독해했으며 새로운 페이지 수로 올리지 않는다.
capture digest는 Carousel `6ff491c72d9de2166751759771f99ad526597d24b324e7284916096f0c0e097a`,
MorphingPopover `ab41a743dd5d2fdef88b519378f9761f347e668a1530f10f4fca8e5a61168d06`다.

Carousel의 기본·1/3폭·간격·custom indicator 네 변형을1280px/light→dark에서 조작했다.
기본 Next Enter/첫 dot Space, 1/3폭·간격 Next 여섯 번/끝 disabled, custom4 Enter/Space를
확인했다. 1/3폭 초기1·2·3에서 끝에는7만 보이고 나머지 폭은 비었다. 기본 dot8×8,
탐색32×32이고 dot/custom 번호 어느 쪽도 current/pressed/selected ARIA를 제공하지 않았다.
원본 slide는 inert/aria-hidden 없이 DOM에 남았다. 숫자만 있는 예제이므로 숨겨진 interactive
child의 focus 누출까지 검증한 것은 아니다. 1/3폭 Next는 키보드 초점이 있어도 opacity0이었다.
세 번째 Code tab→Shift+Tab, 좁은 화면의 Previous→Tab 양쪽에서 확인했다. hover만 reveal하는
Manual과 일치한다. Radix tab 자동 선택으로 숨겨진 Preview에 track이 없자 최초 helper가
실패했으며 Preview를 복원한 뒤 계속했다. 도구 오류를 원본 결함으로 세지 않는다.

390×844/dark, prefers-reduced-motion=reduce(matchMedia=true)에서도 custom indicator가
translateX -298.728%→-276.594%→0, 0→-2.11085%→-300% 중간 좌표를 보였다.
이 경로의 공간 이동 관찰이며 사이트 전체 모션 미지원이나 FPS 측정이 아니다. 폭 변경 뒤
간격 변형의 마지막 상태는 frame308px/translateX -300%/visible card0으로 정착했다.
Next disabled인데 빈 영역이 보였다. Manual은 observer의 이번 entries 중 visible 개수를
분모로 쓰고 전체 가시성 map을 유지하지 않는다. 이는 원인 후보이며 callback 전수 계측으로
원인을 확정하지 않았다. 문서 scrollWidth395/viewport390의 넘침 원인도 미확정이다.
custom indicator pointer drag는2→3 이동했다. 다른 세 drag·touch 경로는 미확인이다.

MorphingPopover는 같은390px/dark/reduced에서 기본·blur·메모 세 변형을 확인했다.
첫 예제 Width autoFocus/240px 편집, Max.height→Tab에서 dialog 밖 다음 Preview로 초점이
이동해도 dialog가 남았다. aria-modal=true지만 aria-label/labelledby가 없었다. custom 변형의
256px 편집→Escape→exit DOM 제거→재열기는100%이고 닫힌 후 activeElement=BODY였다.
defaultValue 편집이며 제품 저장 초안이 아니다. 메모 `밤 산책 👩🏽‍💻` 입력→Escape→exit 종료→
Add Note Enter에서는 textarea가 비었지만 note 상태가 남아 caption opacity0이었다.
textarea의 aria-label/labelledby/placeholder는 모두 없었다. Close popover Enter 후 DOM은
제거되고 초점은 BODY였다. Submit/서버 저장은 실행하지 않았다. 빠른 재열기 중 잠시 두
exit/enter DOM과 중복 field ID가 보였지만 정착 뒤 하나/중복0이라 지속적 중복 결함으로
판정하지 않는다. defaultValue attribute와 실제 input.value를 구분해 정착 값을 재확인했다.

- [숨은 Next 키보드 초점](assets/2026-10-07-motion-carousel-hidden-focus.png),
  SHA256 `e0dd6f274753ff980252ab8a51c55a569fda41d17ee95f5c0d4ebf150ef0f9e6`.
- [폭 변경 뒤 빈 마지막 카드 영역](assets/2026-10-07-motion-carousel-resize.png),
  SHA256 `b68050f1849ce6e286a79c2011f07c30d05bdb6c0c5dc4d3d700c872a89e11dd`.
- [메모 재열기의 빈 값/숨은 caption](assets/2026-10-07-motion-popover-reopen.png),
  SHA256 `01b8168362ada4c02aa42dcc2bc44a4aa1c7af78d317b91c6a6b9833b8083d6f`.

이 PNG는 실제 결과 증거로 보존한다. 임시 viewport/media를 해제하고 System theme을 선택해
복원한 뒤 본 작업의 탭을 닫았다. 메뉴 조회의 일시 timeout은 같은 살아 있는 탭 재조회로
복구했으며 새 브라우저/탭을 시작하지 않았다. HJM 소스·CI·릴리스·소비 앱 변경은 없다.
기존 Carousel의 stable id/선택 의미/44px/inactive hidden·inert/RTL·정지 계약과 Popover의
nonmodal 편집/초점 복귀/controlled draft를 유지한다. 다중 visible/부분 노출은 명시적
collection presentation 후보이며 현재 단일 active Carousel이 제공한 것으로 세지 않는다.
두 URL도 모든 환경/상태/원본 hook·license 검토 완료는 아니다.

## 6. 미확인 범위와 후속 조건

- 11개 사이트 전체 검토 미완료. [사이트 목록](../plans/reference-site-inventory.json)의 URL 수는 검토 완료 수가 아니다. canonical 중복·추가 링크 발견·차단 페이지는 별도 추적한다.
- Motion: 96예제의 모든 동작, dark/mobile/large text/RTL/reduced motion, 포커스 순회와 screen reader, 자동 재생 정지/hover/scroll 상태.
- 공개 소스의 hook/registry 연결과 라이선스·의존성은 후속에서 확인. 외부 링크 전체 인터넷을 방문했다는 주장은 하지 않는다.
- HJM 신규 표현 실험·기능/UI 검사·승격·새 npm release는 위 검토·선택 이후 진행한다. 이미 게시한 1.14.0을 전수 검토 완료로 재분류하지 않는다.

## 7. 보관 처리

- 전수 검토 작업은 실행 중이다. 원시 HTML/소스/캡처/시나리오 JSON은 저장소 밖 작업 임시 공간에 남겨 이어서 검토한다. 종료 후 원본과 최종 리포트를 대조하고 제거한다.
- 저장소에는 페이지별 의미 있는 요약과 [컴포넌트 ledger](../plans/reference-component-review-ledger.json), [사이트 목록](../plans/reference-site-inventory.json)만 갱신한다. 원시 파일을 영구 증거 링크로 삼지 않는다.
