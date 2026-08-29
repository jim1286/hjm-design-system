# `@hjmds/design-contracts`

HJM 제품들이 함께 사용하는 플랫폼 중립 디자인 계약입니다. 밝고 간결한 정보 위계와
결정적인 순간의 선명한 피드백을 공유하되, 특정 제품이나 도메인의 의미는 포함하지 않습니다.

이 패키지는 **UI 컴포넌트 라이브러리가 아닙니다.** React element, React Native view,
DOM event, focus trap 또는 navigation adapter를 렌더링하지 않고, 두 플랫폼 renderer가
구현해야 할 토큰·recipe·상태·접근성 계약만 배포합니다. `@hjmds/react`와
`@hjmds/react-native`는 같은 monorepo의 별도 패키지이며 contracts의 framework-neutral
경계를 침범하지 않고 DOM/RN primitive로 번역합니다.

> **조용한 화면 위에 중요한 순간만 선명하게.**

상세 원칙은 [`docs/identity.md`](./docs/identity.md), 계층·지원 단계·확장 계획은
[`docs/architecture.md`](./docs/architecture.md)에 정리되어 있습니다.
외부 라이브러리에서 어떤 문제 분해 원칙만 가져오고 무엇을 복제하지 않는지는
[`docs/library-reference-decisions.md`](./docs/library-reference-decisions.md)에 기록합니다.
Toast의 queue·announcement·timer 수명주기는 [`docs/toast.md`](./docs/toast.md)에 별도로
고정되어 있습니다.

`badgeRecipe`은 Web/Native 공통 `filled | outline` variant를 정의하며 기본값은 기존과 같은
`filled`입니다. renderer가 별도 색을 추측하지 않도록 outline 배경 정책, border fallback,
강한 tone의 outline content 역할까지 계약에 포함합니다.
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
Ant Design 6.6.1 core 73개를 HJM의 canonical component scope로 번역한 crosswalk는
[`docs/ant-design-coverage.md`](./docs/ant-design-coverage.md)에 정리되어 있습니다.
v0.5의 Provider·typography·Showcase evidence 변경과 소비 절차는
[`docs/migration-0.5.md`](./docs/migration-0.5.md)에 정리되어 있습니다.
기존 `@hjm/design-system`에서 현재 패키지 이름과 granular export로 바꾸는 절차는
[`docs/migration-0.6.md`](./docs/migration-0.6.md)에 정리되어 있습니다.

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

`compareShowcaseStoryIds`와 `assertShowcaseStoryIds`의 전체 inventory 검사는 모든 Stable/Beta
컴포넌트를 제공한다고 선언한 first-party/full-coverage Storybook용 gate입니다. 일부 화면이나
부분 채택 소비 앱은 이 gate를 사용하지 않고, 실제 실행한 story와 scenario만 versioned evidence
artifact로 제출합니다.

## 경계

이 contracts 패키지가 소유하는 것:

- light/dark 시맨틱 색상과 범용 강조색
- spacing, radius, typography, glyph, motion, touch target, shadow, layout, layer
- semantic color reference와 플랫폼 독립 resolver
- button, surface, field 및 확장 컴포넌트의 typed recipe
- shared/adaptive/web/native 범위와 stable/beta/planned/deprecated 상태를 담은 component catalog
- 브랜드 그라디언트와 접근성 계약 테스트

renderer 및 소비 앱 계층이 소유하는 것:

- React DOM 또는 React Native 컴포넌트와 이벤트 타입 (`@hjmds/react`, `@hjmds/react-native`)
- 제품별 저장 키와 사용자 설정 영속화
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

### RN/Metro 친화 진입점

새 package의 root export는 기존 symbol API 호환을 위해 유지하지만 catalog·showcase·전체
recipe graph까지 노출하므로 앱 runtime에서는 필요한 subpath를 우선합니다.

