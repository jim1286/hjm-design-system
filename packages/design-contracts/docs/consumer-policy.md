# HJM 소비 앱 정책

상태: **Normative**
정책 버전: **1.2.0**
적용 대상: 신규 HJM Web·React Native 앱과 기존 앱의 새 화면

이 정책 원문은 다음 package patch release부터
`@hjmds/design-contracts/consumer-policy.md` export에 포함됩니다. 아직 그 export를 포함하지
않는 `0.9.0` 소비자는 HJM-APP-STANDARD의 versioned profile과 catalog snapshot을 정책
근거로 사용하고, 존재하지 않는 `v0.9.0` 정책 URL을 만들어 내면 안 됩니다.

이 문서는 "HJM답게 보인다"를 특정 화면 복제로 정의하지 않습니다. 모든 제품이 공유해야
하는 것은 정보 위계, semantic role, 상태 피드백, 접근성 품질과 플랫폼별 행동입니다.
제품의 이름, 도메인 언어, 핵심 콘텐츠와 대표 브랜드 표현은 각 제품이 소유합니다.

`MUST`, `MUST NOT`, `SHOULD`, `MAY`는 각각 필수, 금지, 강한 권고, 선택을 뜻합니다.

## 1. 의존성과 버전

- 앱은 `@hjmds/design-contracts`와 한 renderer(`@hjmds/react` 또는
  `@hjmds/react-native`)를 npm registry에서 설치해야 합니다(MUST).
- contracts와 renderer는 같은 정확한 SemVer여야 합니다(MUST). `^`, `~`, workspace·file,
  Git ref와 tarball dependency는 허용하지 않습니다(MUST NOT).
- 앱 runtime은 granular subpath를 우선하고 catalog·showcase·evidence entry는 CI나
  tooling에서만 사용해야 합니다(SHOULD).

## 2. 성숙도별 채택

| Catalog 상태 | 신규 앱 기본 정책 | 추가 조건 |
| --- | --- | --- |
| `stable` | 사용 가능 | 제품 흐름·copy 검증 |
| `beta` | 기본 비활성 | ADR, 앱 테스트, 실제 기기/브라우저 evidence |
| `planned` | 사용 금지 | HJM package에서 구현·승격한 뒤 채택 |
| `deprecated` | 신규 사용 금지 | 공지된 migration 기한 안에 제거 |

신규 앱 scaffold는 Stable Core만 기본 surface로 채택해야 합니다(MUST). Beta를 사용하려면
앱의 `docs/decisions/` 아래 ADR에 채택 이유, 대체안, 소유자, 검증 환경과 재검토 날짜를
기록해야 합니다(MUST).

### 2.1 Stable Core와 필수 foundation bridge

현재 Stable Core는 `Surface`, `Button`, `Field`, `TextArea` 네 surface입니다. `Text`,
`Icon`, `Stack`, `Container`, `DesignSystemProvider`처럼 첫 제품 화면에 필요한 foundation
일부는 catalog에서 여전히 `beta`입니다. 따라서 “첫 화면부터 HJM”을 요구하면서 이
foundation을 몰래 `stable`로 간주하거나 `betaAdoptions: []`로 기록하는 것은 허용하지
않습니다(MUST NOT).

HJM-APP-STANDARD가 versioned `requiredFoundations` 목록을 선언한 경우 다음 bridge를
적용합니다.

- 필수 foundation의 채택 이유와 최소 목록은 중앙 profile이 소유합니다. 앱마다 같은
  선택 이유를 새로 발명하지 않습니다(MUST).
- 각 앱은 실제 adapter와 사용 환경에 대한 evidence를 소유합니다(MUST). `draft` /
  `incubating` contract에서는 evidence가 `planned`일 수 있지만, `active` 또는 release gate는
  timestamp가 있는 `verified` evidence 없이는 통과하면 안 됩니다(MUST NOT).
