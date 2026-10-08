# 레퍼런스 적용 판단 → HJM 실험·릴리스 → Utilverse 채택

> 2026-10-09 QR 정리: 원시 URL 원장·캡처는 현재 보관하지 않는다. 과거의 원장/이미지 보존 문구는 당시 작업 기록이며, 현재 확인 가능한 결과·실패·미확인 범위는 이 문서 본문이다. 새 조사나 재검증을 수행한 것은 아니다.

2026-10-07 최신 사용자 요청: **“이제 조사 마무리해”, “필요한것만 조사해”.** 최초의
11개 사이트 전수 조사 요구는 적용에 필요한 근거 확인으로 범위를 변경했다. 추가 URL 발견,
소개문 순차 독해와 모든 원제품/환경 검토는 더 이상 완료 조건이나 릴리스 차단 조건이 아니다.
기존 수집·독해·시각·상태 원장은 당시 증거로 보존하며 `allReviewComplete=false`를 유지한다.
그 flag는 전수 미완료를 기록하는 역사적 범위이며 현재 작업을 다시 전수 조사로 돌리는 지시가 아니다.

현재 작업은 조사 후보를 기존 API 재사용·개선·새 실험·보류·불채택으로 정리하고 필요한 항목을
규격대로 실험에 구현·등록한 뒤 검토·승급·npm 게시·소비 제품 채택으로 이어 간다.
최신 판단과 적용 순서는 [조사 마무리와 적용 결정](reference-research-closeout-2026-10-07.md)을 따른다.
기존 17개 검토·승급·npm 게시 이력과 이번 변경을 구분한다. 현재 추가 변경은 미게시다.
사용자 승급·게시 요청은 승인 기록에서 기존 17개 대상으로 확인된다. 현재 후속 실험 8개의
승급·npm 게시 승인 범위는 별도로 확인해야 하며, 그 전에는 `실험` 분류를 유지한다.
대상별 경로·검증 근거·미확인과 권한 경계는 [후속 8개 승급 검토팩](reference-experiment-promotion-review-2026-10-07.md)을 따른다.
Utilverse 스토어 출시는 기존 승인에 포함하지 않는다.

2026-10-07 추가 요청: **조사가 끝나면 추가·개선·교체 대상으로 정리한 항목을 모두 실험에
등록하며 규격을 지킨다.** 각 조사 보고서에 후보→근거 URL→기존 공개 API 재사용/개선 판단→
최종 실험 경로→등록 상태를 연결해 누락을 대조한다. 동일 후보의 여러 출처는 하나로 묶고,
불채택한 자료는 이유를 남긴다. 제목은 `실험/<토큰|컴포넌트|구성|화면>/<고정 분류>/<항목>`
4마디, 지원 플랫폼의 Default/Dark/LargeText와 사용 지침을 같은 변경에 제공한다.
조사 중 후보를 등록 완료로 표시하지 않는다. 단, 해당 후보의 제공 코드와 실제 동작 검토가 끝난 단위는 전체 사이트 조사와 병행해 실제 구현·사용 지침·규격 검사를 갖춰 등록할 수 있다. 이때 전체 조사 완료로 합산하지 않고 후보별 등록과 미확인 QA를 별도 기록한다. 이는 조사 완료 전 제안 문자열만으로 등록했다고 보고하는 혼동을 피하면서 검토한 후보 구현을 진행하기 위한 구분이다. 등록 후 UI·행동 검토와 승급·게시 단계는 별도로 기록한다.
규격은 [Storybook 탐색](../STORYBOOK_NAVIGATION.md)과 [사용 지침](../../packages/design-contracts/docs/usage/README.md)을 따른다.

2026-10-07 사용자 범위 변경: **OS 최대 접근성 글자와 최대값을 모사하는 확대 조건은
설계·구현 판단, 테스트·검증, 후속 작업, 완료·릴리스 차단에서 제외한다.** 과거 최대 글자
검증 기록과 이미 수정한 source는 당시 증거로 보존한다. 이 계획의 `전체 환경` 후속에도 최대
조건을 포함하지 않으며, `LargeText`라는 스토리 이름을 최대값 검사 의무의 근거로 쓰지 않는다.
이는 최대 글자를 반복 검증하지 말고 고려 자체에서 제외하라는 최신 사용자 지시를 적용한 것이다.

2026-10-07 후속: Component Gallery 실제 viewport 검토를 189모음/756개, 완전한 기본
갤러리 경로 66개, 보이는 기본 예제 카드 2,671/2,671개로 갱신했다. Button group·Button·Card·
Carousel·Checkbox를 기존 API와 대조했고 Native Card의 내부 media clip이 profile radius를
따르지 않던 누락을 수정했다. Node 회귀·typecheck·Metro 검증과 실제 기기 시각 검증을
구분한다. 원격 Showcase·시각 CI는 사용자 재확인에 따라 실제 버전 상승 때만 자동 실행한다.
근거: [페이지 검토](../qa/2026-10-07-component-gallery-page-review.md),
[테마 후속](../qa/2026-10-07-design-profile-research.md),
[CI 실행 시점](../qa/2026-10-07-ci-version-intent.md). 전체 조사·승격·릴리스 완료가 아니다.

## 테마·재질 소유권 — 2026-10-07 사용자 선택

2026-10-07 14:02 KST 후속: Aceternity 탭·상태 버튼·확장 카드(Standard/Grid)·layout-grid의
제공 구현과 선택된 실제 desktop/light 동작을 [기존 API와 대조](aceternity-interaction-adoption-2026-10-07.md)했다.
Button의 상태/복구와 Card.actions→Dialog.motionOrigin 경로를 사용 지침에 연결했다. npm 1.14.0
양 renderer tarball에서 motionOrigin 타입을 직접 확인해 오래된 미게시 표기도 정정했다.
profile selectionMotion→Tabs 연결과 unequal-span/shared-element 차이는 후속 구현 후보이며,
이 네 URL의 검토도 모든 환경/상태/연결 페이지 완료는 아니다. ledger의 범위를 partial로 유지한다.

후속 checkpoint: Tabs 연결은 main `7c56dbc`에 구현·검증·push됐다. 이후 기존 Web Popover,
Native BottomCTA/BottomNavigation의 프로필 그림자 누락을 수정했고 양쪽 공개 저장 행동과
Web 팝오버를 비교 구성에 연결했다. 로컬 Web23/Native mock18 검사·build/typecheck·실제 Web
10종 순회/390px/실패→재시도 결과는 [테마 QA](../qa/2026-10-07-design-profile-research.md)에 있다.
두 변경은 미게시이며 unequal-span/shared-element와 Native 기기 검증은 남는다.

사용자의 병렬 조사 요청으로 사이트를 3개 작업에 분담했다. 원본 수집, 본문 독해,
실제 시각 검토, 상태·행동 검증을 별도로 기록하며 수집량을 완료량으로 합산하지 않는다.
각 작업의 날짜별 보고서에 URL별 범위·발견·미확인을 보존하고 기존 API와 대조한 뒤 흡수한다.
중앙 ledger를 각 조사자가 동시에 수정하거나 조사 도중 공개 API를 임의로 늘리지 않는다.
현재 사이트 전체 완료는 false다. 이는 대표 페이지 검토를 전수로 보고했던 혼동을 피하기 위한
진척 기록 방식이며 병렬 시작 자체를 조사 완료 증거로 삼지 않는다.

병렬 분담과 증거 위치:

- A: Minimal·Designbookmark·CTA — [조사 A](../qa/2026-10-07-reference-parallel-a.md).
- B: 21st·Aceternity·Magic UI·Motion — [조사 B](../qa/2026-10-07-reference-parallel-b.md),
  [Magic URL별 범위 — 본문 요약·미확인 범위](../qa/2026-10-07-reference-parallel-b.md).
- C: Component Gallery·Uiverse·3dicons·Refero — [조사 C](../qa/2026-10-07-reference-parallel-c.md),
  [Refero URL별 범위 — 본문 요약·미확인 범위](../qa/2026-10-07-reference-parallel-c.md).

본문 checkpoint는 Magic96개 전체+2개 부분/257, Refero67개/1394(일반52+상세15)다.
Manual·실제 화면·상태는 각 보고서의 별도 분모를 따른다. 21st의 잠긴 구현은 저장된 로그인도
없어 미검토이며 공개 다른 자료를 계속 읽는다. Refero에서 발견한 잘못된 hex·역할 충돌·
브랜드와 출처/이미지 불일치는 공식 원제품 구현 근거에서 제외한다. 이 checkpoint는 적용/
승급 근거를 추적하기 위한 기록이며 사이트 전체 완료나 새 릴리스가 아니다.

