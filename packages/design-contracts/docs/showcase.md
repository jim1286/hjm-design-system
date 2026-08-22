# HJM Showcase

HJM Showcase는 정적인 화면 모음이 아니라 공통 계약의 실행 가능한 문서입니다.
`componentCatalog`가 범위와 계약 성숙도(`status`) 및 Web/Native renderer 성숙도
(`surfaceStatus`)를, `showcaseManifest`가 각 컴포넌트에 필요한 시각·동작·접근성
증거를 소유합니다. 두 성숙도는 독립적입니다. 계약이 stable이어도 renderer 증거가
부족하면 해당 surface는 beta 또는 planned일 수 있습니다.

## 실행

```bash
pnpm install
pnpm showcase:web
```

정적 빌드와 타입 검사는 다음 명령으로 실행합니다.

```bash
pnpm showcase:web:check
pnpm showcase:web:build
```

## 환경 도구

모든 Web story는 toolbar에서 다음 환경을 즉시 바꿀 수 있어야 합니다.

- light / dark
- LTR / RTL
- 100% / 150% / 200% text
- full / reduced motion

RN on-device story도 같은 `showcaseEnvironmentMatrix`와 story identifier를 사용합니다.
Web과 Native가 같은 DOM/view tree를 만드는 것이 아니라, 같은 의미·상태 전환·접근성
결과를 제공하는 것이 parity 기준입니다.

## story 범위

`surfaceStatus`가 `planned`인 surface는 renderer evidence를 요구하지 않고 contract
문서만 유지합니다. `beta`는 first-party renderer export와 최소 default evidence가 있어야
하며, 아직 통과하지 못한 dark·긴 문구·큰 글자·RTL·reduced motion·접근성 scenario를
generated evidence debt로 공개합니다. `stable`은 이 required scenario를 모두 통과해야
합니다. behavior가 있는 컴포넌트는 keyboard interaction, adaptive 컴포넌트는 두 surface가
모두 beta 이상일 때 Web/Native parity가 승격 debt에 추가됩니다.

`beta`의 구현 source of truth는 `@hjm/react/evidence`와
`@hjm/react-native/evidence`입니다. 제품 story는 채택 evidence이지 first-party 구현을
대신하지 않습니다. renderer claim이 없으면 `planned`, 플랫폼이 지원되지 않으면
`unsupported`입니다. `stable` 승격은 story 파일의 존재만으로 하지 않으며 위 required
scenario의 자동 evidence가 모두 통과해야 합니다.

제품 전용 구단 마크, 경기 상태, 피드 콘텐츠 같은 의미는 HJM story에 올리지 않습니다.
BurnTok과 Yajalal의 실제 채택 story에서 공통 의미로 매핑된 결과만 보여줍니다.

## 세 개의 증거 층

- HJM Web Storybook(6006): 모든 Stable/Beta 계약을 개별 페이지로 제공하고 모든 환경 축을 전환합니다.
- BurnTok Web Storybook(6007): 실제 제품 Web renderer를 Tailwind·Next.js 환경에서 실행합니다.
- Yajalal RN Storybook(8082): 실제 Native renderer를 iOS/Android 기기에서 실행합니다.

HJM의 정적 Storybook은 `main` 갱신 시 GitHub Pages artifact로 배포됩니다. 빌드 후 검증은
Stable/Beta 컴포넌트 페이지가 하나라도 누락되면 실패합니다. 제품 Storybook은 각 제품 저장소의
CI에서 별도로 빌드·번들 검증하며, HJM 카탈로그의 story identifier로 연결합니다.

## 자동 동기화

수동 expected 목록은 두지 않습니다. 다음 산출물은 모두 같은 `componentCatalog`와
`showcaseManifest`에서 계산됩니다.

- `pnpm contracts:sync`: `docs/generated/component-maturity.md`와
  `docs/generated/showcase-manifest.json` 갱신
- `pnpm contracts:check`: 생성 파일이 source와 다르면 CI 실패
- `pnpm evidence:sync`: first-party renderer claim과 required scenario를 결합한
  `renderer-evidence.json`/`.md` 및 명시적 beta debt 갱신
- `pnpm evidence:check`: renderer projection이 source와 다르면 CI 실패
- first-party renderer의 `default` claim은 `proofs[]`에서 canonical render table의 stable
  case id와 연결되고, 그 table은 evidence ID와 exact equality를 검증한 뒤 모든 case를
  실행한다. 현재 gate는 구조화된 test-result registry가 없는 non-default scenario claim을
  전부 거부한다. keyboard·accessibility·device 같은 축은 test case ID와 실행 결과 artifact를
  exact join하는 registry를 먼저 추가한 뒤에만 열 수 있으며, 파일 안의 주석·문자열이나
  export 존재만으로 scenario를 claim할 수 없다.
- HJM Storybook: `surfaceStatus.web`으로 renderer/contract-only/unsupported 분류
- 제품 Storybook verifier: 일반 앱 CI에서는 설치된 `@hjm/design-contracts/showcase`, release
  candidate gate에서는 payload full SHA의 generated manifest를 읽어 해당 surface의 active ID와
  exported CSF registration을 비교하고 missing/unknown/duplicate를 실패 처리
- 제품 evidence artifact: 검증된 story ID와 실제 실행된 scenario만 schema v1 JSON으로 출력
- canonical tag gate: 최소 권한 token으로 두 private 제품의 reviewed default-branch full SHA에
  `repository_dispatch`하고, 같은 canonical release SHA·consumer SHA·correlation ID가 run과
  artifact JSON 내부까지 exact-join된 두 검증이 모두 성공하기 전에는 tag를 생성하지 않음

`compareShowcaseStoryIds`와 `assertShowcaseStoryIds`는 모든 Stable/Beta 컴포넌트를 제공하는
first-party/full-coverage Storybook의 inventory gate입니다. 부분 채택 소비 앱이나 개별 화면은
전체 active ID를 가장하지 않고, 실제 실행한 항목만 versioned evidence artifact로 제출합니다.

Story 파일이 존재한다는 이유만으로 dark, keyboard, accessibility 등을 통과했다고 기록하지
않습니다. 환경 toolbar는 수동 확인 기능이고, scenario evidence는 interaction test, axe,
visual regression 또는 on-device test가 실제 실행된 경우에만 별도로 제출합니다.
