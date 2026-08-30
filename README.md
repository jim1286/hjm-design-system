# HJM Design System

HJM 제품이 같은 언어와 상호작용을 공유하도록 계약, Web renderer, React Native
renderer를 한 이력과 한 release train에서 관리하는 pnpm monorepo입니다.

| Package | Role |
| --- | --- |
| [`@hjmds/design-contracts`](packages/design-contracts) | renderer-neutral tokens, recipes, behavior, catalog, evidence |
| [`@hjmds/react`](packages/react) | accessible React 19 Web components |
| [`@hjmds/react-native`](packages/react-native) | Expo-independent React Native components |
| [`@hjm/showcase-web`](showcase/web) | Storybook documentation and Web evidence |

Stable Core는 `Surface`, `Button`, `Field`, `TextArea`를 Web과 Native에서 안정 API로
보장합니다. 공통 레이아웃에는 `Container`, `AspectRatio`, Web 접근성 유틸리티에는
`VisuallyHidden`을 제공합니다. 승격 근거와 호환성 정책은
[`docs/stable-core.md`](docs/stable-core.md)에 기록합니다.

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
명시적으로 설치하고, 세 패키지는 하나의 fixed version train이므로 같은 range를 씁니다.

```json
{
  "dependencies": {
    "@hjmds/design-contracts": "^<version>",
    "@hjmds/react": "^<version>"
  }
}
```

React Native 앱은 renderer만 Native package로 바꿉니다.

```json
{
  "dependencies": {
    "@hjmds/design-contracts": "^<version>",
    "@hjmds/react-native": "^<version>"
  }
}
```

`<version>`은 세 패키지가 함께 릴리스된 정확한 SemVer(예: `0.8.0`)로 바꿉니다.

publish는 `Release Packages` workflow를 수동으로 실행할 때만 시작되고, 성공한 같은 commit에
`v<version>` tag가 생성됩니다.
tarball을 vendoring하거나 Git ref와 package path로 고정하지 않습니다. 두 방식 모두 참조
문자열에 버전을 박아 `pnpm update`와 `npm outdated`를 무력화합니다.

## Development

```bash
pnpm install
pnpm check
pnpm showcase:web:build
```

- `main` 단일 branch로 운영합니다. `main` push는 Storybook을 GitHub Pages에 배포합니다.
- 세 public package는 하나의 fixed version train으로 함께 versioning합니다.
- 일반 commit: public package source를 바꿨다면 `pnpm changeset`으로 Changeset을 함께 commit해야
  합니다. 자동 배포는 Storybook만 갱신하고 package를 릴리스하지 않습니다.
- 릴리스 commit: 로컬에서 `pnpm release:version`을 실행하고 생성 결과를 하나의 commit으로
  `main`에 push합니다. package publish가 필요할 때 GitHub Actions에서 `Release Packages`를 직접
  실행합니다. workflow는 release commit shape를 확인하고 세 package를 npm에 publish한 뒤
  canonical `v<version>` Git tag를 생성합니다.
- source of truth는 `packages/design-contracts/src/catalog.ts`입니다.
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