### 병렬 조사 checkpoint — 2026-10-07 14:52 KST

아래는 저장된 보고서/URL index와 대조한 시점의 값이다. 조사자는 다음 batch를 계속 읽으며,
이 수를 이후 전체 완료율로 재해석하지 않는다.

| 대상 | 이번에 보존한 독해 범위 | 아직 별도인 범위 |
| --- | --- | --- |
| CTA | snapshot551: 상세505 소개/분류 + 비상세46 고유 추출 본문. 상세 기본 시각360/505(두 view355, desktop-only5) | related 목록·원제품 상태·비상세 전체 시각. live Numa 발견으로 현재 known URL은 최소552이며 새 URL 독해 미완 |
| Magic UI | main102 전체 +2 부분/257. 보이는 컴포넌트 Manual TSX/CSS77/77 | 나머지 main153, provider 설치 탭·연결 소스·전체 예제 시각/상태. 실제 선택 흐름은4페이지 |
| Refero | captured 본문105/1394: 일반52 +상세53/1342 | 상세1289 본문, 각 원본 화면/상태. 재구성 수치·출처 불일치는 제품 공식 토큰으로 채택하지 않음 |
| Motion | Carousel4변형과 MorphingPopover3변형의 실제390px/dark/reduced 및 선택 키보드/입력 경로 | 모든 환경·상태·hook/license 검토는 미완. 기존 본문 독해 수에 중복 가산하지 않음 |

CTA의 기존551 snapshot 내부 anchor 비교에는 새 URL이 없었지만 live related 링크에는 Numa가
나왔다. 따라서 sitemap/capture 종료를 discovery closure로 취급하지 않는다.
[A URL별 범위 — 본문 요약·미확인 범위](../qa/2026-10-07-reference-parallel-a.md)와
[Motion 실제 관찰](../qa/2026-10-07-motion-reference-page-review.md)을 중앙 목록/ledger와 연결했다.

버튼 표현 후보도 기존 Button/IconButton의 HTML button·Pressable, loading/disabled/초점 계약과
대조했다. Ripple/CoolMode의 별도 입력 엔진은 키보드·모션 감소·입자 수명 조건이 다르므로
그대로 복사하지 않는다. 기존 press opacity는 유지하며 선택적 press feedback descriptor는
아직 미구현 후보다. Carousel의 다중 visible/부분 노출도 기존 단일 active 계약과 다른
명시적 기능 후보로 남긴다. Popover는 현재 nonmodal/초점 복귀와 controlled draft를 유지한다.
이번 checkpoint는 문서·채택 기준 갱신이며 renderer 추가·새 실험 등록·승격·게시가 아니다.

Motion 자동 반복 후속: Infinite Slider3/Text Loop3 예제의 실제 모션 감소·좁은 화면과
선택 hover/순환을 확인했다. 중복 읽기·정지 UI 부재·순환 중 공간 이동을
[QA와 중앙 ledger](../qa/2026-10-07-motion-reference-page-review.md)에 보존했다.
TextTransition/ContentTransition의 지침에서 고정 fade로 남은 기본값을 실제
`designProfile.interactions.contentTransition` 상속에 맞춰 고쳤다. 이 API는 단일 값의
전환만 제공하므로 timer/자동 반복 구성 후보를 이미 제공한 기능으로 세지 않는다.
문서 링크575파일과 사용 지침12토큰/139컴포넌트/54구성/22화면 검사는 통과했고
renderer 변경이나 신규 실험·릴리스는 없다.

사용자가 여러 테마·질감을 토큰에 넣을지, 공통 기본값은 HJM에 두고 제품별로 관리할지 물었고 후자를 선택했다. 공통 규격으로 제품의 분위기가 같아지는 것을 피하면서 검증·재사용을 유지하기 위한 경계다. 기존 [브랜드 경계](../../packages/design-contracts/docs/brand-boundary.md)를 시작점으로 사용한다.

| HJM이 제공할 것 | 제품이 관리할 것 |
| --- | --- |
| 역할 기반 토큰, light/dark 연결, 대비·초점·큰 글자·모션 감소·터치 영역 기준 | 제품의 브랜드 팔레트, 로고·그림·문구와 정보 우선순위 |
| 재사용 가능한 재질 표현, 강도·크기·투명도 등 검증된 선택 축 | 어떤 재질을 어느 영역에 어느 강도로 사용할지 정하는 테마 설정 |
| 서로 다른 표현을 비교할 수 있는 선택형 프리셋·사용 지침 | 제품 목적에 맞는 프리셋 조합·지원 조건·제품 화면 검증 |

- HJM 기본 표면은 중립적인 읽기·입력 기반으로 유지하고 재질을 선택적으로 적용한다. 모든 소비 제품에 특정 종이/유리/네온 스타일을 강제하지 않는다.
- `light/dark`는 환경 축이며 종이·유리 같은 표현 스타일과 구분한다. 같은 제품의 웹·앱은 하나의 테마 설정을 공유하고 실제 플랫폼 표현 차이만 renderer/host에서 처리한다.
- 현재 공개 브랜드 경로는 `brandPalette`다. 현재 EffectSurface의 mesh/glow/grain/noise를 우선 비교한다. 없는 재질·프리셋·타이포/모서리 축을 이미 제공한다고 안내하지 않는다.
- 추가 축은 기존 token/recipe/descriptor/public API와 Web·Native 구현을 비교한 뒤 실험으로 제공한다. 제품에서 내부 selector·CSS 변수·임의 시각 style로 계약을 우회하지 않는다.
- 이 선택은 소유권과 방향의 승인이다. 추가 테마의 UI/기능 검증·승격·npm 게시·제품 적용을 완료한 증거가 아니다. 전수조사를 먼저 이어가며 발견한 후보를 공통 규격/선택형 표현/제품 설정으로 분류한다.

## 테마 모음과 전체 단계 상속 — 후속 사용자 요구

2026-10-07 사용자는 제품이 테마를 선택할 수 있도록 여러 테마를 HJM에 참고용으로 보관하고, 테마를 한 번 주입하면 컴포넌트 → 구성 → 화면에 적용되기를 요청했다. 팔레트만 바꾼 비교 스토리로 전체 요구를 완료 처리하지 않는다.

당시 구현 전 소스 확인(역사 snapshot): Web/RN Provider는 `brandPalette`와 환경 축을 자식에게 상속한다. Web `createHjmThemeStyle`은 radius/font/typography/shadow를 공통 foundations에서 직접 가져오고, Native Provider도 고정 foundations를 tokens로 제공한다. Native actions/inputs에는 직접 radius/typography를 읽는 부분도 있다. EffectSurface의 질감은 별도 descriptor다. 따라서 현재 색상 상속은 제공하지만 제품별 재질·형태·서체를 합친 단일 테마 프로필의 전 단계 적용은 미완료다.

목표 연결은 **제품 테마 설정 → Provider → 역할 기반 토큰·recipe → 컴포넌트 → 구성 → 화면**이다. 여러 테마는 선택형 참고 자료로 제공하고 중립 기본값이나 제품 소유권을 대체하지 않는다.

완료 조건:

- 테마별 palette·지원하는 typography/shape/elevation/material 축을 공통 계약으로 해결하고 동일 프로필을 Web/RN에 전달한다. 실제 지원하지 않는 유리·서체·질감 효과를 이미 구현했다고 표시하지 않는다.
- 구성/화면마다 테마 prop을 반복해 주입하거나 별도 스타일을 복제하지 않는다. 기본 profile은 호환성을 유지하고 제품이 한 번 선택한다.
- 재질은 화면 바탕·카드·장식 같은 역할별 표면에 적용한다. 입력/본문의 읽기·초점과 오류·성공 의미, 터치 영역·큰 글자·모션 감소 계약은 모든 테마에서 유지한다.
- 중첩 Provider와 포털/Modal에서도 동일 프로필이 이어지고, 테마 전환 때문에 입력·선택·저장 초안이 초기화되지 않는다.
- 테마별 실제 Button/TextField/Surface와 기존 구성·화면을 light/dark/큰 글자/작은 화면/RTL/모션 감소에서 함께 확인한다. 몇 개 색상 쌍이나 토큰 단위 테스트만으로 전 단계 지원을 주장하지 않는다.
- 참고 프리셋과 사용 지침을 실험에 등록한다. 후보의 공개 API·renderer·기능/UI·기기 검증과 승격·게시·제품 적용을 별도로 기록한다.

