# 11개 UI 레퍼런스 전수 조사와 HJM 흡수·교체 후보

조사일: 2026-10-06 · 상태: **부분 확인, 전수 조사 완료 아님** · 범위: React Web / React Native.

사용자가 11개 사이트의 모든 페이지를 조사하고, 이미 HJM에 있는 기능도 흡수 또는 교체
가능성을 검토하도록 요청했다. 아래는 그 요청에 대한 조사 기록이다. 새 규범이나 구현 완료
선언이 아니며, 외부 데모가 보기 좋다는 이유만으로 기존 행동 계약을 교체하지 않는다.

현재 결론은 우선 후보 **18개**, 네 개 공식 목록의 HJM 대응 분류 **283개**(60 + 33 + 78 + 112),
확정한 엔진 교체 **0개**다. 283개는 사이트 간 중복을 제거한 고유 기능 수가 아니라 각 목록 항목의 합이다.
주요 신규 후보는 이미지 전후 비교와 별점이며, 먼저 할 일은 기존 버튼·업로드·소개 화면 구성과 선택 표시의 개선이다.

## 1. 판정과 범위

- 사이트맵과 공개 내부 링크에서 발견한 URL, 본문 확보, 공식 배포 데이터 확보, 소스 정적 분석,
  사람이 읽고 대조한 후보, 실제 브라우저 조작을 구분한다. HTTP 200은 UI 검토 통과가 아니다.
- 원래 11개 사이트 내부의 공개 콘텐츠가 조사 대상이다. 갤러리가 연결하는 모든 외부 웹사이트,
  로그인 계정의 개인 보관함, 구매한 템플릿 내부까지 조사했다고 해석하지 않는다.
- 21st는 에이전트용 Markdown을 제공하지만 이용약관 §3에 별도 서면 동의 없는 일괄 자동 수집
  금지가 있다. 이를 확인한 뒤 대량 수집을 중단했다. 검색·개별 열람과 원저자 공식 저장소를
  이용하는 범위로 제한하며, 12,340개 URL 전체의 본문·코드·시각 검토는 미완료다.
- Uiverse 웹 원문은 직접 요청에서 403이었다. 공식 Galaxy 저장소의 공개 소스 3,802개를
  조사했지만, 이것이 현재 웹사이트 전체와 일치한다고 주장하지 않는다.
- HJM 대조 대상: `main`, 조사 중 HEAD `6172d260ab673f80d4d93a9ccafb72207dc8ccc7` 및
  공유 checkout의 기존 미커밋 파일. 게시된 npm 패키지나 소비 앱 적용 상태를 뜻하지 않는다.
- 비교 기준은 [공개 API 대응표](../generated/public-component-map.md), 실제 renderer 소스,
  [사용 지침](../../packages/design-contracts/docs/usage/README.md)이다. 이름이 다른 companion,
  optional subpath, 실험 화면까지 포함했다. 기존 미커밋 구현은 이번 조사 성과로 세지 않는다.

## 2. 수집·검토 범위

