# HJM Design System 라이브러리 적용 정책

기준: 2026-09-08. [포트폴리오 공통 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/LIBRARY_POLICY.md)과
[Query 정책](https://github.com/jim1286/app-portfolio/blob/main/docs/libraries/TANSTACK_QUERY_POLICY.md)을 이 저장소에도 적용한다.
라이브러리 선택은 제품의 framework·runtime 경계 안에서 하며, 모듈마다 별도 원칙을 복제하지 않는다.
중앙 변경을 아직 게시하지 않은 로컬 적용에서는 함께 둔 `app-portfolio` checkout의 같은 경로를 원문으로 읽는다. GitHub 링크는 게시 후 소비 경로이며 원격 반영 완료를 뜻하지 않는다.

공용 계약·React·React Native renderer가 각각 호환성 원문을 소유한다. renderer의 React 계열은 peer 계약이며 앱 상태·QueryClient·HTTP·인증·제품 API를 DS로 가져오지 않는다. 변경은 공개 API·접근성·대표 소비 앱 영향으로 검증한다. 상세 배포 범위는 RELEASE_GOVERNANCE 문서를 따른다.

대표 구현의 실제 진입 파일·수정 근거·동작 검사·미검증 범위는 [2026-09-08 구현 경계 조사표](https://github.com/jim1286/app-portfolio/blob/main/docs/audits/2026-09-08/LIBRARY_BOUNDARIES.md)의 이 저장소 행을 따른다. manifest와 lock의 전체 위치·직접 선언은 같은 감사의 `library-inventory.json`이 기록한다.

## 의존성 및 변경 계약

- 실제 버전은 각 manifest와 lockfile이 원문이다. 중앙 [등록부](https://github.com/jim1286/app-portfolio/blob/main/docs/library-policy.json)의 `hjm-design-system` 항목은 채택한 라이브러리·허용 버전 계열·Query 소스 소유권을 기록한다.
- 적용 분류: `framework`, `native-platform`, `storage`, `testing`, `toolchain`, `ui`.
- manifest 추가·이동·삭제는 중앙 `repositories.hjm-design-system.manifests`와 실제 패키지 소비 관계를 함께 갱신한다. 빈 manifest도 등록한다.
- 새 라이브러리·다른 major 계열·Git/path source 변경은 사용 목적, 기존 기능 중복, renderer/서버 경계, 제거 방법과 관련 검증을 기록한 뒤 중앙 등록부도 갱신한다.
- HTTP는 runtime별 공용 transport, runtime 입력은 소유 schema, 비밀은 secure adapter, UI 로컬 상태는 화면/도메인 owner를 사용한다. 별도 캐시·HTTP client·schema를 화면에서 임의로 만들지 않는다.
- 버전 숫자를 맞추기 위한 framework 호환성 무시나 불필요한 패키지 추가는 하지 않는다. peer·SDK·빌드 도구는 해당 호환성 계약을 우선한다.

## 검사와 증거

포트폴리오 루트에서 다음을 실행한다. 독립 checkout의 설치·제품 검사는 해당 저장소의 기존 명령을 사용한다.

```bash
npm ci --ignore-scripts --prefix scripts/library-policy-tools
node scripts/check-library-policies.mjs --module hjm-design-system
```

중앙 검사는 direct manifest 경로·등록·버전 계열·근거 파일 존재와 등록된 Query key factory/생성 위치를 검사한다. 문서 내용의 정확성이나 모든 간접 호출까지 증명하지 않는다.
API 요청의 모든 입력, 계정 격리, persistence race, 실기기 동작은 해당 행동 테스트와 QA로 확인한다.
이 문서와 정적 검사 통과만으로 전체 library API의 런타임 검증이나 원격 required gate 설치를 주장하지 않는다.

## 전이 의존성 보안 권고 처리 — 2026-09-10

Dependabot alerts 6건(high 2·medium 3·low 1)을 확인하고 아래와 같이 정리했다.
전부 lockfile의 전이 의존성이며 게시되는 `dependencies`/`peerDependencies`는 바뀌지 않았다.

락파일 갱신(`pnpm update --recursive`)으로 닫힌 것:

| 패키지 | 변화 | 권고 |
| --- | --- | --- |
| js-yaml | 3.15.1 → 3.15.2, 4.3.1 → 4.3.2 | high 2건 |
| @vitest/mocker | vitest 4.1.11 상향에 포함 | medium |

`pnpm-workspace.yaml`의 `overrides`로 닫은 것:

| 패키지 | 변화 | 이유 |
| --- | --- | --- |
| valibot | 1.2.0 → 1.4.2 | 같은 major 안의 minor이고 트리에 1.4.2가 이미 있어 중복 사본까지 없어진다 |

**닫지 않고 남긴 것과 근거.** 둘 다 dev 전용 toolchain의 전이 의존성이고, 하한을 올리려면
상위 도구에 major를 강제해야 한다. 게시 산출물에는 들어가지 않으므로 소비 앱에 전달되지 않는다.

| 패키지 | 현재 → 요구 | 상위 | 남긴 이유 |
| --- | --- | --- | --- |
| esbuild | 0.27.7 → 0.28.1 (low) | storybook 10.4.4 | 0.x minor는 semver 관례상 breaking이다. low 1건을 위해 storybook 빌드 경로를 흔들지 않는다 |

두 항목은 상위 도구가 올라올 때 함께 해소한다. 상위 major를 강제하는 override는 넣지 않는다.
이 판단은 정적 검토이며, 빌드 도구의 런타임 노출 범위를 실측한 것은 아니다.

또한 이 저장소의 `packageManager`는 `pnpm@11.18.0`으로, 포트폴리오 baseline인 11.24.0과
다르다. 이번 변경 범위가 아니라 그대로 뒀고 HJM 릴리스 절차에서 함께 정한다.

### uuid는 닫았다 — 판단을 정정한다 (2026-09-10, 같은 날 추가)

위에서 `uuid` 7.0.3(`xcode@3.0.1` 경유)을 major 4단계 차이라는 이유로 남기기로 했다.
**두 가지 근거로 판단을 바꿨다.**

1. **포트폴리오 안에 선례가 넷 있다.** taground·unairplane·spint·diairy가 모두
   `'xcode>uuid': 11.1.1` 중첩 override를 쓰고 각 저장소 검사를 통과한다. Xcode 프로젝트
   파서 경로에서 이 major override가 동작한다는 근거가 추측이 아니라 실측으로 있었다.
2. **남겨 두면 Actions가 계속 빨간색으로 남는다.** Dependabot updater가 매 실행마다
   실패한다 — 닫을 수 없는 보안 권고를 자동 수정하려다 실패하는 것이다.

```
security_update_not_possible {
  "dependency-name": "uuid",
  "latest-resolvable-version": "7.0.3",
  "lowest-non-vulnerable-version": "14.0.0"
}
Error: The updater encountered one or more errors.
```

`xcode@3.0.1`이 `~7.0.0`을 선언하므로 Dependabot이 도달할 수 있는 최대가 7.0.3이고,
그것이 여전히 취약하므로 수정안을 만들지 못한다. 이 실패는 **매 Dependabot 실행마다
반복**되며 다른 실제 문제를 가린다. override로 하한을 적는 것이 그 반복을 끝내는 유일한 길이다.

검증: `pnpm ci:check` exit 0 — packages 검사, renderer 번들 예산, workspace·evidence·docs·
governance 검사, **양쪽 showcase**(native check + web storybook build, canonical story 94개와
navigation page 13개 검증)까지 전부.

남은 것은 `esbuild`(low) 하나다. 그것은 storybook 10.4.4가 0.27.7을 끌어오고 0.x minor를
건너야 해서 남긴다. 다만 이 항목은 Dependabot updater를 실패시키지 않는다 —
security update 대상이 아니기 때문이다.
## Liquid Toast optional renderer — 2026-09-28

User-requested absorption of expo-dynamic-notifications adds Skia 2.6.2, Reanimated 4.5.1 and Worklets
0.10.1 as optional renderer peers, development typecheck dependencies and Native showcase runtime.
The optional `toast-liquid` and `thinking-orb` entries import these runtimes; later native adapters also use Reanimated through their separately documented entries. The default Metro fixture rejects these modules during
resolution, including when installed locally, so ordinary consumers do not acquire an implicit native
module requirement. Geometry, timing and lifecycle stay within the existing Toast contract.

Expo 57/RN 0.86.2 is the effect's bundle fixture. Reanimated/Worklets declare RN 0.83–0.86, whereas the
base renderer still tests RN 0.81.6. The resulting development-only peer warning does not establish
effect support on 0.81. A separate entry was chosen over raising the base renderer's RN minimum.
No Expo-only UI modules or network clients are added. Removing the adapter and presentation hint
restores standard Toast; removal of native peers requires the host's normal binary update procedure.

See [usage and compatibility](../packages/react-native/docs/liquid-toast.md) and
[design decisions](plans/liquid-toast.md). Native UI, performance and assistive-technology checks are
separate from mock tests and JS bundling. Original source license notices ship in both packages that
contain adapted code. Native package `files` includes its usage document as well as the notice.

## ThinkingOrb source absorption — 2026-09-29

User-requested absorption vendors MIT geometry/presets at Thinking Orbs commit
`de85557ca220332586d070d8788c0e1d6e877a0d`, rather than adding its React package as a
runtime dependency. Only the optional Native entry uses the existing Skia/Reanimated peers.
Root exports do not load the engine or these optional peers. The source/license record,
catalog freeze exception, compatibility and promotion conditions are in
[ThinkingOrb](../packages/design-contracts/docs/thinking-orb.md). Removing this entry and
its host usage restores ordinary Spinner; no app dependencies or release versions change here.

## Optional presentation adoption — 2026-09-29

The user explicitly requested all six shortlisted libraries with platform-specific adoption allowed.
[Optional adapters](../packages/design-contracts/docs/optional-adapters.md) records exact versions,
entry points, MIT provenance, host setup, failure behavior, removal cost and runtime evidence limits.
NumberFlow and Bloom extend web Statistic/Menu; Zoom Toolkit, Keyboard Controller, Gorhom Sheet
and Zeego supply native-specific capabilities. They are optional peers plus development dependencies,
with actual runtime imports only in opt-in entries. This avoids imposing native linking requirements
on the base renderer. Central library-policy.json registers the new direct dependencies and lanes.
Zeego's older exact peer versions follow its published contract; newer native-module majors were
rejected as an unverified substitution. Native device and transitive security audits remain separate.

## Native showcase build compatibility — 2026-09-29

Android RN 0.86.2 compilation exposed `@react-native-menu/menu@1.2.2` calling the old
Java `setHitSlopRect` API after RN 0.81 converted it to a Kotlin property. The pinned
workspace patch uses property access and preserves both superclass hit testing and
the menu TouchDelegate update. A blind major override was rejected because Zeego
pins 1.2.2. Remove this patch when Zeego adopts an upstream compatible release.
This workspace patch is not inherited by consumers installing the published HJM
package; Android hosts using the optional context-menu adapter need the same patch
until that upstream update. It is unrelated to ThinkingOrb's renderer implementation.

Skia postinstall is explicitly enabled in `pnpm-workspace.yaml`: its binary packages
were installed, but the required copy into `libs/` had been skipped and CMake could
not find `libskia.a`. The official `install-skia` command restored those files.
See [upstream API migration issue](https://github.com/react-native-menu/menu/issues/1144).

The complete iOS showcase now uses ios-context-menu 3.2.1 and ios-utilities 5.2.0.
Their podspecs respect RN 0.86's prebuilt dependency mode instead of forcing an old
Folly version. Two pinned patches handle Xcode 27's iOS 16 subtitle availability
and exclude the removed legacy RCTRootContentView reference from Fabric builds.
Keeping the legacy fallback in Fabric was rejected because it caused a linker
failure. Remove these patches when the upstream packages include equivalent fixes.
The full iOS build and a native menu save action passed on the existing iPhone 17
simulator. The Orb-only autolinking/story filter has therefore been removed.

## iOS 27 showcase launch fix — 2026-09-29

`HJMNativeShowcase-2026-09-29-174721.ips` confirms the UIKit
`___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`
SIGTRAP at launch. Expo 57.0.21 lacks the required scene delegate. The showcase
uses Expo ~57.0.25 and the existing portfolio scene-lifecycle config plugin, which
creates the scene-owned window and preserves Expo URL forwarding. Hand-editing
generated ios files was rejected because prebuild would discard the fix. Remove
the plugin when Expo's template owns scene wiring. This is showcase host repair,
not a claim about a published consumer app or OS-wide release validation.

## Optional QR encoding and test decoding

`qrcode-generator@2.0.4` is an optional peer of both QRCode renderer entries and a
dev dependency for typechecking/showcase tests. Base renderer entries and contracts
remain independent of the encoder. Native QR rendering additionally requires
`react-native-svg@15.15.5`. `jsqr@1.4.0` is test-only: decoding the actual generated
matrix catches corrupt UTF-8 or module geometry that SVG snapshots would miss.
These versions are registered in the central library policy; installing unrelated
optional presentation peers is not required for QRCode.