## 표현·상호작용·구성·화면을 함께 선택하는 프리셋 — 범위 정정

2026-10-07 사용자가 “테마 별로 구성도 변경되고 컴포넌트에 같은 기능이지만 여러 인터렉션”, “화면 구성도 변경”을 명시했다. 앞 절의 색·서체·재질 상속만으로는 이 요구를 충족하지 못한다. 따라서 참고 테마 등록은 **디자인 프리셋**으로 확장한다. 아래는 당시 목표 계약이다. 현재 구현은 디자인 프로필 계약·공개 renderer·조사 마감의 항목별 근거에서 확인한다.

| 프리셋의 축 | 선택하는 것 | 함께 유지할 계약 |
| --- | --- | --- |
| 표현 | palette, 지원하는 typography/shape/elevation/material 역할 | 대비·읽기·큰 글자·초점·터치 영역 |
| 컴포넌트 상호작용 | 동일 기능의 검증된 feedback/transition/disclosure/selection 표현과 입력 방식 | 행동 callback·데이터 의미·비활성/진행/실패·초점·대체 입력 |
| 구성 | inline/expandable 도구 묶음, 카드 묶음·행 배치 등 공개 구성의 변형 | 동일 데이터·행동 슬롯·입력/초안 보존·복구 |
| 화면 | 동일 화면 목적의 영역 배치·탐색 표현·주 행동 배치 변형 | 필수 영역·정보 우선순위·제품의 라우팅/권한/서버 확정 |

연결은 **HJM 프리셋 + 제품별 override → Provider에서 공통 resolve → 토큰·상호작용·구성·화면의 변형 선택 → 실제 renderer**다. 각 앱의 설정 파일 하나에서 네 축을 함께 선택하고 필요한 축만 바꾼다. 같은 제품의 Web/Native는 설정을 공유하며 host 차이는 각 renderer에서 명시적으로 번역한다. light/dark·RTL·큰 글자·모션 감소·화면 폭은 별도 환경 축으로 해결한다.

- 기존 descriptor/상태 엔진/공개 슬롯을 먼저 비교한다. 같은 저장·선택·열기 기능을 프리셋마다 복제한 컴포넌트 이름으로 늘리지 않고, 기존 API가 검증된 변형을 선택하도록 한다. 고유 행동이 필요하면 공통 계약 확장과 플랫폼 지원을 함께 정의한다.
- 변형 registry는 실제 구현·지원 환경·fallback을 가리킨다. 이름만 등록하거나 색만 바꾼 스토리를 “구성/화면이 바뀌는 테마”로 표시하지 않는다. 앱은 HJM checkout 수정 없이 프리셋 상속·부분 override와 지원되는 제품 슬롯으로 자기 디자인을 정의할 수 있어야 한다.
- 명시적 컴포넌트/구성/화면 옵션이 있으면 그것을 우선하고, 없으면 가장 가까운 Provider 프리셋, 이어서 HJM 기본값을 쓴다. 호환성 때문에 기존 명시적 prop을 프리셋이 조용히 덮지 않는다. 중첩 Provider·portal/Modal에서도 resolved profile이 일관돼야 한다.
- 테마 전환으로 이동하는 영역은 같은 데이터/초안/선택 상태를 보존한다. 별도 variant subtree로 전환하며 발생할 수 있는 재마운트·포커스 소실·중복 제출은 실제 기능 검증 항목이다. gesture 중심 변형에도 키보드·보조 기술·모션 감소 대체 경로를 둔다.
- 설정 화면의 묶인 행/카드형 구분, 편집 도구의 inline/접이식 구분 등은 설명을 위한 예시다. 아직 제공하거나 채택 확정한 변형으로 계산하지 않는다. 전수조사에서 원본 기능과 HJM 중복을 검토해 실제 권장 목록을 확정한다.
- 실험의 비교 단위는 같은 제품 데이터와 행동으로 동작하는 프리셋별 **컴포넌트·구성·화면 전체**다. 네 축에서 실제 변화가 드러나는 복수 프리셋, 개별 축 override, 환경 조합, 전환 중 상태 보존을 확인한 뒤 승격·게시·Utilverse 적용한다. 시각 스크린샷만으로 인터랙션 검증을 대신하지 않는다.

## 당시 완료 증거 — 1.14.0 checkpoint

아래 표는 당시 17개 실험 승급/게시 snapshot이다. 2026-10-07 최신 적용 상태는 머리말과 [조사 마감](reference-research-closeout-2026-10-07.md), [후속 검토팩](reference-experiment-promotion-review-2026-10-07.md)을 따른다. 전수 조사 행의 미완료를 현재 추가 조사 의무로 사용하지 않는다.

| 요구 | 필요한 증거 | 현재 상태 |
| --- | --- | --- |
| 11개 사이트 전수 조사 | 사이트별 발견 URL 목록과 페이지별 검토·미확인 기록, 후보별 채택 판단 | 미완료. 이전 조사 수집 수를 UI 검토 수로 세지 않음 |
| 권장 항목 모두 실험 구현 | 후보 목록과 Web/Native 공개 API·개별 스토리·사용 지침 연결 | 로컬 main 17개 실험 구현, 추가 후보 검토 중 |
| UI·기능 검증 | 밝음/어두움/큰 글자/RTL/모션 감소 및 실제 행동, 전체 시트와 기기 QA | 17개 전체 시트·개별 QA·iOS simulator 추가 흐름 및 최종 원격 canonical 검사 통과. 제품·미확인 환경은 QA에 별도 기록 |
| 검증 후 승격 | 항목별 QA 근거, Storybook 양쪽 경로와 지침 동시 갱신 | 완료: 17개 Web·Native 승급·공개 Storybook 확인, [검토 결과](../qa/2026-10-07-experiment-promotion-release.md) |
| HJM 릴리스 | 동기화된 버전·Changeset·CI, npm 세 패키지와 tag의 동일 SHA | 완료: 세 npm package latest 1.14.0, tag SHA 8d6f665, Release Packages 37548646619 success |
| Utilverse 적용·대체 | 모든 화면/컴포넌트 대조표, 공개 API 교체, 제품 상태·테마·데이터 회귀 | 사전 소스 조사 시작. 릴리스 후 정확한 npm 버전 설치 |

## 후속 후보와 검토 순서

2026-10-06 조사 §3의 18개 후보를 빠뜨리지 않는다. 아래 상태는 구현·권고를 구분한다.
새 목록에서 발견한 후보도 검토 후 추가하며 장식 유사성만으로 구현을 중복하지 않는다.

