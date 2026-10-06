# 카드 묶음과 긴 목록

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Masonry](../../masonry.md), [VirtualList](../../virtual-list.md), [QRCode](../../qr-code.md), `src/masonry.ts`, `src/qr-code-recipe.ts`, `src/foundations.ts`(`layout`), `showcase/web/src/patterns/DataLayouts.stories.tsx`, `showcase/native/src/data-layout-preview.tsx`
- 스토리북: `배포/구성/정보 표시/카드 묶음과 긴 목록`

## 언제 쓰나

많은 항목을 화면에 늘어놓을 방식을 고를 때 쓴다. 높이가 다른 카드는 Masonry, 수백 개 이상의 같은 높이 행은
VirtualList, 다른 기기로 넘길 링크는 QRCode다. 세 스토리(카드 묶음·가상 목록 예제·공유 코드)가 각각 하나를 보여 준다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Masonry | 높이가 다른 카드를 원래 순서대로 여러 열에 채운다 | [Masonry](../components/masonry.md) |
| VirtualList | 고정 높이 행을 보이는 범위만 그린다 | [VirtualList](../components/virtual-list.md) |
| QRCode | 링크를 QR로 보이고 대체 행동을 아래에 둔다 | [QRCode](../components/qr-code.md) |
| Button / 링크 | QR 대체 행동(Native Button, Web `<a>`) | [Button](../components/button.md), [Link](../components/link.md) |

고르는 기준이다.

| 상황 | 고를 것 | 고르지 않을 것 |
| --- | --- | --- |
| 카드 높이가 내용마다 다르고 개수가 수십 개 이하 | Masonry | 수백 개(전부 그린다) |
| 행 높이가 모두 같고 수백~수천 개 | VirtualList | 행 높이가 내용마다 다를 때 |
| 휴대폰 카메라로 링크를 넘김 | QRCode + 대체 행동 | 화면 안 이동(그냥 링크) |

## 배치

```text
카드 묶음 (Masonry, 2열)               가상 목록 (VirtualList)            공유 코드 (QRCode)
┌ 바깥 틀: 페이지 스크롤 ──────────┐   ┌ 바깥 틀: 스크롤 없음 ───────┐   ┌ 카드·시트 본문 ─┐
│←gutter→ Container ←gutter→      │   │←gutter→ Container           │   │  ▓▓ ▓ ▓▓▓       │
│ ┌──── width = Container 안쪽 ─┐  │   │ ┌──── height = 남은 높이 ─┐ │   │  ▓ ▓▓▓ ▓  192   │
│ │ ┌──────┐ 12 ┌──────┐        │  │   │ │ 항목 1        (64)      │ │   │  ▓▓▓ ▓ ▓▓       │
│ │ │ 1    │    │ 2    │        │  │   │ │ 항목 2        (64)      │ │   │ [공유 페이지 열기]│ ← 대체 행동
│ │ │      │    └──────┘        │  │   │ │ ... 보이는 행 + 앞뒤 3  │ │   └─────────────────┘
│ │ └──────┘    ┌──────┐        │  │   │ │      ↕ 목록 안 스크롤   │ │
│ │ ┌──────┐    │ 4    │        │  │   │ └─────────────────────────┘ │
│ │ │ 3    │    │      │        │  │   └─────────────────────────────┘
│ └─────────────────────────────┘  │
│ [ 더 보기 ] LoadMore (선택)      │
└──────────────────────────────────┘
  열 사이·행 사이 12(spacing.sm)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 카드 묶음: Web 문서 스크롤 > `Container`, Native `ScrollView` > `Container`. 가상 목록: `Container`만(바깥 세로 스크롤 없음). QR: 카드·시트 본문 | 제품 화면이 소유. 상단 안전 영역은 내비게이션 헤더가 맡는다 | 좌우 `Container gutter`: 폭 600 미만 `compact` 16, 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native ScrollView 위아래 `paddingVertical: spacing.lg` 20 |
| 카드 묶음 | Masonry | 본문 흐름 안, 페이지와 함께 스크롤 | `columns` 기본 2(600 이상에서 늘린다), `gap`은 숫자(기본 12 = `spacing.sm`), `width`는 Container 안쪽에 놓인 실제 호스트의 측정 폭 |
| 카드 | 제품 `renderItem` | 가장 짧은 열 아래 | 높이는 `getItemHeight`가 확정, 안쪽 여백 `spacing.sm` 12 |
| 다음 페이지 | [LoadMore](../components/load-more.md) | Masonry 다음 형제, 같은 스크롤 | LoadMore 기본 |
| 가상 목록 | VirtualList | 고정 높이 상자, 목록 안 스크롤 | `height`는 고정 머리·하단 바를 뺀 남은 높이(스토리 400), `rowHeight` 64(예), `overscan` 기본 3 |
| QR | QRCode | 감싸는 레이아웃이 배치 | `size` 기본 192(모듈 수 정수배로 내림), quiet zone 4모듈 |
| 대체 행동 | Button / 링크 | QR 바로 아래 | Button 높이 44 |

- VirtualList는 그 자체가 세로 스크롤이다. 페이지 스크롤·`ScrollView` 안에 넣지 않는다([VirtualList](../components/virtual-list.md)).
- Masonry는 스크롤을 갖지 않는다. 바깥 스크롤 안에 둔다.

## 흐름과 상태

1. 카드 묶음: 화면이 폭을 측정해 `width`로 넘기고, 각 항목 높이를 계산해 넘긴다. 읽기 순서는 열이 아니라 원래 순서다.
2. 가상 목록: 사용자가 목록 안에서 스크롤하면 보이는 범위와 앞뒤 `overscan` 행만 그린다.
3. 공유 코드: 카메라로 읽거나, 읽을 수 없으면 아래 대체 행동으로 같은 링크를 연다.
4. 데이터를 서버에서 받으면 첫 로드·다음 페이지의 진행·실패는 이 구성 바깥(제품 흐름·LoadMore)이 그린다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 각 구성이 항목을 보인다 | 각 컴포넌트 `label`이 목록·QR 이름이 된다 |
| 진행 중 | 첫 로드는 목록 자리에 제품이 [Skeleton](../components/skeleton.md)을 둔다(Masonry·VirtualList에 로딩 prop은 없다). 다음 페이지는 LoadMore `loading` | 포커스 이동 없음 |
| 실패 | 첫 로드 실패(네트워크·서버)는 목록 자리에 [Result](../components/result.md)·[Notice](../components/notice.md)와 다시 시도 버튼. 다음 페이지 실패는 LoadMore `error`(이미 받은 항목 유지, 재시도 버튼). 재시도도 실패하면 같은 `error`로 남는다 | Notice·LoadMore 알림, 포커스 이동 없음 |
| 빈 목록 | Masonry·VirtualList의 `empty` 내용 | — |
| 큰 글자 | 카드·행 높이가 그대로라 제품이 `getItemHeight`·`rowHeight`를 글자 배율에 맞춰 다시 계산한다 | — |

## 코드 골격

```tsx
// Web
import { Masonry } from "@hjmds/react/masonry";
import { VirtualList } from "@hjmds/react/virtual-list";
import { QRCode } from "@hjmds/react/qr-code";
import { Card } from "@hjmds/react/display";
import { Container, Text } from "@hjmds/react/layout";
import { spacing } from "@hjmds/design-contracts/foundations";

