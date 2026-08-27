# Catalog이 "만들지 않기로 확정함"을 표현하지 못하는 문제 — 설계 제안

## 문제

`ComponentStatus`는 `"stable" | "beta" | "planned" | "deprecated"` 넷뿐이다(`src/catalog.ts`).
`planned`은 "아직 구현하지 않았지만 구현할 것"을 뜻해 왔다. 그런데 저작 과정에서 이 뜻이
거짓인 행이 실제로 쌓였다:

- `AppProvider` — 런타임(Context+훅)뿐이라 계약할 값 타입조차 남지 않는다(`docs/app-provider.md`).
- `Utility` — antd `Util`이 가리키는 문제(토큰을 코드에서 읽는 법) 자체가 이 패키지의
  기존 정적 export로 이미 해소돼 있다(`docs/utility.md`).
- `BorderBeam` — antd에 실재하는 컴포넌트이지만(crosswalk은 정확하다, 정정: 이전 판은
  "오염됐다"고 잘못 주장했었다), 상시 반복 장식 모션이 `docs/identity.md`와 정면으로
  충돌해 만들지 않기로 확정했다(`docs/border-beam.md`).

세 행 모두 **"언젠가 화면이 생기면 만든다"가 아니라 "화면이 생겨도 안 만든다"**다. 그런데
행을 지울 수도 없다 — `component-references.test.ts`의
`"maps every external reference to a real HJM catalog target"`가 모든 crosswalk
`targets`가 실존하는 catalog 항목을 가리킬 것을 강제하고, 세 항목의 crosswalk source
(`App`, `Util`, `BorderBeam`)는 각자 **자기 자신**을 target으로 가리킨다(`Notification`→
`Toast`, `Dropdown`→`Menu`처럼 흡수해 줄 다른 이름이 없다). `ContextPanel`이 안전하게
삭제될 수 있었던 건 애초에 그걸 가리키는 crosswalk source가 **하나도 없었기** 때문이고
(`docs/context-panel.md`), 이 셋은 그 조건을 만족하지 않는다.

즉 두 사실이 동시에 참이어야 한다: **행은 남아야 하고, 그런데 `planned`이 거짓말을
한다.** 지금 `ComponentStatus`에는 이 조합을 표현할 자리가 없다.

## 검토한 세 옵션

### 옵션 A — `ComponentStatus`에 새 값 추가(예: `"declined"`)

`status`가 "구현 성숙도"와 "만들 것인가"를 하나의 축으로 합치는 방법이다. **영향
범위를 실제로 세었다:**

| 파일 | 필요한 변경 |
| --- | --- |
| `src/catalog.ts` | `ComponentStatus` union에 값 추가 |
| `src/showcase.ts:196,219` | `getRequiredShowcaseScenarios`/`getRequiredShowcaseEvidence`의 `status === "planned" \|\| status === "deprecated"` 분기에 새 값 추가(또는 `status !== "stable" && status !== "beta"`로 재작성) |
| `src/showcase.ts:295-305` | `summarizeShowcaseMaturity`의 accumulator 리터럴 `{ stable: 0, beta: 0, planned: 0, deprecated: 0 }`에 새 키 추가 — 안 하면 `Record<ComponentStatus, number>` 타입 에러로 typecheck에서 잡히긴 한다(안전망은 있다) |
| `test/showcase.test.ts:49` | `summary.stable + summary.beta + summary.planned + summary.deprecated` 합계 단정에 새 값 추가 안 하면 실패 |
| `docs/architecture.md`(「지원 단계」) | 새 상태의 정의 문단 추가 |
| `docs/showcase.md:36` | "planned 컴포넌트는 contract 문서만 제공" 문장에 새 값 포함 |
| `docs/ant-design-coverage.md` | 「두 종류」 표에 세 번째 종류 추가 |
| `showcase/web/src/components/ComponentExplorer.stories.tsx:121-124,144,149` | 필터 `<option>` 4개→5개, `isPreviewable` 분기, pill 렌더 |
| `showcase/web/src/showcase-contract.test.ts:21` | `status === "planned"` 필터가 새 값을 놓친다 — 갱신 필요 |
| `showcase/web/src/showcase.css:120-138` | `[data-status="..."]` 색상 규칙 4개→5개 |