| 후보 | 현재 구현/판단 | 남은 일 |
| --- | --- | --- |
| Morphing Popover / Dialog | 원본 초점·초안 소실 확인. 양 Dialog renderer와 Web Popover에 motionOrigin 구현, 초안 보존 편집 실험에 비모달 변형 추가 | Dialog/Popover 전체 환경·기기·성능 검증. docs/qa/2026-10-07-overlay-origin-transition.md |
| Transition Panel | Web 빠른 전환·입력 보존. Native 큰 글자 키보드 아래 입력 접근 문제를 화면 scroll host로 수정 | 필드 외곽 자동 노출·전체 환경·성능. docs/qa/2026-10-07-native-panel-noise.md |
| Animated Background | Tabs gooey 유지. SegmentedControl selectionMotion=slide 실험 추가 | Web RTL 리사이즈 배경 이탈 수정, iOS 2배 글자 키보드 접근·다크/RTL 선택 확인. 팔레트·Android·접근성·성능 대기. docs/qa/2026-10-07-selection-motion.md |
| Stateful Button | Web·iOS 실패→편집→현재 초안 저장 확인. pending 라벨·실패 설정 잠금·비서버 안내 보완 | 환경 조합·제품 상태 연결. docs/qa/2026-10-07-feedback-panel-reference.md |
| File Upload | Web 실제 파일 제한·중복·취소·키보드 재시도 확인, 상태 전환 초점 수정. Native 합성 오류/재시도/성공 확인 | Native 시스템 picker·실제 전송 취소·환경 조합. docs/qa/2026-10-07-upload-reference.md |
| Bento Grid | ProductBento 실험 | 좁은 화면/Native 정보 순서·레이아웃 검증 |
| CTA | Ente/Webflow 갤러리 캡처 대조. ProductBento에 BottomCTA/BottomInfo·초안 유지·실패/재시도 연결. Web·iOS 실제 흐름 확인 | 전체 갤러리 시각 검토·제품 팔레트·Native 환경 조합. docs/qa/2026-10-07-cta-reference.md |
| Refero | Wise 캡처·역할 추출 간 불일치를 확인해 REFERENCE_BRIEF에 관찰/추론 구분 추가 | 전체 스타일 시각 검토와 역할별 제품 테마 대조 |
| Image Comparison | Native SVG 실패를 PNG fixture로 수정, 실제 드래그/양끝 확인. 양 renderer RTL 캡션 방향 수정 | Native 환경 조합·스크롤 충돌·이미지 host 실패 안내. docs/qa/2026-10-07-image-comparison.md |
| Dynamic / Expandable Toolbar | 단일 선택을 SegmentedControl로 수정. Web RTL 키보드·접기 포커스·초안 유지, iOS 키보드 중 선택·재개 확인 | Native 환경 조합·VoiceOver·제품 편집 모델. docs/qa/2026-10-07-toolbar-reference.md |
| Progressive Blur | 경계·초점 보호를 포함한 양 renderer 실험 구현. iOS 실제 합성·끝 항목 선택·내용 축소·다크 확인 | Android 합성·접근성·제품 팔레트·비용 비교. progressive-blur-adoption-2026-10-07.md |
| Noise / EffectSurface | 정적 noise 레이어와 동일 강도 grain 비교 실험 추가. Web 강도 변경 후 입력 유지·버튼, iOS 표시·입력·키보드 중 스크롤/버튼 확인 | 제품 팔레트·대비·성능·Android·접근성 검증. docs/qa/2026-10-07-noise-experiment.md |
| Hero Video Dialog | 기존 Dialog + 제품 player host Web/Native 실험 구현. Web 실제 재생·실패 복구·닫기·초안 유지 확인 | Native 실제 기기, 제품 팔레트, 실제 유음 콘텐츠의 자막/대본 검증 남음. 무음 fixture를 자막 검증으로 세지 않음 |
| Rating | Web 키보드/초기화 초점 버그 수정, iOS 큰 글자 선택·초기화·비활성 확인 | RTL·다크·제품 팔레트·스크린리더 검증. docs/qa/2026-10-07-rating-reference.md |
| 3D icons | 그림과 시작 안내 실험 추가(Web/Native), CC0 원본 2개 | Web 흐름·다크·큰 글자·390px 확인, Native 실제 기기·다른 제품 팔레트 검증 남음 |
| Number Ticker | 공식 소스·기본 데모 대조 후 기존 엔진 유지. 양쪽 소수/음수·비라틴·지수·모션 감소·RTL 비교 스토리 추가 | Native 실제 변형·접근성 및 전체 환경 검증. docs/qa/2026-10-07-number-reference.md |
| Scroll Progress / Tracing Beam | 원본 본문/선 관찰, 기존 ScrollProgress 유지. Web·iOS 본문 스크롤·축소·복원 검증 | 광선 표현·원본 속도 반응은 미확인. docs/qa/2026-10-07-reading-reference.md |
| Animated List | ContentTransition enterOnMount + List 양 플랫폼 실험 추가. 초기 데이터 지연 없이 새 행 등장·초안 보존·재정렬·삭제·정지 | 전체 팔레트·RTL·성능·Native 환경 검증. 재정렬 이동 모션은 미구현. docs/qa/2026-10-07-live-list.md |

## 이번에 갱신한 관찰

- Uiverse는 2026-10-07 IAB에서 `/elements` 목록을 열 수 있었다. 페이지 제목은 4,489 UI elements이며,
  기존 Galaxy 소스 3,802개와 동등하지 않다. 이전의 HTTP 403을 현재 사이트 전체 접근 불가로 이어 쓰지 않는다.
  목록은 Randomized 정렬이므로 안정된 정렬과 페이지 경계를 확인한 뒤 URL별 중복을 제거해야 한다.
- 21st 약관 §3의 자동 수집·미디어/메타데이터 재사용 제한을 현재 원문에서 재확인했다.
  전체 마켓 일괄 수집은 진행하지 않으며 공식 제공 경로/원저자 소스와 검토 가능한 범위를 구분한다.
  이 제한 때문에 남은 페이지를 검토 완료로 바꾸거나 전수 조사 범위를 축소하지 않는다.
- Utilverse 작업 시작 시 main은 ahead 1 / behind 2이고 dirty source는 없었다. 다른 작업의 커밋을
  초기화하지 않는다. 앱은 Native 전용이며 5개 제품 테마·자체 artwork·로컬 도구 데이터 경계를 유지한다.

## Utilverse 1차 대조 지점

검색 결과를 교체 확정으로 세지 않는다. 제품 소유 도구 렌더링·native host는 실제 계약에 따라 남길 수 있다.

| 소스 | 현재 구현 | 우선 대조할 HJM |
| --- | --- | --- |
| components/LanguageSelect.tsx | Sheet 안 Pressable 선택 행 | Select로 선택창 전체 대체 검토 |
| components/PhotoFilePreview.tsx | Native Modal + 이미지 미리보기 | ImageViewer / Dialog의 host·확대·닫기 계약 |
| components/AuthorAvatar.tsx | Pressable 아바타 | Avatar의 공개 행동/링크 슬롯 |
| features/ConversationScreen.tsx | 메시지 주변 Pressable·NativeText | ChatMessage / MessageComposer / reaction 계약 |
| features/ToolboxScreen.tsx | 제품 tile Pressable | Card / Grid / action 공개 슬롯, 제품 shell 테마 유지 |
| components/DisplayPresentation.tsx | 전체 화면 native Modal | ScreenLayout / Dialog 비교, 출력 geometry·회전·화면 유지는 제품 host |
| 삭제·신고 확인 5개 화면 | Alert.alert | AlertDialog와 취소·파괴 행동·중복 제출 계약 |

소스는 `apps/utilverse/apps/mobile/src/` 기준이다. 전체 route·feature·component inventory를 만들고
각 항목에 교체/유지 이유와 검증을 연결한 뒤 채택 완료 여부를 판단한다.


## 조사 재개에 쓰는 기록

- `reference-component-review-ledger.json`: 기존 네 공식 목록 283개 URL의 대응 판단과 페이지별 실제 검토 상태.
  기본 pending은 이전 분류를 새 UI 검증으로 잘못 올리지 않기 위한 값이다. 첫 후속 Animated Background에 구체적인 관찰을 추가했다.
- `reference-site-inventory.json`: 2026-10-07 robots에 공시된 사이트맵에서 발견한 페이지 URL. Minimal 3,433,
  CTA 551, Aceternity 501, Magic UI 257, Refero 1,394. 총 6,136 URL이며 중복 이미지 loc는 수집하지 않는다.
  이 수는 공개 링크 탐색 종료나 시각 검토 수가 아니다. 이전 감사의 추가 내부 링크를 대조해야 한다.
- 위 두 JSON은 페이지 원문·미디어·실행 로그가 아니라 후속 검토의 URL별 진척을 유지하는 조사 증거다.
  QA 원시 파일 정리 때 삭제하면 매번 범위를 다시 발견해야 하므로 검토 종료까지 보존한다.


## Utilverse 소스 inventory

`node scripts/audit-consumer-ui.mjs <utilverse-root> docs/plans/utilverse-ui-adoption-inventory.json`
명령으로 소비 저장소의 TypeScript parser를 사용해 `apps/mobile/src/**/*.tsx` 136개를 읽었다.
JSX에서 실제 사용한 import·alias·행 번호·파일 hash를 기록했다. 현재 121개 파일은 source-reviewed이며
나머지 15개는 pending이다. source-reviewed는 UI·동작 검증이나 채택 완료가 아니다.
HJM import가 있다는 사실만으로 내부 자체 UI가 대체됐다고 판단하지 않는다. Alert.alert 같은
JSX 밖 호출은 위 1차 대조 목록 및 후속 동작 분석으로 함께 확인한다.

