---
"@hjmds/design-contracts": patch
"@hjmds/react": patch
"@hjmds/react-native": patch
---

Switch의 레시피와 렌더러가 어긋나 있던 나머지 두 축을 맞춘다.

1.0.1이 꺼짐 hairline을 붙이면서 드러난 것들이다. `switchRecipe.colors`는 렌더러가
자동으로 소비하지 않는다 — 웹은 `styles.css`가, native는 컴포넌트가 각각 손으로
다시 적기 때문에 계약에만 있고 아무 데도 그려지지 않는 슬롯이 생긴다.

**`trackOn`: 계약을 고친다(렌더러가 아니라).** 켜진 트랙은 채워진 brand 면이고,
같은 형태인 체크된 체크박스는 `selectionControlRecipe.states.checkedBackground`
= `action.brand.background`를 쓴다. 레시피만 `content.brand`(아이콘·라벨용 content
역할)를 가리키고 있었고 두 렌더러는 이미 `primary`를 칠하고 있었다. 관례와 실제
화면이 같은 곳을 가리키므로 **계약을 옮긴다 — 화면 변화는 없다.**

**disabled: opacity 한 장 대신 hue를 바꾼다.** 레시피가 진작 그렇게 적어뒀고
(`trackOffDisabled`·`trackOnDisabled` 등) 그 근거 주석은 "flat opacity가 on과 off를
거의 같게 만들어 저장된 설정을 읽을 수 없게 했다"고 말한다. 두 렌더러 모두 정확히
그 flat opacity를 쓰고 있었다. 이제 컨트롤은 색이 대비를 책임지고, fade는 **라벨에만**
남아 행이 여전히 disabled로 읽힌다. 38%로 고른 on 트랙이 한 번 더 흐려지는 문제도
사라진다.

- 웹: 꺼짐 트랙 `border`, 켜짐 트랙 38% brand wash, 손잡이 `textWeak` hairline.
- native: 플랫폼 `Switch`가 fill만 받아 `*Border` 슬롯은 웹 전용으로 남지만,
  fill은 이제 레시피에서 읽는다 — 값을 손으로 다시 적는 것이 `trackOn`이 어긋난
  원인이었다.
- 웹 렌더러가 레시피의 `label` 슬롯을 `hjm-switch__label`로 실제로 내보낸다.
  이전에는 클래스 없는 `<span>`이라 슬롯을 겨냥할 수 없었다.
- `action-contrast.browser.test.tsx`가 disabled에서 두 상태가 서로 다른 색이고
  컨트롤이 fade되지 않는 것을 고정한다.
