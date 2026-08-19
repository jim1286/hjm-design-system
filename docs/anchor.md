# Anchor — 계약을 만들지 않는다

## 문제로 제기된 것

Ant Design `Anchor`는 긴 문서 안의 목차 링크를 스크롤 위치와 동기화합니다. 검토
관찰은, 진짜 계약은 **현재 위치 표시**(`aria-current`), **스크롤 동기화**,
**reduced motion에서 부드러운 스크롤을 끄는 것**이라는 것과, 두 제품에 긴 문서 화면이
있는지 확인하라는 것이었습니다.

## 판정: 만들지 않는다

### 1. 두 제품 중 어디에도 목차가 필요한 긴 단일 문서 화면이 없다

- **Yajalal RN**: `약관`/`개인정보처리방침`/`이용약관` 류 화면, 또는 섹션이 여럿인 긴
  스크롤 문서 화면을 전수 검색했지만 찾지 못했습니다. `modules/app-rn/src/lib/copy/terms.ts`는
  이름과 달리 법적 약관이 아니라 "같은 개념에는 하나의 단어"를 강제하는 **카피 용어
  단일 출처**(구단·경기차 표기 등)일 뿐, 목차 내비게이션이 필요한 문서가 아닙니다.
  화면 구조도 DESIGN_SYSTEM.md가 "48pt 상단바 + overline·대형 제목·설명 문장으로 이루어진
  페이지 헤더는 쓰지 않는다"로 규정해, 애초에 스크롤 목차가 붙는 긴 article 레이아웃을
  피하는 방향입니다.
- **BurnTok**: `apps/web/src/app`의 최상위 라우트(`feed`, `messages`, `notifications`,
  `u/[id]`, `c/[id]`, `create`, `ideas`, `run` 등)를 전수 확인했지만 약관·도움말·블로그
  같은 긴 문서 페이지 자체가 없습니다. 앱의 성격(피드형 소셜/영상)상 스크롤 목차가
  붙을 만한 단일 긴 문서 화면이 없습니다.
- `anchor`로 두 저장소를 검색했을 때 나온 유일한 실제 코드 매치는 BurnTok
  `AppTooltip.tsx`/`anchored-overlay.ts`의 "anchor element"였는데, 이는 툴팁이 붙는
  기준 요소를 뜻하는 **오버레이 위치 계산 용어**로, antd `Anchor`(문서 내 목차)와는
  이름만 같고 완전히 다른 개념입니다.

### 2. 계약할 상태 축은 유효하지만, 지금 채울 화면이 없다

관찰이 짚은 세 계약(`aria-current` 현재 위치, 스크롤 동기화, reduced motion에서 smooth
scroll 끄기)은 실제로 새로운 플랫폼 중립 개념입니다 — `BottomNavigation`의
`aria-current="page"`(`docs/architecture.md` BottomNavigation 절)와 다른 종류의 "현재
위치" 표시이고, `Toast`/`Sheet`의 Reduce Motion 처리와도 다른 대상(스크롤 애니메이션)에
적용됩니다. `Notification`/`Dropdown`/`VirtualList`처럼 "문제가 이미 다른 컴포넌트에
흡수됐다"는 판정은 아닙니다 — 흡수할 곳이 없고, 처음부터 이 문제를 푸는 컴포넌트가
없다는 뜻입니다.

그럼에도 만들지 않는 이유는 순전히 **측정된 수요 부재**입니다. 목차와 동기화할 긴
문서 자체가 없는 상태에서 스크롤 동기화 로직을 먼저 설계하면, 실제 문서 구조(섹션
개수, 중첩 깊이, 모바일에서 세로 목차를 어떻게 접을지)를 모른 채 API를 고정하게 됩니다.
`docs/authoring-brief.md`와 로드맵이 반복해서 요구하는 "실제 제품 vertical slice 없이
승격하지 않는다"는 gate 이전에, **애초에 계약을 검증할 화면이 없는** 상태입니다.

## 만들지 않은 것

`src/anchor.ts`, `test/anchor.test.ts`는 없습니다. `componentCatalog`의
`{ name: "Anchor", category: "navigation", platform: "web", status: "planned" }` 행과
crosswalk의 `Anchor → Anchor` direct 관계(`src/component-references.ts:64`)는 건드리지
않습니다.

## 뒤집힐 조건

1. BurnTok 또는 Yajalal(Web 우선, `platform: "web"` 그대로 유지 가능)에 여러 섹션을 가진
   긴 단일 문서 화면(약관, 도움말, 가이드 등)이 실제로 생긴다.
2. 그 화면에서 `aria-current` 기반 현재 섹션 표시, 스크롤 동기화, reduced motion의 즉시
   이동(auto) 전환이 실제로 요구되는 vertical slice가 측정된다 — 그때 이 세 축을 공개
   상태 축으로 계약한다.