**6개 파일, 10곳 이상.** `ComponentStatus`를 소비하는 모든 exhaustive 분기가 새 값을
알아야 하고, 그중 다수가 Showcase(웹 UI + 테스트)까지 뻗어 있다.

### 옵션 B — status와 직교하는 필드 (권고)

`status`는 계속 "구현 성숙도"만 뜻한다 — `planned`은 그대로 "아직 구현되지 않음"만
뜻하고, "구현할 의도가 있는가"라는 **완전히 다른 질문**은 별도 필드가 답한다.

```ts
// src/catalog.ts — ComponentCatalogEntry에 필드 하나 추가
export type ComponentCatalogEntry = Readonly<{
  name: string;
  category: ComponentCategory;
  platform: ComponentPlatform;
  status: ComponentStatus;
  aliases?: readonly string[];
  recipe?: RecipeName;
  behavior?: BehaviorName;
  /**
   * `status: "planned"`인 행이 실제로는 "화면이 생겨도 만들지 않기로 확정"인
   * 경우에만 채운다. crosswalk source가 자기 자신을 target으로 가리켜 행을
   * 지울 수 없는 경우(alias로 흡수할 다른 이름이 없음)가 대상이다. 짧은 한 줄
   * 요약이고, 전체 판정과 뒤집힐 조건은 `docs/<component-id>.md`에 있다.
   */
  declinedReason?: string;
}>;
```

세 행에 적용:

```ts
{ name: "AppProvider", category: "provider", platform: "adaptive", status: "planned", aliases: ["App"], declinedReason: "런타임 배선뿐 — message/notification/modal은 이미 Toast·Dialog·AlertDialog" },
{ name: "BorderBeam", category: "utility", platform: "web", status: "planned", declinedReason: "상시 반복 장식 모션이 identity.md와 충돌" },
{ name: "Utility", category: "utility", platform: "web", status: "planned", aliases: ["Util"], declinedReason: "antd Util은 useToken 문서일 뿐 — 토큰은 이미 정적 export" },
```

**영향 범위:**

| 파일 | 필요한 변경 |
| --- | --- |
| `src/catalog.ts` | 타입에 optional 필드 1개, 행 3개에 값 추가 |
| `src/component-definitions.ts` | `ComponentDefinition.contract`에 `declinedReason?: string` passthrough(선택 — 안 해도 `componentCatalog`에서 직접 읽을 수 있다) |
| `docs/ant-design-coverage.md` | 「두 종류」 표에 세 번째 종류 추가(아래) |
| `docs/architecture.md` | 「지원 단계」에 한 문단 |
| (선택) `showcase/web` UI | pill 옆에 조그만 배지/tooltip — **필수 아님**, 없어도 정확성엔 문제없다 |

`getRequiredShowcaseScenarios`/`getRequiredShowcaseEvidence`, `summarizeShowcaseMaturity`,
`test/showcase.test.ts:49`, `showcase-contract.test.ts`, `ComponentExplorer.stories.tsx`의
필터/드롭다운, `showcase.css`의 상태별 색 — **전부 무변경**이다. `status`가 여전히
`"planned"`이므로 기존 "planned은 contract 문서만 요구한다"는 로직이 이미 정확한 답을
낸다. `declinedReason`이 있는지는 그 로직에 아무 영향이 없다 — 정확히 그래야 한다,
declined 행도 Web/Native 스토리를 요구하면 안 되기 때문이다.

**타입만으로는 못 막는 조합을 테스트가 막는다:** `declinedReason`이 있는데
`status !== "planned"`인 행(예: `beta`인데 declined라고 적는 모순)은 값으로만 표현
가능하므로 새 테스트로 막는다.