<!-- coverage:start -->
| 사이트 | 발견한 페이지 URL | 본문 확보 | 검토 수준·미확인 범위 |
| --- | ---: | ---: | --- |
| [minimal.gallery](https://minimal.gallery/) | 3,811 | 3,811 | 사이트맵 3,433개 + 내부 연결 378개. 같은 조건의 내부 링크 재탐색에서 추가 0개. 개별 스크린샷 전체 시각 검토는 미완료. |
| [designbookmark.com](https://designbookmark.com/) | 2,655 | 108 + 도구 데이터 2,547 | 도구 2,547개는 공식 클라이언트 데이터의 설명·분류로 확보, 나머지 108개 정보/카테고리 본문 확인. 외부 제품까지 검사한 수가 아님. |
| [component.gallery](https://component.gallery/) | 66 | 66 | 66개 본문, 그중 컴포넌트 정의 60종 전체를 HJM 의미와 대응(§8). |
| [cta.gallery](https://cta.gallery/) | 551 | 551 | 551개 본문 및 공식 검색 인덱스 확보. 스크린샷 551개를 시각 검토한 수가 아님. |
| [21st.dev](https://21st.dev/) | 12,340 | 3,296 | 3,312개 시도 후 약관 확인으로 일괄 수집 중단. 원본 코드·전체 목록의 채택 판단 미완료. |
| [ui.aceternity.com](https://ui.aceternity.com/) | 548 | 536 | 536개 본문, API가 링크한 별칭 등 12개는 404. API 112종 분류(§11), 유료 block 소스 미확보. |
| [magicui.design](https://magicui.design/) | 262 | 262 | 262개 본문과 공식 전체 텍스트. corpus 컴포넌트 78종 분류(§10). |
| [motion-primitives.com](https://motion-primitives.com/) | 36 | 36 | 36개 본문과 공식 공개 소스. 컴포넌트 문서 33종 분류(§9). |
| [3dicons.co](https://3dicons.co/) | 223 | 223 | 223개 본문 중 icon 상세 211개 CC0 표시 확인. 파일별 시각·최적화 검증은 미실행. |
| [styles.refero.design](https://styles.refero.design/) | 1,394 | 1,394 | 1,394개 본문 중 style 1,342개. 이미지 URL 1,342개는 페이지 집계에서 제외. |
| [Uiverse](https://uiverse.io/) | 사이트 전체 수 미확정 | 웹 403 / 공식 소스 3,802개 | Galaxy 저장소 11개 폴더 전체 HTML 정적 신호 분석. 현재 사이트와 동등한 전수 목록이라는 증거 없음. |

초기 9개 사이트맵의 URL 합계 22,760에는 Refero 이미지 1,342개가 포함돼 있었다. 이를 뺀 초기 **페이지 수는 21,418**이다. 위 표는 이후 내부 링크 추가·잘못된 정적 파일 경로 제거까지 반영한 사이트별 수이며, 현재 사이트의 영구적인 전체 수를 뜻하지 않는다. 페이지 이동·별칭을 포함한 URL 기준이며 중복 콘텐츠를 제거한 디자인 수가 아니다. 쿼리 조합·개인 보관함·로그인 이후 화면·외부 연결 제품은 제외했다.
<!-- coverage:end -->

공식 전체 데이터가 있는 경우 다수 요청 대신 해당 배포 데이터를 읽었다. DesignBookmark의
클라이언트 데이터는 원본 2,566개였고, 배포 코드에 있는 제외 호스트 규칙을 적용하면 2,547개로
사이트맵의 도구 상세 수와 일치했다. 해당 데이터를 실행하지 않고 문자열을 파싱했다.
이것은 도구 설명·분류 확보이며, 2,547개 외부 제품의 동작을 검증했다는 의미가 아니다.

CTA Gallery의 공식 Framer 검색 인덱스는 사이트맵과 같은 551개 페이지를 담고 있었다.
화면 스크린샷 안에만 있는 문구·간격·상태는 이 텍스트 인덱스로 판정하지 않는다.

Aceternity API의 112개 컴포넌트·9개 block 항목과 사이트맵의 204개 block 경로는 단위가
다르다. API 목록만으로 전체 block 조사를 끝내지 않고 각 경로의 본문과 대조했다.

## 3. 우선 검토할 흡수·교체 후보

비용은 코드 검토에 따른 상대 추정이다. 실제 개발 기간이나 성능 개선 수치가 아니다.
아래 외부 패턴의 효과는 아직 HJM에서 구현·실측하지 않았다.

| 우선 | 후보·출처 | 현재 HJM / 판단 | 구체적으로 가져올 부분 | Web / Native·비용 |
| --- | --- | --- | --- | --- |
| P1 | [Morphing Popover](https://motion-primitives.com/docs/morphing-popover), [Morphing Dialog](https://motion-primitives.com/docs/morphing-dialog) | `Popover`, `Dialog`, `MorphingMenu`에 **표현 흡수 후보** | 트리거가 콘텐츠로 이어지는 위치·크기 전환. 기존 포커스·닫기·overlay stack 계약은 유지 | Web optional presentation부터. Native는 측정·키보드·취소 복원이 별도 필요. 높음 |
| P1 | [Transition Panel](https://motion-primitives.com/docs/transition-panel) | `ContentTransition`을 **선택적으로 개선** | 내용 길이가 달라질 때 주변 레이아웃 변화까지 안정화할 수 있는지 검토. 외부 구현의 exit 복사본을 그대로 가져오지 않음 | 양쪽 단일 활성 콘텐츠 계약 유지, 폼 상태·빠른 전환·큰 글자 확인. 중간 |
| P1 | [Animated Background](https://motion-primitives.com/docs/animated-background) | `Tabs`의 gooey 표시가 이미 존재. `SegmentedControl`과 **내부 표현 공유 검토** | 선택 배경의 연속 이동을 비교하되, 외부 컴포넌트의 별도 선택 상태를 추가하지 않음 | Web/RN 각각 기존 selection 소유자 유지. 중간 |
| P1 | [Stateful Button](https://ui.aceternity.com/components/stateful-button) | 기존 `Button`의 **완료 피드백 흡수 후보** | idle→pending→success/error의 크기·라벨·아이콘 전환. 실패 시 재시도와 실제 요청 상태를 연결 | 양쪽 공통 상태 의미, 구현은 각 renderer. 중간. 소스 이용 조건 별도 확인 |
| P1 | [File Upload](https://ui.aceternity.com/components/file-upload) | `FilePicker` + `UploadItem` + `Progress` **구성 개선** | 파일 선택 후 미리보기·중복·오류·재시도·취소를 한 흐름으로 배치 | Web drop, Native picker를 구분. 중간. 업로드 API는 제품 소유 |
| P1 | [Bento Grid](https://magicui.design/docs/components/bento-grid) | `Card`·`Grid`와 기존 제품 소개 실험 화면의 **구성 개선** | 주요 기능 카드와 보조 카드의 크기 차이, 카드 안 제품 미리보기, 설명·행동의 위계 | Native 기본 Grid는 동일 폭 셀이다. CSS span을 그대로 복사하지 않고 세로 흐름/중첩 구성으로 번역. 중간 |
| P1 | [CTA Gallery](https://www.cta.gallery/), [Centered CTA](https://ui.aceternity.com/blocks/cta-sections) | `BottomCTA`·`BottomInfo`·기존 소개/비교 화면의 **예제 보강** | 행동 전에 가치·조건을 설명하는 배치, 주/보조 행동 구분, 본문 CTA와 화면 하단 CTA의 역할 구분 | 양쪽 가능. 카피·가격·증거는 제품 데이터. 낮음~중간 |
| P1 | [Refero Styles](https://styles.refero.design/) | 기존 사용 지침·제품 DESIGN의 **문서 구조 개선** | 색 이름이 아니라 역할, 제목/본문 서체의 역할, 간격·밀도·이미지 방향을 레퍼런스와 HJM 토큰으로 연결 | 공통 계약을 바꾸기보다 제품 테마·화면 brief에 적용. 낮음 |
| P2 | [Image Comparison](https://motion-primitives.com/docs/image-comparison), [Compare](https://ui.aceternity.com/components/compare) | 공개 API 대응표에 전용 대응 없음. **신규 구성 후보** | 같은 위치의 두 이미지를 드래그로 비교, 전/후 라벨, 원본 전체 보기 | HJM `Slider`의 키보드/접근성 의미와 결합 설계. Native gesture·스크롤 충돌 별도. 중간~높음 |
| P2 | [Toolbar Dynamic](https://motion-primitives.com/docs/toolbar-dynamic), [Toolbar Expandable](https://motion-primitives.com/docs/toolbar-expandable) | `EditorScreen`·`MessageComposer`의 **구성 후보** | 선택한 작업에 따라 도구 영역만 확장하고 입력 문맥 유지 | Native 키보드·safe area가 핵심. 외부 예제의 업무 로직을 공용화하지 않음. 중간 |
| P2 | [Progressive Blur](https://magicui.design/docs/components/progressive-blur) | 목록·이미지의 **선택적 가장자리 표현** | 더 내용이 있다는 시각 힌트. 버튼·텍스트를 흐리거나 조작 영역을 가리지 않도록 제한 | Web CSS와 Native 표현/비용이 다름. 공용 기본값으로 채택하지 않음. 중간 |
| P2 | [Noise Texture](https://magicui.design/docs/components/noise-texture), 배경·광원 패턴 | `EffectSurface`의 **레이어 흡수 후보** | 기존 mesh/glow/grain과 다른 결과가 필요한 패턴만 preset 후보로 비교 | 현재 Web은 가시성·문서 비활성·reduced motion 처리. 이 수명주기를 유지. 중간 |
| P2 | [Hero Video Dialog](https://magicui.design/docs/components/hero-video-dialog) | `Dialog` + `Asset`의 **구성 예제** | 정적 포스터에서 설명 영상으로 이어지는 흐름, 닫기 시 재생 중단 | Web/RN host player 차이와 자막·오디오 정책 확인. 중간 |
| P2 | [Rating](https://component.gallery/components/rating/) | 전용 공개 API 없음. **신규 기능 후보** | 읽기 전용 평균 점수와 사용자가 입력하는 별점의 계약 분리 | 실제 소비 제품 필요 확인 후. 키보드/스크린리더·소수점·미평가 값 필요. 중간 |
| P2 | [3dicons](https://3dicons.co/) | `Asset`·`EmptyState`·`Result`·`OnboardingScreen`의 **제품 자산 슬롯 활용** | 빈 상태·완료 화면의 소량 3D 그림 | 아이콘 라이브러리 전체를 HJM 번들에 넣지 않음. 의미 전달용 작은 `Icon`은 유지. 낮음 |
| P3 | [Number Ticker](https://magicui.design/docs/components/number-ticker), Motion 숫자 효과 | `AnimatedStatistic` **교체 검토 후 현재 유지 권고** | 진입 시 count-up 예제가 필요한지 확인. 기존 값 변경 모핑을 대체할 근거는 부족 | 현재 Intl·RTL·비라틴 숫자 fallback을 잃지 않아야 함. 중간 |
| P3 | [Scroll Progress](https://magicui.design/docs/components/scroll-progress), [Tracing Beam](https://ui.aceternity.com/components/tracing-beam) | `ScrollProgress`·`Timeline` **표현만 흡수 검토** | 읽기 흐름을 나타내는 선/강조 | 현재 HJM은 명시적 scroll host와 크기 변화를 처리. window 전용 구현으로 교체할 이유 없음. 낮음~중간 |
| P3 | [Animated List](https://magicui.design/docs/components/animated-list) | `List`·`NotificationItem`·`ContentTransition` **소개 화면 예제 후보** | 항목 등장 순서의 리듬 | 실제 알림 수신을 타이머로 만들어 보이지 않음. 데이터 읽기 지연 금지. 중간 |

## 4. 실제 기존 코드와 비교한 이유

### 상태 전환과 overlay

[현재 ContentTransition](../../packages/react/src/content-transition.tsx)은 이미 Motion Primitives의
keyed transition을 참조했다. `fade/rise/slide/scale`, RTL, 모션 감소 설정, 초기 렌더 억제를
제공한다. Web은 전환 전 focus가 내부에 있었을 때 제품이 지정한 `focusTarget`으로 옮긴다.
따라서 “Motion Primitives 도입” 자체는 새 개선이 아니다.

외부 `TransitionPanel`은 `AnimatePresence`의 exit subtree를 유지한다. HJM은 입력·포커스
대상이 중복되는 것을 피하기 위해 단일 활성 subtree를 선택했다. 전환이 부드럽다는 이유로
이 결정을 되돌리지 않고, 바깥 높이·정렬·주변 콘텐츠 이동 문제를 재현한 뒤 필요한 표현만
흡수해야 한다. 외부 소스가 자동 높이 측정을 이미 해결했다고 주장하지 않는다.

[현재 overlay](../../packages/react/src/overlays.tsx)의 역할·이름·busy·닫기·포커스 계약과
모핑 효과의 geometry는 별개다. 외부 Morphing Popover의 `role=dialog`·`aria-modal=true`
존재만으로 포커스 가두기·복귀·inert가 모두 검증됐다고 보지 않는다. 통째 교체 후보보다
기존 overlay 위의 선택적 표현 후보가 적절하다.

### 선택 표시와 숫자

[Tabs](../../packages/react/src/navigation.tsx)는 이미 선택 표시를 측정하고 WAAPI로 위치·너비를
움직인다. 외부 Animated Background는 자체 active ID와 클릭 handler를 갖는다. 이를 그대로
감싸면 선택 상태와 handler 소유권이 중복될 수 있다. 기존 indicator recipe를 다른 selection
표면에도 쓸 수 있는지 먼저 비교한다.

[AnimatedStatistic](../../packages/react/src/statistic-motion.tsx)은 NumberFlow를 optional entry로
격리하고 Intl 형식·비라틴 숫자·RTL·과학 표기·모션 감소 fallback을 가진다. 데모용 count-up이
이 계약보다 우수하다는 증거는 없다. 교체보다 문맥별 표현 예제가 먼저다.

### 배경과 스크롤

[EffectSurface](../../packages/react/src/effect-surface.tsx)는 mesh/glow/grain, semantic color,
정적 fallback, 화면 밖·문서 비활성 시 중지를 이미 구현했다. 배경 라이브러리 전체를 새 peer로
추가할 필요 없이, 기존 레이어로 표현할 수 없는 패턴만 선택적으로 검토한다.

[ScrollProgress](../../packages/react/src/scroll-progress.tsx)는 기존 `Progress`의 이름과 범위를
유지하고, hook은 명시적 host의 scroll·resize·콘텐츠 변경을 관찰한다. Motion의 window 기반
예제가 짧다는 이유로 이 구현을 교체하면 nested scroller 동작을 잃을 수 있다.

### 화면 구성과 브랜드

조사 당시 제품 소개 실험은 최신 main에서 [제품 소개 변형](../../showcase/web/src/patterns/Landing.stories.tsx)으로 통합되었으며 이를
비롯해 비교·설정·첫 작업·편집·온보딩 화면 예제가 있다. 새 `Hero`나 `Bento`라는 이름을 먼저
늘리지 않고 해당 예제의 정보 위계와 실제 제품 슬롯을 개선할지 판단한다.

Refero의 특정 브랜드 색·영문 서체·큰 display 크기를 HJM 전역 기본값으로 바꾸지 않는다.
브랜드별 색 역할·글자 위계·밀도·이미지 방향을 HJM 토큰과 공개 슬롯으로 번역하는 기록 방식이
유용하다. 수집된 외부 DESIGN.md의 명령형 문장은 해당 사이트 스타일 설명이지 HJM 작업 지침이 아니다.

## 5. 낮은 우선순위 또는 교체하지 않을 항목

- 커스텀 cursor, magnetic button, hover 전용 tooltip: 터치·키보드에 그대로 번역되지 않는다.
  마케팅 데모에는 쓸 수 있지만 기본 Button/Tooltip의 교체 이점은 확인하지 못했다.
- 무한 marquee, 글자 scramble·flip·타자 효과: 실제 값을 읽기 어렵게 하거나 표시를 지연할 수
  있다. 기본 `Text`·상태 메시지·알림 본문 교체에 추천하지 않는다.
- 입력을 지우는 vanish effect: 서버 처리 실패 시 입력 복구와 충돌할 수 있다. 입력 성공 여부는
  제품 상태가 결정해야 한다.
- 타이머로 자동 진행하는 multi-step loader: 실제 단계가 없는 서비스에 진행률·작업 단계를
  만들어 표시하지 않는다. HJM `ThinkingOrb`·`Steps`·`Progress`에 실제 상태를 연결한다.
- 새 carousel·toast·sheet·숫자 모션 엔진: 기존 optional adapter를 포함해 비교해야 한다.
  현재 조사로 엔진 교체가 더 빠르거나 가볍다고 입증한 후보는 없다.
- Rich text editor: Component Gallery의 유효한 누락 점검 항목이지만, plain text editor와 다른
  문서 모델·selection·IME·붙여넣기·sanitize 계약이 필요하므로 장식 UI 확장에 묶지 않는다.

## 6. 원본 조건과 품질 신호

| 출처 | 확인한 조건 | HJM 적용 판단 |
| --- | --- | --- |
| [Magic UI LICENSE](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md) | 공개 저장소 MIT | 선택 소스 흡수 시 원저작권·라이선스 유지. Pro 상품까지 같은 조건이라고 확대하지 않음 |
| [Motion Primitives](https://github.com/ibelick/motion-primitives/blob/main/LICENCE.md) | 공개 소스 MIT, 사이트 beta | 현재 HJM notice와 기존 흡수 이력을 유지하고 변경분을 비교 |
| [Uiverse Galaxy](https://github.com/uiverse-io/galaxy) | README에서 저장소 UI 요소 MIT 명시 | 개별 파일의 추가 원출처 주석도 확인. 사이트 전체의 현재 콘텐츠와 동일하다는 보장은 없음 |
| [Aceternity licence](https://ui.aceternity.com/licence) | Pro 안내와 source 재배포 제한, 제3자 항목은 각 조건 | 무료 항목까지 일괄 MIT로 단정하지 않음. 소스·예제·자산 각각 확인 전 공개 HJM 패키지로 복사 보류 |
| [21st 약관](https://docs.21st.dev/terms) | 코드와 플랫폼 preview/metadata의 권리 구분, 일괄 자동 수집 제한 | 원저자 저장소의 실제 라이선스를 우선 확인. marketplace preview를 HJM 자산으로 재사용하지 않음 |
| [3dicons](https://3dicons.co/) | 조사한 211개 icon 상세에 CC0 표시 | 브랜드 로고와 제품 의미를 구분. 자산 선택·최적화 후 제품 슬롯에 사용 |
| Minimal / CTA / Refero / DesignBookmark | 레퍼런스·갤러리·디렉터리 | 레이아웃 원리와 설명 방식을 참고. 연결 대상의 소스·이미지 사용권이 자동으로 부여되지는 않음 |

공식 소스 snapshot은 Motion Primitives `120f64f6ca60348e251f929e9c81f11ccbe45eda`,
Uiverse Galaxy `adbd2adde0a299a3956ea288fb444ec01891ca41`이다.

Uiverse 공식 저장소 HTML **3,802개**의 문자열 정적 스캔 결과:

| 신호 | 파일 수 |
| --- | ---: |
| `@keyframes` | 1,356 |
| `animation` 선언의 `infinite` | 1,136 |
| `prefers-reduced-motion` | 7 |
| `:focus-visible` | 39 |
| `outline: none` 또는 `outline: 0` | 528 |

이 수치는 코드 안의 문자열 존재 여부이며 접근성 감사 점수나 실패 수가 아니다. 외부 스타일·
브라우저 기본 동작·실제 focus 표현은 포함하지 않는다. 원형 복사보다 HJM 상태·semantic
color·모션 감소·focus 표현에 시각 아이디어를 통합하는 쪽을 권하는 근거로만 사용한다.

## 7. 브라우저 확인과 미확인 범위

Codex in-app browser, 1280×720의 공개 문서에서 Motion Primitives Morphing Popover의
열린 입력 폼, Image Comparison의 좌우 이미지 배치, Magic UI Bento Grid의 크기가 다른
기능 카드·미리보기·설명·행동 배치를 화면으로 확인했다. 모든 예제·다크·큰 글자·RTL·
키보드 경로·모션 감소·프레임률을 검증한 결과는 아니다. 모핑 animation의 성능 수치도 없다.

추가로 [Basedash 스타일 기록](https://styles.refero.design/style/77b723ca-9583-4349-9b5e-2ef8b4fde002)의 미리보기/설명 분할과 DESIGN.md 탭, [Minimal의 Raycast 기록](https://minimal.gallery/raycast/)의 desktop/mobile 스크린샷 전환을 확인했다. Raycast 자료는 2024-04-25 게시된 기록으로 현재 제품 화면의 증거가 아니다. 두 화면 모두 중심 제목·짧은 설명을 유지하되 행동 배치는 달랐다. 갤러리의 반응형 캡처를 실제 앱의 반응형 동작 검증으로 세지 않는다.

[CTA Gallery의 Linear 사례](https://www.cta.gallery/cta/linear)는 desktop/mobile 캡처 모두 짧은 가치 제목→보조 설명→주 행동 하나→보조 이미지의 위계를 보여 준다. HJM에서는 새 CTA primitive보다 기존 Top/본문/행동 구성의 예제로 흡수할 후보이며, 원본 이미지·브랜드를 복사할 필요는 없다. 링크된 실제 서비스의 동작을 검증한 결과는 아니다.

남은 범위는 전체 페이지의 시각/행동 검토, 접근 제한 페이지, 21st 전체 콘텐츠, Uiverse
웹사이트와 공식 저장소의 현재 일치 여부, 후보별 HJM 구현·Web/RN 회귀·실기기 성능이다.
현재까지 **확정한 엔진 교체는 0건**이다. 교체 후보를 제외한 것이 아니라 동등 계약·성능·
유지보수 이점의 근거가 아직 부족한 상태다.

조사 중 원시 데이터는 저장소 밖 임시 디렉터리에 두었다. 핵심 수치·공식 출처·소스 SHA와
미확인 범위는 이 문서에 보존했다. 직접 만든 원시 HTML·JSON·외부 소스 사본·임시 스크립트는 수집 종료 후 제거했다.
제품 코드·의존성·lockfile·공개 API·스토리북 분류·npm 버전은 이번 조사에서 변경하지 않았다.

## 8. Component Gallery의 전체 60종과 HJM 대응

전체 정의 페이지를 기준으로 의미를 대조했다. 아래의 대응은 플랫폼 동등성·실행 검증 완료를 뜻하지 않는다.

| 외부 분류 | 현재 대응 | 조사 판단 |
| --- | --- | --- |
| [accordion](https://component.gallery/components/accordion/) | Accordion | 기존 계약 유지, 열림 전환 비교 |
| [alert](https://component.gallery/components/alert/) | Notice / AlertDialog | 정보 고지와 사용자 결정 요구를 분리 |
| [avatar](https://component.gallery/components/avatar/) | Avatar / AvatarGroup | 집합·overflow 표현 흡수 검토 |
| [badge](https://component.gallery/components/badge/) | Badge / CounterBadge | 상태와 개수의 의미 유지 |
| [breadcrumbs](https://component.gallery/components/breadcrumbs/) | Breadcrumb | 현재 위치·긴 경로 예제 비교 |
| [button-group](https://component.gallery/components/button-group/) | Stack + Button / ToggleGroup | 일반 행동 묶음과 선택 묶음을 구분 |
| [button](https://component.gallery/components/button/) | Button / IconButton | 완료 피드백 흡수 후보 |
| [card](https://component.gallery/components/card/) | Card | 밀도·미리보기·행동 배치 비교 |
| [carousel](https://component.gallery/components/carousel/) | Carousel / CarouselMotion | 이미 두 계층 존재, 엔진 교체 근거 없음 |
| [checkbox](https://component.gallery/components/checkbox/) | Checkbox / CheckboxGroup | 선택·오류·그룹 계약 유지 |
| [color-picker](https://component.gallery/components/color-picker/) | ColorPicker | 색 입력과 토큰 편집 문맥 구분 |
| [combobox](https://component.gallery/components/combobox/) | Combobox | 빈 결과·로딩·키보드 예제 비교 |
| [date-input](https://component.gallery/components/date-input/) | DatePicker / Field | 분리된 일·월·년 입력의 전용 계약은 별도 검토 |
| [datepicker](https://component.gallery/components/datepicker/) | DatePicker / DateRangePicker / Calendar | 새 달력 중복 추가보다 기간·오류 문맥 비교 |
| [drawer](https://component.gallery/components/drawer/) | Sheet / SidePanel | modal 보조 작업과 도킹 패널 구분 |
| [dropdown-menu](https://component.gallery/components/dropdown-menu/) | Menu / ContextMenu / Menubar | 값 선택 Select와 구분 |
| [empty-state](https://component.gallery/components/empty-state/) | EmptyState | 빈 검색·첫 사용·초기화 후의 행동 구분 |
| [fieldset](https://component.gallery/components/fieldset/) | Form / Field / CheckboxGroup / RadioGroup | 관련 입력의 그룹 이름·설명 전달을 비교 |
| [file-upload](https://component.gallery/components/file-upload/) | FilePicker / UploadItem | 선택→전송→오류·재시도 구성 후보 |
| [file](https://component.gallery/components/file/) | UploadItem / Asset / ListRow | 다운로드용 파일 카드와 업로드 행의 의미 구분 |
| [footer](https://component.gallery/components/footer/) | Layout / BottomInfo | 웹사이트 footer 구성과 앱 하단 조건 문구를 구분 |
| [form](https://component.gallery/components/form/) | Form / Field | 검증·전송·복구 계약 유지 |
| [header](https://component.gallery/components/header/) | TopBar / NavigationBar | 본문 Top과 화면 chrome 구분 |
| [heading](https://component.gallery/components/heading/) | Heading / Top | 시맨틱 단계와 시각 크기 비교 |
| [hero](https://component.gallery/components/hero/) | Top / Asset / 기존 소개 화면 | 전용 primitive보다 화면 구성 개선 |
| [icon](https://component.gallery/components/icon/) | Icon / Asset | 작은 기능 glyph와 장식 일러스트 구분 |
| [image](https://component.gallery/components/image/) | Image / Asset / GridReveal | 비교·확대는 별도 동작 경계 |
| [label](https://component.gallery/components/label/) | Field 등 입력 API의 label | label을 독립 시각 텍스트로 복제하지 않음 |
| [link](https://component.gallery/components/link/) | Link | 버튼 행동과 이동 의미 구분 |
| [list](https://component.gallery/components/list/) | List / ListRow / VirtualList | 정적 목록·행 행동·가상화 구분 |
| [modal](https://component.gallery/components/modal/) | Dialog / AlertDialog / Sheet | 모핑 표현만 선택 흡수 검토 |
| [navigation](https://component.gallery/components/navigation/) | NavigationBar / Sidebar / BottomNavigation / Anchor | 표면·이동 범위별 기존 선택 기준 유지 |
| [pagination](https://component.gallery/components/pagination/) | Pagination / LoadMore | 페이지 이동과 더 보기 구분 |
| [popover](https://component.gallery/components/popover/) | Popover | geometry 흡수 후보, overlay 행동 보존 |
| [progress-bar](https://component.gallery/components/progress-bar/) | Progress / ScrollProgress | 실제 진행량 소유자 유지 |
| [progress-indicator](https://component.gallery/components/progress-indicator/) | Steps / StepPlayer | 실제 단계와 소개용 연출 구분 |
| [quote](https://component.gallery/components/quote/) | TextFormat / Text 구성 | Web 표현은 존재, Native 전용 인용 API는 별도 검토 |
| [radio-button](https://component.gallery/components/radio-button/) | Radio / RadioGroup | 선택 의미·키보드 유지 |
| [rating](https://component.gallery/components/rating/) | 전용 공개 API 없음 | 신규 후보, 읽기 전용·입력형 계약 분리 |
| [rich-text-editor](https://component.gallery/components/rich-text-editor/) | EditorScreen과 동일 기능 아님 | 문서 모델·IME·sanitize가 필요한 별도 큰 과제 |
| [search-input](https://component.gallery/components/search-input/) | SearchField / SearchScreen | 입력·결과 화면·검색 서버 경계 유지 |
| [segmented-control](https://component.gallery/components/segmented-control/) | SegmentedControl | 기존 탭 indicator와 표현 공유 후보 |
| [select](https://component.gallery/components/select/) | Select / NativeSelect | host native 선택과 custom overlay 구분 |
| [separator](https://component.gallery/components/separator/) | Divider | 장식 선과 의미 구분자 역할 비교 |
| [skeleton](https://component.gallery/components/skeleton/) | Skeleton | 예상 콘텐츠 모양과 실제 loading 조건 유지 |
| [skip-link](https://component.gallery/components/skip-link/) | SkipNav | 기존 키보드 계약 유지 |
| [slider](https://component.gallery/components/slider/) | Slider | 이미지 비교의 조작 의미 재사용 후보 |
| [spinner](https://component.gallery/components/spinner/) | Spinner / ThinkingOrb | 단순 대기와 실제 AI 작업 단계 구분 |
| [stack](https://component.gallery/components/stack/) | Stack | 간격 토큰 유지 |
| [stepper](https://component.gallery/components/stepper/) | NumberField | 여기서는 숫자 증감, Steps와 다른 기능 |
| [table](https://component.gallery/components/table/) | DataTable / Table | 행동과 단순 표시 계약의 기존 구분 유지 |
| [tabs](https://component.gallery/components/tabs/) | Tabs / TabPanel | 기존 gooey indicator 포함해 대조 |
| [text-input](https://component.gallery/components/text-input/) | Field / TextField | 입력 상태·이름·오류 계약 유지 |
| [textarea](https://component.gallery/components/textarea/) | TextArea | 입력 보존·크기 변화·오류 예제 비교 |
| [toast](https://component.gallery/components/toast/) | Toast / ToastProvider | queue·update·pause·dismiss를 데모로 대체하지 않음 |
| [toggle](https://component.gallery/components/toggle/) | Switch | 즉시 적용 설정과 폼 checkbox 구분 |
| [tooltip](https://component.gallery/components/tooltip/) | Tooltip | hover 전용 시각 효과로 교체하지 않음 |
| [tree-view](https://component.gallery/components/tree-view/) | Tree | 키보드·계층·선택 계약 유지 |
| [video](https://component.gallery/components/video/) | Asset + host player | 자막·재생 제어·수명주기는 별도 검증 |
| [visually-hidden](https://component.gallery/components/visually-hidden/) | VisuallyHidden | 시각 스타일보다 접근성 문맥 소유자 유지 |

## 9. Motion Primitives 전체 33종의 분류

공식 소스의 문서·API 목록과 HJM을 대조한 분류다. 개별 데모의 모든 상태를 조작한 결과는 아니다.

| 원본 항목 | HJM 대응 | 분류 이유 |
| --- | --- | --- |
| [accordion](https://motion-primitives.com/docs/accordion), [disclosure](https://motion-primitives.com/docs/disclosure) | Accordion / Collapsible | 기존 열림 계약에 표현 흡수 검토 |
| [animated-background](https://motion-primitives.com/docs/animated-background) | Tabs / SegmentedControl | 기존 선택 표시와 비교 |
| [animated-group](https://motion-primitives.com/docs/animated-group), [in-view](https://motion-primitives.com/docs/in-view), [transition-panel](https://motion-primitives.com/docs/transition-panel) | ContentTransition / Grid / List | 등장 구성 후보, 읽기 지연 금지 |
| [animated-number](https://motion-primitives.com/docs/animated-number), [sliding-number](https://motion-primitives.com/docs/sliding-number) | AnimatedStatistic | 현재 숫자 엔진 유지 권고 |
| [border-trail](https://motion-primitives.com/docs/border-trail), [glow-effect](https://motion-primitives.com/docs/glow-effect), [spotlight](https://motion-primitives.com/docs/spotlight) | EffectSurface / Card | 선택적 장식 레이어 후보 |
| [carousel](https://motion-primitives.com/docs/carousel) | Carousel / CarouselMotion | 현재 carousel 계약·engine 유지 |
| [cursor](https://motion-primitives.com/docs/cursor), [magnetic](https://motion-primitives.com/docs/magnetic), [tilt](https://motion-primitives.com/docs/tilt) | 제품 장식 또는 optional 표현 | Web 소개용 표현, 기본 조작 UI 교체 제외 |
| [dialog](https://motion-primitives.com/docs/dialog), [morphing-dialog](https://motion-primitives.com/docs/morphing-dialog), [morphing-popover](https://motion-primitives.com/docs/morphing-popover) | Dialog / Popover / MorphingMenu | overlay 동작 유지, geometry만 비교 |
| [dock](https://motion-primitives.com/docs/dock) | NavigationBar / BottomNavigation | 내비게이션 표현 비교, 확대 효과는 선택적 |
| [image-comparison](https://motion-primitives.com/docs/image-comparison) | Image / Slider 기반 비교 구성 | 신규 기능 후보 |
| [infinite-slider](https://motion-primitives.com/docs/infinite-slider) | 제품 마케팅 구성 | 소개용 반복 띠 구성, 정지·중복 의미 필요 |
| [progressive-blur](https://motion-primitives.com/docs/progressive-blur) | 목록·이미지 장식 | 가장자리 표현 후보, 실제 콘텐츠 가림 금지 |
| [scroll-progress](https://motion-primitives.com/docs/scroll-progress) | ScrollProgress / Timeline | 현재 host·범위 계약 유지 |
| [spinning-text](https://motion-primitives.com/docs/spinning-text), [text-effect](https://motion-primitives.com/docs/text-effect), [text-loop](https://motion-primitives.com/docs/text-loop), [text-morph](https://motion-primitives.com/docs/text-morph), [text-roll](https://motion-primitives.com/docs/text-roll), [text-scramble](https://motion-primitives.com/docs/text-scramble), [text-shimmer](https://motion-primitives.com/docs/text-shimmer), [text-shimmer-wave](https://motion-primitives.com/docs/text-shimmer-wave) | Text / TextTransition / 제품 소개 표현 | 읽기·상태 텍스트의 기본 표현 교체 제외 |
| [toolbar-dynamic](https://motion-primitives.com/docs/toolbar-dynamic), [toolbar-expandable](https://motion-primitives.com/docs/toolbar-expandable) | EditorScreen / MessageComposer | 입력 문맥을 유지하는 구성 후보 |

## 10. Magic UI 전체 corpus 78종의 분류

공식 `llms-full.txt`의 COMPONENT 섹션 단위다. 웹사이트의 모든 effect·예제·Pro 상품 수와 같지 않다. 본문과 소스의 정적 신호를 분류했으며 개별 UI 품질 합격 판정은 아니다.

| 원본 항목 | HJM 대응 | 분류 이유 |
| --- | --- | --- |
| [android](https://magicui.design/docs/components/android), [iphone](https://magicui.design/docs/components/iphone), [safari](https://magicui.design/docs/components/safari) | Asset / 소개 화면 | 기기 모형 구성, 제품 소개에 한정 |
| [animated-beam](https://magicui.design/docs/components/animated-beam), [animated-grid-pattern](https://magicui.design/docs/components/animated-grid-pattern), [backlight](https://magicui.design/docs/components/backlight), [border-beam](https://magicui.design/docs/components/border-beam), [dot-pattern](https://magicui.design/docs/components/dot-pattern), [dotted-map](https://magicui.design/docs/components/dotted-map), [flickering-grid](https://magicui.design/docs/components/flickering-grid), [floating-3d-particles](https://magicui.design/docs/components/floating-3d-particles), [globe](https://magicui.design/docs/components/globe), [glyph-matrix](https://magicui.design/docs/components/glyph-matrix), [grid-pattern](https://magicui.design/docs/components/grid-pattern), [hexagon-pattern](https://magicui.design/docs/components/hexagon-pattern), [icon-cloud](https://magicui.design/docs/components/icon-cloud), [interactive-grid-pattern](https://magicui.design/docs/components/interactive-grid-pattern), [light-rays](https://magicui.design/docs/components/light-rays), [meteors](https://magicui.design/docs/components/meteors), [neon-gradient-card](https://magicui.design/docs/components/neon-gradient-card), [noise-texture](https://magicui.design/docs/components/noise-texture), [orbiting-circles](https://magicui.design/docs/components/orbiting-circles), [particles](https://magicui.design/docs/components/particles), [retro-grid](https://magicui.design/docs/components/retro-grid), [ripple](https://magicui.design/docs/components/ripple), [shine-border](https://magicui.design/docs/components/shine-border), [striped-pattern](https://magicui.design/docs/components/striped-pattern), [warp-background](https://magicui.design/docs/components/warp-background) | EffectSurface / 제품 소개 구성 | 선택적 배경·연결 효과, 수명주기 유지 |
| [animated-circular-progress-bar](https://magicui.design/docs/components/animated-circular-progress-bar) | Progress(shape=circular) | 실제 진행률을 사용하는 원형 표현 비교 |
| [animated-gradient-text](https://magicui.design/docs/components/animated-gradient-text), [animated-shiny-text](https://magicui.design/docs/components/animated-shiny-text), [aurora-text](https://magicui.design/docs/components/aurora-text), [comic-text](https://magicui.design/docs/components/comic-text), [dia-text-reveal](https://magicui.design/docs/components/dia-text-reveal), [hyper-text](https://magicui.design/docs/components/hyper-text), [kinetic-text](https://magicui.design/docs/components/kinetic-text), [line-shadow-text](https://magicui.design/docs/components/line-shadow-text), [morphing-text](https://magicui.design/docs/components/morphing-text), [scroll-based-velocity](https://magicui.design/docs/components/scroll-based-velocity), [sparkles-text](https://magicui.design/docs/components/sparkles-text), [spinning-text](https://magicui.design/docs/components/spinning-text), [text-3d-flip](https://magicui.design/docs/components/text-3d-flip), [text-animate](https://magicui.design/docs/components/text-animate), [text-reveal](https://magicui.design/docs/components/text-reveal), [typing-animation](https://magicui.design/docs/components/typing-animation), [video-text](https://magicui.design/docs/components/video-text), [word-rotate](https://magicui.design/docs/components/word-rotate) | Text / TextTransition / 제품 표현 | 소개용 타이포그래피, 일반 본문/상태 텍스트 교체 제외 |
| [animated-list](https://magicui.design/docs/components/animated-list), [blur-fade](https://magicui.design/docs/components/blur-fade) | ContentTransition / List | 등장 순서·일회성 진입 표현 후보 |
| [animated-theme-toggler](https://magicui.design/docs/components/animated-theme-toggler) | HjmProvider를 소비하는 제품 theme switch | 테마 전환 연출 후보, 데이터·focus 유지 |
| [avatar-circles](https://magicui.design/docs/components/avatar-circles) | AvatarGroup | 기존 묶음 아바타의 배치 비교 |
| [bento-grid](https://magicui.design/docs/components/bento-grid) | Card / Grid / 소개 실험 화면 | 기능 설명 구성 개선 |
| [client-tweet-card](https://magicui.design/docs/components/client-tweet-card), [tweet-card](https://magicui.design/docs/components/tweet-card) | 제품별 embed | 외부 콘텐츠 임베드, 공용 core 편입 보류 |
| [code-comparison](https://magicui.design/docs/components/code-comparison) | CodeBlock | 코드 비교 구성 후보, diff 데이터는 별도 |
| [confetti](https://magicui.design/docs/components/confetti) | Celebration | 기존 celebration engine 유지 |
| [cool-mode](https://magicui.design/docs/components/cool-mode), [pointer](https://magicui.design/docs/components/pointer), [smooth-cursor](https://magicui.design/docs/components/smooth-cursor) | 제품 장식 | 입력·링크 기본 동작 교체 제외 |
| [dock](https://magicui.design/docs/components/dock) | NavigationBar | 내비게이션 표현 비교 |
| [file-tree](https://magicui.design/docs/components/file-tree) | Tree | 정적 설명용 tree와 실제 탐색 구분 |
| [glare-hover](https://magicui.design/docs/components/glare-hover), [magic-card](https://magicui.design/docs/components/magic-card) | Card / EffectSurface | 카드의 hover 표현만 흡수 검토 |
| [hero-video-dialog](https://magicui.design/docs/components/hero-video-dialog) | Dialog + Asset | 영상 포스터→재생 구성 후보 |
| [highlighter](https://magicui.design/docs/components/highlighter) | Text / TextFormat | 강조 표현 후보, 문장 의미 유지 |
| [interactive-hover-button](https://magicui.design/docs/components/interactive-hover-button), [pulsating-button](https://magicui.design/docs/components/pulsating-button), [rainbow-button](https://magicui.design/docs/components/rainbow-button), [ripple-button](https://magicui.design/docs/components/ripple-button), [shimmer-button](https://magicui.design/docs/components/shimmer-button), [shiny-button](https://magicui.design/docs/components/shiny-button) | Button | 버튼 상태/피드백에 선택 흡수 |
| [lens](https://magicui.design/docs/components/lens) | Image / 이미지 확대 adapter | 이미지 확대 문맥과 기존 adapter 비교 |
| [marquee](https://magicui.design/docs/components/marquee) | 제품 마케팅 구성 | 소개용 반복 띠, 멈춤·중복 접근성 필요 |
| [number-ticker](https://magicui.design/docs/components/number-ticker) | AnimatedStatistic | 기존 Intl·방향·fallback 유지 권고 |
| [pixel-image](https://magicui.design/docs/components/pixel-image) | GridReveal / Image | 기존 reveal 표현과 비교 |
| [progressive-blur](https://magicui.design/docs/components/progressive-blur) | 목록·이미지 장식 | 가장자리 시각 힌트 후보 |
| [scroll-progress](https://magicui.design/docs/components/scroll-progress) | ScrollProgress | 현재 명시적 host 계약 유지 |
| [terminal](https://magicui.design/docs/components/terminal) | CodeBlock / 소개 화면 | 제품 소개용 코드 실행 표현 |

## 11. Aceternity API 112종의 분류

공식 [API 목록](https://ui.aceternity.com/api/components)의 112개 이름을 빠짐없이 분류했다. 카테고리 98종과 미분류 14종을 구분했다. 이는 원본 코드 112개를 실행한 결과가 아니며, 일부 API 문서 링크는 404였다. `3d-card`, `cover`, `globe`, `glowing-stars`, `grid`, `input`, `label`, `lamp`, `moving-line`, `parallax-scroll-2`, `shooting-stars`, `stars-background` 12개가 해당하며, 아래는 API가 제공한 주소를 기록한 것이다. 예를 들어 실제 문서에는 `3d-card-effect`·`lamp-effect` 같은 별도 경로가 존재한다. 특히 유료 block의 본문 확보는 유료 소스 확보를 뜻하지 않는다.

| API 분류 | 원본 항목 | HJM 대조 판단 |
| --- | --- | --- |
| backgrounds | [background-beams](https://ui.aceternity.com/components/background-beams), [background-beams-with-collision](https://ui.aceternity.com/components/background-beams-with-collision), [background-boxes](https://ui.aceternity.com/components/background-boxes), [background-gradient](https://ui.aceternity.com/components/background-gradient), [background-gradient-animation](https://ui.aceternity.com/components/background-gradient-animation), [background-lines](https://ui.aceternity.com/components/background-lines), [background-ripple-effect](https://ui.aceternity.com/components/background-ripple-effect), [aurora-background](https://ui.aceternity.com/components/aurora-background), [wavy-background](https://ui.aceternity.com/components/wavy-background), [dotted-glow-background](https://ui.aceternity.com/components/dotted-glow-background), [noise-background](https://ui.aceternity.com/components/noise-background), [scales](https://ui.aceternity.com/components/scales) | EffectSurface의 기존 레이어와 비교. semantic color·비활성 중지·정적 fallback 안에서만 선택 흡수. |
| text | [text-generate-effect](https://ui.aceternity.com/components/text-generate-effect), [text-reveal-card](https://ui.aceternity.com/components/text-reveal-card), [text-hover-effect](https://ui.aceternity.com/components/text-hover-effect), [typewriter-effect](https://ui.aceternity.com/components/typewriter-effect), [flip-words](https://ui.aceternity.com/components/flip-words), [colourful-text](https://ui.aceternity.com/components/colourful-text), [encrypted-text](https://ui.aceternity.com/components/encrypted-text), [cover](https://ui.aceternity.com/components/cover) | TextTransition 및 소개 문구의 선택적 연출. 일반 본문·상태 텍스트 교체 제외. |
| cards | [3d-card](https://ui.aceternity.com/components/3d-card), [card-hover-effect](https://ui.aceternity.com/components/card-hover-effect), [card-spotlight](https://ui.aceternity.com/components/card-spotlight), [card-stack](https://ui.aceternity.com/components/card-stack), [evervault-card](https://ui.aceternity.com/components/evervault-card), [glare-card](https://ui.aceternity.com/components/glare-card), [wobble-card](https://ui.aceternity.com/components/wobble-card), [comet-card](https://ui.aceternity.com/components/comet-card), [tooltip-card](https://ui.aceternity.com/components/tooltip-card), [focus-cards](https://ui.aceternity.com/components/focus-cards), [draggable-card](https://ui.aceternity.com/components/draggable-card) | Card의 표현·카드 묶음 구성 후보. hover는 터치·키보드 대안이 필요하고 drag는 기존 adapter와 비교. |
| navigation | [floating-navbar](https://ui.aceternity.com/components/floating-navbar), [navbar-menu](https://ui.aceternity.com/components/navbar-menu), [sidebar](https://ui.aceternity.com/components/sidebar), [floating-dock](https://ui.aceternity.com/components/floating-dock), [resizable-navbar](https://ui.aceternity.com/components/resizable-navbar), [tabs](https://ui.aceternity.com/components/tabs) | NavigationBar·Sidebar·Tabs·BottomNavigation과 대응. 선택 상태와 키보드 소유권은 기존 계약 유지. |
| hero | [hero-parallax](https://ui.aceternity.com/components/hero-parallax), [hero-highlight](https://ui.aceternity.com/components/hero-highlight), [spotlight](https://ui.aceternity.com/components/spotlight), [spotlight-new](https://ui.aceternity.com/components/spotlight-new), [lamp](https://ui.aceternity.com/components/lamp), [vortex](https://ui.aceternity.com/components/vortex), [container-scroll-animation](https://ui.aceternity.com/components/container-scroll-animation) | 기존 제품 소개 실험 화면의 이미지·강조 슬롯 후보. 전역 토큰이나 기본 레이아웃으로 복사하지 않음. |
| animations | [animated-modal](https://ui.aceternity.com/components/animated-modal), [animated-testimonials](https://ui.aceternity.com/components/animated-testimonials), [animated-tooltip](https://ui.aceternity.com/components/animated-tooltip), [apple-cards-carousel](https://ui.aceternity.com/components/apple-cards-carousel), [carousel](https://ui.aceternity.com/components/carousel), [infinite-moving-cards](https://ui.aceternity.com/components/infinite-moving-cards), [moving-border](https://ui.aceternity.com/components/moving-border), [parallax-scroll](https://ui.aceternity.com/components/parallax-scroll), [parallax-scroll-2](https://ui.aceternity.com/components/parallax-scroll-2), [tracing-beam](https://ui.aceternity.com/components/tracing-beam), [following-pointer](https://ui.aceternity.com/components/following-pointer), [layout-text-flip](https://ui.aceternity.com/components/layout-text-flip), [container-text-flip](https://ui.aceternity.com/components/container-text-flip), [3d-marquee](https://ui.aceternity.com/components/3d-marquee) | Dialog·Tooltip·Carousel·ContentTransition·Timeline에 나누어 비교. 모달/캐러셀 엔진 교체 근거 없음. 무한 반복·parallax는 소개용 선택 표현. |
| effects | [sparkles](https://ui.aceternity.com/components/sparkles), [glowing-stars](https://ui.aceternity.com/components/glowing-stars), [meteors](https://ui.aceternity.com/components/meteors), [shooting-stars](https://ui.aceternity.com/components/shooting-stars), [stars-background](https://ui.aceternity.com/components/stars-background), [canvas-reveal-effect](https://ui.aceternity.com/components/canvas-reveal-effect), [svg-mask-effect](https://ui.aceternity.com/components/svg-mask-effect), [glowing-effect](https://ui.aceternity.com/components/glowing-effect), [pointer-highlight](https://ui.aceternity.com/components/pointer-highlight), [lens](https://ui.aceternity.com/components/lens), [compare](https://ui.aceternity.com/components/compare), [direction-aware-hover](https://ui.aceternity.com/components/direction-aware-hover), [hover-border-gradient](https://ui.aceternity.com/components/hover-border-gradient), [pixelated-canvas](https://ui.aceternity.com/components/pixelated-canvas), [dither-shader](https://ui.aceternity.com/components/dither-shader), [webcam-pixel-grid](https://ui.aceternity.com/components/webcam-pixel-grid) | 대부분 EffectSurface/Asset의 선택 표현. compare는 신규 이미지 비교 후보, lens는 기존 확대 adapter와 비교. webcam은 권한·개인정보가 포함되어 장식 기본값에서 제외. |
| layout | [bento-grid](https://ui.aceternity.com/components/bento-grid), [layout-grid](https://ui.aceternity.com/components/layout-grid), [sticky-scroll-reveal](https://ui.aceternity.com/components/sticky-scroll-reveal), [timeline](https://ui.aceternity.com/components/timeline), [grid](https://ui.aceternity.com/components/grid), [moving-line](https://ui.aceternity.com/components/moving-line) | Grid·Card·Timeline 및 기존 화면 구성에 흡수 검토. sticky·CSS span의 Native 대응은 별도 설계. |
| forms | [input](https://ui.aceternity.com/components/input), [label](https://ui.aceternity.com/components/label), [file-upload](https://ui.aceternity.com/components/file-upload), [placeholders-and-vanish-input](https://ui.aceternity.com/components/placeholders-and-vanish-input), [gooey-input](https://ui.aceternity.com/components/gooey-input) | Field의 입력·label·복구 계약 유지. file-upload는 기존 FilePicker/UploadItem 구성 개선. 입력 소실 연출은 실패 복구를 우선. |
| utilities | [3d-pin](https://ui.aceternity.com/components/3d-pin), [macbook-scroll](https://ui.aceternity.com/components/macbook-scroll), [globe](https://ui.aceternity.com/components/globe), [world-map](https://ui.aceternity.com/components/world-map), [link-preview](https://ui.aceternity.com/components/link-preview), [multi-step-loader](https://ui.aceternity.com/components/multi-step-loader), [loader](https://ui.aceternity.com/components/loader), [stateful-button](https://ui.aceternity.com/components/stateful-button), [code-block](https://ui.aceternity.com/components/code-block), [sticky-banner](https://ui.aceternity.com/components/sticky-banner), [images-slider](https://ui.aceternity.com/components/images-slider), [google-gemini-effect](https://ui.aceternity.com/components/google-gemini-effect), [tailwindcss-buttons](https://ui.aceternity.com/components/tailwindcss-buttons) | stateful-button은 기존 Button 상태 구성, code-block은 CodeBlock, loader는 Spinner/Progress, banner는 Notice와 대응. 지도·기기 모형은 제품 소개 자산. link-preview는 URL 조회/보안 정책을 제품이 소유. |
| API 미분류 | [parallax-hero-images](https://ui.aceternity.com/components/parallax-hero-images) | 소개 화면 이미지 슬롯, reduced motion과 터치 대안 필요. |
| API 미분류 | [squiggly-text](https://ui.aceternity.com/components/squiggly-text) | 장식 텍스트 표현, 본문 대체 제외. |
| API 미분류 | [magnetic-button](https://ui.aceternity.com/components/magnetic-button) | 기존 Button 위치·hit target을 흔드는 기본 동작으로 채택하지 않음. |
| API 미분류 | [notch](https://ui.aceternity.com/components/notch) | 기존 navigation/MorphingMenu와 구성 비교. 운영체제 UI처럼 오인되는 배치는 피함. |
| API 미분류 | [image-generation-loader](https://ui.aceternity.com/components/image-generation-loader) | ThinkingOrb·Progress와 실제 생성 상태 연결. 데모 진행률을 제품 진행률로 사용하지 않음. |
| API 미분류 | [canvas-text](https://ui.aceternity.com/components/canvas-text) | 제품 소개용 장식. 일반 Text의 의미·선택·접근성 유지. |
| API 미분류 | [cloud-shader](https://ui.aceternity.com/components/cloud-shader) | EffectSurface optional 배경 후보. GPU 비용 측정 전 기본 레이어 채택 보류. |
| API 미분류 | [chromatic-image](https://ui.aceternity.com/components/chromatic-image) | Asset 장식 후보. 이미지 원본 확인을 방해하는 기본 효과 제외. |
| API 미분류 | [images-badge](https://ui.aceternity.com/components/images-badge) | AvatarGroup/Asset의 미리보기 묶음 후보. Badge의 상태 의미와 분리. |
| API 미분류 | [keyboard](https://ui.aceternity.com/components/keyboard) | 기기/키보드 모형은 제품 소개 구성. 실제 입력 컴포넌트 교체 제외. |
| API 미분류 | [terminal](https://ui.aceternity.com/components/terminal) | CodeBlock 기반 소개 구성. 타자 효과는 실제 실행 상태와 구분. |
| API 미분류 | [3d-globe](https://ui.aceternity.com/components/3d-globe) | 제품별 지도/장식. 지도 데이터·tooltip·canvas 대안은 별도 계약. |
| API 미분류 | [ascii-art](https://ui.aceternity.com/components/ascii-art) | 이미지의 선택적 표현, 기본 Image 교체 제외. |
| API 미분류 | [text-flipping-board](https://ui.aceternity.com/components/text-flipping-board) | TextTransition/Statistic와 표현 비교. 값 읽기 지연과 숫자 지역화 계약 보존. |

API의 block 9개는 카드 3개·기능 소개 3개·확장 카드 2개·hero 1개다. 새 primitive 이름을 늘리기보다 기존 소개·비교 화면의 구성 예제로 검토한다. `use-outside-click` hook은 HJM overlay stack의 바깥 클릭·닫기 정책을 대체하지 않는다.

## 12. 디렉터리·갤러리에서 HJM으로 옮길 판단 방식

[DesignBookmark](https://designbookmark.com/)의 활성 도구 2,547개에는 inspiration 태그 341개,
ui-resources 84개, icons 70개, design-systems 49개가 있다. 태그는 중복되므로 합산하지 않는다.
이 사이트는 HJM에 그대로 들여올 컴포넌트 묶음보다 후속 원출처를 찾는 색인 역할이다.
등록된 외부 제품을 모두 방문했다거나 각 라이선스를 검증했다고 주장하지 않는다.

Minimal과 CTA는 시각 원본을 확인한 뒤 구성의 근거를 남기는 데 쓴다. 텍스트 수집만으로
모든 디자인의 좋고 나쁨을 평가하지 않는다. 특히 showcase를 개선할 때는 “어두운 배경과 큰
제목” 같은 표면적 복사보다, 어떤 사용자에게 어떤 정보를 먼저 보여 주고 어디에서 행동하게
하는지 기록해야 한다. Refero는 그 기록을 토큰·서체 역할·간격·이미지 방향으로 설명하는
형식의 참고다. 추출된 수치나 재구성 HTML을 실제 제품의 공식 구현으로 보지 않는다.

이번 후보를 실험 구현으로 옮긴다면 다음 순서가 적절하다. 이는 이번에 구현했다는 뜻이 아니다.

1. **기존 API의 구성 예제**: Button의 loading/label/icon으로 완료·실패 피드백, FilePicker와
   UploadItem으로 전송·복구 흐름, 기존 제품 소개 화면의 Card/Grid로 기능 우선순위 표현.
   먼저 새 prop 없이 충족되는지 확인한다.
2. **기존 표현의 선택 확장**: SegmentedControl 선택 표시, ContentTransition 주변 레이아웃,
   Popover/Dialog geometry를 실험한다. reduced motion·빠른 전환·입력 보존·focus 복귀와
   Web/Native의 플랫폼 차이를 함께 확인한다.
3. **새 기능**: 실제 소비 제품 요구를 확인한 뒤 ImageComparison과 Rating을 각각 별도 계약으로
   설계한다. 전자는 Slider 조작 의미와 겹치고, 후자는 읽기 전용 평균과 입력형 별점을 나눠야 한다.
4. **엔진 교체**: 이번에는 권고하지 않는다. 같은 조건의 동작·번들·실기기 성능·유지보수
   비교에서 이점이 드러나는 경우에만 migration과 함께 검토한다.

연구 산출물은 이 문서 한 개다. 전체 시각 검토와 21st/Uiverse의 누락은 남아 있으므로
사용자가 요청한 “모든 페이지 전수 조사”를 완료했다고 표시하지 않는다.
