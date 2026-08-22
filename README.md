# HJM Design System

HJM 제품이 같은 언어와 상호작용을 공유하도록 계약, Web renderer, React Native
renderer를 한 이력과 한 release train에서 관리하는 pnpm monorepo입니다.

| Package | Role |
| --- | --- |
| [`@hjm/design-contracts`](packages/design-contracts) | renderer-neutral tokens, recipes, behavior, catalog, evidence |
| [`@hjm/react`](packages/react) | accessible React 19 Web components |
| [`@hjm/react-native`](packages/react-native) | Expo-independent React Native components |
| [`@hjm/showcase-web`](showcase/web) | Storybook documentation and Web evidence |

## Why one repository

Contracts와 두 renderer는 같은 API 변화에 함께 반응해야 합니다. 한 PR에서 계약, Web,
Native, Storybook, evidence를 원자적으로 변경하고 CI에서 함께 검증합니다. 패키지는 각각
granular export를 유지하므로 저장소를 합쳐도 앱 bundle graph가 합쳐지지는 않습니다.
루트 `@hjm/design-system-workspace`는 배포하지 않는 `0.0.0` orchestrator입니다. release와
Git tag의 버전 source of truth는 fixed train의 `packages/design-contracts/package.json`입니다.

## Install from this repository

태그와 package path를 함께 고정합니다. renderer를 사용하는 앱은 contracts도 명시적으로
설치합니다.

```json
{
  "dependencies": {
    "@hjm/design-contracts": "git+https://github.com/jim1286/hjm-design-system.git#v<version>&path:/packages/design-contracts",
    "@hjm/react": "git+https://github.com/jim1286/hjm-design-system.git#v<version>&path:/packages/react"
  }
}
```

React Native 앱은 renderer의 package 이름과 path를 모두 Native package로 지정합니다.

```json
{
  "dependencies": {
    "@hjm/design-contracts": "git+https://github.com/jim1286/hjm-design-system.git#v<version>&path:/packages/design-contracts",
    "@hjm/react-native": "git+https://github.com/jim1286/hjm-design-system.git#v<version>&path:/packages/react-native"
  }
}
```

`<version>`은 세 패키지가 함께 릴리스된 정확한 SemVer(예: `0.6.0`)로 바꿉니다.

## Development

```bash
pnpm install
pnpm check
pnpm showcase:web:build
```

- 패키지는 `0.6.x` fixed version train으로 함께 versioning합니다.
- generated version commit이 `main`의 HEAD에 도달하면 전체 검증 후 canonical `v<version>` Git
  tag를 idempotent하게 생성하므로 위 Git package path가 실제 release를 가리킵니다. tag 전에는
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