```ts
it("declinedReason only ever appears on a planned row", () => {
  for (const entry of componentCatalog) {
    if (entry.declinedReason) expect(entry.status).toBe("planned");
  }
});

it("every declined row has a doc explaining the reversal condition", async () => {
  for (const entry of componentCatalog) {
    if (!entry.declinedReason) continue;
    const id = componentIds[entry.name as ComponentName];
    await expect(readFile(`docs/${id}.md`, "utf8")).resolves.toBeTruthy();
  }
});
```

두 번째 테스트는 이미 `component-references.test.ts`가 `readFile`로 `package.json`을
읽는 것과 같은 패턴이라 새 인프라가 필요 없다.

### 옵션 C — 아무것도 바꾸지 않는다

`docs/<name>.md`만으로 충분하다는 입장이다. 검토했지만 권고하지 않는다: `planned`이
계속 "만들 것"으로 오독될 수 있고, 실제로 이번 라운드에서 내가 그 오독으로 `Utility`·
`BorderBeam` 행을 **삭제하라고 잘못 권고**했다(crosswalk의 self-reference 제약을 놓쳤다).
문서만으로는 이 실수를 막지 못한다 — catalog을 보는 사람이 매번 대응하는 문서를 찾아
읽어야만 알 수 있고, 옵션 B의 필드 자체가 "이 행은 다르다"는 신호를 catalog 안에 직접
남긴다.

## 권고: 옵션 B

이유를 한 문장으로: **"얼마나 완성됐는가"(status)와 "만들 것인가"(declinedReason)는
서로 다른 질문이고, 다른 질문은 같은 필드에 욱여넣지 않는다** — 이 저장소가 이미
반복해서 쓰는 판단 방식(Select의 `selectedKey`/`open`을 안 섞는 것, DatePicker의
`selectedDate`/`focusedMonth`를 안 섞는 것)과 같은 자리다. 옵션 A는 정확히 그 반대 —
서로 다른 두 질문을 한 축에 합치고, 그 대가로 Showcase 웹 UI까지 포함해 6개 파일·
10곳 이상을 건드려야 한다.

## `docs/ant-design-coverage.md`에 반영할 세 번째 종류

```markdown
| 종류 | 뜻 | 예 | 재검토 신호 |
|---|---|---|---|
| **흡수됨** | 그 문제를 이미 다른 컴포넌트가 완결한다 | `Notification`→Toast, `Dropdown`→Menu, `ContextPanel`→SidePanel/Sheet, `Flex`→Stack, `TimePicker`→Select 조합, `Rating`→Slider/Statistic | 흡수한 쪽이 못 푸는 요구가 나올 때 |
| **검증할 화면이 없음** | 계약 자체는 유효하나 이를 확인할 제품 화면이 없다 | `Anchor`, `Calendar` | 그 화면이 실제로 생길 때 |
| **거절됨** | 계약을 만들 수는 있지만 정체성·아키텍처 경계와 충돌하거나(`BorderBeam`), 문제 자체가 이 패키지의 기존 구조(export, 다른 컴포넌트)로 이미 해소돼 있는데 흡수 대상 이름이 없어 alias를 걸 수 없다(`Utility`, `AppProvider`) | `BorderBeam`, `Utility`, `AppProvider` | 원칙(identity)이나 이 패키지의 아키텍처 경계(런타임 허용 여부) 자체가 바뀔 때 — **제품 화면이 늘어나는 것만으로는 안 뒤집힌다**, 그 점이 "검증할 화면이 없음"과 다르다 |
```

catalog 행 처리: **행을 유지한다.** `status: "planned"` 그대로 두고 `declinedReason`만
채운다 — crosswalk target을 자기 자신이 가리켜 삭제가 구조적으로 불가능하기 때문이다.

## 남은 것 — 이 설계가 결정하지 않는 것

`Grid`/`Masonry`/`Space`/`TreeSelect`/`Anchor`/`Rating` 같은 다른 `planned` 행들이 실제로
"거절됨"에 속하는지는 각각 별도로 검토해야 한다(이 문서는 그 판단을 내리지 않는다) —
`Rating`은 이미 `docs/rating.md`가, `Anchor`는 `docs/anchor.md`가, `TreeSelect`는
`docs/tree-select.md`가 각자 있으니 그 문서들을 다시 읽고 `declinedReason`이 필요한지
가리는 감사가 이 설계 적용 이후의 자연스러운 다음 작업이다.

