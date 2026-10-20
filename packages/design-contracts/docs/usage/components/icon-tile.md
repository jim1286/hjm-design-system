# IconTile

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-20
- 근거: `src/screen-patterns.ts`의 `iconTileRecipe`
- 스토리북: `배포/컴포넌트/데이터 표시/아이콘 타일`

## 언제 쓰나

프로필·런처 격자의 아이콘 위/제목 아래 항목에 쓴다. 번뚝 양 표면이 같은 64px 아이콘과 제목 배치를 복제하고 Web에서 Button 내부 label CSS를 덮던 원인을 제거하기 위해 분리했다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 설명·행동을 포함한 카드 | Card |
| 가로 목록 | ListRow |

 Card의 leading은 제목 옆이므로 런처의 수직 배치를 대체하지 않는다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `IconTile` | 런처 항목 표시 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

## 최소 사용 예

```tsx
// Web
import { IconTile } from "@hjmds/react/screens";
<IconTile icon={artwork} label={title} overlay={productBadge}
  onActivate={openItem} activationLabel={openLabel} />
```

```tsx
// Native
import { IconTile } from "@hjmds/react-native/screens";
<IconTile icon={artwork} label={title} overlay={productBadge}
  onActivate={openItem} activationLabel={openLabel}
  onLongPress={previewItem} activationHint={previewHint} />
```

