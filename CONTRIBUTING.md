# Contributing to HJM Design System

검토일: 2026-10-09

HJM은 계약, Web renderer, React Native renderer, Showcase evidence를 같은 변경에서
함께 관리합니다. 새 API는 한 플랫폼의 편의보다 공통 사용자 문제와 검증 가능한 의미를
먼저 설명해야 합니다.

## 시작하기

Node.js 20 이상과 저장소에 선언된 pnpm 버전을 사용합니다.

```bash
pnpm install
pnpm dev:check --base origin/main
# 릴리스 전 전체 검증
pnpm ci:check
```

## 변경 규칙

1. canonical 컴포넌트의 공개 API·지원 행동이 바뀌면 관련 `componentCatalog`와 renderer evidence를 갱신합니다. 내부 리팩터링에 내용이 같은 문서 갱신을 요구하지 않습니다.
   companion·alternative·optional API를 포함한 모든 공개 컴포넌트 이름은
   [공개 API 대응표](docs/generated/public-component-map.md)에 분류합니다.
2. 상태 축을 추가하기 전에 실제 제품 문제와 Web/RN 번역을 문서화합니다.
3. 사용자에게 보이는 문구는 renderer가 번역하지 않습니다. 제품이 지역화한 문자열을
   전달하도록 타입으로 요구합니다.
4. 게시할 public package source 변경은 작업 단위(PR, 또는 PR 없이 `main`에 push하는 묶음)를 마칠 때
   `pnpm changeset` 하나로 SemVer 영향을 기록합니다. 반복 개발마다 추가하지 않습니다. `main` 단일 branch
   운영에서는 PR이 없을 수 있으므로 `pnpm release:version` 전에 마지막 `v<version>` tag 이후의 게시 소스
   변경이 모두 changeset에 담겼는지 확인합니다. migration은 소비 API·동작이 바뀔 때만 작성합니다.
5. 생성 파일은 `pnpm sync`로 함께 갱신합니다. 공개 API·지원 상태·사용법에 변화가 없으면
   관련 문서의 무의미한 수정이나 검토일 갱신을 요구하지 않습니다.

2026-10-09 생산성 개선: 매 반복마다 전량 빌드·문서 갱신을 강제하던 흐름을 나눴습니다.
`pnpm dev:check`는 staged/unstaged/untracked 변경, `--base REF`는 해당 ref 이후 변경까지 봅니다.
Web/Native 변경은 해당 renderer와 contracts·Showcase만 검사하고, contracts·공용 설정 변경은
양쪽을 검사합니다. `--plan`으로 실행 목록을 보고 `--all`로 양쪽을 명시할 수 있습니다.
문서만 바뀌어도 contracts의 build·typecheck·test를 실행합니다. contracts 테스트가 루트·패키지 README와
패키지 문서 내용을 검증하기 때문입니다. Native 범위는 Metro bundle(`bundle:check:built`)을, Web 범위는
renderer budget을 함께 확인하고, 모든 범위에서 `contracts:check`·`docs:check`·`usage:check`·`api-map:check`·
`workspace:check`를 실행합니다. 이름 변경은 이전·새 경로를 모두 범위 판정에 넣습니다. 2026-10-09 리뷰에서
문서만 바꾼 변경이 실행 항목 0개로 통과하고 optional native peer 서브패스 오류(tsc·test 통과, Metro 실패)를
놓칠 수 있음을 확인해 넓혔습니다.
릴리스의 `pnpm ci:check`는 전체 검증을 유지하되 세 패키지를 한 번 빌드하고
`:built` 명령이 같은 산출물을 사용합니다. 이 명령들은 선행 build가 필요한 내부 단계이며
단독 개발에는 기존 Showcase 명령을 사용합니다.

## 중복 구현 검토

2026-10-01 전수 조사에서 catalog 밖 공개 API를 빠뜨리고 같은 행동을 각각 구현한 결과,
메뉴 검색 규칙과 필드 표현이 갈라지고 Table의 문서가 실제 정렬 기능과 어긋났습니다.
새 API를 추가하거나 겹치는 구현을 바꿀 때는 다음을 같은 변경에서 확인합니다.

- catalog뿐 아니라 두 renderer의 package exports와 공개 API 대응표를 비교합니다.
  기존 API로 충족할 수 없는 사용자 요구와 별도 API의 선택 기준을 계약 문서에 적습니다.
- 상태·접근성·validation·recipe의 공통 의미는 contracts를 재사용하고 같은 renderer의
  표현은 내부 helper로 합성합니다. optional peer와 플랫폼 host는 해당 adapter가 소유합니다.
