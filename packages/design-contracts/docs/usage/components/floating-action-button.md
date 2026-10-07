# FloatingActionButton

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [FloatingActionButton](../../floating-action-button.md), recipe `floatingActionButtonRecipe`(`src/floating-action-button.ts`)
- 스토리북: `배포/컴포넌트/동작/플로팅 실행 버튼`

## 언제 쓰나

목록·피드처럼 스크롤되는 콘텐츠 위에 떠 있는 **단일 생성 행동**(새 기록 추가, 새 글 작성)에 쓴다.
스크롤 방향에 따라 알약(라벨 보임)과 원(아이콘만)으로 접히지만 같은 버튼 인스턴스를 유지한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 화면의 결론이 되는 하단 고정 주 행동 | [BottomCTA](bottom-cta.md) ([판정](../../floating-action-button.md#bottomcta와-겹치지-않는다-판정)) |
| 콘텐츠 안의 일반 행동 | [Button](button.md), [IconButton](icon-button.md) |
| 하단 탭 가운데의 생성 버튼 | [BottomNavigation](bottom-navigation.md) 옆에 Button/IconButton 합성 |
| 비활성·로딩 상태가 필요한 행동 | [Button](button.md) (FAB는 `disabled`·`loading`이 없다) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `FloatingActionButton` | 기본 | `@hjmds/react`, `/floating-action-button` | `@hjmds/react-native`, `/floating-action-button` |
| `useFloatingActionButtonScroll` | 보조 — 스크롤로 `layoutMode` 결정 | `/floating-action-button` | `/floating-action-button` |
| `resolveFloatingActionButtonContentClearance` | 보조 — 첫 하단 여백 계산 | `/floating-action-button` | `/floating-action-button` |

## 최소 사용 예

```tsx
// Web
import { useState } from "react";
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
import { useState } from "react";
import { FlatList, View } from "react-native";
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

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor.layoutMode` | `expanded` · `collapsed` | `expanded` | 직접 고르지 말고 `useFloatingActionButtonScroll` 결과를 넘긴다 |
| `descriptor.label` | 문구(필수) | — | `collapsed`에서도 접근성 이름은 항상 전체 `label`이다 |
| `descriptor.icon` | `{ name }` | — | `name`만 받는다(`size`·`tone`·접근성 이름은 넣을 수 없다). 아이콘은 항상 장식이다 |
| `safeAreaBottomInset` | 0 이상 숫자 | `0` | — |
| `renderIcon` | `(icon: { name: string; size: number; color: string; decorative: true }) => ReactNode` | 필수 | 제품 아이콘 시스템으로 그린다 |
| `onContentClearanceChange` | `(clearance: number) => void` | 필수 | 스크롤 콘텐츠 하단 padding으로 쓴다. 큰 글자·inset이 바뀌면 다시 불린다 |
| Web `onClick` · Native `onPress` | Button의 같은 이벤트 | — | — |

- 톤·크기·모양은 `primary`·`large`·`pill`로 고정이고 prop이 없다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 높이·지름 52(IconButton `large`). `expanded`는 알약(아이콘 + 라벨, 라벨 좌우 여백 `spacing.lg` 20), `collapsed`는 지름 52 원이다. 최대 폭은 화면 폭 − 32(여백 양쪽)다 | `floating-action-button.ts` `floatingActionButtonRecipe`, `styles.css` `.hjm-fab` |
| 간격 | 가장자리 여백 `spacing.md`(16). 하단 거리는 16 + 하단 안전 영역이다(Web은 `safeAreaBottomInset`과 `env(safe-area-inset-bottom)` 중 큰 값, Native는 `safeAreaBottomInset`). 스크롤 콘텐츠 하단에 `onContentClearanceChange` 값을 padding으로 둔다. 기본값은 52 + 16×2 + 하단 inset(= 84 + inset)이다 | `floating-action-button.ts` `resolveFloatingActionButtonContentClearance`, `styles.css` `.hjm-fab`, `react-native/src/floating-action-button.tsx` |
| 순서·정렬 | 위치는 스크롤 영역의 **논리적 끝 쪽 하단 모서리**로 고정이다(RTL은 왼쪽) | `styles.css` `.hjm-fab`, `react-native/src/floating-action-button.tsx` |
| 고정·스크롤 | Web은 `position: fixed`(z-index `layer.sticky` 100)로 창에 붙는다. Native는 positioned 부모(`flex: 1` View) 안에서 `absolute`다. [BottomNavigation](bottom-navigation.md)·도구막대 위에 띄울 때는 그 높이를 `safeAreaBottomInset`에 더한다(Native는 제품이 더한다) | `styles.css` `.hjm-fab`, `react-native/src/floating-action-button.tsx` |
| 좁은 폭·큰 글자 | 큰 글자로 라벨이 여러 줄이 되면 clearance 값이 커진다 | `react-native/src/floating-action-button.tsx` |

```text
┌────────────────────────────┐
│ TopBar (고정)               │
├────────────────────────────┤
│ 목록 (스크롤)                │
│ ...                         │
│ 마지막 항목                  │
│ ← padding-bottom = clearance│
│                ┌──────────┐ │
│                │ + 새 기록 │ │ ← FAB expanded(52, primary pill)
│                └──────────┘ │    끝 여백 16
│                          16 │
├────────────────────────────┤
│ 안전 영역                    │
└────────────────────────────┘
스크롤해 내려가면 (+) 지름 52 원으로 접힌다.
```

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
| 배치 prop | 없음(`layoutStyle`을 받지 않는다. 위치는 CSS가 소유) | 없음(`layoutStyle`·`style` 없음) |

## 함정

- 모드마다 Button과 IconButton을 바꿔 끼우면 focus와 ref를 잃는다. 이 컴포넌트 하나로 접고 편다.
- Native `safeAreaBottomInset`은 OS 하단 inset만이다. 화면 안 도구막대 높이는 제품이 따로 더한다.


### 테마의 깊이 상속

2026-10-07 테마 소비 감사에서 FAB만 recipe의 고정 그림자를 읽어 같은 화면의
카드·오버레이·하단 행동과 깊이가 달랐다. 가까운 Provider의 designProfile이 있으면
`tokens.shadow.floating`을 읽는다. 모양은 기존 원·pill을 유지하고 프로필 모서리로 바꾸지 않는다.
프로필 없는 기존 소비자는 같은 recipe 그림자/elevation을 유지한다.
Native에서 opacity0은 Android elevation도0으로 해석한다. 제품은 각 FAB에 그림자 prop을
넣지 않고 루트 프로필을 한 번 주입한다. 클릭·접힘·접근성 이름·safe area·clearance는 그대로다.
