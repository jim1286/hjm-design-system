# 브랜드 경계 — 제품이 바꿀 수 있는 것과 그 경로

상태: 규범 · 2026-09-26 · 이 문서가 브랜드·테마 주입 규칙의 단일 원본이다.
[theming.md](./theming.md)는 사용법 예시, [consumer-policy.md](./consumer-policy.md)는 채택 정책,
[design-system-provider.md](./design-system-provider.md)는 환경 축 설계를 다루며 브랜드 규칙은 여기로 링크한다.

2026-09-26 설계 점검에서 브랜드가 들어오는 경로가 네 가지(부분 `brandPalette`, 손으로 조립한 전체 `value`,
CSS 변수 재정의, 제품 자체 토큰 생성기)였고, 문서 세 개가 서로 다른 규칙을 적고 있었다
(`.hjm-*` 재정의 금지 vs 특이도를 맞추면 허용, 부분 덮어쓰기 배제 vs `brandPalette` 권장). 그리고 제품 팔레트의
대비를 아무도 검사하지 않았다. 이 문서가 그 셋을 하나로 정한다.

## 1. 지원하는 경로는 `brandPalette` 하나다

- 제품 브랜드는 Provider의 `brandPalette` prop으로 넣는다(`<HjmProvider brandPalette={…}>`,
  `<HjmNativeProvider brandPalette={…}>`, 1.5.0). theme별로 17개 `ThemeColors` key 중 필요한 것만 넘기고,
  나머지는 HJM 기본값을 쓴다(부분 병합). Provider는 계속 OS theme·글자 크기·모션 설정을 따르고,
  중첩 Provider는 가장 가까운 상위의 `brandPalette`를 물려받는다.
- 상태 강조색(`statusAccents`·`statusAccentFills`)은 덮을 수 없다. "오류·성공"과 "브랜드"가 같은 색이 되는
  것을 막는다.
- 1.4까지는 Provider에 이 prop이 없어서 `resolveDesignSystemProviderValue(input, { brandPalette })` 결과를
  `value`로 넘기는 것이 유일한 방법이었다. 그러면 Provider가 OS 설정 관찰을 멈춰 제품이 system theme·reduced
  motion을 직접 구독해야 했다. 이 우회를 쓰는 제품은 prop으로 옮긴다.
- **전체 `value`를 손으로 조립하는 것**(resolver 결과의 `palette.theme`을 통째로 바꾸는 것 포함)은 테스트·임베딩용이지
  브랜드 경로가 아니다. 부분 병합으로 표현할 수 없는 요구는 계약 공백이므로 이슈로 올린다.
  17개 key를 모두 채운 `brandPalette`는 허용되지만 아래 대비 검사를 반드시 통과해야 한다.

## 2. 모든 브랜드 팔레트는 대비 검사를 통과해야 한다

`@hjmds/design-contracts/palette-contrast`의 `checkBrandPaletteContrast(brandPalette)`가 Provider와 같은 방식으로
theme별 병합 결과를 검사하고, 기준 미달 쌍을 돌려준다. 빈 배열이어야 한다(MUST). 제품은 이 호출을
자기 테스트에 두어 팔레트 변경마다 실행한다. 전체 팔레트는 `checkPaletteContrast(palette)`를 쓴다.

| 쌍 | 최소 | 근거 |
| --- | --- | --- |
| `text`·`textBody`·`textMuted`·`textSub` on `bg`·`surface` | 4.5 | WCAG 1.4.3 본문. `textSub`는 `Text tone="subtle"`의 실제 글자색이다 |
| `contentBrand`·`danger` on `bg`·`surface` | 4.5 | 링크·현재 위치·오류 문구는 글자로 읽힌다 |
| `onPrimary` on `primary`, `onDanger` on `dangerFill` | 4.5 | 채운 버튼의 라벨 |
| `primary`·`borderControl` vs `bg`·`surface` | 3 | WCAG 1.4.11. 채운 컨트롤과 쉬고 있는 컨트롤 윤곽선은 형태로 식별돼야 한다 |
| `textWeak` vs `bg` | 3 | 아래 참조 |

`textWeak`는 비활성 문구·placeholder·장식 표지(`content.decorative`) 등급이라 본문 4.5를 요구하지 않는다.
비활성 콘텐츠와 장식은 WCAG 대비 요구에서 제외되고, HJM 필드는 보이는 label을 요구하므로 placeholder가 유일한
정보가 되지 않는다. 다만 같은 key가 canvas 위의 `border.strong`(Toast 표면 테두리, Carousel 비활성 점)도 칠하므로
`bg` 대비 3:1은 지킨다. 읽혀야 하는 글자에 `textWeak`를 쓰지 않는다.

