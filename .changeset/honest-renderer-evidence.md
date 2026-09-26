---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

렌더러 시나리오 증거를 실제 검사로 바꾸고, 그 검사로 드러난 결함을 고친 뒤 13개 컴포넌트를 stable로 올립니다.

**증거.** 1.4까지 dark·RTL·큰 글자·모션 줄이기·긴 문구·접근성 시나리오는 모든 컴포넌트가 템플릿으로 일괄
주장했습니다. 그런데 증명한 것은 SSR 결과에 Provider 속성이 붙었다는 것(Web)과 렌더가 죽지 않았다는 것
(Native)뿐이었습니다. 긴 문구는 컴포넌트가 아니라 감싸는 요소에 들어가 있었습니다.

- Web `test/scenario-matrix.browser.test.tsx`: 실제 Chromium에서 계산 스타일을 봅니다.
  - dark: 라이트 전용 팔레트 색이 남으면 실패합니다.
  - 2배 글자: 글자가 1.5배 이상 커지고 가로로 넘치지 않아야 합니다.
  - RTL: 방향을 상속하고 물리적 정렬을 쓰지 않아야 합니다.
  - 모션 줄이기: 투명도 외의 움직임이 없어야 합니다.
  - 접근 이름: 모든 조작 요소에 이름이 있어야 합니다.
  - 긴 문구: 컴포넌트 안에서 줄바꿈되어야 합니다.
- Native `test/scenario-matrix.test.tsx`: test renderer의 style·props로 같은 축을 봅니다.
  - RTL: LTR 결과의 좌우 반전이어야 합니다.
  - 모션 줄이기: 마운트 때 시작된 `Animated.timing`의 길이를 봅니다.
  - 긴 문구: 레이아웃을 잴 수 없으므로 한 줄로 잘리지 않는지만 증명합니다.
- 기본 시나리오만 기존 default-render proof에 남깁니다. 두 proof는 공용 fixture 모듈을 씁니다.
- Web의 "모든 시나리오 증거 완비"는 과대 표시였던 33개에서 실제 16개로 줄었고, 보강 뒤 24개입니다.

**검사가 찾은 결함과 수정.**
- Heading·Top 제목이 text scale을 무시하던 문제(Web).
- FilePicker의 숨은 file input이 이름 없는 두 번째 tab stop이던 문제(Web). 이제 라벨로 이름을 받고 tab 순서에서 빠집니다.
- Surface·Section·Link에서 끊김 없는 긴 단어(URL·이메일·식별자)가 넘치던 문제(Web). `overflow-wrap: anywhere`를 추가했습니다.

**승격.** `Text`, `Icon`, `Stack`, `Container`, `DesignSystemProvider`, `IconButton`, `Badge`, `Card`, `Tag`,
`Notice`, `Progress`, `Spinner`, `Skeleton`을 stable로 올립니다. 두 renderer에서 요구 시나리오가 모두 통과하고
세 제품 이상이 쓰는 컴포넌트입니다.
- 필수 foundation bridge의 다섯 항목이 모두 stable이 됐으므로 중앙 app profile의 다음 개정에서 목록을 비웁니다(consumer-policy 1.3.0).
- 보이는 글자 슬롯이 없는 Icon·IconButton·Skeleton·Spinner·Divider는 long-copy 요구에서 뺐습니다.

**기타.**
- 카탈로그 확장 동결(`docs/catalog-freeze.json`): keyboard·platform-parity 증거가 필요한 핵심 beta가 승격될 때까지 새 항목을 추가하지 않습니다.
- 핵심 컴포넌트의 시각 기준 이미지 검사(`test/core.visual.test.tsx`, `.github/workflows/visual.yml`)를 추가합니다. 기준 이미지는 CI 이미지(ubuntu-latest)에서만 만들고 비교합니다.
