# HJM Design System

HJM 제품이 같은 언어와 상호작용을 공유하도록 계약, Web renderer, React Native
renderer를 한 이력과 한 npm release train에서 관리하는 pnpm monorepo입니다.
기존 Flutter 제품을 위한 별도 beta renderer도 같은 저장소에서 관리합니다.

Web Storybook: [storybook.jmstudioapps.com](https://storybook.jmstudioapps.com/).
2026-10-10 승인한 자체 도메인 게시·복구 방법은 [배포 실행서](deploy/storybook/README.md)를 따릅니다.

| Package | Role |
| --- | --- |
| [`@hjmds/design-contracts`](packages/design-contracts) | renderer-neutral tokens, recipes, behavior, catalog, evidence |
| [`@hjmds/react`](packages/react) | accessible React 19 Web components |
| [`@hjmds/react-native`](packages/react-native) | Expo-independent React Native components |
| [`@hjm/showcase-web`](showcase/web) | Storybook documentation and Web evidence |

현재 API 안정성과 플랫폼 지원은 [생성된 성숙도 표](packages/design-contracts/docs/generated/component-maturity.md)를 따른다.
화면 선택은 [사용 지침](packages/design-contracts/docs/usage/README.md)과
[선택 기준](packages/design-contracts/docs/usage/SELECTION.md)에서 시작한다.
소비 앱은 설치한 버전의 catalog와 지침을 사용한다. Storybook 분류와 npm 제공 버전은 서로 다른 정보다.
승격 판단은 [승격 기준](packages/design-contracts/docs/stable-promotion.md), 과거 결과는
[승격 기록](packages/design-contracts/docs/stable-core.md)에 보존한다.

Beta는 필요한 경우 선택해서 쓸 수 있으며, 기존 contract/TASKS의 채택 기록과 관련 회귀
검사로 추적합니다. 별도 ADR을 항목마다 요구하지 않습니다. 신규 제품의 공통 계약과 제품 소유
범위는 [소비 정책](packages/design-contracts/docs/consumer-policy.md), 브랜드 범위는
[브랜드 경계](packages/design-contracts/docs/brand-boundary.md)를 따릅니다.
카탈로그 등록과 보조·선택형 API 분류는 [공통 기준](packages/design-contracts/docs/stable-promotion.md#카탈로그-등록과-공개-api-분류)을 따릅니다.

Storybook은 `배포`와 `실험` 아래에 각각 `토큰 → 컴포넌트 → 구성 → 화면`을 둡니다.
2026-10-02 사용자 요청으로 큰 개념의 단계를 통일했습니다. 신규 항목은 실험에서 검토하고
승인된 작업 범위에서 배포 분류로 옮기며 분류만을 위한 재승인을 요구하지 않습니다. 여기서 ‘배포’는 Storybook 분류이며 npm 게시·앱 출시와
별개입니다. [단계별 배치와 승인 기준](docs/STORYBOOK_NAVIGATION.md)을 따릅니다.

## Why one repository

Contracts와 두 renderer는 같은 API 변화에 함께 반응해야 합니다. 같은 변경에서 계약, Web,
Native와 영향받는 Storybook·evidence를 함께 관리하고 변경 범위의 타입·동작을 확인합니다. Renderer는
검증된 family-level granular export를 유지하므로 저장소를 합쳐도 앱 bundle graph가
합쳐지지는 않습니다. 이 경계는 root barrel 비경유와 family별 금지 의존성 경계를
보증하며, named component별 별도 chunk나 tree-shaking 결과까지 보증하지는 않습니다.
루트 `@hjm/design-system-workspace`는 배포하지 않는 `0.0.0` orchestrator입니다. release와
Git tag의 버전 source of truth는 fixed train의 `packages/design-contracts/package.json`입니다.

## Install

세 패키지는 npm registry에 함께 publish합니다. renderer를 사용하는 앱은 contracts도
명시적으로 설치하고, 세 패키지는 하나의 fixed version train이므로 **정확히 같은
SemVer**를 씁니다. 이 npm 패키지의 Git ref, package path, vendored tarball 소비는 지원하지 않습니다.
Flutter renderer는 퇴역했다. [제거 이유와 이전 소스](docs/FLUTTER_LEGACY.md)를 참고한다.

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
위 npm 패키지는 tarball을 vendoring하거나 Git ref와 package path로 고정하지 않습니다. 두 방식 모두 참조
문자열에 버전을 박아 `pnpm update`와 `npm outdated`를 무력화합니다.

## Development

에이전트 작업은 [AGENTS.md](AGENTS.md)의 중복 검토·소유권·문서 최신화 기준을 따릅니다.

```bash
pnpm install
# 변경 파일의 타입·관련 동작 검사를 선택합니다.
# 넓은 진단이 필요할 때만 pnpm dev:check --base origin/main
# 전체 패키지 진단을 명시적으로 선택한 경우에만 pnpm release:check
# 전체 문서·Showcase 회귀는 명시적으로 선택할 때만 pnpm ci:check
```

[릴리스 검증 계약](docs/RELEASE_GOVERNANCE.md)은 내부 검사와 별도 제품 검증의 범위를 정합니다.
`ci:check`는 명시적으로 선택하는 로컬 전수 진단입니다. package 계약·테스트·bundle/evidence,
Native Showcase와 Web Storybook을 확인하며 배포 workflow에서 자동으로 실행하지 않습니다.

- `main` 단일 branch로 운영합니다. 현재 `showcase.yml`은 명시적 npm 릴리스가 만든 `v*` 태그 또는 수동 실행에서 Web artifact를 만들고 GitHub Pages 이동 안내를 게시합니다. 일반 main push·의존성 수정은 배포하지 않습니다. 자체 도메인 Storybook은 [게시 실행서](deploy/storybook/README.md)로 별도 전달합니다.
- 세 public package는 하나의 fixed version train으로 함께 versioning합니다.
- 게시 소스 변경은 작업 단위(PR 또는 PR 없이 `main`에 push하는 묶음)를 마칠 때 `pnpm changeset` 하나로 정리합니다. 개발 반복 commit마다 추가하지 않고, `release:version` 전에 마지막 tag 이후 게시 소스 변경이 changeset에 모두 담겼는지 확인합니다. 명시적 package 릴리스가 태그를 만든 뒤 Storybook artifact 흐름이 시작되며, 일반 version 준비 push는 게시하지 않습니다.
- 릴리스 commit: 로컬에서 `pnpm release:version`을 실행하고 생성 결과를 하나의 commit으로
  `main`에 push합니다. package publish가 필요할 때 GitHub Actions에서 `Release Packages`를 직접
  실행합니다. workflow는 세 package를 build하고 npm에 publish한 뒤
  canonical `v<version>` Git tag를 생성합니다.
- 컴포넌트 범위·성숙도의 source of truth는
  `packages/design-contracts/src/catalog.ts`입니다. 토큰·recipe·behavior는 각각의
  `src/*.ts` 모듈이 source of truth이고, `docs/generated/*.json`은 CI와 도구를 위한
  생성 projection입니다.
- catalog projection은 `pnpm contracts:sync`로 갱신합니다.
- 공개 컴포넌트 전체 이름과 카탈로그의 관계는
  [공개 API 대응표](docs/generated/public-component-map.md)에서 확인합니다.
  2026-10-01 중복 조사에서 TextField·Table 등 목록 밖 API를 놓칠 수 있음을 확인해 추가했습니다.
  `pnpm api-map:sync`로 source/export 대응표를 생성하고 `pnpm api-map:check`가 미분류 이름·drift를
  검사합니다. root `check`에 이 검사를 연결한 이유는 catalog 검사만으로 companion·확장을 볼 수 없기 때문입니다.
- renderer claim과 scenario debt projection은 전체 package build 뒤
  `pnpm evidence:sync`로 갱신합니다.
- 앱 runtime에서는 root barrel보다 package별 granular subpath를 사용합니다.

자세한 역할과 migration은
[`packages/design-contracts/docs/migration-0.6.md`](packages/design-contracts/docs/migration-0.6.md)를
참고하세요.

기여, 보안 제보, 라이선스와 외부 디자인 시스템 비교 근거는 각각
[`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), [`LICENSE`](LICENSE),
[`library-gap-analysis.md`](packages/design-contracts/docs/library-gap-analysis.md)에서 확인할 수 있습니다.

## 공통 작업 상태와 복구

일반 저장·낙관적 변경·역연산은 선택적
[`action-session` 계약](packages/design-contracts/docs/action-session.md)으로 기존 Button·입력·알림과
합성할 수 있습니다. 기존 AlertDialog 및 앱의 mutation 계층과 중복 소유하지 않습니다.
Web/Native 예제는 `배포/구성/피드백과 복구`의 저장과 재시도·즉시 반영과 복구·보관과 실행 취소입니다(2026-10-06 사용자 승인으로 실험에서 옮김). 스토리북 배포는 게시·소비 앱 적용과 별개입니다.

제품 개발 시 [상호작용 적용·품질 기준](docs/INTERACTION_QUALITY.md)에서 구현된 예제, 상태 연결, 반응·프레임·복구 검증을 확인합니다.

## 반복 화면

로그인은 기존 `AuthScreenLayout`을 쓰고, 설정·알림함·채팅은 opt-in
`@hjmds/react/screens` 또는 `@hjmds/react-native/screens`에서 조합합니다.
화면별 제공 기준과 개발 중 추가 prop은 [사용 지침](packages/design-contracts/docs/usage/README.md)에서 확인합니다.
설치 버전의 exports·타입을 기준으로 사용하며, Storybook 배포 분류를 npm 제공 여부로 해석하지 않습니다.
[화면 계약과 채택 방법](packages/design-contracts/docs/screen-patterns.md)에서 제품 데이터·라우팅·
번역·키보드 경계와 초기 로딩/갱신 상태의 구분을 확인하세요.

기본 화면 예제에 댓글(답글·공감·게시), 검색(결과·빈 상태), 저장 목록(해제·되돌리기),
프로필(수정·상세)을 제공합니다. 제품은 해당 공개 화면 API부터 선택하고 데이터·문구·콜백을 연결합니다.
Showcase는 공개 API의 소비 예제이며 제품에서 기본 구조를 복사하는 원본이 아닙니다.
소셜 로고의 로컬 미리보기는 포트폴리오 루트에서
`node scripts/sync-auth-provider-logos.mjs --local-showcase --write` 후 개발 서버를 실행합니다.
로고는 무시되는 `.env.local`에만 투사하며 공개 소스·npm에는 포함하지 않습니다.

기본 흐름은 `@hjmds/react/screen-flows` / `@hjmds/react-native/screen-flows`에서 제공합니다.
목록·작성·프로필·신고·사진·검색·권한·온보딩과 댓글의 사용법 및 제품 소유 범위는
[화면 계약](packages/design-contracts/docs/screen-patterns.md#기본-흐름-공개-조합-2026-10-05)을 확인하세요.


## 로컬 HJM 소스 연결

일상 개발은 `pnpm showcase:web` 또는 `pnpm showcase:native`로 시작한다.
Showcase의 `typecheck`도 공용 개발 adapter로 같은 공개 source exports를 읽는다. 기존 `tsc`가 이전 dist 타입을 읽어 새 슬롯을 거부하던 불일치를 없앴다. CI/production 또는 `HJM_LOCAL_SOURCE=0`에서는 기존 tsconfig와 설치 패키지를 검사한다.
2026-10-09부터 이 명령은 선행 package build 없이 `src`를 직접 읽고 자동 갱신한다.
2026-10-12 사용자 요청으로 소비 앱의 개발 서버도 중앙 소스를 기본으로 읽는다.
게시 버전과 비교할 때만 `HJM_LOCAL_SOURCE=0`으로 실행한다. production/CI와 배포 빌드는
플래그와 무관하게 설치된 패키지를 사용한다. Next 소비 앱의 dev 스크립트는 `--webpack`을 포함한다.
자세한 범위는 [기여 지침](CONTRIBUTING.md#로컬-화면-개발)을 따른다.
