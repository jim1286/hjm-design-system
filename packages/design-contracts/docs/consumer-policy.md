# HJM 소비 앱 정책

상태: **Normative**
정책 버전: **2.0.0**
검토일: 2026-10-13 · 현재 소비 계약과 변경 범위 검증
적용 대상: 신규 HJM Web·React Native 앱과 기존 앱의 새 화면

이 원문은 `@hjmds/design-contracts/consumer-policy.md`에서 제공한다. 소비 앱은 설치한
패키지 버전의 정책과 HJM-APP-STANDARD release snapshot을 함께 확인한다. 이 checkout의
미게시 변경을 설치된 패키지의 기능으로 판단하지 않는다.

2026-10-13 지침 점검에서 종료된 foundation bridge와 스타일 제거 예정 조건이 현재 규칙에
남아 있었다. 해당 레거시 절차는 제거하고 과거 버전의 이관표와 검증 기록은 보존한다.

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

저장소의 `module.contract.json` 소비 목록은 호환성 검토 대상을 기록하며 설치·배포 완료를
뜻하지 않는다. 2026-10-13 실제 package 의존성을 대조해 누락된 Utilverse와 App Release Hub를
추가했다. Hub는 정책 사이트 생성에 colors/foundations만 사용하므로 renderer 이관과 구분한다.

## 2. 성숙도별 채택

| 사용할 surface 상태 | 신규 앱 기본 정책 | 추가 조건 |
| --- | --- | --- |
| `stable` | 사용 가능 | 제품 흐름·copy 검증 |
| `beta` | 필요에 따라 선택 가능 | 사용 표면·미완료 항목 확인, 채택 기록과 관련 회귀 검사 |
| `planned` | 사용 금지 | HJM package에서 구현·승격한 뒤 채택 |
| `deprecated` | 신규 사용 금지 | 공지된 migration 기한 안에 제거 |

`surfaceStatus`가 사용 플랫폼의 채택 기준입니다. contract `status`가 stable이어도
다른 renderer까지 안정화됐다는 뜻은 아닙니다. 현재 값은 설치 버전의
[성숙도 표](generated/component-maturity.md)를 확인합니다. Storybook의 배포/실험은 API 안정성이나 npm 게시 상태가 아닙니다.

신규 앱 scaffold의 기본 선택은 Stable Core입니다(SHOULD). Beta 사용은 정책 예외가 아닙니다.
앱의 기존 contract 또는 TASKS 한 곳에 컴포넌트·표면, 사용하는 이유, 담당자와 관련 회귀
검사를 기록해야 합니다(MUST). 여러 Beta를 한 기록으로 묶을 수 있고, 별도 ADR·대안 비교·
재검토 날짜는 요구하지 않습니다. 실제 기기·브라우저 QA는 바뀐 사용자 흐름과 플랫폼 위험에
맞춰 앱 릴리스에서 수행합니다. Beta라는 이유만으로 제품 전체 QA를 반복하지 않습니다.

컴포넌트 승격은 [승격 기준](stable-promotion.md)을 따르고 과거 판정은
[Stable Core 기록](stable-core.md)에 보존한다. 현재 규칙에 이전 버전의 개수나 임시 foundation
bridge를 복제하지 않는다. 구버전 소비자는 설치된 정책·profile과 해당 이관표를 확인한다.

화면은 [선택 기준](usage/SELECTION.md)에 따라 그대로 사용, 공개 슬롯 확장, 제품 전용 구성 중 고른다.
이름이 같다는 이유로 저장·스크롤·권한 흐름이 다른 화면에 공통 API를 강제하지 않는다.

## 3. 코드 경계

- 앱 root는 HJM Provider를 한 번 구성하고 theme, direction, text scale, reduce-motion 입력을
  제품 설정과 연결해야 합니다(MUST).
- 화면은 원시 hex, 임의 spacing/radius/type scale을 새로 선언하지 않고 HJM semantic token
  또는 제품 어댑터를 사용해야 합니다(MUST).
- 도메인 상태는 화면마다 색을 정하지 않고 제품 어댑터에서 HJM `AccentTone`과 component
  variant에 매핑해야 합니다(MUST).
- HJM component의 `layoutStyle`은 배치용 margin, width, flex와 화면 composition에만
  사용해야 합니다(SHOULD). color, typography, radius, control height와 interaction state를
  덮어쓰는 용도로 사용하면 안 됩니다(MUST NOT).
- 플랫폼 primitive가 필요한 경우 접근성 또는 플랫폼 관습 때문에 필요한 adapter에
  한정하고, 그 이유를 해당 adapter test로 고정해야 합니다(MUST).

### 3.1 배치와 시각 값

- 배치에는 `layoutStyle`을 쓰고, 제공하지 않는 컴포넌트는 외부 composition wrapper를 쓴다.
  지원 속성은 각 renderer의 `HjmCompositionStyle` 타입과 컴포넌트 Props를 따른다.
- 색·글꼴·모서리·높이·상태 표현은 semantic API, `brandPalette`, `designProfile`로 지정한다.
  앱에서 내부 selector나 제거된 `style`·`labelStyle` 별칭으로 덮지 않는다.
