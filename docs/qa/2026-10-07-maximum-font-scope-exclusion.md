# QA 리포트 — 최대 글자 조건 제외 범위 감사

## 1. 최종 판정

- 판정: **부분 확인**. 지정된 계약·실행 registry·evidence·Storybook·release/workspace 경로를 정적으로 읽었다. 테스트 성공이나 릴리스 완료 판정이 아니다.
- 2026-10-07 루트 AGENTS가 제외하는 것은 **OS 최대 접근성 글자 설정 및 그 최대값을 모사하는 목적의 확대 조건**이다. `textScale=2`, `LargeText`, 일반 연속 배율 또는 이름에 큰 글자가 들어간다는 사실만으로 최대 목적을 판정하지 않는다.
- 기존 일반 2x·LargeText 검증과 공개 배율 계약을 유지한다. 최대 목적의 직접 근거 없이 이를 없애려던 이번 B 변경 60개는 모두 작업 전 내용으로 복구했다.
- 마지막 정적 확인: 2026-10-07 21:37 KST. 수행자: 병렬 에이전트 B.

## 2. 대상과 이력

- 대상: HJM design-contracts, Web/Native renderer, Storybook 등록 규격, package/release governance.
- 감사와 복구 기준: `main`, `88bbe6ad9e61c4686f3ccb8d066730d76c18c9e0`. 당시 package 버전은 1.15.0이다. 게시 상태를 조회하거나 주장하지 않았다.
- 공유 댓글·인증·프로필 모서리 작업은 다른 세션 소유다. 복구는 착수 시 clean이었던 B 담당 60개에 한정했다. `screen-flows` 양 테스트·기존 shared dirty·A의 source/새 회귀는 변경하지 않았다.
- A에게 `upload-item.browser.test.tsx` / `agreement-top.browser.test.tsx` 동시 변경 여부를 확인했고, 두 파일을 수정하지 않았다는 회신을 받았다. A는 새 회귀 두 파일과 별도 8개 renderer source를 소유한다.

| 이력 | 변경 전·후 | 판정 |
| --- | --- | --- |
| 최초 감사 | `large-text`/200% fixture, matrix claim, Storybook 필수 등록 경로 확인 | 숫자와 명칭을 최대 목적과 동일시할 직접 근거는 없음 |
| B의 과도한 변경 | 일반 2x 혼합 fixture를 1x로 변경하고 활성 large-text requirement/claim을 제거 | 루트 원문의 범위를 과하게 해석한 변경. 채택하지 않음 |
| 범위 교정 후 복구 | 아래 60개 파일을 정확히 기준 SHA 내용으로 복구 | 일반 검증 축소 없음. source/registry/public API의 최종 변경 없음 |
| 최종 보존 | 이 QA 문서만 신규 작성 | 역사적 최대 전용 제외와 일반 검증을 구분 |

복구 목록은 다음과 같다. 접미사와 디렉터리가 같은 파일을 묶었으며 합계는 60개다.

- 공통 10개: `packages/design-contracts/src/showcase.ts`, `packages/design-contracts/test/showcase.test.ts`, `packages/react/src/evidence.ts`, `packages/react-native/src/evidence.ts`, 양 renderer의 `test/executed-scenarios.json`, Web `test/scenario-matrix.browser.test.tsx`, Native `test/scenario-matrix.test.tsx`, `scripts/check-storybook.mjs`, `showcase/native/src/component-stories.test.ts`.
- Web 29개, 모두 `packages/react/test/<이름>.browser.test.tsx`: `asset-profile`, `document-resource`, `floating-action-button`, `date-entry`, `advanced`, `agreement.keyboard`, `field-group`, `design-profile`, `contract-alignment`, `calendar`, `screens`, `side-panel`, `selection-motion`, `bottom-navigation`, `reference-adoption`, `sheet-layout`, `carousel`, `popover`, `auth-layout`, `agreement-top`, `page-navigation`, `upload-item`, `switch-row`, `profile-chrome-shadows`, `text-annotation`, `adoption-gaps-1-13-1`, `screen-chrome`, `toast-layout`, `thinking-orb`.
- Native 21개, 모두 `packages/react-native/test/<이름>.test.tsx`: `profile-token-consumers`, `floating-action-button`, `sheet-viewport`, `gesture-sheet-tokens`, `profile-font-hosts`, `settings-row`, `category-filter`, `asset-profile`, `design-profile`, `screens`, `calendar`, `profile-chrome-shadows`, `gooey-navigation`, `selection-motion`, `reference-adoption`, `code-block`, `shared-field-frame`, `adoption-gaps-1-13-1`, `fixed-frame-glyph-scale`, `top-bar-product`, `bottom-navigation.interaction`.