- 중앙 필수 목록 밖의 `beta`는 계속 제품별 optional adoption입니다. 제품 ADR, 대안,
  제거·승격 조건과 verified app evidence가 모두 필요합니다(MUST).
- foundation이 catalog에서 `stable`로 승격되면 기존 표준의 의미를 조용히 바꾸지 않고
  다음 versioned app profile에서 bridge 목록을 줄입니다(MUST).

이 bridge는 성숙도 예외가 아니라 공개된 임시 채택 계약입니다. catalog와 generated
maturity manifest에는 해당 surface가 계속 `beta`로 보여야 합니다.

## 3. 코드 경계

- 앱 root는 HJM Provider를 한 번 구성하고 theme, direction, text scale, reduce-motion 입력을
  제품 설정과 연결해야 합니다(MUST).
- 화면은 원시 hex, 임의 spacing/radius/type scale을 새로 선언하지 않고 HJM semantic token
  또는 제품 어댑터를 사용해야 합니다(MUST).
- 도메인 상태는 화면마다 색을 정하지 않고 제품 어댑터에서 HJM `AccentTone`과 component
  variant에 매핑해야 합니다(MUST).
- HJM component의 `style` escape hatch는 배치용 margin, width, flex와 화면 composition에만
  사용해야 합니다(SHOULD). color, typography, radius, control height와 interaction state를
  덮어쓰는 용도로 사용하면 안 됩니다(MUST NOT).
- 플랫폼 primitive가 필요한 경우 접근성 또는 플랫폼 관습 때문에 필요한 adapter에
  한정하고, 그 이유를 해당 adapter test로 고정해야 합니다(MUST).

### 3.1 React Native legacy style compatibility boundary

`@hjmds/react-native` 0.9.x의 공개 타입에는 `style`, `labelStyle`, `inputStyle`,
`containerStyle`과 여러 slot `*Style`처럼 전체 React Native style을 받는 호환 API가 남아
있습니다. 이 타입 범위와 caller-last 렌더 순서는 기존 소비자를 위한 집행 공백이지, 앞 절의
금지 속성을 제품이 덮어써도 된다는 허가가 아닙니다.

- 신규 앱과 기존 앱의 새 화면은 legacy raw style prop을 새로 사용하면 안 됩니다(MUST NOT).
  컴포넌트가 `layoutStyle`을 제공하면 배치에는 그것만 사용하고, 제공하지 않으면 바깥
  composition wrapper를 사용하거나 HJM에 semantic axis를 먼저 추가해야 합니다(MUST).
- `HjmCompositionStyle` / `layoutStyle`은 margin, width, flex 계열과 `alignSelf`만 노출하며
  color, typography, padding, gap, border, radius, height, opacity, transform과 interaction
  state key를 타입에서 제외합니다. 허용된 margin 값도 HJM spacing token 또는 검토된 제품
  adapter에서 와야 합니다(MUST).
- 기존 화면의 legacy prop은 migration 기간에만 유지할 수 있습니다(MAY). controlled visual
  key가 남아 있으면 정책 항목, 소유자, 대체 semantic API와 제거 train을 ADR에 기록해야
  하며, 신규 사용으로 복사해서는 안 됩니다(MUST NOT).
- 0.9 호환 train에서는 등록 style ID와 배열을 런타임에서 필터링하거나 조용히 삭제하지
  않습니다. 그러한 즉시 변경은 기존 앱의 레이아웃을 예측 불가능하게 깨뜨리기 때문입니다.

legacy raw style surface는 다음 조건이 모두 충족된 뒤 공지된 breaking train에서 제거합니다.

1. Stable Core가 canonical `layoutStyle` 또는 동등한 좁은 composition API를 제공한다.
2. HJM showcase와 관리 중인 앱이 새 API로 이동하고 light/dark, large text, RTL과 touch-target
   evidence를 다시 검증한다.
3. 최소 한 fixed release train 동안 deprecation과 migration 문서를 제공한다.
4. 제거 Changeset이 영향을 받는 prop과 semantic 대안을 열거한다.