HJM 기본 light·dark 팔레트도 같은 검사를 통과한다(`test/palette-contrast.test.ts`). 2026-09-26 이 검사를 만들면서
기본 light `textSub`(`#6b7684`)가 `surface`에서 4.19:1로 AA 미달임을 찾아 `#65707d`(4.57:1)로 고쳤다
([theme-palette.md](./theme-palette.md)).

## 3. CSS 재정의는 지원하는 테마 경로가 아니다

- `.hjm-*` 클래스를 제품 stylesheet에서 덮거나 `--hjm-*` 변수를 제품 CSS·인라인 style로 재정의하지 않는다(MUST NOT).
  `.hjm-*` 이름과 내부 DOM은 공개 API가 아니며, HJM이 바꿔도 호환성 파괴로 취급하지 않는다. 특이도를 맞추면
  허용한다던 이전 문구(consumer-policy)는 이 문서로 대체한다.
- 필요한 값이 semantic key나 recipe 축으로 표현되지 않으면 계약 공백이다. 우회하지 말고 이슈로 올린다.
- 제3자 브랜드 색(소셜 로그인 등)은 테마가 아니라 남의 자산이다. [AuthProviderButton](./provider-button.md)이 소유한다.
- component `style` escape hatch는 배치(margin·width·flex)에만 쓴다. 색·타이포·radius·높이·상호작용 상태를
  덮는 데 쓰지 않는다([consumer-policy.md §3](./consumer-policy.md#3-코드-경계)).

### 기존 재정의는 추적되는 부채다

2026-09-26 기준 제품 web stylesheet의 `.hjm-*` 재정의: 다에리 61줄, 번뚝 26줄. 제품은 이 목록을 한 곳에 모으고,
각 줄을 (1) `brandPalette` key, (2) HJM recipe 축 요청(이슈), (3) 삭제 중 하나로 옮긴다. 새 재정의는 추가하지 않는다.

### 이관 경로: 레이어된 stylesheet (opt-in)

`@hjmds/react/styles.css`는 기본적으로 **CSS 레이어 밖**에 있다(호환성 유지). 이 때문에 레이어 안에 있는 소비 앱
유틸리티(Tailwind 4의 `@layer utilities` 등)는 HJM 규칙을 덮지 못하고, 레이어 밖의 제품 규칙은 특이도 싸움으로만 이긴다.

같은 내용을 `@layer hjm { … }`로 감싼 `@hjmds/react/styles.layered.css`를 함께 배포한다. 빌드가 `styles.css`에서 생성하므로
두 파일의 규칙은 항상 같다. 이 파일을 쓰면 **레이어 밖의 모든 제품 CSS가 특이도와 무관하게 HJM을 이긴다** —
`button { background: none }`, `* { margin: 0 }` 같은 전역 요소 리셋과 CSS 리셋 라이브러리까지 포함해서다.
그래서 전환 전에 제품은 다음을 확인한다.

1. 전역 요소 선택자(`button`, `input`, `a`, `h1`…, `*`)와 리셋 stylesheet를 찾아 HJM 컴포넌트 안에 닿는지 본다.
   닿으면 제품 레이어(예: `@layer reset, hjm, product;` 순서 선언)로 옮기거나 범위를 좁힌다.
2. 기존 `.hjm-*` 재정의는 레이어 전환 뒤 특이도 없이도 이기므로, 의도하지 않은 재정의가 더 넓게 먹지 않는지 확인한다.
3. 브라우저에서 light/dark·큰 글자 화면을 실제로 확인한 뒤 전환한다.

기본 `styles.css`를 레이어로 바꾸는 것은 위 확인이 모든 web 소비 제품에서 끝난 다음 major에서 결정한다.

## 4. HJM과 제품이 소유하는 것

HJM: semantic color role과 light/dark 대비, spacing·type scale·radius·motion·touch target, component anatomy·상태·
키보드·screen-reader 행동, loading·empty·error·disabled·focus 문법.

제품: 이름·로고·대표 이미지, `brandPalette`로 표현한 브랜드 색, 도메인 상태 → `AccentTone` 매핑, 콘텐츠 밀도와
정보 우선순위, copy·i18n·내비게이션 구조. 제품 고유 gradient는 light/dark·on-color 대비와 reduce-motion을 제품 테스트로
검증한다([consumer-policy.md §4](./consumer-policy.md#4-제품-정체성-경계)).
