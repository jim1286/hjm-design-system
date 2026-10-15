# IconTile

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.25.0 이후)
- 검토일: 2026-10-15
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
| IconTile | 런처 항목 표시 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

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

`icon: ReactNode`, `label: string`, `overlay?: ReactNode`, `labelLines?: 1 | 2`(기본1), `ghost?: boolean`(기본false). 두 줄은 런처 제목 높이44를 예약하고 ghost는 이동 대상의 점선/반투명 표현이다. 아이콘 64, 제목 최대 폭72, 간격6을 공유 recipe가 정한다. overlay는 아이콘 기준 배지를 위한 슬롯이며 넘침을 자르지 않는다.

## 배치

아이콘 위·한 줄 말줄임 제목 아래로 중앙 정렬한다. Grid나 가상 목록의 host가 열 수와 외부 여백을 정한다. HJM 내부 selector를 제품에서 덮지 않는다.

## 꼭 지킬 것

아이콘 원본과 제품 배지만 전달한다. 같은 배치를 별도 View/div로 다시 만들지 않는다.

## 상태와 상호작용

이 구성은 표시 전용이다. 링크/버튼/드래그 host가 disabled·포커스·키보드·길게 누르기와 라우팅을 소유하므로 기존 앱의 drag engine을 교체하지 않는다.

## 접근성

host에 전체 행동의 현지화 이름을 제공한다. 아이콘 내부 장식 이미지 중복 설명은 제품이 제거하며 의미 있는 제품 배지의 이름을 보존한다.

## 제품 연결

앱은 원본 이미지·이모지·제품 고유 인기 효과·배지 의미·navigation/drag를 연결한다.

## 관련 지침

[선택 기준](../SELECTION.md), [Grid](grid.md), [Card](card.md).
