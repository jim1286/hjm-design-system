# `@hjm/design-system`

HJM 제품들이 함께 사용하는 플랫폼 중립 디자인 계약입니다. 밝고 간결한 정보 위계와
결정적인 순간의 선명한 피드백을 공유하되, 특정 제품이나 도메인의 의미는 포함하지 않습니다.

> **조용한 화면 위에 중요한 순간만 선명하게.**

상세 원칙은 [`docs/identity.md`](./docs/identity.md), 계층·지원 단계·확장 계획은
[`docs/architecture.md`](./docs/architecture.md)에 정리되어 있습니다.
Toast의 queue·announcement·timer 수명주기는 [`docs/toast.md`](./docs/toast.md)에 별도로
고정되어 있습니다.
Icon의 semantic name·RTL·장식/정보 접근성 경계는 [`docs/icon.md`](./docs/icon.md)에
고정되어 있습니다.
Tooltip의 Web hover/focus·provider·positioning 경계는
[`docs/tooltip.md`](./docs/tooltip.md)에 고정되어 있습니다.
BottomNavigation의 route source-of-truth와 adaptive renderer 경계는
[`docs/bottom-navigation.md`](./docs/bottom-navigation.md)에 고정되어 있습니다.
Link의 실제 목적지·Web anchor·Native router 경계는
[`docs/link.md`](./docs/link.md)에 고정되어 있습니다.
공통 계약을 Web과 Native에서 검증하는 showcase 규칙과 실행 방법은
[`docs/showcase.md`](./docs/showcase.md)에 정리되어 있습니다.
Ant Design 6.6.0 core 73개를 HJM의 canonical component scope로 번역한 crosswalk는
[`docs/ant-design-coverage.md`](./docs/ant-design-coverage.md)에 정리되어 있습니다.

## Showcase

```bash
pnpm install
pnpm showcase:web       # Web Storybook
pnpm showcase:web:check # story 계약과 타입 검사
pnpm showcase:web:build # 배포 가능한 정적 Storybook
```

Web Storybook은 탐색 가능한 component home, foundation·catalog·환경 매트릭스를 보여주고, 실제 React Native
renderer는 소비 앱의 on-device Storybook에서 같은 story identifier로 검증합니다.
light/dark, LTR/RTL, 100–200% 글자 크기, reduced motion이 공통 필수 환경입니다.

## 경계

이 저장소가 소유하는 것:

- light/dark 시맨틱 색상과 범용 강조색
- spacing, radius, typography, glyph, motion, touch target, shadow, layout, layer
- semantic color reference와 플랫폼 독립 resolver
- button, surface, field 및 확장 컴포넌트의 typed recipe
- shared/adaptive/web/native 범위와 stable/beta/planned/deprecated 상태를 담은 component catalog
- 브랜드 그라디언트와 접근성 계약 테스트

각 소비 앱이 소유하는 것:

- React DOM 또는 React Native 컴포넌트와 이벤트 타입
- 테마 Provider, 저장 키, 사용자 설정 영속화
- 아이콘 라이브러리, 폰트 로딩, 애니메이션 구현
- 제품 전용 컴포넌트와 의미 매핑

예를 들어 야구 팀 색상, 경기 상태, 스코어보드, 라인업, 야구장과 같은 야구 도메인
UI는 Yajalal이 소유합니다. 다른 제품의 기능 상태 역시 각 제품이 범용 `AccentTone`에
매핑합니다. 이 패키지에는 `react`, `react-native`, DOM 또는 Expo import를 추가하지
않습니다.

## 소비 원칙

웹과 RN은 같은 토큰과 recipe를 읽고 각 플랫폼 renderer가 실제 UI primitive로
번역합니다. 공유하는 것은 컴포넌트의 **의미와 계약**이지 렌더링 코드가 아닙니다.

신규 recipe는 `slots`, `defaults`, `sizes`, `tones/variants`, `states`를 중심으로
구성합니다. 외부 라이브러리에서는 컴포넌트 범위·anatomy·상호작용·접근성 패턴을
참고하지만 제3자 외형, 전용 자산, 제품 의미는 복사하지 않습니다.

