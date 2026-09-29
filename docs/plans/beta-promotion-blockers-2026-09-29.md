# Beta 승격 미완료 이유 조사

기준일: 2026-09-29 · 조사 snapshot: Mentions 승격 및 surface evidence 0 확인 후 · source catalog 1.7.0 · 범위: Web/React Native renderer

## 후속 실행 현황 (2026-09-29)

위 표는 작업 시작 전의 조사 snapshot이다. 후속 병렬 작업으로 20개 일반 Web 후보와 9개 Native
후보의 전용 browser/host-action proof를 보강하고 source evidence·실행 scenario에 연결했다.
TransferList의 좁은 화면 라벨 overflow도 수정했다. Native Form에는 제품이 선택한 첫 무효 필드의
input/accessibility focus 경로와 회귀 테스트를 추가했고, ThinkingOrb Web의 dark·large-text·RTL·
reduced-motion·accessibility proof도 전용 browser case에 연결했다. ThinkingOrb Native는 이 조사 시점에 계획 상태였으며, 아래 최종 상태에서는 설치 smoke까지 완료했다.

아래 숫자와 표는 작업 시작 전 snapshot을 설명하는 기록으로 보존한다. 당시 남은 일은 후보별 proof 최종 확인과 canonical CI 실행이었다.

## 최종 상태 — 2026-09-29

현재 source catalog와 생성 보고서에서 Beta는 0개다. 검증된 Web 및 Native 후보는 Stable Core와 Changeset까지 반영했고, canonical `pnpm ci:check`가 통과했다. 따라서 Beta → Stable 승격 작업 자체에 남은 후보는 없다.

별도 Planned 항목은 Beta 승격 실패 목록이 아니다. Contract/Web은 Stable 100개·Planned 8개이고, Native는 Stable 83개·Planned 3개·Unsupported 22개다. ThinkingOrb은 Contract·Web·Native 모두 Stable이다. Native는 설치된 iOS·Android showcase에서 Skia smoke를 통과했으며, 상세 조건과 미검증 범위는 [ThinkingOrb 검증 기록](../../packages/design-contracts/docs/thinking-orb.md)에 유지한다. mock 테스트와 Metro/export 결과는 실제 iOS·Android 기기 실행을 대체하지 않는다.

설치 smoke를 시작하기 전 checkout에는 Expo dev-client가 `apps/diairy/apps/mobile`에서 실행 중이고 iPhone 17 / iOS 27.0 simulator가 부팅되어 있었다. 공유 기기를 점유하지 않도록 해당 Native 검증은 수행하지 않았다. 당시에는 별도 Android 기기도 연결되어 있지 않았다. 이후 사용자가 기존 Android와 iPhone 17 사용을 허용하여 설치 smoke를 완료했다.

## 판정 요약

현재 catalog와 generated renderer evidence를 대조했다. 이전 snapshot에서 Beta로 보였던 항목은 순차 승격했고, 현재 Beta 중 required evidence는 완성됐지만 status만 빠진 surface는 없다. 초기 조사에서 Native Form은 evidence matrix는 채웠지만 첫 유효성 오류 필드에 접근성 focus를 이동하는 실제 동작이 없어 Beta에 남겼고, 후속 구현으로 해소했다. 나머지 proof 누락은 구현 실패가 아니라 전용 case가 scenario claim에 연결되지 않았다는 뜻이다.

| Surface | stable | beta | proof 누락 | 판정 |
| --- | ---: | ---: | ---: | --- |
| Web | 76 | 21 | 21 | 20개 공통 scenario claim과 ThinkingOrb 환경 evidence 보완 필요 |
| Native | 69 | 10 | 9 | 9개 proof 연결, Form 동작 보완 필요 |

누락 시나리오 수는 중복될 수 있다. 같은 컴포넌트가 keyboard와 long-copy 모두 빠진 경우 두 조건에 모두 포함된다. 현재 Web의 20개와 Native의 9개는 두 조건이 함께 빠져 있다.

## Web Beta

