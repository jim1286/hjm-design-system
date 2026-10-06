# 앞면과 상세 정보 전환

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/stea-expression-previews.tsx`(`FlipInfoCard`), `showcase/native/src/stea-expression-previews.tsx`, `showcase/shared/stea-expressions.ts`(`flipCopy`), `src/content-transition.ts`, `src/card.ts`
- 스토리북: `배포/구성/정보 표시/앞면과 상세 정보 전환`

## 언제 쓰나

모임·상품처럼 한 카드에 요약(앞면)과 상세 항목(뒷면)이 있고, 사용자가 버튼 하나로 두 면을 오가게 할 때 쓴다.
3D 뒤집기 대신 같은 자리에서 `ContentTransition` `scale`로 내용을 바꾼다. 상세가 길거나 여러 묶음이면
[Collapsible](../components/collapsible.md)·[Accordion](../components/accordion.md)으로 펼치거나 상세 화면으로 이동한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `Card` | 제목("이번 주 모임")만 가진 틀 | [Card](../components/card.md) |
| `ContentTransition` `preset="scale"` | 앞면 ↔ 뒷면 전환, `stateKey`="front"/"back" | [ContentTransition](../components/content-transition.md) |
| 앞면 `Stack gap="xs"` + `Text` 3줄 | 이름(title strong), 요약, 메모(muted) | [Text](../components/text.md) |
| 뒷면 `DescriptionList` | 장소·준비물·인원·진행 항목 | [DescriptionList](../components/description-list.md) |
| `Button` `tone="secondary"` | "자세히 보기" ↔ "앞면 보기" 토글 | [Button](../components/button.md) |
| 면 알림 | Web `VisuallyHidden role="status"`, Native `announceForAccessibility` | [VisuallyHidden](../components/visually-hidden.md) |
| `Container` | 바깥 틀의 최대 폭·좌우 여백 | [Container](../components/container.md) |

## 배치

```text
바깥 틀: 스크롤(Web 문서, Native ScrollView 위아래 spacing.md 16) + Container gutter 16/20 · 최대 720

앞면                                      뒷면
┌ Card ─────────────────────────────┐     ┌ Card ─────────────────────────────┐
│ 이번 주 모임          (title)     │     │ 이번 주 모임                      │
│ ┌ 면 영역 ──────────────────────┐ │     │ ┌ 면 영역 ──────────────────────┐ │
│ │ 성수 북클럽   (title strong)  │ │     │ │ 장소    성수동 …              │ │
│ │ 10월 9일 목요일 저녁 7시      │ │     │ │ 준비물  읽은 부분까지 …       │ │
│ │ 이번 달 책은 … (muted)        │ │     │ │ 인원    8명 중 6명 …          │ │
│ └───────────────────────────────┘ │     │ │ 진행    …                     │ │
│          ↕ spacing.md 16          │     │ └───────────────────────────────┘ │
│ [        자세히 보기         ]    │     │ [         앞면 보기          ]    │ ← secondary, 같은 자리
└───────────────────────────────────┘     └───────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: `Container size="reading"`. Native: `ScrollView` → `Container` | 화면 본문, 카드는 스크롤과 함께 움직인다. 안전 영역은 화면 host(SafeArea·navigation header)가 준다. 입력이 없어 키보드 처리는 없다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우는 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 최대 폭 `layout.readingMaxWidth` 720 |
| 틀 | `Card` | 바깥 틀 안 | body padding `spacing.md` 16(`cardRecipe`) |
| 면 | `ContentTransition` 안 앞면 Stack 또는 DescriptionList | Card 제목 아래 | 앞면 줄 사이 `spacing.xs` 8, 면 높이는 내용에 따름 |
| 전환 버튼 | `Button` secondary | 면 아래, 전환되는 면 **밖**, 꽉 찬 폭(Stack 기본 stretch) | 높이 `control.buttonHeight.medium` 44, 면과 `spacing.md` 16 |

- 버튼은 두 면 모두에서 같은 자리(면 아래, 면 밖)에 둔다. 면 안에 두면 면이 바뀔 때 포커스한 버튼이 사라진다.
- 두 면의 높이가 다르면 버튼이 위아래로 움직인다. 면 높이를 고정하려면 제품 레이아웃에서 최소 높이를 준다(스토리는 고정하지 않는다).
- 전환 버튼은 보기 전환이라 primary가 아니라 secondary다([Button](../components/button.md)).

## 흐름과 상태

