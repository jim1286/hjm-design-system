# v0.5 implementation design

## 목적

v0.5는 HJM 계약을 더 크게 보이게 만드는 릴리즈가 아니라, **카탈로그·토큰·Showcase가
같은 사실을 말하게 만드는 릴리즈**다. Ant Design reference inventory는 범위 비교에만
사용하고, 구현 증거가 없는 planned 항목을 실제 renderer처럼 표시하지 않는다.

## 설계 결정

### 1. 테마는 HJM light/dark 고정 계약이다

코어는 제품이 임의의 색을 덮어쓰는 `Partial<ThemeColors>` API를 제공하지 않는다. 임의
override는 action/content 대비와 semantic role의 뜻을 동시에 깨뜨릴 수 있기 때문이다.
`DesignSystemProvider` 계약은 환경 입력을 해석하고, 해석된 theme에 해당하는 검증된
`THEMES`, `ACCENTS`, `accentFill` palette를 묶어 renderer에 전달한다.

우선순위는 다음과 같다.

```text
explicit input → parent provider → renderer가 측정한 system signal → HJM default
```

React/RN Context와 OS 구독은 계속 제품 renderer가 소유한다. 코어는 값·기본값·병합·검증만
소유한다.

### 2. typography도 foundation token만 사용한다

기존 size/line-height 역할에 UI/code font family, weight, letter spacing, numeric style,
heading scale을 추가한다. recipe 안의 `"600"`, `"700"` 같은 weight 복제는 foundation
reference로 이관한다. 기존 공개 값은 바꾸지 않는 additive migration이다.

### 3. Showcase route와 renderer evidence를 분리한다

모든 catalog 항목은 문서 route를 갖지만, route가 있다고 renderer가 있는 것은 아니다.

```text
ContractStory
├─ stable/beta + Web 지원 → Web reference renderer
├─ planned/deprecated     → Contract-only decision page
└─ Native-only            → Web unsupported page
```

Web renderer registry는 실제 recipe 객체를 참조해야 하며 fallback renderer를 허용하지 않는다.
Contract-only 화면은 anatomy/defaults/상태 축/behavior/roadmap/승격 근거만 보여주고 완성형
컴포넌트 JSX를 렌더링하지 않는다. Native 증거는 소비 앱의 on-device fixture가 제공하기 전에는
누락 상태로 남긴다.

### 4. Showcase 자체가 첫 번째 Web token consumer다

Storybook decorator는 theme, spacing, radius, typography, glyph, motion, opacity, stroke,
control, layout, layer, backdrop, shadow를 CSS variable로 번역한다. manager chrome도 같은
foundation을 사용한다. token boundary verifier는 원시 색·그림자·모션·타입 값의 재유입을
막고, 편집용 레이아웃 수치는 selector/property/value/reason이 명시된 예외만 허용한다.

Reduce Motion은 모든 animation을 같은 `0.001ms`로 덮지 않는다. renderer가 각
`motionPreset.reducedMotion`의 `instant | opacity | static` 전략을 번역한다.

### 5. 외부 reference와 HJM 구현 상태는 별도 축이다

Ant Design snapshot은 버전과 category/name/lifecycle을 고정한다. 별도 scheduled workflow가
최신 npm 버전과 pin의 drift를 알리되, 네트워크 상태 때문에 기본 push 검증을 불안정하게 만들지
않는다. 73/73 tracking은 구현 완료 수치로 사용하지 않는다.

## 이번 릴리즈의 완료 게이트

- canonical direction/textScale/reducedMotion/theme가 하나의 환경 계약으로 해석된다.
- Provider 값이 resolved environment와 검증된 color palette를 함께 제공한다.
- typography foundation과 recipe weight가 단일 출처다.
- planned story에는 interactive renderer DOM이 없다.
- Web 지원 stable/beta 항목과 renderer registry가 정확히 일치한다.
- Native-only 항목이 Web renderer 수치에 포함되지 않는다.
- Explorer 수치는 catalog status가 아니라 renderer/evidence registry에서 계산한다.
- manager와 preview가 HJM token을 사용한다.
- Ant Design reference drift를 독립적으로 점검할 수 있다.
- Slider/Form/일관성 문서의 알려진 drift가 해소된다.
- `pnpm check`, Showcase type/test/token/static 검증, Storybook production build가 통과한다.

## 의도적으로 하지 않는 것

- Ant Design 외형, prop 이름, runtime dependency 복사
- 제품 증거 없는 planned → beta/stable 승격
- `AppProvider`, `BorderBeam`, `Utility`의 가짜 공개 컴포넌트화
- React/RN renderer를 플랫폼 중립 코어에 포함
- 제품별 locale, copy, storage, domain color를 공용 토큰에 포함