| 누락된 필수 시나리오 | 컴포넌트 수 | 대상 |
| --- | ---: | --- |
| keyboard + long-copy | 20 | TransferList, UploadItem, Sidebar, ContextMenu, Menu, Anchor, Collapsible, DataTable, Tree, Calendar, Carousel, Tour, Dialog, AlertDialog, Sheet, SidePanel, Popover, Tooltip, CommandPalette, SkipNav |
| dark + large-text + rtl + reduced-motion + accessibility | 1 | ThinkingOrb |

## Native Beta

| 누락된 조건 | 컴포넌트 수 | 대상 |
| --- | ---: | --- |
| host action + long-copy proof | 9 | TransferList, UploadItem, Menu, Collapsible, Calendar, Carousel, Dialog, AlertDialog, Sheet |
| 실제 동작 공백 (evidence 누락 없음) | 1 | Form — invalid submission 뒤 첫 오류 필드로 focus 이동 |

## 누락이 뜻하는 것

긴 문구 시나리오는 임의 문자열을 모든 컴포넌트에 주입하지 않는다. `renderLongCopy` fixture가 실제 label/title/description/content 슬롯을 채우고 `packages/react/src/evidence.ts` 또는 `packages/react-native/src/evidence.ts`의 component claim으로 연결돼야 한다. 따라서 fixture 부재만으로 clipping 실패를 단정하지 않는다. 메뉴·overlay 계열에는 긴 제목/설명이나 접근성 이름 등 실제 표면에 맞는 슬롯을 정해야 한다.

Web keyboard는 browser Tab/Enter와 bespoke roving focus/arrow handling을 구분한다. 이번 승격에서 Tabs의 long-strip 포커스 노출 버그를 고쳤고, BottomNavigation·LoadMore도 전용 Web 상호작용 증거를 연결했다. 남은 컴포넌트는 기존 전용 browser test가 있으면 component별 claim으로 연결하고, 없다면 요구 동작을 먼저 정해 의미 있는 테스트를 추가한다.

Native의 keyboard scenario는 물리 키보드 인증이 아니라 RN host/accessibility action 단위 테스트다. 기기·VoiceOver·TalkBack 검증으로 부풀리지 않는다. Native Form은 이 evidence 기준을 이미 채웠지만 첫 invalid control로 접근성 focus 이동이 빠져 있어 behavior 구현 및 회귀 검사가 다음 blocker다.

Web ThinkingOrb에는 theme·reduced motion·animation lifecycle·offscreen resume/cleanup·`role=status`/label 테스트가 일부 존재한다. 그러나 9가지 state와 두 크기에 대한 required matrix claim으로 모두 연결되지 않았다. 이 특수 환경 및 생명주기 증거가 Web Beta blocker다. Native ThinkingOrb은 Beta가 아니라 **planned**이며, 선택형 Skia 개발 클라이언트와 실제 기기 검증을 시작 조건으로 둔다.

## 다음 작업

1. 20개 Web / 9개 Native beta 컴포넌트에서 기존 상호작용 테스트와 실제 long-copy 슬롯을 확인하고 전용 proof를 연결한다.
2. Native Form의 invalid-submit focus 동작을 구현하고 실제 host action 테스트를 추가한다.
3. Web ThinkingOrb의 state·size·lifecycle matrix를 claim 가능한 component 전용 증거로 완성한다.

제품 채택 수, 배포 상태, 새 ADR 부족 때문에 보류한 항목은 없다. Beta에서 Stable로 올리는 것은 required evidence와 concrete behavior gate를 각각 통과한 경우에만 진행한다.

근거: [renderer evidence](../../packages/design-contracts/docs/generated/renderer-evidence.md), [showcase requirements](../../packages/design-contracts/src/showcase.ts), [Web evidence claims](../../packages/react/src/evidence.ts), [Native evidence claims](../../packages/react-native/src/evidence.ts), [승격 기준](../../packages/design-contracts/docs/stable-promotion.md).

## 실제 기능 공백 후속 구현

Masonry·VirtualList·QRCode를 양쪽 renderer에 추가하고 Native Cascader 조합을 추가했다.
Chart·AppProvider·BorderBeam·Utility 후보는 사용자 요청으로 삭제했다.
이 후속 변경의 전체 릴리스 검증·게시·소비 앱 적용은 진행 중이며, 위 과거 통과 기록으로 대체하지 않는다.
