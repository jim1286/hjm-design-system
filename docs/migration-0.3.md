# v0.3 migration

v0.2 → v0.3. **소비자가 손대야 할 것은 하나뿐이고**, 나머지는 전부 가산 변경이다.

## 깨지는 변경 하나 — 열거해 둔 톤 목록

`buttonRecipe.tones`에 **`link`**가, `surfaceRecipe`에 **`subtle`**이 늘었다. 따라서
`SurfaceTone`·`ButtonTone` 유니언이 넓어진다.

- **읽기만 하는 코드는 영향 없다.**
- **톤 목록을 열거해 단정하는 테스트는 고쳐야 한다.** BurnTok의
  `packages/design-system/src/index.test.ts`가 그 사례였다.
- **`SurfaceTone`/`ButtonTone`을 exhaustive switch로 다루는 renderer는 새 분기를 더해야 한다.**

## 왜 늘었는가 — 제품이 먼저 찾은 답을 계약이 받았다

v0.3의 recipe 변경은 **새로 설계한 것이 아니라 제품이 이미 고쳐 쓰던 것**이다. `app-rn`은
이 패키지의 recipe 31개를 손으로 옮겨 적은 사본으로 갖고 있었고(자기 주석에
`Temporary v0.1 bridge matching the HJM recipe exactly`라고 적어 두었다), 그중 10개는
값이 달랐다. 확인해 보니 **다른 이유가 전부 실제 화면을 보고 고친 것**이었고 측정한 색까지
근거로 적혀 있었다. 그래서 앱을 계약에 맞추는 대신 계약이 그 답을 받았다.

| 바뀐 값 | 이유 |
|---|---|
| `badgeRecipe.tones.brand.background` → `surfaceAlt` | 브랜드 틴트가 "선택됨"만 뜻하게 되어, 정적 배지가 줄지어 있으면 옵션 하나가 켜진 필터처럼 읽혔다 |
| `noticeRecipe.tones.info.background` → `surfaceAlt` | 정보 워시가 캔버스 위에서 `#DCE3F3`로 앉아 배너가 눌러야 할 컨트롤보다 위계가 높아졌다 |
| `segmentedControlRecipe.item.selected*` → 불투명 `surfaceAccent`/`contentBrand` | primary의 10% 워시는 배경에 따라 값이 변해(`#E8EFFB` / `#DCE5F3`) 같은 "선택됨"이 세 색으로 읽혔다 |
| `selectionControlRecipe.states.selectedBackground` → `surfaceAccent` | 위와 같은 이유(투명 워시는 배경을 탄다) |
| `chipRecipe.states.idle.border` → `border` | `textMuted`로 그리면 선택되지 않은 칩이 옆의 선택된 칩보다 무거워져 신호가 뒤집혔다 |
| `bottomCtaRecipe.background` → `surface` | 헤어라인 하나가 글자를 자르고 깨진 카드처럼 읽혔다. 그림자가 아니라 surface로 층을 쌓는다 |

## 늘어난 축 (가산)

- `buttonRecipe.tones.link` — 구역 오류 복구처럼 **조용해야 하지만 나아갈 길로 읽혀야 하는**
  동작. 채움은 복구가 화면의 **유일한** 출구일 때만이다.
- `surfaceRecipe.subtle` — 알리는 면(설명 배너·등급 판·조용한 콜아웃)의 자리. 헤어라인을
  항상 그린다.
- `searchFieldRecipe.shapes` — 모양이 **축이 되었다**(`radius` 단일값을 대체). `fieldRecipe`와
  같은 키를 쓰므로 두 입력의 모양을 맞추거나 일부러 다르게 하는 것이 둘 다 표현된다.
- `selectionControlRecipe.presentations.grouped`, `selectionGroupRecipe`의 `grouped` 간격,
  `surfaceRecipe.*.borderAlways`, `switchRecipe`의 disabled 색 6종과 `rowTwoLineMinHeight`,
  `bottomCtaRecipe.shadow`, `badgeRecipe.tones.strong`.

## 새 계약 (약 30개)

antd 6.6.0 reference inventory 73개 중 계약 완료가 27 → 56개가 되었다. 전부
`status: "planned"`이므로 **renderer 구현을 약속하지 않는다** — `docs/expansion-roadmap.md`의
maturity gate 그대로다. 목록은 `src/catalog.ts`와 `docs/ant-design-coverage.md`에 있다.

`content-state.ts`가 그중 실제 제품 결함을 닫은 첫 사례다. 상태가 **화면 전체를 대신하는지
구역만 대신하는지**(`scope: "screen" | "region"`)가 강조 수준과 접근성 발표를 함께 정한다.
`app-rn`에서 화면 전체 오류가 보조 기술에 아무것도 알리지 않는 동안 구역 오류만 알리고 있던
것을 이 축이 잡았다.