## 적용 순서

1. `src/catalog.ts`: `ComponentCatalogEntry`에 `declinedReason?: string` 추가, `AppProvider`/
   `Utility`/`BorderBeam` 세 행에 값 채우기.
2. `src/component-definitions.ts`: (선택) `ComponentDefinition.contract`에 passthrough.
3. `docs/ant-design-coverage.md`: 「두 종류」→「세 종류」표 교체.
4. `docs/architecture.md`: 「지원 단계」에 `declinedReason`이 뜻하는 것 한 문단.
5. `component-references.test.ts`(또는 새 테스트 파일)에 위 두 단정(`status`
   일관성, 대응 doc 존재) 추가.
6. (선택, 필수 아님) `showcase/web` UI에 declined 배지 — Showcase 정확성에는 영향 없으므로
   급하지 않다.

1~5는 서로 독립적으로 검증 가능하다(각 단계 후 `pnpm typecheck && pnpm test`가 계속
통과해야 한다) — 옵션 A처럼 여러 파일을 한 번에 바꿔야 typecheck이 통과하는 상황이
생기지 않는다.

---

## 감사 — `status: "planned"` + recipe 없는 행 전수 조사

옵션 B가 적용된 뒤, 실제로 이 신호가 필요한 다른 행이 있는지 감사했다. `src/catalog.ts`
에서 `status: "planned"`이면서 `recipe`가 없는 행을 전부 골랐다(14개) — 이미 recipe가
있는 행은 "만들지 말지"가 아니라 "이미 만들었고 승격만 남았다"는 뜻이라 대상이 아니다.