| 진입점 | 용도 |
| --- | --- |
| `@hjmds/design-contracts/tokens` | 색·foundation·semantic reference 전체 |
| `@hjmds/design-contracts/foundations` | spacing·type·motion·layout foundation만 |
| `@hjmds/design-contracts/colors` | light/dark palette와 accent resolver만 |
| `@hjmds/design-contracts/color-references` | semantic color reference 생성·해석기만 |
| `@hjmds/design-contracts/responsive` | 공통 window class와 responsive value resolver |
| `@hjmds/design-contracts/grid` | Web/RN 공통 Grid descriptor와 geometry resolver |
| `@hjmds/design-contracts/recipes` | 공통 core component recipe |
| `@hjmds/design-contracts/recipes/base` | Button·Surface·Field 최소 recipe graph |
| `@hjmds/design-contracts/contracts` | renderer가 구현할 공통 anatomy/style 계약 |
| `@hjmds/design-contracts/components/<name>` | `toast`, `form` 등 한 컴포넌트의 상태·validator |
| `@hjmds/design-contracts/recipes/all` | planned를 포함한 전체 recipe; tooling용 |
| `@hjmds/design-contracts/behaviors` | 전체 behavior registry; tooling용 |
| `@hjmds/design-contracts/catalog` | maturity/catalog metadata; tooling용 |
| `@hjmds/design-contracts/evidence` | versioned product evidence schema·validator; CI용 |
| `@hjmds/design-contracts/version` | package graph 없이 현재 contract 버전만 읽는 runtime entry |
| `@hjmds/design-contracts/showcase` | Storybook manifest와 evidence rule; CI용 |
| `@hjmds/design-contracts/manifest.json` | JS runtime 없이 읽는 생성 manifest; CI용 |
| `@hjmds/design-contracts/renderer-evidence.json` | first-party renderer claim과 scenario debt snapshot; CI용 |

```ts
import { spacing, typography } from "@hjmds/design-contracts/foundations";
import { designSystemVersion } from "@hjmds/design-contracts/version";
import { resolveContentStateAnnouncement } from "@hjmds/design-contracts/components/content-state";
import { createToastStore } from "@hjmds/design-contracts/components/toast";
```

`pnpm bundle:check`는 각 진입점이 연결하는 ESM module 수와 raw/gzip 크기를 검사합니다.
특히 token·단일 component 진입점에서 catalog/showcase/root module이 다시 유입되면 실패합니다.

```ts
import { THEMES } from "@hjmds/design-contracts/colors";
import { radius, typography } from "@hjmds/design-contracts/foundations";
import { buttonRecipe, type ButtonTone } from "@hjmds/design-contracts/recipes";

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
  resolveColorReference,
} from "@hjmds/design-contracts/tokens";
import { badgeRecipe } from "@hjmds/design-contracts/recipes";

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

## Git tag로 설치

릴리즈 태그가 생성된 뒤 소비 저장소에서는 정확한 태그를 고정합니다.
`v0.5.2`까지의 태그는 이전 package name을 담고 있습니다. 첫 rename release는 `v0.6.0`이며
소비 저장소는 이전 이름과 새 이름을 동시에 두지 않고 한 변경에서 전환합니다.

```bash
pnpm add '@hjmds/design-contracts@git+https://github.com/jim1286/hjm-design-system.git#v<version>&path:/packages/design-contracts'
```

`<version>`은 설치할 fixed release의 정확한 SemVer로 바꿉니다.

태그에는 `dist/` 빌드 결과를 함께 포함해야 합니다. 브랜치나 커밋되지 않은 로컬 경로에
의존하지 않으며, 계약 변경은 SemVer로 배포합니다.

## 개발

```bash
pnpm install
pnpm check
```

`pnpm check`는 TypeScript typecheck, Vitest 계약/대비 테스트, 배포용 declaration 빌드,
subpath import graph 예산 검사를 순서대로 실행합니다. 공개 토큰이나 recipe를 변경할 때는
light/dark key 대칭, WCAG 대비, 최소 44 단위 터치 영역 테스트도 함께 갱신해야 합니다.