## 3. 환경과 검증 범위

- 정적 source 및 JSON 독해만 수행했다. 브라우저·기기·시뮬레이터·실서비스 API·OS 글자 설정을 조작하지 않았다.
- 숫자 2 또는 3을 보고 최대 OS 설정이라고 추정하지 않는다. 실제 최대값·최대값 모사 목적은 해당 fixture의 명시적 근거로 판단한다.
- 일반폭, RTL, light/dark·제품 팔레트, reduced motion, 긴 문구, 상태·복구·키보드·접근성 이름·터치 계약은 범위 안이며 이번 작업에서 축소하지 않았다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 경로·조건 | 실제 source | 판정 |
| --- | --- | --- |
| [single-line-field-scaling](../../packages/react-native/test/single-line-field-scaling.test.tsx) | `OS maximum font size is excluded` 근거 주석 5개와 `it.skip` 5개. 최대 목적 역사적 fixture를 실행하지 않음 | 명시 최대 제외가 이미 적용됨. 이번에 변경하지 않음 |
| [dialog-viewport](../../packages/react-native/test/dialog-viewport.test.tsx) | 같은 명시적 제외 주석·`it.skip` 각 2개 | 동일 |
| [multiline-field-scaling](../../packages/react-native/test/multiline-field-scaling.test.tsx) | 같은 명시적 제외 주석·`it.skip` 각 2개. 일반 callback ref 검사는 활성 | 최대 제외와 일반 계약 보존을 분리한 기존 source 유지 |
| [bottom-navigation.interaction](../../packages/react-native/test/bottom-navigation.interaction.test.tsx) | 최대 제외 주석·`it.skip` 각 2개. 일반 capsule 이름/활성화 검사와 구분됨 | 최대 전용 총 11개는 이미 skip. 이 작업에서 재실행하지 않음 |
| [fixed-frame-glyph-scale](../../packages/react-native/test/fixed-frame-glyph-scale.test.tsx) | 주석은 utilverse의 **a large text size**에서 glyph가 잘린 과거 결함을 설명한다. 반복 `[undefined, 2, 3]`과 `allowFontScaling=false`/fixed glyph metrics를 검사한다. OS fontScale 최대 설정 호출·maximum 목적 주석은 없음 | 이 source만으로 최대 목적을 입증할 수 없음. 원문 유지. 숫자 3만으로 새 skip을 만들지 않음 |
| 양 renderer scenario registry | Web 39개 execution 중 matrix/Toast/ThinkingOrb에 2x가 있고 Toast RTL도 2x다. Native 22개 execution 중 matrix/ThinkingOrb에 2x가 있음 | 일반 200% fixture의 source. maximum 목적을 확인하지 못했으므로 제거하지 않음 |
| [contracts showcase](../../packages/design-contracts/src/showcase.ts) | environment `large-text`는 200%로 명시. renderer requirements에도 포함 | 일반 확대 요구가 곧 OS 최대 요구라는 근거 없음. 유지 |
| [contracts evidence](../../packages/design-contracts/src/evidence.ts) | 버전·surface·story·required scenario를 엄격히 검증 | 일반 계약 유지. 전체 evidence gate를 약화하지 않음 |
| 양 renderer `src/evidence.ts`·matrix tests | 실제 컴포넌트 스타일/호스트와 claim·registry를 결합 | 일반 축 유지. 최대 전용 history를 새 완료 claim으로 승격하지 않음 |
| [Storybook 검사](../../scripts/check-storybook.mjs), [Native 등록 검사](../../showcase/native/src/component-stories.test.ts) | Default/Dark/LargeText 필수 등록 | LargeText라는 이름 자체는 최대 조건이 아님. 필수 규칙을 새로 변경하지 않음 |
| AGENTS·CONTRIBUTING·탐색 규격 | 일반 큰 글자 예제를 설명 | 최상위 최대 제외 원문과 일반 확대를 구별하여 적용. 숫자/명칭 금지 규칙을 새로 만들지 않음 |

