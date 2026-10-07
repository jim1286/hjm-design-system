# Aceternity 탭·상태 버튼·상세 카드 대조

검토일: 2026-10-07 · 기준: HJM main `3021ce0` · 상태: 아래 네 페이지의 선택된 동작 검토.
11개 사이트/Aceternity 전체 페이지 검토 완료가 아니다.

2026-10-07 최신 사용자 지침: 최대 OS 접근성 글자와 최대값을 모사한 확대는 이후 설계·구현·
검증·후속·완료/릴리스 차단에서 제외한다. 아래 이미 수행한 확대 검증은 당시 증거로 보존한다.

사용자가 테마에 따라 구성·상호작용도 바뀌기를 요청했으므로, 시각적 닮음보다 기존 HJM의
상태·수명·접근성 경로와 먼저 대조했다. 각 페이지의 설명·표·Manual 제공 구현과 Code 예제를
직접 읽었다. expandable-card는 Standard와 Grid 구현을 모두 읽었다. 원본 코드·사진·서체·색을
제품/renderer에 복사하거나 registry 설치를 실행하지 않았다.

## 원본과 실제 확인 범위

| 원본 | 소스에서 확인한 구조 | 실제 브라우저 확인 | 미확인 |
| --- | --- | --- | --- |
| [Animated Tabs](https://ui.aceternity.com/components/tabs) | 선택 표시가 이동하고 여러 패널의 표시 순서를 바꿈. 선택 값으로 내용 묶음에 key를 주며 모든 콘텐츠를 겹쳐 렌더 | 기본 desktop/light, Services·Random 선택과 겹친 카드 표현 | 나머지 선택/hover 상태, 좁은 화면·RTL·큰 글자·모션 감소·접근성·성능 |
| [Stateful Button](https://ui.aceternity.com/components/stateful-button) | loader 진입 후 callback을 기다리고 success/check를 표시한 뒤 숨김. 예제는 지연 Promise이며 실제 서버 전송 없음 | 같은 실행의 loader와 check 표시, 이후 기본 표시 복귀. pending 중 disabled=false, aria-busy 없음 | 실패/중복/화면 이탈의 실행 검증, 다른 환경·성능 |
| [Expandable Card](https://ui.aceternity.com/components/expandable-card) | 행/그리드에서 별도 상세를 열고 card/image/title의 layout identity를 연결. Escape와 바깥 누름, body overflow 변경 | 문서의 Standard와 Grid 첫 상세 열기. 독립 Standard 예제에서 Escape 후 상세 링크가 제거됨 | 전 항목 순회, 초점·모달 접근성 전체, 작은 화면 닫기·다크·큰 글자·성능 |
| [Layout Grid](https://ui.aceternity.com/components/layout-grid) | 서로 다른 폭의 셀과 선택/직전 선택, 동일 위치 영역 안 확대. 배경 클릭으로 선택 해제 | 4개 썸네일 기본 배치, 첫/네 번째 상세 확대와 바깥 누름 닫기 | 나머지 항목, 키보드·초점·긴 콘텐츠·다른 환경·성능 |

브라우저는 Codex IAB Chromium, 기본 1280px desktop/light다. 첫 캡처의 전환 중 프레임과
정착 후 화면을 구분했다. Standard 문서 안에는 예제가 중복되고 숨은 heading은 키 입력 대상이
아니므로, Escape 성공은 독립 [Standard preview](https://ui.aceternity.com/live-preview/expandable-card-demo-standard)의
상세 링크 제거로 확인했다. 버튼 success 대기 중 첫 관찰창 만료는 종료로 판단하지 않고 같은
실행을 관찰해 check의 display=block, loader의 display=none을 확인했다. 원본의 실패를 주입해
실행한 결과는 아니며, 아래 누락은 제공 구현의 정적 관찰이다.

## 기존 공개 API와 채택 판단

catalog와 [공개 API 대응표](../generated/public-component-map.md), granular exports와
두 renderer의 실제 navigation/overlays/actions/primitives 구현을 대조했다.

| 필요 | HJM에서 재사용 | 판단과 남은 차이 |
| --- | --- | --- |
| 탭 선택 표시 | `Tabs`/`TabPanel`, `appearance="gooey"` | 기존 선택/수명 엔진 유지. `gooey`의 늘어남과 profile `selectionMotion="slide"`는 다른 표현. 현재 프로필이 Tabs appearance를 자동 변경하지 않는 누락을 후속 후보로 남김 |
| 콘텐츠 변경 피드백 | optional `ContentTransition` | profile의 contentTransition을 받는 단일 subtree 전환. 원본처럼 모든 패널을 겹쳐 렌더하거나 key로 전체 초안을 다시 만드는 대안은 입력 수명/접근성 때문에 채택하지 않음 |
| 처리 중·성공·실패 | `Button` + 기존 제품 mutation 또는 `createActionSession`, `Notice`/`ContentTransition` | 상태 버튼이라는 별도 엔진 추가 불필요. 원본 제공 구현에는 pending 자동 disabled/busy 및 rejection 정리가 없으며 도메인 응답 검증도 없음. HJM의 기존 loading/복구 계약에 연결 |
| 행/카드/그리드 | `Grid`, `Card`, `OverviewScreen`의 프로필 구성 축 | 현재 Grid는 반응형 열 수이며 원본의 개별 CSS column span과 동일하지 않음. 테마의 rows/cards/grid 구성과 제품의 정보 우선순위를 함께 검토. unequal-span 필요는 미지원 후보로 남김 |
| 상세 열기 | `Card.actions`의 `Button` → `Dialog` + optional `motionOrigin`; 인라인이면 `Collapsible` | 일반 상세 경로는 기존 API로 흡수. 원본의 card/image/title별 shared-element identity를 지원한다고 표시하지 않음. 상세·초점·초안의 엔진을 복제하지 않고, 좌표는 제품 host가 측정 |

`Card`는 버튼 의미나 onPress를 소유하지 않는다. 사용 지침에 공개 actions 경로를 명시했다.
원본의 비의미적 div 클릭, global layoutId, body overflow 직접 변경을 공통 동작으로 가져오지
않는다. Dialog의 busy/close/return focus와 제품의 실제 성공 판정·초안은 기존 소유권을 유지한다.

## 이번 적용

- Dialog 축 표에 `motionOrigin`을 추가하고 Card/Button에서 여는 실제 공개 API 골격을 연결했다.
  기존 지침 하단의 전환 설명은 있었지만 prop 표에는 없고 미게시로 남아 있었다.
- npm registry와 1.14.0 양 renderer tarball의 `dist/overlays.d.ts`를 직접 읽어 게시 타입을 확인했다.
  release commit `8d6f665`의 양 source에도 같은 prop이 있다. 계약/사용 지침의 미게시 표기를
  **게시 API·실험 표현**으로 정정했다. 현재 테마 후속 변경의 게시를 뜻하지 않는다.
- Card에는 인라인 펼침과 상세 모달의 선택 기준, Button에는 pending·도메인 확정·실패 복구의
  상태 연결, Tabs에는 profile 축과 appearance/패널 수명을 혼동하지 않는 기준을 추가했다.
- ledger의 네 URL을 HTML 확인에서 실제 소스·선택된 시각/행동 검토로 갱신했다. 모든 환경이나
  전체 사이트 완료로 바꾸지 않는다.

이 변경은 재사용 지침/검토 결과의 적용이다. 새 컴포넌트/선택 축/peer/버전을 추가하지 않았고,
실험 승급·원격 CI·npm 게시·소비 앱 코드 변경·기기 검증은 수행하지 않았다.

## 구현 후속과 완료 증거

1. 프로필의 selectionMotion을 Tabs에 적용할 표현은 평범한 이동과 gooey를 구분해야 한다.
   공통 resolver, 명시적 appearance 우선, 세로 fallback, 빠른 전환 취소, large text/RTL 측정,
   reduced motion, Web/Native 동일 선택·focus·패널 초안 보존으로 입증해야 한다.
2. 서로 다른 폭의 셀이나 카드별 shared-element 이동이 필요한 구성은 원본의 전체 동작과
   기존 API의 차이를 더 읽고 공통 의미/플랫폼 번역을 정한다. 현재 Grid/Dialog로 원본 동등성을
   주장하지 않는다.
3. 각 원본의 남은 상태·환경과 연결된 block/preview/관련 페이지를 ledger에서 계속 검토한다.
   네 페이지의 선택된 동작 검토로 source/visual/interaction 전수 완료를 선언하지 않는다.

관련 진행: [전수 검토·릴리스·제품 채택 계획](reference-release-utilverse-2026-10-07.md),
[테마 조사/QA](../qa/2026-10-07-design-profile-research.md).

## 같은 날 후속 구현: Tabs 선택 표시 (미게시)

위 표는 첫 원본 검토 시점의 상태다. 후속 구현에서 새 엔진 없이 공통 resolver와 양쪽
기존 Tabs에 프로필 상속·명시 slide를 연결했다. appearance를 생략할 때만 selectionMotion을
읽고, 명시 standard/slide/gooey가 우선하며 세로는 standard를 유지한다. 일반 slide는
200ms 공통 곡선·2점 표시선, 기존 gooey는 320ms 늘어남·6점 표시선으로 구분한다.
빠른 재선택은 현재 표시 중인 좌표를 이어받으며 선택/키보드/disabled/패널 수명은 유지한다.
실험 테마 비교에 공개 Tabs와 visited 초안의 네 표시 선택을 추가했다.

Chromium의 10종 상속·초안/선택 유지·명시 선택, 키보드·중간 프레임 취소·RTL 폭 변경·
동작 줄이기와 Native mock-host 회귀를 확인했다. 자세한 실행/실패/수정은
[같은 작업 QA](../qa/2026-10-07-design-profile-research.md)에 기록한다. Native 기기 성능·
원본 모든 패널 상태·사이트 전수 검토·실험 승급·게시·소비 앱 채택은 여전히 미완료다.

## 가로 카드 목록과 상세 — 실제 원본 검토 후 설계 판단

B는 [Apple Cards Carousel](https://ui.aceternity.com/components/apple-cards-carousel)의 전체
Manual과 관련 확장 카드 구현을 읽고, 독립 예제의 desktop/dark 동작을 확인했다.
1280×720에서 카드 세 개와 다음 카드 일부가 함께 보였다. 첫 카드 Enter로 상세를 연 뒤
Tab은 두 번째 배경 카드로 이동했고 dialog role은 없었다. Escape 후 호출 카드로 돌아오지
않은 관찰은 [B 조사](../qa/2026-10-07-reference-parallel-b.md)와
[해당 시각 증거](../qa/assets/parallel-b-apple-carousel-background-focus.png)에 있다.
이는 선택된 한 예제의 실제 흐름이며 모든 원본 항목/환경/성능 검증은 아니다.

공개 API 대응표와 양 renderer를 다시 대조했다. `List`의 Web `advanced-display.tsx`, Native
`data-display.tsx`에는 가로/스크롤 축이 없다. `Carousel`/`CarouselMotion`은 한 활성 패널을
표시하고 나머지 패널을 숨기거나 inert로 유지한다. 따라서 여러 카드가 함께 보이고 각각의
행동을 읽고 누르는 가로 목록을 Carousel CSS 변경이나 List의 비공개 스타일로 제공했다고
등록하지 않는다. 이 기능은 기존 엔진을 다시 이름 붙이는 것이 아니라 유한 목록의 별도 배치
계약이 필요하다. 상세 모달은 기존 `Card.actions`→`Dialog`에 합성하며 원본 상세 엔진은 복제하지 않는다.

### 공통 계약에서 먼저 정할 것

| 의미 | 구현 방향과 근거 |
| --- | --- |
| 데이터·정체성 | 유한한 안정 ID 목록. 테마/폭/방향 변경은 원문·초안·상세 대상과 기존 subtree를 초기화하지 않는다 |
| 스크롤 위치 | 현재 보이는 기준 항목 ID는 선택 값과 다르다. 모든 카드를 읽고 누를 수 있으므로 기존 Carousel의 단일 선택/inert 계약을 재사용하지 않는다 |
| 배치·끝 처리 | 이전/다음은 유한 목록의 끝에서 멈춘다. 폭은 기존 공개 배치 토큰과 사용 가능한 실제 폭에서 정하고 원본 300px/384px 값을 제품 기본값으로 복사하지 않는다 |
| 방향·입력 | RTL의 논리적 이전/다음, 터치 스크롤, 키보드로 포커스된 항목의 노출을 함께 번역한다. 원본 물리 scrollLeft 증가/감소를 양 플랫폼 계약으로 복사하지 않는다 |
| 부분 노출 | 다음 카드 일부가 보이는 것은 위치 힌트다. 읽을 수 있는 카드/행동을 단일 패널처럼 숨기거나 포커스 불가로 만들지 않는다 |
| 상세·복구 | 기존 Dialog의 배경 잠금·닫기·호출 행동으로 포커스 복귀를 유지한다. 목록/모달 상태 엔진과 body overflow 직접 조작을 새로 만들지 않는다 |
| 테마 | 테마는 간격·표면·목록 표현의 지원 축을 선택한다. 가로 스크롤은 실제 제공된 표현에만 연결하고 미지원 List/화면이 자동으로 가로 목록을 지원한다고 안내하지 않는다 |

### 후보 통합과 다음 구현 범위

새 69번째 제안 경로를 만들지 않고 기존 B의 `실험/구성/정보 표시/고객 후기 탐색`과
`실험/구성/직접 조작과 모션/카드 상세 연결`에서 같은 기능을 요구하는 원본을 대조한다.
가로 목록의 공개 진입점·타입·공통 resolver·두 host의 측정/끝 처리·사용 지침을 구현한 뒤
실제 실험 경로를 확정한다. 현재는 **설계 판단/미구현·미등록**이다.

검증은 기본 글자, 좁은/넓은 화면, light/dark, RTL, 모션 감소, 부분 노출 카드의 읽기·입력,
끝 정렬, 폭 변경, 상세 열기/닫기/포커스 복귀와 테마를 바꾼 뒤 데이터 유지에 집중한다.
최대 글자 확대를 다시 실행하거나 완료 조건으로 추가하지 않는다. Native OS 흐름은 기존에
사용하던 기기에서 확인하며 별도 기기를 만들거나 부팅하지 않는다. 현재 원본 관찰이나
소스 대조만으로 HJM 기능 제공/실험 등록/승급/게시 완료를 주장하지 않는다.
