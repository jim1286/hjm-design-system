# HJM Design Identity

## 한 문장

> 조용한 화면 위에 중요한 순간만 선명하게.

HJM은 장식으로 브랜드를 증명하지 않습니다. 정보와 행동의 우선순위를 분명하게 만들고,
사용자가 결정을 내려야 하는 순간에만 브랜드 색과 움직임을 집중합니다. BurnTok, Yajalal,
그리고 앞으로 생길 제품은 서로 다른 콘텐츠를 다루더라도 같은 판단 기준을 공유합니다.

## 네 가지 원칙

### 1. 명확한 집중

- 한 영역에는 하나의 지배적인 행동만 둡니다.
- `primary` fill은 주요 행동에, 더 밝은 `contentBrand`는 focus·선택 indicator·현재 위치에
  씁니다. 둘을 나눠 dark surface에서도 상태 경계가 사라지지 않게 합니다.
- 제목, 본문, 보조 정보의 순서는 크기뿐 아니라 색과 여백으로도 구분합니다.
- 인터페이스가 콘텐츠보다 먼저 보이면 요소를 덜어냅니다.

### 2. 부드러운 구조

- 배경과 surface의 작은 차이, 얇은 border, 충분한 여백으로 계층을 만듭니다.
- 강한 그림자는 떠 있어야 하는 요소에만 씁니다.
- `12 / 16 / 24 / full` radius를 중심으로 친근하지만 가볍지 않은 인상을 유지합니다.
- 일반 정보는 plain section과 list를 우선하고, 카드는 의미 있는 묶음에 사용합니다.

### 3. 확실한 피드백

- pressed, focused, selected, loading, invalid, disabled 상태를 빠짐없이 정의합니다.
- 상태는 색 하나에만 의존하지 않고 형태, 아이콘, 문장 또는 접근성 상태를 함께 사용합니다.
- 오류 문장은 문제와 다음 행동을 알려줍니다.
- 모션은 상태 변화의 원인과 결과를 잇는 데만 사용합니다.

선택 입력에서는 이 원칙을 `brand tint + 선명한 border + 형태 indicator`의 세 겹으로
구현합니다. Checkbox는 check/dash, RadioGroup은 dot을 항상 보여 주므로 선택을 색만으로
추측하게 하지 않습니다. 설명이 있는 결정은 넉넉한 `card` 행, 짧고 반복되는 목록은
`plain` 행으로 표현하지만 같은 focus·invalid·disabled 문법을 유지합니다.

### 4. 플랫폼에 자연스럽게

- Web과 React Native는 의미, 명칭, 크기 계층, 접근성 기준을 공유합니다.
- 키보드, hover, focus trap, safe area, 뒤로가기, native picker는 플랫폼 관습을 따릅니다.
- 픽셀 복제보다 같은 우선순위와 같은 신뢰감을 목표로 합니다.
- 플랫폼 차이는 renderer가 소유하며 제품 화면이 조건문으로 흩어 구현하지 않습니다.

## 시각 문법

### Color

- 깨끗한 white canvas와 깊은 navy dark canvas가 기본입니다.
- HJM blue는 행동과 현재 상태를 드러내는 서명입니다.
- 그라디언트는 브랜드 마크, hero, 특별한 CTA에만 제한합니다.
- `text`, `textBody`, `textMuted`는 필수 정보에 사용할 수 있습니다.
- `textSub`, `textWeak`는 장식적·중복적인 정보에만 사용하며 필수 문장에는 쓰지 않습니다.
- 제품 상태는 먼저 `info / success / warning / attention`에 매핑하고, 제품 이름은 공용
  패키지로 올리지 않습니다.

### Type

- 제목은 짧고 단단하게, 본문은 편안하게 읽히도록 합니다.
- 굵기는 정보 우선순위를 보완하며, 크기만 키워 계층을 만들지 않습니다.
- 숫자 비교가 중요한 화면은 renderer에서 tabular number를 적용합니다.
- 제품별 폰트 로딩은 앱이 소유하지만 typography의 크기·행간 계약은 공유합니다.

### Shape and elevation

- 작은 제어는 `radius.md`, 묶음과 카드는 `radius.lg`, hero와 sheet는 `radius.xl`을
  기본으로 합니다.
- `raised`는 카드, `floating`은 menu·toast, `overlay`는 dialog처럼 실제로 떠 있는
  계층에 대응합니다.
- border와 surface 차이로 충분하면 shadow를 추가하지 않습니다.

### Motion

- `120ms`: hover, press, 작은 색 변화
- `200ms`: 일반적인 열기·닫기와 상태 전환
- `320ms`: 큰 화면 요소와 맥락 전환
- Reduce Motion에서는 이동과 반복을 제거하고 즉시 전환 또는 짧은 opacity로 대체합니다.
- bounce와 spring은 공간 관계를 설명할 때만 사용합니다.

## HJM답지 않은 패턴

- 같은 영역에 Primary 버튼을 여러 개 배치
- 모든 정보를 카드로 감싸거나 그림자로 분리
- 원시 hex, 임의의 간격, 임의의 radius를 화면에서 직접 선언
- 브랜드색을 장식 배경처럼 넓게 사용
- disabled만 제공하고 loading, focus, invalid 상태는 누락
- Web 동작을 RN에 그대로 복제하거나 native 관습을 이유 없이 Web에 강제
- 외부 라이브러리의 색상과 외형을 그대로 복사

## 제품이 소유하는 것

공용 시스템은 시각적 의미와 접근성 계약을 소유합니다. 제품은 도메인 의미와 콘텐츠를
소유합니다.

| 공용 HJM 역할 | 제품 매핑 예시 |
| --- | --- |
| `info` | BurnTok `ai` |
| `success` | BurnTok `built`, Yajalal `win` |
| `warning` | BurnTok `rare` |
| `attention` | BurnTok `popular`, Yajalal `live` |
| product palette | KBO 구단 색상, 코드 미리보기 색상 |

제품 매핑은 앱 또는 제품 어댑터에 남깁니다. HJM 코어에 제품명, 저장 키, 도메인 상태를
추가하지 않습니다.

## 참고 원칙

다른 시스템에서는 외형이나 코드를 복사하지 않고 다음을 학습합니다.

- [Ant Design](https://ant.design/docs/spec/values/): 설계 가치, 토큰 계층, 컴포넌트 범위
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): compound anatomy와 접근성 행동
- [React Aria](https://react-spectrum.adobe.com/react-aria/getting-started.html): 키보드·터치·국제화 상호작용
- [Material](https://developer.android.com/develop/ui/compose/designsystems/custom): color·type·shape subsystem
- [Polaris](https://polaris-react.shopify.com/getting-started/components-lifecycle): 컴포넌트 생명주기
- [Tamagui](https://tamagui.dev/docs/intro/introduction): typed variant와 플랫폼 적응
- [TDS](https://developers-apps-in-toss.toss.im/design/components.html): 간결한 모바일 정보 계층과 협업 언어

TDS를 포함한 제3자 전용 자산·폰트·토큰·구현은 라이선스 범위를 확인하지 않고 포함하지
않습니다. HJM은 공개된 원칙과 일반적인 사용 패턴만 독립적으로 재해석합니다.
