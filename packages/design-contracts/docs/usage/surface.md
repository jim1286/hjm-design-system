# Surface 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `surfaceRecipe`·`surfaceDefaults`·`surfaceGeometry`(`src/base-recipes.ts`)

## 언제 쓰나

배경·테두리·radius를 가진 **의미 없는 상자**가 필요할 때 쓴다. 다른 컴포넌트로 표현되지 않는
패널, 요약 영역, 이미지를 둥근 모서리 안에 자르는 틀이 여기에 속한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 제목·본문·행동이 있는 콘텐츠 카드, 누르는 카드 | [Card](card.md) |
| 간격만 필요하고 상자는 필요 없음 | [Stack](stack.md) |
| 상태·경고를 알리는 상자 | [Notice](notice.md) |
| 설정·목록 행 | [ListRow](list-row.md), [List](list.md) |
| 화면 위에 뜨는 층 | [Sheet](sheet.md), [Dialog](dialog.md), [Popover](popover.md) |
| 콘텐츠 최대 폭·좌우 여백 | [Container](container.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Surface` | `@hjmds/react`, `/layout` | `@hjmds/react-native`, `/primitives` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Surface } from "@hjmds/react/layout";

<Surface as="section" padding="md" aria-label={t("order.summary")}>
  {children}
</Surface>
```

```tsx
// Native
import { Surface } from "@hjmds/react-native/primitives";

<Surface tone="raised" padding="md" layoutStyle={{ marginTop: 16 }}>
  {children}
</Surface>
```

## 축과 기본값

- `tone`: `default`(기본) · `raised`(그림자) · `sunken` · `accent`(primary 색 테두리) · `subtle`.
  모든 tone의 배경은 테마 `bg`다. 회색 채움 대신 테두리·그림자로 위계를 나타낸다.
- `padding`: `none`(기본) 또는 spacing 토큰(`xxs`~`xxxl`). `radius`: `lg`(기본, 16) · `sm` · `md` · `xl` · `full`.
- `bordered`: 생략하면 테두리를 그린다(모든 tone이 `borderAlways`). `bordered={false}`로만 끈다.
- 자식 자르기: `raised`를 뺀 tone은 둥근 모서리 밖으로 넘친 자식을 자른다. `raised`는 그림자가 잘리지 않게 자르지 않는다.
- Web `as`: `div`(기본) · `section` · `article`.

## 꼭 지킬 것

- 배치는 `layoutStyle`로만 한다. 배경·테두리 색·radius·그림자를 덮지 않는다.
  색은 제품 테마 토큰이 정하고, Surface마다 브랜드 색을 하드코딩하지 않는다.
- 안쪽 여백은 `padding` 토큰으로 정한다(기본이 `none`이라 내용이 테두리에 붙는다).
- Surface는 role을 갖지 않는다. 영역에 이름이 필요하면 Web은 `as="section"`과 라벨을 함께 준다.
- `raised` 안에 이미지를 넣으면 모서리가 잘리지 않는다. 모서리 자르기가 필요하면 다른 tone을 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| `style` | 받음(`layoutStyle`이 이김) | 타입에서 제외 |
| 요소 선택 | `as` | 없음(`View`) |
| 그림자(`raised`) | CSS | `elevation: 4`와 iOS shadow |
| ref | `forwardRef` | 없음 |
| import 경로 | `/layout` | `/primitives` |