PhotoFilePreview를 직접 읽고 중요한 차이를 확인했다. 제품은 Expo Image의 `onDisplay`로만
결과 검토를 허용하고 오래된 파일 이벤트를 ticket으로 무효화한다. 현재 HJM ImageViewer는
Native Image `onLoad`만 사용하며 host-render/표시 확인 슬롯이 없다. 단순 교체하면 데이터 승인
시점이 바뀌므로 릴리스 전 공통 host 확장 또는 공통 overlay+제품 이미지 host 구성을 검토해야 한다.
LanguageSelect는 ListRow의 고정 접근성 역할을 보완하려고 별도 radio Pressable을 사용한다.
HJM RadioGroup의 renderIndicator와 세로 row presentation으로 같은 의미·체크 표시를 지원하는지 비교한다.


## 2026-10-07 공식 페이지 범위 재검사

`python3 scripts/audit-reference-pages.py`로 Magic UI·Aceternity 사이트맵 757개 정규화 URL에서
시작해 HTML 내부 링크를 따라 발견 큐가 빌 때까지 검사했다. 총 1,194 URL: Magic UI HTML 286,
Aceternity HTML 893, 404 14, 오디오 1. 이 검사는 정적 HTML 범위이며 브라우저에서만 나타나는
링크·로그인·유료 영역·전체 화면과 동작 검토를 완료했다는 뜻이 아니다. URL·응답·hash·제목 요소·
heading·표시된 코드 import·소스 링크를 `reference-page-source-index.json`에 보존했다.
원문 HTML은 보존하지 않는다. 반복 탐색은 기존 기록으로 재개하며 21st는 자동 수집 대상에서 제외한다.

기존 Aceternity 후보에 있는 12개 주소가 404였다. 실제 source 파일 이름과 문서 route가
일치하지 않는 항목을 새로 대조해야 한다. 내부 링크에서 찾은 목록 밖 25개 페이지를 ledger에
추가했다(설치/도구 문서 4개 포함). 오래된 URL을 조용히 지우지 않고 404 근거를 남긴다.
원문 title 요소에는 SVG 제목도 섞일 수 있어 document title이라고 표시하지 않으며,
표시 코드 import가 비어 있다는 사실을 의존성이 없다는 근거로 쓰지 않는다.

## Utilverse Avatar 채택에 필요한 호스트 확장

자체 Avatar는 Expo Image disk 캐시와 로딩 중 이니셜 유지가 있다. Native HJM Avatar에
`renderImage({source,size,fallback,onError})`를 추가해 제품 host를 연결하고 프레임·접근성·
대체 표시를 HJM에 남겼다. A→B→A 뒤 이전 이미지 실패가 새 이미지를 지우지 않도록
source 세대 검사를 넣었다. 기존 Native Image 경로는 유지한다. 아직 미게시·앱 미적용이다.

## 영상 다이얼로그 실험

10번째 레퍼런스 실험으로 `실험/구성/정보 표시/영상 미리보기`를 두 Showcase에 추가했다.
공개 Dialog를 재사용하고 플레이어만 제품 호스트로 공급한다. 6초 자체 생성 무음 fixture로
Web 실제 재생과 decoder 오류→재시도를 확인했다. 닫기 즉시 플레이어를 제거하고 초안과
초점 복귀를 유지한다. Native 모듈 없는 기존 개발 앱은 지원 누락 안내를 보여 준다.
이 안내는 기기 재생 통과가 아니며 승격·릴리스 전에 실제 host 검증이 남는다.
자세한 결과와 미확인 범위는 `docs/qa/2026-10-07-video-dialog.md`에 기록한다.

## 추가 후보: 문장 주석

2026-10-07 Magic UI Highlighter의 실제 데모·공식 소스를 대조했다. 기존 TextFormat은
Web의 kbd/code/quote만 제공하므로 기존 API로 바로 흡수 가능하다는 초기 대응표는
기능 동등성을 뜻하지 않는다. 기본 강조·밑줄 외 박스/원/취소선/괄호와 줄별 주석을
비교할 새 실험 후보로 유지한다. 아직 구현하지 않아 실험 수는 14개다.

원본은 inline-block과 rough-notation을 사용하고 body resize마다 주석을 hide/show한다.
HJM에서는 문장 줄바꿈·텍스트 선택을 보존하고 장식은 접근성 트리에서 제외해야 한다.
정적 배경색만 더해 원본 손그림·줄별 표현까지 흡수했다고 판단하지 않는다.
공통 주석 계약과 양 renderer 측정·모션 감소·제품 팔레트를 설계한 뒤 실험으로 구현한다.
원본 문서의 duration 기본값 500ms와 해당 source의 600ms 차이도 관찰했다.
상세 근거와 미확인 범위는 [문장 강조 조사](../qa/2026-10-07-highlighter-reference.md)에 있다.

문장 주석의 공통 geometry 구현을 시작했다. `packages/design-contracts/src/text-annotation.ts`는
실제 측정한 줄 조각에서 7가지 주석의 결정적 경로와 잘림 방지 bounds를 만든다.
현재는 내부 모듈이며 공개 export·양 renderer·실험 스토리는 아직 없다. 문장 일부의
Native 줄별 측정이 다음 구현 지점이다. 실험 수를 늘리거나 UI 검증으로 집계하지 않는다.

문장 주석 Web 내부 renderer와 실제 DOM 브라우저 회귀 6개를 추가했다. 순수 geometry는
contracts subpath로 연결했지만 Web renderer 공개 export·양쪽 Storybook은 미등록이다.
Native 0.86.2/iOS 26.5에서 중첩 Text의 줄 이벤트 미발생·measure 0×0을 실측했다.
Native에는 정확한 문장 조각 측정 host가 필요하며 전체 문단 좌표로 대체하지 않는다.
원형 주석의 끝 글자와 선이 겹치는 시각 문제도 남았다. 양 renderer 연결과 이 문제 해결
후 실험으로 등록한다. 현재 14개 실험 및 전수 조사·릴리스 미완료 상태는 유지한다.

문장 주석의 큰 글자 끝부분을 가로지르는 circle 경로는 실패 회귀를 먼저 확인한 뒤
바깥으로 휜 루프로 수정했다. 계약 12개/브라우저 7개 통과. 원본 타원과의 형태 차이와
조밀한 줄 간격, Native 측정 문제는 계속 검토하며 아직 새 실험으로 집계하지 않는다.

Native 문장 주석의 후속 측정 후보로 Skia Paragraph를 실제 기존 iOS 기기에서 검증했다.
같은 엔진의 범위 측정과 그리기를 사용하면 한글·emoji·혼합 RTL의 대상 부분을 표시할 수
있었다. fallback run 경계가 겹치는 문제를 공통 병합 함수로 수정했다. 일반 Native Text와
줄바꿈은 달랐으며 선택·복사·폰트/스케일·장식 외곽·Android가 남아 있어 공개 컴포넌트나
새 실험으로 등록하지 않았다. 내부 측정 후보 확인을 일반 본문 대체 완료로 세지 않는다.

## Utilverse 미리보기·전광판 계약 대조

2026-10-07 fa201bc의 두 컴포넌트와 호출부를 HJM e7903e6에 대조했다.
계획의 FullScreenOverlay는 실제 공개 API가 아니므로 삭제했다. 사진 결과 확인은 Expo
onDisplay에 의존하며 ImageViewer의 onLoad로 치환할 수 없다. 전광판의 출력 geometry와
화면 유지 수명은 제품 소유다. 기존 Native Modal을 없애기 위해 기능을 줄이지 않는다.
[파일별 판단과 남은 검증](utilverse-preview-display-adoption.md)에 채택 전제와 보존 계약을 적었다.
현재 소비 manifest는 1.12.2-basic-screens-preview.6 로컬 tarball이다. HJM 게시 버전과
소비 설치 버전을 혼동하지 않으며 이번 대조에서 Utilverse 소스를 수정하지 않았다.

언어 선택·Avatar·AuthorAvatar·SocialPhotoGallery 네 파일의 소스 대조를 추가했다.
[선택·미디어 채택 판단](utilverse-selection-media-adoption.md)에 기존 API 연결과
조회 수명·터치 대상·이니셜 보존 조건을 적었다. Carousel의 숨겨진 슬라이드도
renderSlide가 실행되므로 선택 사진만 조회하도록 연결해야 한다. 사용 지침에도
이 경계를 추가했다. 현재 소스 검토 6/136이며 소비 적용·기기 검증 수는 아니다.