```tsx
// Web·Native 같은 형태 — 격자 칸을 채우는 고정 크기 이미지 아트워크
<IconTile frame="none" size="fill" label={title} icon={({ edge }) => <ToolArtwork id={tool.id} size={edge} />} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| icon | `ReactNode` · `(artwork: IconTileArtwork) => ReactNode` | 필수 | 아이콘 원본. 함수면 그려질 아이콘 한 변 `artwork.edge`를 받는다(`fixed` 64, `fill`은 측정한 칸 크기 48~68). 고정 크기 이미지·생성 아트워크는 이 값으로 크기를 맞춘다(미게시, 1.31.0 이후) |
| label | string | 필수 | 제목 |
| onActivate · activationLabel · disabled | callback · string · boolean | 없음 · label · false | 미게시. 단순 항목 열기는 IconTile 자체의 버튼을 사용한다. 44 최소 대상/키보드/초점/비활성/누름 피드백을 HJM이 제공한다 |
| Native `onLongPress` · `activationHint` | callback · string | 없음 | 미게시. `onActivate`와 함께 길게 누르기 미리보기·메뉴를 연결한다. 비활성일 때 두 행동을 모두 막고 설명은 버튼의 접근성 hint로 전달한다. Web prop으로 제공하지 않는다 |
| layoutStyle | 배치 전용 style | 없음 | 정적 타일 또는 interactive 루트의 폭·외부 배치 |
| overlay | ReactNode | 없음 | 제품 배지 |
| labelLines | 1 또는 2 | 1 | 제목 줄 수 |
| ghost | boolean | false | 이동 대상 표시 |
| frame | `"surface"` · `"none"` | `"surface"` | 미게시(1.30.0 이후). `surface`는 공통 틀(`surfaceAlt` 채움 + 테두리 1), `none`은 틀을 그리지 않는다. 아이콘 원본이 이미 완성된 런처 아이콘(모양·배경 포함)일 때 `none` |
| shape | `"squircle"` · `"square"` · `"circle"` | `"squircle"` | 미게시. 틀(과 ghost 점선)의 모서리. 크기 대비 비율 `iconTileRecipe.shapes`(squircle 0.22 · square 0 · circle 0.5). 제품 아이콘 테마(아이폰 셸 squircle, Windows·Linux 셸 square)를 따른다 |
| size | `"fixed"` · `"fill"` | `"fixed"` | 미게시. `fixed`는 64×64, `fill`은 격자 칸 폭을 채우되 `fillMinSize` 48 ~ `fillMaxSize` 68 사이로 제한한 정사각형. 열 수·칸 폭은 host Grid가 정하고 제품이 칸 크기를 계산해 넘기지 않는다 |

`icon: ReactNode | ((artwork: IconTileArtwork) => ReactNode)`, `label: string`, `overlay?: ReactNode`, `labelLines?: 1 | 2`(기본1), `ghost?: boolean`(기본false). 두 줄은 런처 제목 높이44를 예약하고 ghost는 이동 대상의 점선/반투명 표현이다. 아이콘 64, 제목 최대 폭72, 간격6을 공유 recipe가 정한다. overlay는 아이콘 기준 배지를 위한 슬롯이며 넘침을 자르지 않는다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아이콘 64×64(radius 22%, `shape`에 따라 0%·50%), `size="fill"`이면 칸 폭 48~68 정사각형; 제목 최대 폭 72 · 두 줄이면 84와 최소 높이 44 | `iconTileRecipe` |
| 간격 | 아이콘과 제목 사이 6 | `iconTileRecipe.gap` |
| 순서·정렬 | 아이콘(overlay 포함) 위 → 제목 아래, 가로 가운데, 제목 가운데 정렬 | 양 renderer |
| 고정·스크롤 | Grid나 가상 목록의 host가 열 수·외부 여백·스크롤을 정한다 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 제목은 `labelLines`(1 또는 2)줄에서 말줄임, overlay는 잘리지 않는다 | 양 renderer |

아이콘 위·한 줄 말줄임 제목 아래로 중앙 정렬한다. HJM 내부 selector를 제품에서 덮지 않는다.

## 꼭 지킬 것

아이콘 원본과 제품 배지만 전달한다. 같은 배치를 별도 View/div로 다시 만들지 않는다.

- `size="fill"`의 이미지 아트워크는 `icon={({ edge }) => <Artwork size={edge} />}`로 그린다. 제품이 격자 폭에서 48~68 제한을 다시 계산해 넘기지 않는다. 측정 전 쪽 수·높이 추정처럼 타일 밖에서 크기가 필요하면 contracts `resolveIconTileFillEdge(칸 폭)`을 쓴다. 측정 전 첫 렌더의 `edge`는 `fillMinSize` 48이다(Web은 그리기 전에 측정한다).
- 완성된 아이콘 아트워크 위에 틀이 두 겹으로 그려지면 `frame="none"`, 아이콘 모양이 테마마다 다르면 `shape`, 칸 크기를 따라 커져야 하면 `size="fill"`을 쓴다. 이 이유로 런처 항목을 직접 만들지 않는다.

## 상태와 상호작용

`onActivate`가 없으면 표시 전용이며, 있으면 HJM이 버튼·누름 피드백·비활성을 소유한다.
Native의 길게 누르기 미리보기는 `onLongPress`에 제품 콜백을 연결한다. 별도 Pressable로 감싸지 않는다.
실제 끌기·재배열 같은 제품 제스처는 정적 타일을 기존 gesture host에 넣어 유지한다.

## 접근성

host에 전체 행동의 현지화 이름을 제공한다. 아이콘 내부 장식 이미지 중복 설명은 제품이 제거하며 의미 있는 제품 배지의 이름을 보존한다.

## 제품 연결

앱은 원본 이미지·이모지·제품 고유 인기 효과·배지 의미·navigation/drag를 연결한다.

## 관련 지침

[선택 기준](../SELECTION.md), [Grid](grid.md), [Card](card.md).

## 근거

- `frame`·`shape`·`size`: 2026-10-18 HJM 1.30.0 감사. 유틸버스 런처는 도구 아트워크가 완성된 아이콘(셸에 따라 iPhone squircle, Windows·Linux square)이고 크기가 격자를 따라 48~68로 변해, 고정 64 틀을 그리는 IconTile 대신 자체 타일을 유지했다. 범위 48~68은 그 런처의 실제 칸 계산값이다.
- `icon` 함수와 `resolveIconTileFillEdge`: 2026-10-18 HJM 1.32.0 감사. `size="fill"` 채택 뒤에도 유틸버스 런처는 도구 아트워크가 고정 크기 이미지라 격자 폭에서 48~68 제한을 다시 계산해(`ToolboxScreen` `size`) 아트워크에 넘겼다. 타일이 측정한 한 변을 아트워크에 넘겨 계산을 HJM 한 곳에 둔다.

### 단순 열기와 제품 제스처 host

2026-10-19 번뚝 공개 프로필에서 일반 Button의 face 여백과 label clipping이 64px 그림을 약26px 칸으로 좁혔다. 단순 열기는 `onActivate`로 연결하며 추가 Button/Pressable을 중첩하지 않는다. 내용에 별도 입력/링크/행동을 넣지 않는다. 접근성 이름은 잘리지 않은 label을 기본으로 쓰고 열기 같은 동사를 포함할 때 activationLabel을 공급한다. 읽기 전용 타일은 onActivate를 생략하면 기존 수동 표시를 유지한다. 실제 끌기·재배열 제스처의 런처 host는 정적 IconTile을 계속 사용한다.

2026-10-20 Utilverse는 길게 누르기 미리보기 때문에 별도 Pressable·누름 스프링·비활성 처리를 유지했다.
Native `onLongPress`·`activationHint`를 추가해 미리보기/열기/진동의 제품 콜백만 남기고 공통 누름 host를 재사용한다.
누름 표현은 `iconTileRecipe.activation`의 공통 opacity 피드백이며 앱별 spring/축소 값을 주입하지 않는다.

```tsx
<IconTile label={item.title} activationLabel={t("openItem", { title: item.title })}
  onActivate={() => open(item.id)} disabled={pending} icon={artwork} />
```

격자가 고정64 그림을 요청할 때는 Grid의 minColumnWidth를 iconTileRecipe.iconSize와 연결한다. 줄 수를 유지하려고 그림/제목을 일반 버튼 여백 안에서 자르지 않는다.
