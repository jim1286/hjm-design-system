# HJM Design System

HJM 제품이 같은 언어와 상호작용을 공유하도록 계약, Web renderer, React Native
renderer를 한 이력과 한 release train에서 관리하는 pnpm monorepo입니다.

| Package | Role |
| --- | --- |
| [`@hjmds/design-contracts`](packages/design-contracts) | renderer-neutral tokens, recipes, behavior, catalog, evidence |
| [`@hjmds/react`](packages/react) | accessible React 19 Web components |
| [`@hjmds/react-native`](packages/react-native) | Expo-independent React Native components |
| [`@hjm/showcase-web`](showcase/web) | Storybook documentation and Web evidence |

현재 checkout의 stable은 계약/Web 69개, Native 62개입니다.
1.5.0의 17개에 `Divider`, `Section`, `ListRow`, `Statistic`, `DescriptionList`, `EmptyState`,
`Result`, `Heading`, `Top`, `BottomCTA`, `AspectRatio`, `Grid`, `Steps`, `TopBar`, `AuthScreenLayout`, `Radio`, `Avatar`, `Asset`, `CounterBadge`, `Image`, `VisuallyHidden`을 승격했고, Web-only TextFormat도 stable입니다. 잘못 적용되던 long-copy gate는 실제 visible text 슬롯이 없는 다섯 컴포넌트에서 제외하고 접근성·fallback 증거를 유지합니다. 다음 minor 배포에 포함됩니다. 소비 앱은 설치한 버전의 catalog를 따릅니다.
추가로 긴 row title·timeline label·안내 문구를 검증해 List, Timeline, BottomInfo를, Link·AuthProviderButton·PasswordField·CheckboxGroup·RadioGroup·Chip·SegmentedControl·SearchField·NumberField·Toast·FloatingActionButton·Checkbox·Switch·ToggleGroup·Slider·OtpField·TagsInput·Select·Combobox은 각 renderer의 키보드 또는 host action을 확인해 stable로 승격했습니다. Layout은 양 renderer의 긴 콘텐츠·환경·접근성 검사와 Web skip-link Tab/Enter 동작을, Web-only Splitter는 긴 콘텐츠 matrix와 실제 포커스된 separator의 키보드 조절을 확인했습니다. Native에는 Layout skip-link action 계약이 없어 keyboard proof는 요구하지 않습니다.
승격은 공개 API와 renderer 검증을 기준으로 하며 제품 수·배포 이력은 필수 조건이 아닙니다.
[승격 기준](packages/design-contracts/docs/stable-promotion.md)과
[승격 기록](packages/design-contracts/docs/stable-core.md)을 참고하세요.

Beta는 필요한 경우 선택해서 쓸 수 있으며, 기존 contract/TASKS의 채택 기록과 관련 회귀
검사로 추적합니다. 별도 ADR을 항목마다 요구하지 않습니다. 신규 제품의 공통 계약과 제품 소유
범위는 [소비 정책](packages/design-contracts/docs/consumer-policy.md), 브랜드 범위는
[브랜드 경계](packages/design-contracts/docs/brand-boundary.md)를 따릅니다.
카탈로그 확장은 [동결 목록](packages/design-contracts/docs/catalog-freeze.json)으로 관리합니다.

## Why one repository

Contracts와 두 renderer는 같은 API 변화에 함께 반응해야 합니다. 한 PR에서 계약, Web,
Native, Storybook, evidence를 원자적으로 변경하고 CI에서 함께 검증합니다. Renderer는
검증된 family-level granular export를 유지하므로 저장소를 합쳐도 앱 bundle graph가
합쳐지지는 않습니다. 이 경계는 root barrel 비경유와 family별 source-graph budget을
보증하며, named component별 별도 chunk나 tree-shaking 결과까지 보증하지는 않습니다.
루트 `@hjm/design-system-workspace`는 배포하지 않는 `0.0.0` orchestrator입니다. release와
Git tag의 버전 source of truth는 fixed train의 `packages/design-contracts/package.json`입니다.

## Install

세 패키지는 npm registry에 함께 publish합니다. renderer를 사용하는 앱은 contracts도
명시적으로 설치하고, 세 패키지는 하나의 fixed version train이므로 **정확히 같은
SemVer**를 씁니다. Git ref, package path, vendored tarball은 지원하는 소비 경로가 아닙니다.

```json
{
  "dependencies": {
    "@hjmds/design-contracts": "<version>",
    "@hjmds/react": "<version>"
  }
}
```

React Native 앱은 renderer만 Native package로 바꿉니다.

```json
{
  "dependencies": {
    "@hjmds/design-contracts": "<version>",
    "@hjmds/react-native": "<version>"
  }
}
```

`<version>`은 세 패키지가 함께 릴리스된 정확한 SemVer(예: `0.9.0`)로 바꿉니다.

publish는 `Release Packages` workflow를 수동으로 실행할 때만 시작되고, 성공한 같은 commit에
`v<version>` tag가 생성됩니다.
tarball을 vendoring하거나 Git ref와 package path로 고정하지 않습니다. 두 방식 모두 참조
문자열에 버전을 박아 `pnpm update`와 `npm outdated`를 무력화합니다.

## Development

```bash
pnpm install
pnpm ci:check
```

[릴리스 검증 계약](docs/RELEASE_GOVERNANCE.md)은 내부 검사와 별도 제품 검증의 범위를 정합니다.
`governance:check`가 canonical 명령·workflow·scenario registry 연결을 검사하며 외부 소비 제품
dispatch gate는 현재 미구현입니다.

`ci:check`는 package 계약·테스트·bundle/evidence, Native showcase 계약과 배포 가능한 Web
Storybook을 한 번에 검증하는 CI의 canonical command입니다.

- `main` 단일 branch로 운영합니다. `main` push는 Storybook을 GitHub Pages에 배포합니다.
- 세 public package는 하나의 fixed version train으로 함께 versioning합니다.
- 일반 commit: public package source를 바꿨다면 `pnpm changeset`으로 Changeset을 함께 commit해야
  합니다. 자동 배포는 Storybook만 갱신하고 package를 릴리스하지 않습니다.
- 릴리스 commit: 로컬에서 `pnpm release:version`을 실행하고 생성 결과를 하나의 commit으로
  `main`에 push합니다. package publish가 필요할 때 GitHub Actions에서 `Release Packages`를 직접
  실행합니다. workflow는 release commit shape를 확인하고 세 package를 npm에 publish한 뒤
  canonical `v<version>` Git tag를 생성합니다.
- 컴포넌트 범위·성숙도의 source of truth는
  `packages/design-contracts/src/catalog.ts`입니다. 토큰·recipe·behavior는 각각의
  `src/*.ts` 모듈이 source of truth이고, `docs/generated/*.json`은 CI와 도구를 위한
  생성 projection입니다.
- catalog projection은 `pnpm contracts:sync`로 갱신합니다.
- renderer claim과 scenario debt projection은 전체 package build 뒤
  `pnpm evidence:sync`로 갱신합니다.
- 앱 runtime에서는 root barrel보다 package별 granular subpath를 사용합니다.

자세한 역할과 migration은
[`packages/design-contracts/docs/migration-0.6.md`](packages/design-contracts/docs/migration-0.6.md)를
참고하세요.

기여, 보안 제보, 라이선스와 외부 디자인 시스템 비교 근거는 각각
[`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), [`LICENSE`](LICENSE),
[`library-gap-analysis.md`](packages/design-contracts/docs/library-gap-analysis.md)에서 확인할 수 있습니다.