ImageViewer의 제품 이미지 host·상태 이벤트를 구현하고 stale callback 회귀를 추가했다.
iOS 실측에서 retry 터치가 Gallery gesture layer에 막히는 문제와 사진 위 오류 문구의
가독성 문제를 수정했다. light·dark/2배 글자에서 재시도 복구를 확인했다.
[검증 기록](../qa/2026-10-07-image-viewer-host.md). 명시적 배율·회전과 Expo onDisplay
실기기 검증·Utilverse 적용은 남아 있으며 실험 개수와 전수 조사 완료 상태는 바꾸지 않는다.

ImageViewer의 회전 허용 prop과 좌우 cutout 보호를 추가했다. 닫기·재시도·이전/다음은
긴 문구가 줄바꿈될 수 있다. Gallery의 공개 ref에는 정확한 scale 설정이 없어
2배/pixel 보기의 구현 경로를 별도 검증한다. 회전 실측과 명시적 배율은 아직 미완료다.

정확한 배율 진단에서 Gallery의 scale=1 세로 pan은 손을 떼면 0으로 돌아갔다.
ResumableZoom은 804×804/402×454의 ±201/±175, 출력 크기 600×600의
±99/±73 경계에 머물 수 있었다. 공통 image geometry와 회귀를 추가했으며
공개 배율 UI·접근 가능한 이동·모드 변경 검토 무효화는 다음 구현 지점이다.


ImageViewer의 선택적 inspection 공개 API에 fit/2배/출력 크기와 방향/중앙 버튼을 연결했다.
실제 남은 viewport에서 공통 geometry를 계산하며 크기·모드·재시도 변경 시 새 host의 표시
확인을 다시 기다린다. iOS light와 dark/2배 글자에서 합성 실패 복구·배율 전환·버튼 이동을
확인했고 Native 1,201 테스트가 통과했다. 일반 Gallery 경로는 유지한다.
[검증 범위](../qa/2026-10-07-image-viewer-host.md)에 Android·회전·스크린리더·Expo 표시 확인·
제품 팔레트·성능 미확인을 남겼다. 아직 미게시·Utilverse 미적용이며 실험은 14개다.


## 추가 후보: 기억하는 날짜 직접 입력