순수한 공개 API 산술·정규화는 최대 UI 검증과 별도다. 다음 검사는 화면의 최대 조건 적합성을 주장하지 않는다.

- `packages/design-contracts/test/design-system-provider.test.ts`: 0·음수·비유한 값 거부, 연속값 2.35 수용, 부모/명시값/시스템값 우선순위. `DesignSystemTextScale = number` 계약을 유지한다.
- `packages/react-native/test/provider-text-scale-parity.test.tsx`: Native 호스트의 중복 배율 방지, 명시 배율 한 번 적용, 부모 배율 상속/대체. 모의 host props/산술을 확인하며 실제 OS 최대 레이아웃 완료의 증거가 아니다.
- `packages/react/test/renderers.ssr.test.tsx`의 Provider serialization·임계값 flag, `showcase/web/src/web-theme.test.ts`의 CSS 변수 projection: 결정적 값 전달 계약을 유지한다.
- `packages/design-contracts/test/description-list.test.ts`의 열 수 산술과 `bottom-navigation.test.ts`의 recipe 필드 계약도 숫자·명칭만으로 제외하지 않는다.

현재 조사한 활성 경로에서 **명시적으로 OS 최대/최대 모사 목적이라 선언됐는데 실행되는 잔여 케이스는 확인하지 못했다**. 이는 저장소 전체 모든 source·과거 문서의 전수 판정이 아니다. fixed-frame 반복의 과거 목적은 위에 직접 source 한계로 남겼으며 root가 추가 근거를 갖고 판단할 수 있다.

## 5. 검사·관찰 결과

| 명령·조건 | 결과 | 해석 |
| --- | --- | --- |
| `git rev-parse HEAD`, 지정 source·registry 독해 | 기준 SHA·원문 확인 | 현재 source 감사. 테스트 통과 영수증 아님 |
| B 소유 60개 파일을 기준 SHA와 byte 비교 | 60/60 byte 동일, 차이 0개 | 공유 dirty 또는 generated 파일을 복구하지 않음 |
| 최대 제외 주석/`it.skip` 정적 집계 | 4개 파일, 총 11개 | 이미 존재하던 제외. 새 fixture 실행 없음 |
| `node scripts/check-doc-links.mjs` | 통과: 597개 Markdown | 전체 suite/CI/build/device와 구분 |

## 6. 미확인 범위와 후속 조건

- 전체 tests/CI·원격·기기·build/dist 생성·commit/push·게시를 실행하지 않았다. root 소유 작업과 구분한다.
- 다른 세션의 shared dirty `screen-flows` 양 테스트는 일반 2x와 행동 검증을 섞어 사용한다. 최대 목적의 근거 없이 변경하지 않았으며 새 최대 차단 항목으로 남기지 않는다.
- source·registry·공개 계약 변경이 최종적으로 없으므로 이번 QA 문서에 Changeset은 필요하지 않다. `contracts:sync`·`evidence:sync`·API map 생성도 필요하지 않다.
- 처음 과도한 source가 공유 build에서 잠시 읽혔을 수 있으므로 root에게 즉시 알렸다. 최종 dist/생성물 정합성·검사는 root가 자신의 build 이후 확인한다. B가 generated artifacts를 직접 수정하지 않았다.
- 일반 배율을 앞으로 재분류할 때도 명시적인 최대 목적 근거 없이 일반 검증을 끄거나 최대 목적 UI 조건을 새로 추가하지 않는다.

## 7. 보관 처리

- 이 문서에 범위 해석·오류·복구·정적 근거·미실행을 보존했다. 새 원시 캡처/JSON/로그는 만들지 않았다.
- 제품 source·회귀 fixture·과거 QA·기존 11개 skipped 역사적 source를 보존한다. 다른 세션의 파일을 삭제하거나 바꾸지 않았다.
