# FloatingActionButton 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [FloatingActionButton](../floating-action-button.md), recipe `floatingActionButtonRecipe`(`src/floating-action-button.ts`)

## 언제 쓰나

목록·피드처럼 스크롤되는 콘텐츠 위에 떠 있는 **단일 생성 행동**(새 기록 추가, 새 글 작성)에 쓴다.
스크롤 방향에 따라 알약(라벨 보임)과 원(아이콘만)으로 접히지만 같은 버튼 인스턴스를 유지한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면의 결론이 되는 하단 고정 주 행동 | [BottomCTA](bottom-cta.md) ([판정](../floating-action-button.md#bottomcta와-겹치지-않는다-판정)) |
| 콘텐츠 안의 일반 행동 | [Button](button.md), [IconButton](icon-button.md) |
| 하단 탭 가운데의 생성 버튼 | [BottomNavigation](bottom-navigation.md) 옆에 Button/IconButton 합성 |
| 비활성·로딩 상태가 필요한 행동 | [Button](button.md) (FAB는 `disabled`·`loading`이 없다) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `FloatingActionButton` | `@hjmds/react`, `/floating-action-button` | `@hjmds/react-native`, `/floating-action-button` | 기본 |
| `useFloatingActionButtonScroll` | `/floating-action-button` | `/floating-action-button` | 스크롤로 `layoutMode` 결정 |
| `resolveFloatingActionButtonContentClearance` | `/floating-action-button` | `/floating-action-button` | 첫 하단 여백 계산 |

## 최소 사용 예

```tsx
// Web
import { FloatingActionButton, useFloatingActionButtonScroll } from "@hjmds/react/floating-action-button";

const layoutMode = useFloatingActionButtonScroll(); // window 스크롤. 컨테이너면 element, 마운트 전엔 null
const [clearance, setClearance] = useState(0);

<ul style={{ paddingBottom: clearance }}>{items}</ul>
<FloatingActionButton
  descriptor={{ icon: { name: "add" }, label: t("memo.new"), layoutMode }}
  renderIcon={({ name, size, color }) => <ProductIcon name={name} size={size} color={color} />}
  onContentClearanceChange={setClearance}
  onClick={openComposer}
/>
```

```tsx
// Native
import { FloatingActionButton, useFloatingActionButtonScroll } from "@hjmds/react-native/floating-action-button";

const { layoutMode, onScroll } = useFloatingActionButtonScroll();
const [clearance, setClearance] = useState(0);

<View style={{ flex: 1 }}>
  <FlatList data={items} renderItem={renderItem} onScroll={onScroll} contentContainerStyle={{ paddingBottom: clearance }} />
  <FloatingActionButton
    descriptor={{ icon: { name: "add" }, label: t("memo.new"), layoutMode }}
    renderIcon={({ name, size, color }) => <ProductIcon name={name} size={size} color={color} />}
    safeAreaBottomInset={insets.bottom}
    onContentClearanceChange={setClearance}
    onPress={openComposer}
  />
</View>
```

## 축과 기본값

- `descriptor.layoutMode`: `expanded`(기본) · `collapsed`. 직접 고르지 말고 `useFloatingActionButtonScroll` 결과를 넘긴다.
- `descriptor.label`은 필수다. `collapsed`에서도 접근성 이름은 항상 전체 `label`이다.
- `descriptor.icon`은 `name`만 받는다(`size`·`tone`·접근성 이름은 넣을 수 없다). 아이콘은 항상 장식이다.
- `safeAreaBottomInset` 기본 `0`. 톤·크기·모양은 `primary`·`large`·`pill`로 고정이고 prop이 없다.

## 꼭 지킬 것

- `onContentClearanceChange`가 준 값을 스크롤 콘텐츠 하단 padding에 반드시 적용한다. 큰 글자에서
  라벨이 여러 줄이 되면 값이 커진다. 지름만 예약하면 마지막 항목을 가린다.
- 스크롤 콘텐츠 **뒤**의 sibling으로 둔다. 목록 항목 안에 넣지 않는다.
- 라벨은 i18n 키로 넣는다. 아이콘 그림은 제품 아이콘 시스템이 `renderIcon`으로 그린다(HJM은 name·size·color만 준다).
- 한 화면에 FAB는 하나만 둔다. 모서리 위치는 바꿀 수 없다(논리적 끝 쪽 하단, RTL은 왼쪽).

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 이벤트 | `onClick` | `onPress` |
| 위치 | CSS(`.hjm-fab`) | positioned 부모 안 `absolute` |
| 스크롤 hook | `useFloatingActionButtonScroll(target?)` → `layoutMode` | `useFloatingActionButtonScroll()` → `{ layoutMode, onScroll }` |
| 여백 측정 | `ResizeObserver`·`resize` | `onLayout` |
| 그 밖의 prop | `id`, `className`, `onFocus`, `onBlur` | `testID`, `onFocus`, `onBlur` |
| ref | `HTMLButtonElement` | `View` |

## 함정

- 모드마다 Button과 IconButton을 바꿔 끼우면 focus와 ref를 잃는다. 이 컴포넌트 하나로 접고 편다.
- Native `safeAreaBottomInset`은 OS 하단 inset만이다. 화면 안 도구막대 높이는 제품이 따로 더한다.