| 행 | 대응 antd | 조사 | 판정 | catalog 처리 |
|---|---|---|---|---|
| `Grid` | `Grid` | Yajalal 전수 검색(`columns`/`numColumns`/grid) — 있는 모든 "여러 열" 요구는 `Statistic`이 이미 자체 `columns: 1\|2\|3\|4` 축으로 흡수했다(`statisticRecipe`). 범용 반응형 Grid를 쓰는 화면은 없다. BurnTok은 이 머신에 저장소가 없어 확인 못함(`docs/color-picker.md`와 같은 제약). | **검증할 화면이 없음** — CSS Grid(Web)와 RN Flexbox+`numColumns`(Native)가 이름·단위를 공유하지 않는다는 점도 `docs/virtual-list.md`/`docs/affix.md`의 "공유 semantic 없음" 논증과 같다. 다만 실제 반응형 다단 레이아웃 화면이 나오면 계약이 정당화될 수 있어(정체성 충돌이 아님) 거절됨은 아니다. | 변경 없음 |
| `Masonry` | `Masonry` | 동일 검색, masonry/waterfall 코드 없음. | **검증할 화면이 없음** — BurnTok(사진/영상 피드)에는 미래에 타당할 수 있는 문제라 거절 근거가 없다. | 변경 없음 |
| `Space` | `Space` | antd `Space`(자식 사이 일정한 간격+wrap+정렬)는 `Stack`이 이미 가진 축(`stackRecipe.defaults`의 `gap`/`align`/`justify`/`wrap`, `axes: {block,inline}`)과 겹친다. antd 자체도 `Space`/`Flex`가 서로 거의 같은 문제라는 지적이 흔하다 — `Flex`는 이미 `Stack`에 흡수됐다(`aliases: ["Flex"]`). `Space`만의 나머지 둘: `split`(자식 사이에 구분선 삽입)은 이미 존재하는 `Divider`를 자식 사이에 끼워 넣는 조합으로 그대로 되고, `Space.Compact`(인접 필드의 테두리를 시각적으로 합치는 것)는 spacing이 아니라 별개의 좁은 시각 패턴이라 이 흡수 여부와 무관하다(필요해지면 그때 별도로 연다). | **흡수됨 → Stack** | 아래 diff |
| `TimePicker` | `TimePicker` | 이미 감사됨(`docs/time-picker.md`, 이 저작자 작성) — Select 두 개(시·분)로 흡수. | **흡수됨(다중 대상 조합)** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `ColorPicker` | `ColorPicker` | 이미 감사됨(`docs/color-picker.md`). 실사용처 없음, 뒤집힐 조건이 전부 제품 화면 등장이다. | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `Cascader` | `Cascader` | 이미 감사됨(`docs/cascader.md`) — TreeSelect에 `valueMode`/`commitAt` 두 축이 더해지면 흡수된다는 판정. **그 두 축이 아직 `src/tree-select.ts`에 없다.** | **흡수 대기(선결 축 없음)** — 아래 「세 종류 다듬기」 참고, 넷째 종류가 필요했다. | 지금은 행·crosswalk 둘 다 그대로 둔다(아래 근거) |
| `Rating` | `Rate` | 이미 감사됨(`docs/rating.md`) — Slider(입력)/Statistic(표시) 조합으로 흡수. | **흡수됨(다중 대상 조합)** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `TreeSelect` | `TreeSelect` | 계약 모듈이 실재한다(`src/tree-select.ts`, 테스트·문서 포함) — recipe가 없는 건 select/tree/checkbox recipe 셋을 그대로 합성하기 때문이지 "안 만들기로 함"이 아니다. | **감쇠 분류 대상이 아니다** — 아래 「세 종류 다듬기」 참고. 별도의 작은 카탈로그 위생 문제만 있다. | 아래 참고(선택적 diff) |
| `Anchor` | `Anchor` | 이미 감사됨(`docs/anchor.md`). | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `VirtualList` | `List`(lifecycle) | 이미 감사됨(`docs/virtual-list.md`) — "공유할 semantic이 없다"는 강한 논증이지만, 뒤집힐 조건 셋 다 제품/엔지니어링 증거 등장이다(정체성 충돌 아님). | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `QRCode` | `QRCode` | 이미 감사됨(`docs/qrcode.md`). | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만). **별도 발견**: 문서 파일명이 `docs/qrcode.md`인데 `componentIds.QRCode`는 `"qr-code"`다 — canonical 파일명은 `docs/qr-code.md`여야 한다. 지금 당장 필요한 변경은 아니지만(QRCode는 `declinedReason`이 없어 파일 존재를 강제하는 새 테스트의 대상이 아니다), 이름 규칙 감사 때 함께 고칠 것을 권한다. |
| `Watermark` | `Watermark` | 이미 감사됨(`docs/watermark.md`). | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `ConfirmPopover` | `Popconfirm` | 이미 감사됨(`docs/popover.md` 말미) — Popover(표면)+AlertDialog(confirm session) 조합으로 흡수. | **흡수됨(다중 대상 조합)** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |
| `Affix` | `Affix` | 이미 감사됨(`docs/affix.md`). | **검증할 화면이 없음** — 이미 올바르게 처리돼 있다. | 변경 없음(확인만) |

핵심 결과: **14개 중 13개는 이미 올바르게 분류돼 있었다.** 실제로 재분류가 필요했던 것은
`Space`(흡수됨으로 새로 판정) 하나이고, `Cascader`는 이미 옳게 "흡수됨"으로 판정됐지만
그 판정을 catalog에 지금 적용하면 안 된다는 것을 발견했다(아래). `TreeSelect`는 애초에
이 감사의 대상(만들지 않기로 한 것)이 아니었다는 것을 확인했다.

### `Space` 적용 diff

```ts
// src/catalog.ts:50 — Stack의 aliases에 Space 추가
{ name: "Stack", category: "layout", platform: "shared", status: "planned", recipe: "stackRecipe", aliases: ["Flex", "Space"] },

// src/catalog.ts:54 — Space 행 삭제
// { name: "Space", category: "layout", platform: "shared", status: "planned", aliases: ["Inline"] },  ← 제거

// src/component-references.ts:61
{ name: "Space", category: "layout", targets: ["Stack"], relationship: "adapted" },  // was targets: ["Space"], relationship: "direct"
```

