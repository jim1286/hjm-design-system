# `@hjm/design-system`

HJM 제품들이 함께 사용하는 플랫폼 중립 디자인 계약입니다. BurnTok에서 정리된 밝고
간결한 카드 중심 시각 언어를 공유하되, 특정 제품이나 도메인의 의미는 포함하지 않습니다.

## 경계

이 저장소가 소유하는 것:

- light/dark 시맨틱 색상과 범용 강조색
- spacing, radius, typography, glyph, motion, touch target, shadow
- button, surface, field의 typed recipe
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

현재 소비 경계는 다음과 같습니다.

- Yajalal RN은 `src/lib/theme` 어댑터 뒤에서 이 패키지를 직접 사용합니다.
- BurnTok 웹/RN은 기존 `@burntok/design-system` import를 유지하며, 그 패키지가
  공통 계약을 재수출하고 `ai`, `built`, `rare`, `popular` 제품 의미만 매핑합니다.
- 저장 키, CSS 변수 이름, KBO 구단/경기 상태 같은 제품 의미는 각 앱에 남습니다.

## Git tag로 설치

릴리즈 태그가 생성된 뒤 소비 저장소에서는 정확한 태그를 고정합니다.

```bash
pnpm add '@hjm/design-system@git+https://github.com/jim1286/hjm-design-system.git#v0.1.0'
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