- 플랫폼 host·제품 소유 슬롯·이미지 renderer의 정식 style은 제거된 별칭과 구분한다.
- CSS 레이어와 기존 재정의의 이관은 [브랜드 경계](brand-boundary.md#3-css-재정의는-지원하는-테마-경로가-아니다)가 소유한다.
- 제거된 API와 대체 prop은 [Native 호환 API 이관표](migration-native-legacy-removal.md)에 보존한다.
  종료된 제거 예정 조건이나 0.x 버전 규칙을 현재 소비 경로로 안내하지 않는다.

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

다음 제품 계약을 유지하고, 변경한 코드와 직접 소비하는 표면의 타입·빌드·관련 동작을 검사한다.
같은 SHA·같은 범위의 성공은 재사용하며 전체 회귀는 명시적으로 선택한다.
문서 형식·Storybook 분류·검사 명령 문자열은 제품 배포의 차단 조건이 아니다.

1. contracts/renderer exact version 일치와 금지 dependency 형식 검사
2. 설치된 catalog·앱 profile과 실제 사용 표면의 일치
3. HJM Provider 존재와 제품 theme adapter 존재 검사
4. 원시 색·간격·radius의 화면 레이어 유입 방지 검사
5. typecheck, unit/component test, production build
6. 영향 화면의 light/dark, 지원 방향과 reduced motion 등 변경에 관련된 환경
7. optional Beta component를 쓴다면 §2의 채택 기록과 변경한 사용자 흐름의 회귀 검사

앱이 지원하지 않는 플랫폼이나 환경은 가짜 통과 script로 만들지 않고 app contract에서
`not-applicable`과 이유를 선언해야 합니다(MUST).

OS 최대 글자 및 그 최대값 모사는 설계·검증·후속 조건에서 제외한다.

## 6. 예외와 변경 절차

계약 변경이나 예외의 이유·영향·검사 결과·미확인 범위는 기존 계약 문서, TASKS 또는 커밋에 남긴다.
작은 수정에 별도 ADR, 고정 항목 수, 중복 승인을 요구하지 않는다. 임시 우회에는 제거 조건을 적는다.
공개 API·데이터·호환성을 바꾸면 해당 계약과 migration을 갱신한다.

공통 API를 바꾸는 것이 한 제품의 local override보다 적절하면 제품 코드를 복제하지 않고
HJM에 Changeset과 Web/RN evidence를 먼저 제출합니다. 반대로 제품 의미가 들어가면 공통
package로 승격하지 않습니다.

## 7. 신규 앱 완료 조건

다음 질문에 모두 "예"라고 답할 수 있어야 HJM 채택이 완료된 것입니다.

- exact fixed-train dependency와 Provider가 CI에서 검증되는가?
- 설치 버전의 surfaceStatus를 따르고 optional Beta는 채택 기록과 관련 회귀 검사로 추적되는가?
- screen 코드가 semantic token·component를 우회하지 않는가?
- 같은 상태가 Web/RN에서 같은 의미와 자연스러운 플랫폼 행동을 갖는가?
- 로고를 제거해도 제품의 핵심 콘텐츠와 정보 구조가 다른 제품과 구분되는가?
- 제품 고유 표현을 제거해도 정보 위계·피드백·접근성에서는 HJM의 결이 남는가?

## Optional presentation adapters

The [optional adapter contract](optional-adapters.md) lists platform-specific entries and exact peer requirements. These extensions do not promote the canonical component or establish consumer/device compatibility. Native adapters require separately verified development clients; base imports retain their existing dependency contract.


## 상호작용 채택과 성능 기록

2026-10-02 사용자가 참고 인터랙션 수준의 제품 품질을 요청한 데 따른 구체 적용 기준이다.
기존 상태 피드백·접근성 책임을 제품의 입력 → 반응 → 확정 → 복구 흐름까지 연결한다.

- 제품은 설치된 HJM 버전의 API와 Storybook 배포/실험 상태를 확인하고 해당 범위에서 재사용한다.
  새 동작이 필요한 경우 기존 Button·Sheet·Toast를 합성하며 같은 상태를 두 계층에서 관리하지 않는다.
- 성공은 서버 또는 제품의 실제 확정 뒤에 표시한다. 연속 입력·실패·역순 응답·중간 이탈에서도
  초안과 복구 경로를 보존한다. 웹·앱 입력 방식이 달라도 같은 사용자 의도를 유지한다.
- 성능에 영향을 주는 제스처·전환·대량 렌더링 변경은 제품 조건의 변경 전후를 측정한다.
  기기·OS·빌드·데이터·측정 방법과 미검증 범위를 기록하고 데모의 성공을 실기기 성능으로 쓰지 않는다.
- 구체 예제·목표·기록 양식은 [상호작용 적용·품질 기준](../../../docs/INTERACTION_QUALITY.md)을 따른다.
  이 소스 문서의 변경이 아직 게시되지 않은 API를 소비 앱에 설치하거나 자동 적용하지는 않는다.