1. 앞면(요약)으로 열린다.
2. "자세히 보기"를 누르면 면이 `scale`(0.96 → 1, 투명도 0 → 1)로 뒷면 DescriptionList로 바뀌고 버튼 라벨이 "앞면 보기"가 된다.
3. 다시 누르면 앞면으로 돌아온다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 앞면: 이름·요약·메모 | — |
| 뒷면 | DescriptionList(이름 "모임 상세 정보") | 포커스는 버튼에 남는다. 바뀐 면을 Web 숨긴 status, Native announce로 알린다 |
| 진행 중 | — (면 전환은 이미 받은 데이터로 즉시 바뀐다. 카드 데이터를 불러오는 중이면 화면이 카드 자리에 [Skeleton](../components/skeleton.md)을 둔다) | — |
| 실패 | — (전환 자체는 실패하지 않는다. 카드 데이터 불러오기 실패는 화면이 카드 자리에 [Notice](../components/notice.md) + 다시 시도를 둔다) | — |
| 모션 감소 | 전환 없이 즉시 바뀐다(`ContentTransition`이 처리) | 같음 |

면→문구 키는 상수 표로 둔다(아래 `faceKey`). 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Card, DescriptionList } from "@hjmds/react/display";
import { Container, Stack, Text, VisuallyHidden } from "@hjmds/react/layout";

const faceKey = {
  front: { status: "meetup.showingFront", toggle: "meetup.showBack" },
  back: { status: "meetup.showingBack", toggle: "meetup.showFront" },
} as const;

<Container size="reading">
  <Card title={t("meetup.title")}>
    <Stack gap="md">
      <ContentTransition stateKey={face} preset="scale">
        {face === "back"
          ? <DescriptionList aria-label={t("meetup.details")} items={details} />
          : <Stack gap="xs">
              <Text variant="title" emphasis="strong">{meetup.name}</Text>
              <Text>{meetup.when}</Text>
              <Text tone="muted">{meetup.note}</Text>
            </Stack>}
      </ContentTransition>
      <VisuallyHidden role="status">{t(faceKey[face].status)}</VisuallyHidden>
      <Button tone="secondary" onClick={() => setFace(face === "back" ? "front" : "back")}>
        {t(faceKey[face].toggle)}
      </Button>
    </Stack>
  </Card>
</Container>
```

```tsx
// Native
import { AccessibilityInfo, ScrollView, useWindowDimensions } from "react-native";
import { Button } from "@hjmds/react-native/actions";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Card, DescriptionList } from "@hjmds/react-native/data-display";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";
const toggle = () => {
  const next = face === "back" ? "front" : "back";
  setFace(next);
  // iOS는 accessibilityLiveRegion을 무시하므로 바뀐 면을 직접 알린다.
  AccessibilityInfo.announceForAccessibility(t(faceKey[next].status));
};

<ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container size="reading" gutter={gutter}>
    <Card title={t("meetup.title")}>
      <Stack gap="md">
        <ContentTransition stateKey={face} preset="scale">
          {face === "back"
            ? <DescriptionList label={t("meetup.details")} descriptor={{ items: details }} />
            : <Stack gap="xs">
                <Text variant="title" emphasis="strong">{meetup.name}</Text>
                <Text>{meetup.when}</Text>
                <Text tone="muted">{meetup.note}</Text>
              </Stack>}
        </ContentTransition>
        <Button tone="secondary" onPress={toggle}>{t(faceKey[face].toggle)}</Button>
      </Stack>
    </Card>
  </Container>
</ScrollView>
```

`face`(`"front" | "back"`)·`setFace`와 모임 이름·일시·책·상세 항목은 제품 소유다. Native의 `faceKey`는 Web과 같은 상수 표다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 틀 | 문서 스크롤 + `Container` | `ScrollView`(위아래 `spacing.md`) + `Container` |
| `DescriptionList` 이름·항목 | `aria-label` + `items` | `label` + `descriptor={{ items }}` |
| 면 변경 알림 | `VisuallyHidden role="status"` | `AccessibilityInfo.announceForAccessibility`(iOS는 live region을 무시한다) |

## 함정

- 3D 회전으로 뒤집지 않고 `ContentTransition`으로 면을 바꾼다. 모션 감소 처리를 ContentTransition이 맡고, 한 번에 한 면만 마운트된다.
- 현재 스토리는 Web 면 알림을 `<span className="hjm-visually-hidden" role="status">`로 직접 그린다. 규칙은 공개 컴포넌트 [VisuallyHidden](../components/visually-hidden.md)이다.
- 현재 스토리는 면 문구를 `faceStatus(back)` 함수로 만든다. 제품은 i18n 키 상수 표(`faceKey`)로 둔다.