`Flex`가 같은 방식으로 이미 흡수됐을 때와 마찬가지로 별도 `docs/space.md`를 새로 만들지
않았다 — `Flex`의 흡수도 전용 문서 없이 crosswalk+alias만으로 기록돼 있다(`docs/*.md`에
`flex.md`가 없다). 이 절 자체가 그 기록 역할을 한다. `aliases: ["Inline"]`(Space의
원래 별칭)은 Stack에 옮기지 않았다 — "Inline"은 antd Space가 아니라 일반 명사라 Stack
검색에 그대로 두면 오히려 혼란을 준다는 판단이다. 리드가 원하면 `aliases: ["Flex",
"Space", "Inline"]`로 그대로 옮기는 쪽도 무리는 아니다.

## 「세 종류」 표에 대한 다듬기 — 감사가 드러낸 것

### 1. 「흡수됨」은 두 갈래로 나뉜다 — catalog 처리가 다르다

`Notification`→`Toast`, `Dropdown`→`Menu`, `Flex`/`Space`→`Stack`처럼 **흡수 대상이
정확히 하나**면 행을 지우고 그 대상에 `aliases`를 단다. 그런데 `TimePicker`→Select×2,
`Rating`→Slider/Statistic, `ConfirmPopover`→Popover+AlertDialog처럼 **흡수 대상이 둘
이상의 조합**이면 alias를 걸 단일 이름이 없다 — 그래서 이 셋은 (이미 정확하게) 행을
그대로 두고 있었다. 이건 실수가 아니라 이 저장소가 이미 세 번 반복해서 도달한 정답이다.
`docs/ant-design-coverage.md`의 「흡수됨」 처리 문장에 이 구분을 추가해야 한다:

> **흡수됨**은 행을 지우고 흡수한 쪽에 `aliases`로 이름을 남깁니다 — 남겨 두면 "아직
> 만들 계획"으로 잘못 읽힙니다. **다만 흡수 대상이 둘 이상의 조합이면**(예:
> `TimePicker`→Select 둘, `Rating`→Slider/Statistic, `ConfirmPopover`→Popover+
> AlertDialog) alias를 걸 단일 이름이 없으므로 행을 그대로 둡니다 — 조합 방법은 각
> 컴포넌트의 판정 문서에 남습니다.

### 2. 네 번째 종류가 실제로 필요했다 — 「흡수 대기(선결 축 없음)」

