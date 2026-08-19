# ContextPanel — 새 컴포넌트를 만들지 않는다

## 이게 무엇인지부터 정해야 했다

`docs/expansion-roadmap.md`의 「Batch 2 — 입력과 탐색」은 `adaptive: Select, Combobox,
ContextPanel, BottomNavigation`이라고만 적어 두었을 뿐 문제 정의가 없다. crosswalk
(`src/component-references.ts`)에도 `ContextPanel`을 가리키는 antd source entry가
**하나도 없다** — `TimePicker`(`targets: ["TimePicker"]`)나 `Drawer`(`targets: ["Sheet",
"SidePanel"]`)처럼 어딘가 대응이 있는 다른 planned 항목과 다르다. 이름과 카탈로그의
`category: "overlay"`만으로 판정해야 했다.

이름("문맥 패널")과 자리(overlay, adaptive)로 가장 가능성 높은 해석은 하나다: **선택한
대상의 상세를 본문 옆에서 보여주는 면 — Web은 사이드 영역, Native는 Sheet.** 이는 antd
`Drawer`가 실제로 풀던 문제이기도 하다.

## 판정: Drawer 분해가 이미 이 문제를 끝냈다

`docs/ant-design-coverage.md`와 `src/component-references.ts:114`는 이미 `Drawer`를
`Sheet`(adaptive)와 `SidePanel`(web)로 **decomposed** 처리해 뒀다. 그리고 방금 다른
저작자가 완성한 `SidePanel`(`src/side-panel.ts`, `docs/side-panel.md`)을 읽어보면, 이
컴포넌트가 이미 "ContextPanel"이 말하려던 것 그 자체다:

- `modal: false` 축이 **정확히** "본문을 밀어내며 옆에서 보여주되 나머지 페이지는
  계속 상호작용 가능한, 상세를 보여주는 비-차단 패널"이다 — 로드맵이 말하려던
  "문맥"의 의미가 이미 여기 있다.
- `edge: "start" | "end"`로 어느 쪽에 도킹하는지도 이미 계약돼 있다.

Native에서 같은 사용자 의도("선택한 대상의 상세를 본다")를 만들 표면은 이미 `Sheet`
(`platform: "adaptive"`, `status: "beta"`)다 — Native에는 상시 옆 패널을 놓을 화면
폭이 없으므로 모달 Sheet로 여는 것이 Select/DatePicker가 이미 채택한 것과 같은 적응
경로다.

즉 "ContextPanel"이 하려던 일 — **Web에서는 SidePanel(필요하면 `modal:false`로
비차단), Native에서는 Sheet** — 은 새 컴포넌트가 아니라 **이미 완결된 Drawer 분해를
어떤 제품이 어떻게 조합해서 쓰느냐**의 문제다. 여기에 `ContextPanel`이라는 셋째 이름을
얹으면:

- `sidePanelRecipe`의 `edge`/`modal`/`content` anatomy와 거의 같은 것을 다시
  선언하게 되고,
- `sheetBehaviorDefaults`의 dismiss 어휘와 거의 같은 것을 Native 쪽에 다시
  계약하게 되어,

Dropdown이 Menu와 같은 실수를 반복할 뻔한 것과 같은 자리다(`docs/dropdown.md`) — 두
컴포넌트가 같은 상태를 서로 다른 이름으로 소유하는 문제.

## 대안 검토 — "선택과 결합된 패널"이라면?

`ContextPanel`이 단순한 표면이 아니라 "목록에서 항목을 고르면 자동으로 열리고, 패널을
닫으면 선택이 풀리는" **결합된 상태**를 뜻할 가능성도 검토했다. 그렇다면 SidePanel/Sheet
어느 쪽도 갖지 않는 축(선택 key ↔ 열림 상태의 양방향 동기화)이 새로 필요할 수 있다.
하지만 이를 요구하는 목록형 컴포넌트(`DataTable`, `Tree`)가 아직 하나도 저작되지 않았고
(둘 다 `planned`, recipe 없음), 이 동기화가 실제로 어떤 모양이어야 하는지 뒷받침할
vertical slice가 없다. 지금 그 축을 짐작해서 만들면 `Select`의 `open`/`selectedKey`를
"섞지 않는다"는 이 저장소의 원칙(`docs/architecture.md`「Select와 Combobox의 적응형
경계」)과 반대로, 검증되지 않은 결합을 먼저 만드는 것이 된다. 이 판정은 그 결합이
필요한 실제 화면이 나오면 뒤집힐 수 있다 — 아래 참고.

## 판정이 뒤집힐 조건

`DataTable` 또는 `Tree`(둘 다 Batch 3 planned)가 저작되고, 그 목록의 "선택 항목 →
상세 패널" 흐름이 여러 제품에서 반복해서 같은 동기화 코드를 다시 쓰는 것이 확인되면,
그때는 새 표면이 아니라 **SidePanel/Sheet를 감싸는 얇은 selection-synced open-state
헬퍼**(새 recipe 없이 behavior 레벨의 작은 함수 하나)를 여는 쪽을 권한다 — Select의
`reconcileSelectSelection`이 표면 자체가 아니라 상태 유도 함수만 추가했던 것과 같은
자리다.

## 배선 명세 제안 (리드 적용)

Dropdown(`docs/dropdown.md`)과 달리 ContextPanel은 alias로 흡수할 단일 기존 이름이
없다(SidePanel과 Sheet 둘로 나뉘므로). 두 가지 중 리드가 고른다.

**(a) 권고: catalog에서 제거.** `src/catalog.ts`의
`{ name: "ContextPanel", category: "overlay", platform: "adaptive", status: "planned" }`
행을 지운다. `component-definitions.ts`의 예약 ID(`ContextPanel: "context-panel"`)는
남겨 둬도 무해하다 — `componentCatalog`에 없으면 어차피 노출되지 않는다.
`docs/expansion-roadmap.md`의 「Batch 2」 목록에서 `ContextPanel`을 빼고, 대신 "선택
항목 상세는 Web `SidePanel`(`modal:false` 옵션 포함) + Native `Sheet`로 이미 커버된다"는
한 줄을 Drawer 분해 설명 옆에 남긴다.

**(b) 대안: catalog row 유지 + 이 문서만 링크.** 로드맵 문구를 지금 당장 고치기보다
Component Explorer에서 "ContextPanel"을 검색했을 때 이 문서로 안내되는 쪽이 낫다고
판단하면 이 대안을 쓴다 — Notification이 catalog row를 유지한 채 `docs/notification.md`
로 안내한 것과 같은 방식.

이 저작자 판단은 (a)다 — Notification/Dropdown과 달리 ContextPanel은 대응할 단일
기존 컴포넌트 이름이 없어 alias를 만들 수 없고, catalog에 recipe/behavior 없이 남아
있는 `planned` 행 자체가 "아직 구현 안 된 진짜 계획"으로 오인될 여지가 있다 — 이미
Drawer 분해로 완결된 문제를 다시 계획 중인 것처럼 보이게 하는 쪽이 더 나쁘다고 봤다.