<Container size="content" gutter={gutter}>
  <Masonry items={cards} keyExtractor={(c) => c.id} width={measuredWidth} gap={spacing.sm} label={t("cards.label")}
    getItemHeight={(c, itemWidth) => measureCard(c, itemWidth)}
    renderItem={(c) => <Card title={c.title}>{c.body}</Card>} />
</Container>

<Container size="content" gutter={gutter}>
  <VirtualList items={rows} keyExtractor={(r) => r.id} renderItem={(r) => <Text>{r.label}</Text>}
    rowHeight={64} height={availableHeight} label={t("rows.label")} />
</Container>

<QRCode value={shareUrl} label={t("share.qr")} fallback={<a href={shareUrl}>{t("share.open")}</a>} />
```

```tsx
// Native
import { useState } from "react";
import { Linking, ScrollView, View, useWindowDimensions } from "react-native";
import { Masonry } from "@hjmds/react-native/masonry";
import { VirtualList } from "@hjmds/react-native/virtual-list";
import { QRCode } from "@hjmds/react-native/qr-code";
import { Button } from "@hjmds/react-native/actions";
import { Card } from "@hjmds/react-native/data-display";
import { Container, Text } from "@hjmds/react-native/primitives";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { width } = useWindowDimensions();
const [measuredWidth, setMeasuredWidth] = useState(0);
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="content" gutter={gutter}>
    <View onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}>
      {measuredWidth > spacing.sm ? <Masonry items={cards} keyExtractor={(c) => c.id} width={measuredWidth} gap={spacing.sm}
        label={t("cards.label")} getItemHeight={(c, itemWidth) => measureCard(c, itemWidth)}
        renderItem={(c) => <Card title={c.title}>{c.body}</Card>} /> : null}
    </View>
  </Container>
</ScrollView>

<Container size="content" gutter={gutter}>{/* ScrollView로 감싸지 않는다 */}
  <VirtualList items={rows} keyExtractor={(r) => r.id} renderItem={(r) => <Text>{r.label}</Text>}
    rowHeight={64} height={availableHeight} label={t("rows.label")} />
</Container>

<QRCode value={shareUrl} label={t("share.qr")}
  fallback={<Button onPress={() => void Linking.openURL(shareUrl)}>{t("share.open")}</Button>} />
```

스토리의 1000개 예시 행, 카드 높이 공식(`80 + id % 3 × 40`), 예시 URL은 제품 데이터로 바꾼다. 2026-10-06 검수에서 고정 320(Web)·창 폭 − 32(Native)가 좁은 슬롯과 넓은 창의 Container 제한을 무시하는 것을 확인했다. 예제도 ResizeObserver/onLayout으로 실제 호스트 폭을 측정하고 측정 전에는 Masonry를 그리지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 폭 측정 | ResizeObserver 등 | 실제 호스트의 `onLayout` |
| 바깥 스크롤 | 문서 스크롤 | Masonry는 `ScrollView` 안, VirtualList(`FlatList`)는 바깥 없이 |
| QR 대체 행동 | `<a href>` | Button + `Linking.openURL` |
| 카드 여백 | `var(--hjm-space-sm)` | `spacing.sm` |

## 함정

- Masonry `width`를 측정 전 0으로 넘기면 `TypeError`다. 측정이 끝난 뒤 그린다.
- Masonry `gap`은 토큰 이름이 아니라 숫자다(`gap={spacing.sm}`). `gap="sm"`은 타입 오류다.
- QR 색은 recipe가 검정/흰색으로 고정한다. 다크 테마에서도 브랜드 색으로 바꾸지 않는다.
- 카드 표면은 `Surface bordered padding="sm"`, 행 텍스트는 `Text`를 재사용한다. 가상 목록 바깥에 세로 ScrollView를 추가하지 않는다.