이 제거는 늦어도 첫 `1.0.0` train의 release gate 전에 완료해야 합니다(MUST). 그 전까지
legacy prop의 런타임 호환성은 유지하지만 신규 앱 적합성 검사에서는 실패로 취급합니다.

권장 구조는 다음과 같습니다. 실제 폴더명은 stack 관습에 맞춰도 역할은 유지합니다.

```text
src/ui/hjm-provider.*       공통 환경 연결
src/ui/product-theme.*      제품 브랜드·도메인 semantic mapping
src/ui/components/*         제품 전용 composition과 플랫폼 adapter
src/features/*              UI 계약을 소비하는 기능
```

## 4. 제품 정체성 경계

HJM이 소유하는 것:

- semantic color role과 light/dark 대비
- spacing, type scale, radius, motion, touch target
- component anatomy, 상태, 키보드·screen-reader 행동
- loading, empty, error, disabled, focus의 일관된 문법

제품이 소유하는 것:

- 이름, 로고, 대표 이미지와 illustration
- 제품 대표 accent·gradient와 도메인 상태 매핑
- 핵심 콘텐츠 밀도, 정보 우선순위와 feature composition
- 사용자에게 보이는 copy, i18n, navigation 정보 구조

`brandGradient`는 HJM 조직 surface와 fallback용입니다. 신규 제품이 이를 hero나 CTA의
기본값으로 그대로 채택할 의무는 없습니다. 제품 고유 gradient를 쓰는 경우 light/dark와
on-color 대비, 색에 의존하지 않는 상태 표지, reduce-motion을 제품 테스트로 검증해야
합니다(MUST).

## 5. 필수 검증과 evidence

앱 CI는 최소한 다음을 실패 조건으로 두어야 합니다(MUST).

1. contracts/renderer exact version 일치와 금지 dependency 형식 검사
2. versioned `requiredFoundations` 전체의 선언과 lifecycle에 맞는 app evidence 검사
3. HJM Provider 존재와 제품 theme adapter 존재 검사
4. 원시 색·간격·radius의 화면 레이어 유입 방지 검사
5. typecheck, unit/component test, production build
6. light/dark, 100–200% 글자 크기, LTR/RTL, reduce motion 중 앱이 지원한다고 선언한 환경
7. optional Beta component를 쓴다면 ADR과 해당 component·환경의 versioned consumer evidence

앱이 지원하지 않는 플랫폼이나 환경은 가짜 통과 script로 만들지 않고 app contract에서
`not-applicable`과 이유를 선언해야 합니다(MUST).

## 6. 예외와 변경 절차

필수 규칙의 예외는 암묵적으로 두지 않습니다. ADR에는 다음을 모두 기록해야 합니다.

- 위반하는 정책 항목과 사용자 가치
- 검토한 대안과 선택 이유
- 위험, 보완 테스트와 담당자
- 만료 또는 재검토 날짜

공통 API를 바꾸는 것이 한 제품의 local override보다 적절하면 제품 코드를 복제하지 않고
HJM에 Changeset과 Web/RN evidence를 먼저 제출합니다. 반대로 제품 의미가 들어가면 공통
package로 승격하지 않습니다.

## 7. 신규 앱 완료 조건

다음 질문에 모두 "예"라고 답할 수 있어야 HJM 채택이 완료된 것입니다.

- exact fixed-train dependency와 Provider가 CI에서 검증되는가?
- Stable은 기본 사용하고 필수 beta foundation은 중앙 목록+앱 evidence로, optional Beta는
  제품 ADR+evidence로 구분되어 있는가?
- screen 코드가 semantic token·component를 우회하지 않는가?
- 같은 상태가 Web/RN에서 같은 의미와 자연스러운 플랫폼 행동을 갖는가?
- 로고를 제거해도 제품의 핵심 콘텐츠와 정보 구조가 다른 제품과 구분되는가?
- 제품 고유 표현을 제거해도 정보 위계·피드백·접근성에서는 HJM의 결이 남는가?