`Cascader`가 그 사례다. 판정 자체(TreeSelect + `valueMode`/`commitAt` 두 축 = Cascader)는
`docs/cascader.md`에서 이미 끝났고 재검토가 필요 없다. 그런데 그 축이 **아직
`src/tree-select.ts`에 없다.** 지금 crosswalk를 `tree-select`로 돌리고 catalog 행을
지우면, 실제로는 만들지 않은 해결책(`valueMode`/`commitAt`)을 "이미 흡수 완료"로
표시하는 거짓말이 된다 — `AppProvider`를 `planned`으로 두는 것과 반대 방향의 같은
문제다(전자는 "안 만들 것"을 "만들 것"처럼, 후자는 "아직 안 만든 것"을 "이미 다
됐다"처럼 보이게 한다).

기존 세 종류 어디에도 안 맞는다: **흡수됨**은 흡수 대상이 그 기능을 이미 갖고
있다고 전제한다(지금은 아니다). **검증할 화면이 없음**은 계약 자체가 유효하다고
전제한다(맞지만, 재검토 신호가 "제품 화면 등장"이 아니라 "엔지니어링 선행 조건
충족"이라 다른 신호다). **거절됨**은 아예 아니다(만들 것이다, 그것도 곧).

```markdown
| **흡수 대기(선결 축 없음)** | 판정은 "다른 컴포넌트에 흡수된다"로 이미 끝났지만, 그 흡수를 실제로 가능하게 할 축이 흡수 대상에 아직 없다 | `Cascader`(TreeSelect의 `valueMode`/`commitAt` 대기) | 그 축이 흡수 대상에 실제로 추가될 때 — **제품 화면과 무관한 엔지니어링 선행 조건**이라는 점이 "검증할 화면이 없음"과 다르다 |
```

catalog 처리: **행과 crosswalk 둘 다 지금은 건드리지 않는다** — 결과적으로 "검증할
화면이 없음"과 같은 처리(가만히 둔다)이지만, 재검토 신호가 다르므로 표에서는 구별해
둔다. `valueMode`/`commitAt`이 `tree-select.ts`에 실제로 추가되면 그때
`docs/cascader.md`가 이미 제안한 배선(행 삭제 또는 `aliases: ["Cascader"]`를
TreeSelect에 추가)을 적용한다.

### 3. `TreeSelect`는 억지로 끼워 맞추지 않는다 — 넷 중 어디에도 안 들어가는 게 맞다

`TreeSelect`를 이 audit에 넣은 것 자체가 처음엔 틀린 전제였다. `src/tree-select.ts`가
실재하고(`resolveTreeCheckedStates`/`toggleTreeCheckedSelection`/
`validateTreeCheckedSelection`), 테스트·문서까지 갖췄다 — **이건 "안 만들기로 한 것"이
아니라 "이미 만든 것"이다.** recipe가 없는 이유도 카탈로그 상 흔한 패턴과 같다(`Radio`→
`selectionControlRecipe`, `TextArea`→`fieldRecipe`, `Mentions`→`comboboxRecipe`처럼
기존 recipe 재사용) — 다만 `TreeSelect`는 재사용하는 recipe가 **셋**(select+tree+
checkbox)이라 `recipe?: RecipeName` 단일 필드로는 어느 것도 대표로 못 고른다. 이건
"만들지 않기로 확정함" 분류 문제가 아니라 **catalog 위생 문제**다: 소비자가 recipe
없는 행을 보고 "아직 아무것도 안 만들어졌다"로 오독할 수 있다.

이 감사의 범위(만들지 않기로 한 것의 분류)와는 다른 문제라 `declinedReason` 메커니즘을
적용하지 않았고, 새 넷째 종류도 만들지 않았다 — 억지로 끼워 맞추면 "이미 완성된
계약"과 "안 만들기로 확정한 것"을 같은 표에 섞게 된다. 대신 별도로 짧게 제안한다
(적용 여부는 리드 판단):

```ts
// src/catalog.ts:86 — 참고용, 이 audit의 diff는 아니다
{ name: "TreeSelect", category: "input", platform: "web", status: "planned", recipe: "selectRecipe", behavior: "select" },
```

`selectRecipe`/`select`를 대표로 고른 이유는 트리거+오버레이 chrome이 사용자가 가장
먼저 보는 조각이기 때문이다(Mentions가 comboboxRecipe를 대표로 고른 것과 같은
근거) — `treeRecipe`/체크박스 recipe도 함께 쓴다는 사실은 `docs/tree-select.md`가
이미 "HJM 기본값" 절에서 설명하고 있으니 catalog 필드가 그 셋을 전부 못 담아도
정보 손실은 아니다.

### 4. 부수적 발견 — `QRCode` 문서 파일명이 canonical id와 다르다

`componentIds.QRCode`는 `"qr-code"`인데 문서는 `docs/qrcode.md`다. 지금은 `QRCode`에
`declinedReason`이 없어 이 감사가 새로 세운 "declined 행마다 `docs/<id>.md`가
실존해야 한다" 테스트의 대상이 아니라 당장 깨지는 것은 없다. 다만 이름 규칙이
어긋난 채로 있으면 나중에 `QRCode`가 정말 `declinedReason`을 갖게 될 때(또는 다른
자동화가 파일명 규칙에 의존하게 될 때) 조용히 깨질 자리라 남겨 둔다 — 이 audit의
범위 밖이라 고치지 않았다.