확장 순서와 shared/adaptive/Web/Native 분류는
[`docs/expansion-roadmap.md`](./docs/expansion-roadmap.md)에 기록합니다. 시각 recipe뿐 아니라
`behaviorRegistry`의 키보드·포커스·접근성 scenario와 collection selection 계약을 함께
만족해야 행동이 있는 컴포넌트가 구현된 것으로 봅니다.

```ts
import {
  THEMES,
  buttonRecipe,
  radius,
  typography,
  type ButtonTone,
} from "@hjm/design-system";

const tone: ButtonTone = "primary";
const contract = buttonRecipe.tones[tone];
const colors = THEMES.light;

const rendererInput = {
  backgroundColor: contract.background
    ? colors[contract.background]
    : "transparent",
  color: colors[contract.content],
  borderRadius: radius.md,
  ...typography.body,
};
```

웹 renderer는 이를 CSS/CSS variable로 변환하고, RN renderer는 `StyleSheet`와
`Pressable`로 변환합니다. 앱 화면에서 원시 색상·간격을 다시 선언하지 않습니다.
v0.2 신규 recipe의 `ColorReference`는 제품 별칭이 아닌 공용 status palette로 풉니다.

```ts
import {
  ACCENTS,
  THEMES,
  accentFill,
  badgeRecipe,
  resolveColorReference,
} from "@hjm/design-system";

const palette = {
  theme: THEMES.dark,
  statusAccents: ACCENTS.dark,
  statusAccentFills: accentFill,
};
const successText = resolveColorReference(
  badgeRecipe.tones.success.content,
  palette,
);
```

현재 소비 경계는 다음과 같습니다.

- Yajalal RN은 `src/lib/theme` 어댑터 뒤에서 이 패키지를 직접 사용합니다.
- BurnTok 웹/RN은 기존 `@burntok/design-system` import를 유지하며, 그 패키지가
  공통 계약을 재수출하고 `ai` 제품 accent와 `built`, `rare`, `popular` 제품 의미만
  매핑합니다. 공통 `ai` 아이콘 이름은 특정 제품 색이나 모델이 아니라 “AI 기능”을
  나타내는 일반 의미 역할입니다.
- 저장 키, CSS 변수 이름, KBO 구단/경기 상태 같은 제품 의미는 각 앱에 남습니다.

## 지금 상태 — 두 소비 저장소 모두 로컬 link

야잘알(app-rn)과 BurnTok(web·design-system 패키지) 모두 지금은
`link:../../../hjm-design-system`로 이 저장소를 직접 가리킨다(각자의
`package.json` 참고). 셋 다 이 컴퓨터에서 같이 개발 중이라 recipe를 고치고
`pnpm build`만 다시 돌리면 재설치 없이 두 소비처에 즉시 반영된다.

**이 저장소가 `1.0.0`이 되는 순간 두 소비 저장소 모두 아래 Git tag 설치로
전환한다.** `link:`는 이 기기 하나에서만 성립하고 CI·배포·다른 개발자의
체크아웃에서는 경로가 없어 깨진다 — 1.0.0은 계약이 안정화됐다는 신호이고,
그 시점부터는 재현 가능한 고정 버전이 로컬 편의보다 우선한다.

## Git tag로 설치 (1.0.0부터 이 방식으로 전환)

릴리즈 태그가 생성된 뒤 소비 저장소에서는 정확한 태그를 고정합니다.

현재 배포된 기준은 `v0.3.0`입니다.

```bash
pnpm add '@hjm/design-system@git+https://github.com/jim1286/hjm-design-system.git#v0.3.0'
```

태그에는 `dist/` 빌드 결과를 함께 포함해야 합니다. 브랜치나 커밋되지 않은 로컬 경로에
의존하지 않으며, 계약 변경은 SemVer로 배포합니다.

## 개발

```bash
pnpm install
pnpm check
```

`pnpm check`는 TypeScript typecheck, Vitest 계약/대비 테스트, 배포용 declaration
빌드를 순서대로 실행합니다. 공개 토큰이나 recipe를 변경할 때는 light/dark key 대칭,
WCAG 대비, 최소 44 단위 터치 영역 테스트도 함께 갱신해야 합니다.
