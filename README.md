# HJM Design System

HJM 제품이 같은 언어와 상호작용을 공유하도록 계약, Web renderer, React Native
renderer를 한 이력과 한 release train에서 관리하는 pnpm monorepo입니다.

| Package | Role |
| --- | --- |
| [`@hjmds/design-contracts`](packages/design-contracts) | renderer-neutral tokens, recipes, behavior, catalog, evidence |
| [`@hjmds/react`](packages/react) | accessible React 19 Web components |
| [`@hjmds/react-native`](packages/react-native) | Expo-independent React Native components |
| [`@hjm/showcase-web`](showcase/web) | Storybook documentation and Web evidence |

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

publish는 consumer evidence gate를 통과한 뒤에만 실행되고, 성공한 같은 commit에
`v<version>` tag가 생성됩니다.
tarball을 vendoring하거나 Git ref와 package path로 고정하지 않습니다. 두 방식 모두 참조
문자열에 버전을 박아 `pnpm update`와 `npm outdated`를 무력화합니다.

## Development

```bash
pnpm install
pnpm check
pnpm showcase:web:build
```

- `main` 단일 branch로 운영합니다. 모든 commit은 `main`에 직접 push하고, CI는 `main` push에서만
  돕니다.
- 세 public package는 하나의 fixed version train으로 함께 versioning합니다.
- 일반 commit: public package source를 바꿨다면 `pnpm changeset`으로 Changeset을 함께 commit해야
  `Design System Showcase` workflow의 gate를 통과합니다. 이 push는 Storybook을 GitHub Pages에
  배포만 하고 릴리스는 하지 않습니다.
- 릴리스 commit: 로컬에서 `pnpm release:version`을 실행하고 생성 결과를 하나의 commit으로
  `main`에 push합니다. `Release Packages` workflow는 `main` push마다 돌지만 package version이
  바뀐 push(= 아직 `v<version>` tag가 없고 남은 Changeset도 없는 push)에서만 릴리스를 진행하고,
  같은 push가 Storybook도 함께 갱신합니다. 전체 검증 후 canonical `v<version>` Git tag가
  생성되므로 위 Git package path가 실제 release를 가리킵니다. tag 전에는
  Yajalal/BurnTok의 release-SHA Storybook inventory gate도 fail closed로 통과해야 합니다.
  두 consumer가 private이므로 canonical에만 최소 권한 `HJM_CONSUMER_SYNC_TOKEN`을 두고 릴리스
  시작 시 각 default branch HEAD를 full SHA로 캡처해 `repository_dispatch`합니다. consumer의
  canonical read token은 필요 없으며,
  권한과 evidence 경계는
  [`consumer-release-gate.md`](packages/design-contracts/docs/consumer-release-gate.md)를 따릅니다.
- source of truth는 `packages/design-contracts/src/catalog.ts`입니다.
- catalog projection은 `pnpm contracts:sync`로 갱신합니다.
- renderer claim과 scenario debt projection은 전체 package build 뒤
  `pnpm evidence:sync`로 갱신합니다.
- 앱 runtime에서는 root barrel보다 package별 granular subpath를 사용합니다.

자세한 역할과 migration은
[`packages/design-contracts/docs/migration-0.6.md`](packages/design-contracts/docs/migration-0.6.md)를
참고하세요.