2026-10-07 [Component Gallery Date input](https://component.gallery/components/date-input/)의
18개 예제 목록에서 [GOV.UK 공식 지침](https://design-system.service.gov.uk/components/date-input/)과
예제 HTML을 읽었다. 년·월·일의 독립 입력과 그룹 이름/오류, 부분 입력 보존, 생일 자동완성,
자동 초점 이동을 하지 않는 계약은 달력에서 날짜를 고르는 행위와 다르다. HJM 5582ec7의
Web DatePicker는 calendar dialog trigger, Native는 Sheet trigger이며 직접 분할 입력 API가 없다.
기존 매핑 `DatePicker / Field`를 기능 동등성으로 인정하지 않는다.

공통 날짜 조각 resolver + 기존 TextField/Form 구성으로 흡수할 수 있는지 실험 후보에 추가한다.
기존 달력은 유지한다. 지역별 순서, 월 이름 입력, 미완성/잘못된 날짜/범위 오류, 큰 글자/키보드,
Native 자동완성 지원과 스크린리더 그룹 의미를 검토한 뒤 양쪽 공개 구성과 실험을 설계한다.
[Wise compact date input](https://wise.design/components/compact-date-input)은 이번 텍스트 조회에서
본문이 거의 없어 동작 판단 근거로 사용하지 않았다. 18개 예제의 시각·상호작용은 미검토이며
새 후보를 구현된 실험 수로 더하지 않는다. 현재 실험 수는 14개다.


날짜 직접 입력 후속: GOV.UK 기본/단일 오류 예제를 실제 브라우저로 확인했다. 월 이름·부분
연도가 유지되고 누락된 연도에만 오류 표시가 있는 것을 관찰했다. Wise compact 링크는
실제 /404로 이동했다. 공통 내부 초안 resolver와 6개 회귀, contracts 타입/빌드를 통과했다.
달력 계산은 기존 정책대로 제품 adapter에 두고 부분 값·누락 우선·필드별 오류를 HJM이 연결한다.
[확인 범위와 다음 연결 작업](../qa/2026-10-07-date-entry-reference.md). 공개 renderer와 실험은
아직 없으며 14개 집계는 유지한다.


날짜 직접 입력은 이제 contracts/Web/Native 전용 공개 subpath와 사용 지침, 양쪽 Storybook
`실험/구성/입력과 작성/날짜 직접 입력`에 연결했다. 현재 실험은 **15개**다. 이전 14개 기록은
당시 snapshot이다. Web 윤년 오류 교정/순서 전환, iOS 기본 입력/확인을 실제 화면에서 관찰했다.
계약 7개·Web 3개·Native 4개 회귀를 추가했지만 환경/스크린리더/자동완성/Android 검증이 남아
승격·릴리스하지 않았다. Highlighter는 여전히 내부 후보이며 16번째 실험으로 세지 않는다.


날짜 입력 환경 검증에서 반복 오류와 Native 큰 글자 하단 접근 문제를 수정했다. 오류는
그룹 한 번 + 해당 필드 테두리/설명으로 연결하고 Native 예제는 화면 스크롤을 소유한다.
Web dark/RTL/390px/2배 글자, iOS light/2배 글자 입력→오류 복구→확인과 Native 1,207개
회귀를 확인했다. 제품 팔레트·Android·스크린리더 등은 남았으며 실험 15개/승격·릴리스 미완료다.


## 추가 후보: 관련 입력 묶음

GOV.UK 주소 그룹의 실제 화면·입력·Tab 이동과 HJM 제출/선택/날짜 API를 대조했다.
일반 입력 그룹은 기존 Form으로 대체되지 않으므로 [별도 실험 계획](field-group-experiment.md)에
공개 계약·Native 접근성·오류/잠금 검증 조건을 등록했다. 내부 공통 resolver와 회귀 6개를 추가했고
contracts typecheck·build가 통과했다. 공개 renderer·스토리는 아직 없으며 15개 집계에는 포함하지 않는다.


관련 입력 묶음을 양 renderer의 공개 `field-group` subpath와 Storybook에 연결했다. 현재 16개 실험이다.
[검증 기록](../qa/2026-10-07-field-group-reference.md)에 자동 검사·Web 환경 조합·기존 iOS 기기의
오류/입력/잠금/재정렬 관찰과 미확인 범위를 구분했다. 승격·릴리스·Utilverse 적용은 아직 하지 않았다.


대화·도구함 두 화면의 전체 소스와 현재 HJM renderer를 대조했다.
[채택 판단](utilverse-conversation-toolbox-adoption.md)에 검색 행·반응 집계·빈 상태의
교체 경로와 durable command·가상화 pager 보존 조건을 기록했다. 대화 화면은 이미
ChatScreen/ChatMessage를 사용하므로 초기 목록의 표현을 신규 전체 교체로 해석하지 않는다.
현재 8/136 source-reviewed, 128 pending이다. 소비 구현·기기 검증·릴리스는 미실행이다.


삭제·신고·차단·명령 피드백 여섯 TSX를 상세 검토했다. 현재 14/136 source-reviewed,
122 pending이다. [상태 의미와 교체 조건](utilverse-destructive-actions-adoption.md)에
Promise resolve와 서버 성공의 차이, Sheet 자식 명령의 닫힘 정책 연결을 기록했다.
소비 코드·기기 QA·릴리스는 미실행이다.


문서·파일 구성을 contracts/Web/Native 공개 `document-resource` subpath, 사용 지침과 양쪽
Storybook `실험/구성/정보 표시/문서와 파일`에 연결했다. 현재 **17개 실험**이다.
Web 실패→재시도에서 실제 76바이트 UTF-8 다운로드와 원문 일치를 확인했다. Native 예제는
텍스트 Share host이므로 native 파일 저장 검증으로 세지 않는다. 자동 회귀·타입·빌드와
공개 API/문서/스토리 규격은 통과했지만 기기·제품 팔레트·접근성 및 원본 전수 검토는 남는다.
[검증 범위](../qa/2026-10-07-file-reference.md). 승격·릴리스·소비 앱 적용은 미실행이다.


설정·도구 화면 열 TSX를 추가 검토해 현재 24/136 source-reviewed, 112 pending이다.
[채택 계획](utilverse-settings-tools-adoption.md)에 기존 SettingsScreen 재사용, 테마 RadioGroup·
알림 ListRow·Section/Notice 교체 후보와 TopBar/키보드/전광판 host 경계를 기록했다.
전체 136 파일 hash는 소비 fa201bc9와 다시 일치 확인했다. 소비 코드·기기 QA는 아직 미실행이다.


문서·파일 Native host를 실제 TXT 생성/읽기 확인/OS 공유로 보완했다. iOS 26.5에서 파일에
저장까지 실행하고 Files 사본의 내용 hash를 확인했다. 이전 텍스트 Share 한계 기록은 당시
snapshot이며 Android·접근성·전체 환경은 아직 미검증이다. 실험 17개/승격·릴리스 미실행 유지.

## 가입·계정 소스 검토 갱신

10개 파일을 추가 검토해 81/136 source-reviewed다. [계정 채택 계획](utilverse-account-auth-adoption.md)에 Agreement의 버전별 동의·잠금, List/계정 행동, Notice 안내 교체와 제품 보존 계약을 기록했다. HJM 1dea6da의 잠금·큰 글자 수정은 완료했으나 소비 적용은 릴리스 후이며 아직 미실행이다.

## 공개 콘텐츠 복구 소스 검토 갱신

6개 파일 추가 검토로 87/136 source-reviewed다. [복구 UI 채택 계획](utilverse-public-recovery-adoption.md)에 이의 신청 확인창, 댓글 메뉴, 로컬 문서 복구와 실패 후 원문 비노출 계약을 기록했다. 소비 적용·runtime 검증은 미실행이다.

## 알림 소스 검토 갱신

4개 파일 추가 검토로 91/136 source-reviewed다. [알림 채택 계획](utilverse-notifications-adoption.md)에 NotificationItem 행동 슬롯, 날짜/시각 구성, 권한·예약·구독·수신함 요청 수명 보존을 기록했다. 소비 적용과 실제 알림 검증은 미실행이다.

## 계산·변환 소스 검토 갱신

6개 파일 추가 검토로 97/136 source-reviewed다. [계산 도구 채택 계획](utilverse-numeric-tools-adoption.md)에 문자열 정밀도 보존, 선택·접기·확인·안내의 공통화와 환율 snapshot/익명 공유 계약을 기록했다. 소비 적용은 미실행이다.

## 로컬 기록 도구 소스 검토 갱신

6개 파일 추가 검토로 103/136 source-reviewed다. [로컬 도구 채택 계획](utilverse-local-tools-adoption.md)에 TaskList 항목 행동·큰 결과 숫자 보완 후보, 저장 큐와 비밀값 수명 보존을 기록했다. 후보 구현·소비 적용·runtime 검증은 미완료다.

## 추첨·점수판 소스 검토 갱신

8개 파일 추가 검토로 111/136 source-reviewed다. [추첨·점수판 계획](utilverse-random-score-adoption.md)에 제품 그림과 공통 제어부 경계, Celebration optional peer 전제, 단일 추첨과 재생 취소 계약을 기록했다. 소비 적용·기기 검증은 미실행이다.

## 날짜·시계·타이머 소스 검토 갱신

3개 파일 추가 검토로 114/136 source-reviewed다. [시간 도구 계획](utilverse-time-tools-adoption.md)에 DateEntry/DurationField 채택과 DST 중복 시각·절대 마감 시각·저장 큐 보존 조건을 기록했다. 소비 적용은 미실행이다.

## 소셜 입력·외부 host 검토 갱신

7개 파일 추가 검토로 121/136 source-reviewed다. [소셜 host 계획](utilverse-social-host-adoption.md)에 기존 composer 슬롯 흡수, 선택 UI와 광고/번역 host 경계를 기록했다. 소비 적용·runtime 검증은 미실행이다.

## 2026-10-07 최소 10개 프로필 확정 요구

사용자 요청으로 neutral을 제외하고 레트로·종이·숲·미니멀·에디토리얼·브루탈리즘·유리·오로라·터미널·클레이 10종을 실험에 등록한다.
원본 문서의 관찰, HJM 해석, 미지원 효과와 실제 검사 결과는 [테마 조사/QA](../qa/2026-10-07-design-profile-research.md)에 모은다.
프로필 숫자·등록만으로 전체 사이트 전수검수나 모든 기존 컴포넌트 반영 완료를 선언하지 않는다.

### 2026-10-07 최소 10종 구현 결과

neutral 제외 레트로·종이·숲·미니멀·에디토리얼·브루탈리즘·유리·오로라·터미널·클레이를
4개 참고 도메인의 개별 출처에 근거해 실험으로 구현했다. 공개 계약·양 renderer·Provider 상속·
상호작용 기본값·OverviewScreen·개별/전체 비교 Storybook·사용 지침·Changeset을 구현하고 대상 로컬 검사를
수행했다. 최신 전체 검사에는 ContextMenu 브라우저 1건 실패/단독 통과가 남아 전체 green으로 안내하지 않는다. [QA 기록](../qa/2026-10-07-design-profile-research.md)에 화면·명령·미지원 표현·기기 검증
공백을 남긴다. 이 결과로 11개 사이트 전수 검토·승격·게시·소비 앱 반영 항목을 닫지 않는다.

### 오버레이·선택 입력 연결 후속 보완

2026-10-07 Provider 토큰만 바꾸고 고정 chrome을 유지한 경로를 대조해 Web Dialog/Sheet/Toast
floating shadow, Native Dialog/AlertDialog/Sheet의 shape/shadow, Select/Combobox와 feedback의 shape를
연결했다. 기존 테마 비교 실험에서 알림/로딩/Toast와 열린 Dialog/Sheet의 다음 테마 순회를 제공한다.
초안·선택·Modal lifecycle은 같은 엔진을 유지한다. Native mock-host 대상 56검사, Web browser 대상 18검사와
두 Showcase 검사를 통과했고, 실제 브라우저 light Dialog 10종 + dark/RTL/2배 Sheet 10종 + 390px Sheet
10종의 입력/id 유지·가로 overflow·닫기 target을 확인했다. Native 기기/접근성은 아직 미확인이다.
직접 foundation import 감사의 18파일·50 runtime 참조에는 정상 fallback/full/고정 glyph가 섞이며,
미흡한 다른 shape/type/optional host 경로를 후속 대조한다. 이는 전체 토큰 소비 감사 완료가 아니다.

Magic UI의 알려진 공개 URL 257개의 source fetch가 exit=0/HTTP200 257로 종료했다.
원본 reading·UI/state 검토는 별도 진행이며 11개 사이트 전수 검토 완료 flag는 유지하지 않는다.
미게시 source와 명령/화면/hash/잔여 경로는 [테마 QA](../qa/2026-10-07-design-profile-research.md)에 보존한다.

2026-10-07 내용 전환 후보 단위: Motion 두 예제 전체 코드·실제 흐름 대조 후 양 플랫폼
`실험/구성/비교와 검증/내용 전환 비교`에6스토리와 사용 지침을 등록했다.
[후보별 등록·검증](../qa/2026-10-07-content-transition-comparison.md). 전수 조사·Native 기기·승급·게시 완료 아님.

2026-10-07 날짜와 시각 후보: 기존 DatePicker·시간 선택을 합성해 양 플랫폼 7스토리·사용 지침을
`실험/구성/선택과 필터/날짜와 시각 선택`에 등록했다.
[검증과 Form 안내 정정](../qa/2026-10-07-date-time-selection.md),
[후보별 실제 등록부](reference-experiment-registrations-2026-10-07.json). 전수 조사·Native 기기·승급·게시 완료 아님.

2026-10-07 명령 기록 후보: 기존 CodeBlock/Tabs/ClipboardButton으로 양 플랫폼8스토리와
사용 지침을 `실험/구성/정보 표시/명령 기록 표시`에 등록했다. 복사 요청의 중복/이전 응답을
Chromium에서 재현해 공통 ClipboardButton을 보완했다. [근거·한계](../qa/2026-10-07-command-records.md).
Native 실제 OS·승급·게시·전수 조사 완료는 아니다.

2026-10-07 조사 인벤토리 재조정: A가 기존 DB2657 요청 목록 밖의 내부 링크를 확인했다.
새 경로6+플랫폼 분류18을 중앙 [페이지 목록](reference-site-inventory.json)에 더해 요청2681/
canonical2680이 됐다. `sponsor#apply`는 기존 페이지의 상호작용 타깃으로 따로 남겼으며 새
페이지로 세지 않았다. `libraries`의 실제 rendered404는 오류 관찰로 보존하고 성공 본문 수에서
뺐다. A의 소개층 독해·화면24개·원제품 흐름 미확인을 구분하며 discovery closure는 false다.
기존 수집 PID80505가 root `ps`에서도 없는 것을 확인해 중앙 running 표기를 역사 snapshot으로
정정했다. 다른 source/crawler를 덮어쓰거나 재시작하지 않았다.

21st.dev 원본 pages.json은 B와 root가 0byte를 관찰했다. 원인은 미확인이며 원본은 보존한다.
B의 [별도 복구 인덱스 — 본문 요약·미확인 범위](../qa/2026-10-07-reference-parallel-b.md)는
기존12460URL 중 raw 파일 byte/SHA가 맞는11398개와 누락1062개를 구분한다. HTTP 상태·수집
시각 복구나 본문 독해·실제 UI 검증 완료를 뜻하지 않는다. 중앙 목록에 복구 파일 SHA와
독해 수를 별도 기록한 이유는 오래된 수집 수와 현재 오류를 합쳐 전수 완료로 오인하지 않도록
하기 위해서다. 구현·실험 등록 상태는 [B 조사](../qa/2026-10-07-reference-parallel-b.md)와
[후보 등록부](reference-experiment-registrations-2026-10-07.json)에 계속 따로 연결한다.


2026-10-07 조사 종료 후 필요한 적용: 기존 `실험/구성/비교와 검증/테마 조합`에
앱 소유 설정 `산책 노트`와 `문장 모음`을 양 renderer 변형으로 추가했다. 기존10테마와
제품 설정3종의 Web30조합에서 동일 입력 노드·초안·선택 유지와 가로 overflow 없음,
일부 좁은 다크/RTL/모션 감소 및 실패/재시도·Dialog 초안/초점 복귀를 확인했다.
[검증·한계](../qa/2026-10-07-product-theme-propagation.md). 원격CI·버전 상승·게시·실제 제품
반영과 Native 기기 검증은 수행하지 않았다. 새로운 범용 테마 엔진이나 실험 경로를 중복 등록하지 않았다.


## 2026-10-07 최신 게시·소비 확인

기존 계획의 1.14.0 완료 표와 달리 현재 npm latest는 세 패키지 모두 1.15.0이다.
공식 registry의 tarball integrity를 직접 비교했고 기본 10종 프로필 및 design-profile 공개 진입점은 게시본에 있다.
CollectionRail 진입점과 renderer Text.fontRole, EffectSurface ruledSpacing은 1.15.0에 없다.
따라서 기본 테마 제공과 이번 후속 구현의 게시를 합산하지 않는다. GitHub Release 목록은 비어 있지만 npm 게시 부재의 근거가 아니며, remote v1.15.0 tag는 commit 9aa33e2063dc65d0427697fb5a20b48ab7cba387을 가리킨다.

초기 공유 checkout에서 확인한 중앙 release record와9개 소비 제품의 manifest/contract는1.14.0이었다. 이 working-copy 기록은 아래 최신 원격 상태의 대체 근거가 아니다.
이는 다른 branch/worktree/remote에 1.15.0 갱신이 없다는 증거가 아니다. 소비 버전 변경 전 각 저장소의 branch/worktree와 진행 중 작업을 먼저 대조한다.
이미 게시된 1.15.0의 소비 갱신은 사용자의 “릴리즈 되면 다른 곳들도 버전업” 범위에 있으며, 후속 8개 실험 승급·npm 게시 승인은 별도 질문으로 확인 중이다.
초기 게시 확인에서는 version 상승·CI dispatch·앱 build/배포·소비 수정이 없었다. 아래 소비 후속의 실제 검사/merge는 별도로 기록한다.

원격 main 재확인: 중앙 release record blob b3bde1e6c80521361902ec8da33e3c3c287ffed0과 BurnTok contract blob d8932e5c092712e4151eaac610edb35373237d78은 1.15.0이다.
22:28 KST 후속: Portfolio Site PR25와 Unairplane PR18을 게시 1.15.0으로 갱신하고 main merge 및 원격 계약을 확인했다. 제품별 frozen 설치·로컬 검사와 한계는 [완료 감사 §8](../qa/2026-10-07-reference-completion-audit.md#8-게시-1150-소비-반영--2228-kst)에 기록했다. Spint·Diairy·Mofun·Utilverse·Choose Window·Yajalal의 원격 main 계약은 아직1.14.0이다.
공유 checkout의 dirty와 stale local refs 때문에 설치/merge를 직접 수행하지 않는다. 22:45 KST 후속: Spint PR19와 Mofun PR6도 게시1.15.0으로 갱신해 main merge와 원격 계약을 확인했다. 검사·경고·메타 PR12 정리는 [완료 감사 §9](../qa/2026-10-07-reference-completion-audit.md#9-spintmofun-소비-반영--2245-kst)를 따른다. 이미 완료된5개 갱신은 중복하지 않으며 Diairy·Utilverse·Choose Window·Yajalal4개를 최신 원격 main에서 분리해 갱신한다.

23:00 KST 후속: Utilverse PR2를 게시1.15.0으로 갱신해 main a08bf0625747649c8c6410dc788a5db50bd41288에 통합했다. 기존 Query factory의 중앙 등록 누락은 메타 PR13에서 해당 export만 등록해 정리했다. 실제 검사·경고·보관 범위는 [완료 감사 §10](../qa/2026-10-07-reference-completion-audit.md#10-utilverse-소비-반영--2300-kst)을 따른다. 원격 main 계약9개 재확인에서6개 완료이며 남은 소비 갱신은 Diairy·Choose Window·Yajalal3개다. 필요한 조사 마감과 후속8개 실험 승급·게시 승인 대기는 그대로 유지한다.

23:11 KST 후속: Choose Window PR16과 Yajalal PR110의 Flutter native-adapter 계약·catalog/release 참조를 게시1.15.0으로 맞춰 main 통합과 원격 계약을 확인했다. Dart UI·10종 테마 자동 전환·시각 parity는 이 metadata 갱신의 완료 주장이 아니다. 실제 Flutter 분석·test340/564건·bundle 및 canonical 범위/한계는 [완료 감사 §11](../qa/2026-10-07-reference-completion-audit.md#11-flutter-두-제품-계약-갱신--2311-kst)을 따른다. 현재9개 원격 소비 계약 중8개 반영이며 남은 것은 Diairy1개다.


23:37 KST 후속: Diairy PR26의 Web/Native 게시1.15.0을 main31c53b7aa3da1ca883d6120c450c625d6119d3c2에 통합했다. 기존 guide의 RSC 경계/브라우저 fixture 보완과 실제 두 표면 타입·2444unit/생성기5건·Node e2e36건·웹 두 build·iOS/Android JS export·선택 browser7조건의 범위와 한계는 [완료 감사 §12](../qa/2026-10-07-reference-completion-audit.md#12-diairy-webnative-소비-반영과9개-main-재확인--2337-kst)에 기록했다. 중앙 기존 library 채택 누락은 메타 PR14로 정리했다.9개 원격 main SHA를 각각 조회한 뒤 고정 SHA의 계약을 다시 읽어 모두1.15.0임을 확인했다. React7개/Flutter native-adapter2개이며 후자는 Dart 테마 UI 구현 완료가 아니다. 필요한 조사와 실험 등록은 마감했다. 후속8개 실험의 승급·게시 명시 승인만 별도로 대기한다.


2026-10-08 00:10 KST 후속: Diairy에서 확인한 Web layout/provider RSC 경계를 HJM source에 보완하고 직접-import Next production fixture를 남겼다. 관련 기존 CollectionRail/글자 역할/토큰 표 검사 연결 누락까지 보완한 local gate 구간별 완료는 [완료 감사 §13](../qa/2026-10-07-reference-completion-audit.md#13-공개-web-profile의-rsc-경계와-로컬-gate-정리--2026-10-08-0010-kst)을 따른다. 새 npm train·소비 wrapper 제거·원격 CI는 수행하지 않았다. 필요한 조사 마감 및8개 실험 승급·게시 승인 대기는 유지한다.

2026-10-08 00:18 KST: 일시적인 GitHub push 오류 뒤 재시도가 성공해 마지막 RSC source 보완/검사 연결을 원격 main793a2d26에 통합 확인했다. 실패 이력과 최종 상태는 [완료 감사 §14](../qa/2026-10-07-reference-completion-audit.md#14-마지막-source-보완의-원격-통합-확인--2026-10-08-0018-kst)에 있다. 후속8개 승급·게시 승인은 아직 도착하지 않았다.
