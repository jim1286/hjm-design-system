# Button 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [버튼 라벨 줄바꿈](../button-label.md), recipe `buttonRecipe`(`src/base-recipes.ts`)

## 언제 쓰나

사용자가 누르면 무언가가 일어나는 텍스트 행동에 쓴다. 저장·확인·다음 같은 화면의 주 행동,
보조 행동, 삭제처럼 되돌리기 어려운 행동, 켜고 끄는 토글 버튼(`selected`)이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 아이콘만 있는 행동 | [IconButton](icon-button.md) |
| 화면 하단에 고정된 주 행동 | [BottomCTA](bottom-cta.md) |
| 다른 페이지·URL로 이동 | [Link](link.md) (`tone="link"` 버튼은 같은 화면 안의 행동용) |
| 여러 선택지 중 하나를 고름 | [SegmentedControl](segmented-control.md), [ToggleGroup](toggle-group.md) |
| 소셜 로그인 | [AuthProviderButton](auth-provider-button.md) |
| 복사 | `ClipboardButton`(Web, 아래 표) |
| 떠 있는 주 행동 | [FloatingActionButton](floating-action-button.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Button` | `@hjmds/react`, `/actions` | `@hjmds/react-native`, `/actions` | 기본 |
| `ClipboardButton` | `/clipboard` | 없음 | 복사 동반 버튼 |
| `InlineConfirm` | `/inline-confirm` | `/inline-confirm` | 버튼 자리에서 한 번 더 확인 |
| `ReactionPicker` | `/reaction-picker` | `/reaction-picker` | 반응 고르기 확장 |

## 최소 사용 예

```tsx
// Web
import { Button } from "@hjmds/react/actions";

<Button tone="primary" loading={saving} onClick={save}>
  {t("profile.save")}
</Button>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";

<Button tone="primary" loading={saving} onPress={save} fullWidth>
  {t("profile.save")}
</Button>
```

## 축과 기본값

- `tone`: `primary`(기본) · `secondary` · `ghost` · `danger` · `link`. 한 화면의 `primary`는 하나로 둔다.
- `size`: `small` · `medium`(기본) · `large`. `shape`: `rounded`(기본) · `pill`. `align`: `center`(기본) · `leading`.
- `selected`를 주면 토글 버튼이 된다. Web은 `aria-pressed`, Native는 접근성 state로 알린다.
- `loading`은 누름을 막고 스피너를 그린다. Native는 기본으로 포커스를 유지한다(`disableWhileLoading`으로만 옛 동작).

## 꼭 지킬 것

- 라벨은 i18n 키로 넣는다. 자르지 말고 두 줄을 넘으면 카피를 고친다([라벨 정책](../button-label.md)).
- 배치는 `layoutStyle`로만 한다. 색·radius·높이를 `style`/`className`으로 덮지 않는다.
  Native에서 `style`·`labelStyle`을 넘기면 실행 중 `TypeError`가 난다.
- 색은 tone과 제품 테마 토큰으로 바꾼다. 버튼마다 브랜드 색을 하드코딩하지 않는다.
- 진행 중 상태는 `loading`으로 표시하고 같은 자리에 별도 Spinner를 겹치지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress` |
| 꽉 찬 폭 | `layoutStyle` | `fullWidth` |
| 로딩 문구·스피너 교체 | 없음 | `loadingLabel`, `renderLoadingIndicator` |
| 내용에 맞춰 높이 증가 | CSS가 처리 | `growWithContent` |
| 기본 `type` | `"button"`(폼 submit은 `type="submit"`을 명시) | 해당 없음 |
