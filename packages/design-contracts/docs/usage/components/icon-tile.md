# IconTile

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-16
- 근거: `src/screen-patterns.ts`의 `iconTileRecipe`
- 스토리북: 별도 예제 미등록

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
<button type="button" onClick={openItem} aria-label={openLabel}>
  <IconTile icon={artwork} label={title} overlay={productBadge} />
</button>
```

```tsx
// Native
import { IconTile } from "@hjmds/react-native/screens";
<Pressable accessibilityLabel={openLabel} onPress={openItem}>
  <IconTile icon={artwork} label={title} overlay={productBadge} />
</Pressable>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| icon | ReactNode | 필수 | 아이콘 원본 |
| label | string | 필수 | 제목 |
| overlay | ReactNode | 없음 | 제품 배지 |
| labelLines | 1 또는 2 | 1 | 제목 줄 수 |
| ghost | boolean | false | 이동 대상 표시 |
| frame | `"surface"` · `"none"` | `"surface"` | 미게시(1.30.0 이후). `surface`는 공통 틀(`surfaceAlt` 채움 + 테두리 1), `none`은 틀을 그리지 않는다. 아이콘 원본이 이미 완성된 런처 아이콘(모양·배경 포함)일 때 `none` |
| shape | `"squircle"` · `"square"` · `"circle"` | `"squircle"` | 미게시. 틀(과 ghost 점선)의 모서리. 크기 대비 비율 `iconTileRecipe.shapes`(squircle 0.22 · square 0 · circle 0.5). 제품 아이콘 테마(아이폰 셸 squircle, Windows·Linux 셸 square)를 따른다 |
| size | `"fixed"` · `"fill"` | `"fixed"` | 미게시. `fixed`는 64×64, `fill`은 격자 칸 폭을 채우되 `fillMinSize` 48 ~ `fillMaxSize` 68 사이로 제한한 정사각형. 열 수·칸 폭은 host Grid가 정하고 제품이 칸 크기를 계산해 넘기지 않는다 |

`icon: ReactNode`, `label: string`, `overlay?: ReactNode`, `labelLines?: 1 | 2`(기본1), `ghost?: boolean`(기본false). 두 줄은 런처 제목 높이44를 예약하고 ghost는 이동 대상의 점선/반투명 표현이다. 아이콘 64, 제목 최대 폭72, 간격6을 공유 recipe가 정한다. overlay는 아이콘 기준 배지를 위한 슬롯이며 넘침을 자르지 않는다.

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

- 완성된 아이콘 아트워크 위에 틀이 두 겹으로 그려지면 `frame="none"`, 아이콘 모양이 테마마다 다르면 `shape`, 칸 크기를 따라 커져야 하면 `size="fill"`을 쓴다. 이 이유로 런처 항목을 직접 만들지 않는다.

## 상태와 상호작용

이 구성은 표시 전용이다. 링크/버튼/드래그 host가 disabled·포커스·키보드·길게 누르기와 라우팅을 소유하므로 기존 앱의 drag engine을 교체하지 않는다.

## 접근성

host에 전체 행동의 현지화 이름을 제공한다. 아이콘 내부 장식 이미지 중복 설명은 제품이 제거하며 의미 있는 제품 배지의 이름을 보존한다.

## 제품 연결

앱은 원본 이미지·이모지·제품 고유 인기 효과·배지 의미·navigation/drag를 연결한다.

## 관련 지침

[선택 기준](../SELECTION.md), [Grid](grid.md), [Card](card.md).

## 근거

- `frame`·`shape`·`size`: 2026-10-18 HJM 1.30.0 감사. 유틸버스 런처는 도구 아트워크가 완성된 아이콘(셸에 따라 iPhone squircle, Windows·Linux square)이고 크기가 격자를 따라 48~68로 변해, 고정 64 틀을 그리는 IconTile 대신 자체 타일을 유지했다. 범위 48~68은 그 런처의 실제 칸 계산값이다.