- 기존 공개 이름을 유지할 경우 고유 기능·호환성 이유를 문서화합니다. 공개 API를 합치거나
  제거할 경우 migration과 SemVer 영향을 Changeset에 기록합니다.
- 공통 구현을 소비하는 컴포넌트의 행동 회귀와 import/bundle 경계를 검증합니다.
  `pnpm api-map:check`는 분류와 drift만 검사하므로 기능 중복이 없다는 증거로 쓰지 않습니다.

에이전트 작업에도 같은 기준을 적용합니다([AGENTS.md](AGENTS.md)).

## Storybook 실험과 배포

2026-10-02 사용자 요청에 따라 `배포`와 `실험` 모두 `토큰 → 컴포넌트 → 구성 → 화면`으로
정리합니다. 신규 UI·표현·도구는 `실험/<단계>/...`에서 먼저 검토하고, 명시적 사용자 승인 후
같은 단계의 `배포/<단계>/...`로 이동합니다. 이 이동은 **스토리북 배포**이며 npm 게시나
소비 앱·운영 서비스 배포와 별개입니다. 구현이나 검사 통과는 사용자 승인을 대신하지 않습니다.
승인 날짜·대상·경로와 양쪽 Storybook·메뉴·검사·문서를 함께 갱신합니다.
기존 항목 수정은 현재 위치에서 진행합니다. 상세 기준은 [탐색 기준](docs/STORYBOOK_NAVIGATION.md)을 따릅니다.

## 상호작용 품질

2026-10-02 요청에 따라 [상호작용 적용·품질 기준](docs/INTERACTION_QUALITY.md)을 따른다.
구현된 예제·플랫폼 지원·스토리북 상태를 확인하고 입력 → 반응 → 확정 → 복구를 함께 연결한다.
성능에 영향을 주는 변경은 동일 조건의 변경 전후 측정을 남긴다. 검사·데모·실기기·소비 앱
결과를 구분하고 성능 미측정 상태를 목표 달성으로 보고하지 않는다.

## 컴포넌트 완료 조건

- renderer-neutral descriptor·validator·resolver 또는 명시적인 presentation contract
- Web/RN 지원 범위와 접근성 번역
- public granular export와 package boundary test
- default·dark·long copy·large text·RTL·reduced motion·accessibility evidence
- 행동 컴포넌트의 keyboard/host-action evidence
- Storybook 또는 Native gallery의 canonical preview
- 소비자 migration과 Changeset

계획된 컴포넌트의 자세한 저작 규칙은
`packages/design-contracts/docs/authoring-brief.md`를 따릅니다.

## 커밋 전 게이트

```bash
# 개발/PR: 변경 영향 검사. 공개 계약 변경 시 pnpm sync 후 diff를 검토한다.
pnpm dev:check --base origin/main
# 게시 전: 전체 회귀와 생성 drift 검사
pnpm release:check
```

## 행동 강령

기술적 반대 의견은 재현 가능한 증거와 사용자 영향으로 설명합니다. 개인을 공격하거나
차별·괴롭힘·위협하는 행동은 허용하지 않습니다. 보안 문제는 공개 이슈 대신
`SECURITY.md`의 절차를 사용합니다.

## Storybook registration during implementation

2026-10-01 사용자 피드백에서 새 optional 컴포넌트가 묶음 예제에만 있어 없는 것으로
보였다. 공개 컴포넌트를 구현하는 같은 변경에서 지원하는 Web/Native Storybook에
개별 항목을 등록한다. [분류 기준](docs/STORYBOOK_NAVIGATION.md)의 역할별 컴포넌트 아래에 두고 Default·Dark·LargeText를 제공한다. 신규 항목은 실험 아래 토큰·컴포넌트·구성·화면 중 실제 역할에 둔다.
비교 예제는 구성, 페이지 전체는 화면, 색상·글꼴 편집은 토큰에 둔다. canonical catalog 밖 optional 항목도 등록 검사에
포함한다. 스토리끼리 import하지 않고 별도 preview 모듈을 공유한다.

분류 이름과 메뉴 순서는 Web/Native가 공유한다. 2026-10-01 분류 감사에서 Display/Data Display,
Foundation/Foundations와 단일 컴포넌트의 Patterns 등록이 혼재했다. 새 항목은
[Storybook 탐색 기준](docs/STORYBOOK_NAVIGATION.md)을 따르고, 기존 제목을 옮길 때는
Web은 CSF `id`를 유지해 저장된 링크를 보존한다. Native 10.4.4는 명시적 meta ID를
무시하는 runtime index 때문에 새 제목 기반 ID를 사용하며 변경 경로를 문서화한다.
