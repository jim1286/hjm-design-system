# 끌기·밀기·화면 전환

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [Optional interaction adapters](../../../../../docs/interaction-adapters.md), `src/interaction-adapters.ts`, `showcase/web/src/patterns/InteractionAdapters.stories.tsx`, `showcase/native/src/InteractionAdapters.stories.tsx`. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/드래그·스와이프·모션`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/직접 조작과 모션/끌기·밀기·화면 전환`

## 언제 쓰나

순서 바꾸기·행 작업·내용 전환·카드 넘기기·달성 축하·카드 확대 화면 전환 같은 선택형 상호작용 어댑터를 한 화면에서 함께 쓸 때, 각 어댑터를 어디에 놓고 무엇으로 감싸야 하는지 확인하는 구성이다.

스토리는 2026-10-06 사용자 승인으로 스토리북 배포됐다. 어댑터 API 자체의 성숙도는 따로다: `sortable`·`swipe-actions`·`content-transition`·`carousel-motion`·`celebration`은
Web·Native stable, Native `screen-transition`은 experimental이다. 각 어댑터는 root에서 재노출되지 않고 subpath로만 import하며, 제품에 해당 peer를 설치해야 한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| `SortableCollection` | 짧은 한 열 목록의 순서 바꾸기. 드래그 + 앞/뒤 버튼 경로 | [SortableCollection](../components/sortable-collection.md) |
| `SwipeActions` | 행 작업(보관·삭제). Native는 스와이프로 버튼을 드러내기만 하고 실행은 버튼으로 | [SwipeActions](../components/swipe-actions.md) |
| `ContentTransition`·`TextTransition` | 상태가 바뀔 때 내용·문장 전체를 페이드 | [ContentTransition](../components/content-transition.md), [TextTransition](../components/text-transition.md) |
| `CarouselMotion` | 카드 넘기기. 이전/다음 버튼, 반복·자동 재생 없음 | [Carousel](../components/carousel.md) |
| `Celebration` | 제품이 확인한 성공 뒤 입자 효과(장식) | [Celebration](../components/celebration.md) |
| `createHjmTransitionStack`·`SharedTransitionElement`·`SharedTransitionScreen`·`useSharedTransitionOptions` | Native 전용: 목록 카드 → 상세 화면 확대 전환 | [SharedTransitionScreen](../components/shared-transition-screen.md), [SharedTransitionElement](../components/shared-transition-element.md) |
| `Button`·`Text` | 상태 변경 트리거, 결과 문구 | [Button](../components/button.md), [Text](../components/text.md) |

## 배치

```text
Native(전체 화면 host)                    Web(문서 흐름)
┌ GestureHandlerRootView ─────────────┐  ┌ Container size="reading" ────┐
│ ░ 상단 안전 영역(insets.top) ░      │  │ Section 즐겨찾기 순서        │
├─────────────────────────────────────┤  │  ⠿ 숲길    [앞][뒤]          │
│ ScrollView  위아래 spacing.md 16    │  │  ⠿ 바닷가  [앞][뒤]          │
│ └ Container gutter 16/20            │  │ ↕ sectionGap 24               │
│   Section 즐겨찾기 순서             │  │ Section 목록 작업             │
│    ⠿ 숲길      [앞][뒤]  행 높이 ≥44│  │  ListRow  [보관][삭제]       │ ← 버튼 상시 노출
│    ⠿ 바닷가    [앞][뒤]             │  │  결과 문구(status)           │
│   ↕ sectionGap 24                   │  │ Section 내용 전환             │
│   Section 목록 작업                 │  │  [다음 상태] / 전환되는 제목 │
│   ┌ ListRow ← 스와이프 ──[보관][삭제]┐│  │ Section 카드 탐색             │
│   └ [작업 보기] 상시 버튼 ─────────┘│  │  [ 카드 ] [이전][다음]       │
│    결과 문구(live region)           │  │ Section 목표 달성             │
│   Section 내용 전환 / 카드 / 축하   │  │  [기록 달성 축하] + 결과 문구│
│ ░ 하단 안전 영역(insets.bottom) ░   │  │  (canvas 입자)               │
├─────────────────────────────────────┤  └──────────────────────────────┘
│ Celebration: 스크롤 밖 화면 오버레이│ ← 터치·접근성 트리에 안 들어감
└─────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Native: `GestureHandlerRootView` → `ScrollView` → `Container` → `Stack gap="xl"`. Web: `Container size="reading"` → `Stack gap="xl"` | 화면 루트. Native host가 상·하 안전 영역을 padding으로 받고, 스크롤은 `ScrollView` 하나. 텍스트 입력이 없어 키보드 처리는 없다 | Native `ScrollView` 위아래 `spacing.md` 16, 좌우는 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). Web 최대 폭 `layout.readingMaxWidth` 720. 구획 사이 `layout.sectionGap` 24(`Stack gap="xl"`) |
| 구획 제목 | [Section](../components/section.md) `title` | 각 어댑터 묶음 위 | 제목과 본문 사이 `spacing.xs` 8(`sectionRecipe`) |
| 순서 목록 | `SortableCollection` | 본문, 스크롤 | Native 행 padding·간격 `spacing.xs` 8, 손잡이 줄 최소 높이 44. Web 손잡이 44×44, 행 위아래 `spacing.xs` 8 |
| 행 작업 | `SwipeActions` + [ListRow](../components/list-row.md) | 목록 행 | 행 높이·여백은 `ListRow`(한 줄 56), 작업 버튼 높이 44·간격 `spacing.xs` 8 |
| 결과 문구 | `Text`(Web `role="status"`, Native `accessibilityLiveRegion`) | 작업·축하 바로 아래 | 구획 안 간격은 Section이 정한다 |
| 내용 전환 | `ContentTransition`·`TextTransition` | 바뀌는 내용 자리 | 크기 변화 없음(전환은 투명도·짧은 이동만) |
| 카드 | `CarouselMotion` | 본문 | Native는 `onLayout`으로 잰 폭 × 제품이 정한 높이, Web은 부모 폭 |
| 축하 | `Celebration` | Native: 스크롤 **밖** 화면 오버레이(host의 형제), Web: 자체 canvas | 입자 32/64개, 1.6/2.4초(`celebrationRecipe`) |

- Native `Celebration`을 스크롤 내용 안에 두면 화면 밖에서 시작해 보이지 않는다(기기 QA 확인). 항상 화면 host의 형제로 둔다.
- `SwipeActions`는 Web에서 버튼을 바로 보이고, Native에서 스와이프·상시 "작업 보기" 버튼·동작 줄이기 모두 같은 버튼을 드러낸다. 목록 전체가 `openRowId` 하나를 공유한다.
- 카드 높이·색·이미지는 제품 소유다. 카드 안 제목은 [Heading](../components/heading.md)으로 둔다.

근거: `packages/react-native/src/sortable.tsx`, `packages/react/src/sortable.tsx`, `packages/react-native/src/swipe-actions.tsx`, `src/interaction-adapters.ts`(`celebrationRecipe`), `src/foundations.ts`(`layout`)

## 흐름과 상태

1. 순서: 손잡이를 길게 눌러 끌거나(Native)·스페이스로 잡아 화살표로 옮기거나(Web)·앞/뒤 버튼을 누른다. `onCommit(intent)`의 `orderedIds`를 제품이 먼저 화면에 반영하고 저장한다. 저장·되돌리기는 제품 소유다(`onCommit`은 `void`를 돌려받는다).
2. 행 작업: Native는 스와이프 또는 "작업 보기"로 버튼을 드러내고 버튼을 눌러 실행한다. 스와이프만으로 삭제하지 않는다. `onAction`이 던지거나 reject하면 `onError`로 받는다.
3. 내용 전환: 상태 키가 바뀌면 이전 내용은 바로 사라지고 새 내용이 들어온다. 접근성 트리에는 하나만 있다.
4. 카드: 이전/다음 버튼이나 스와이프로 옮기고, `onCurrentKeyChange`를 제품 state에 반영한다.
5. 축하: 제품이 성공을 확인한 뒤 새 `eventId`로 한 번 재생한다. 의미는 결과 문구가 전한다.
6. 화면 전환(Native): 목록 카드와 상세의 `SharedTransitionElement id`를 같게 두고 이동한다. back·제스처 취소는 navigation이 처리한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 순서 목록·행·카드가 정지 상태로 보이고, 결과 문구는 안내 문구(`note.hint`) | — |
| 진행 중 | 순서 이동 중에는 잡은 행이 따라 움직인다. 순서 저장 중에는 `disabled`, 행 작업 중에는 `busy`로 같은 작업의 중복 실행을 막는다(`onAction`이 끝날 때까지 두 번째 행동도 받지 않는다) | `labels.dragStart`·`position`·`dragCancel` 알림(제품 문구), Web 그룹 `aria-busy` |
| 실패 | 순서 저장 실패: 제품이 이전 `items`로 되돌리고 실패 문구. 행 작업 실패: `onError` → 실패 문구(`note.actionFailed`), 행은 그대로 남는다. 다시 누르면 같은 작업을 재요청하고, 재요청도 실패하면 같은 문구를 다시 알린다 | 결과 문구 알림(Web `role="status"`, Native live region) |
| 동작 줄이기 | Native 드래그 끔(앞/뒤 버튼 유지), 스와이프 끔(버튼 노출), 전환·카드는 즉시 이동, 입자 없음 | 의미는 문구로 유지 |
| 앱 백그라운드 | Native 드래그 취소, 전환·입자 정지 | — |

상태→문구 키는 상수 표로 둔다(`const noteStatusKey = { idle: "note.hint", failed: "note.actionFailed", archived: "note.archived" } as const`). 템플릿 문자열 키는 키 추출·누락 검사가 찾지 못한다.

## 코드 골격

```tsx
// Web
import { Container, Section, Stack, Text } from "@hjmds/react/layout";
import { ListRow } from "@hjmds/react/display";
import { Heading } from "@hjmds/react/heading";
import { SortableCollection } from "@hjmds/react/sortable";
import { SwipeActions } from "@hjmds/react/swipe-actions";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Celebration } from "@hjmds/react/celebration";

const noteStatusKey = { idle: "note.hint", failed: "note.actionFailed", archived: "note.archived" } as const;
const recordKey = { start: "record.start", ready: "record.ready" } as const;

<Container size="reading">
  <Stack gap="xl">
    <Section title={t("fav.title")}>
      <SortableCollection items={items} label={t("fav.label")} labels={sortLabels} disabled={savingOrder}
        renderItem={(item) => <strong>{item.label}</strong>} onCommit={(intent) => void commitOrder(intent.orderedIds)} />
    </Section>
    <Section title={t("note.title")}>
      <SwipeActions label={t("note.actions")} actions={[{ id: "archive", label: t("note.archive") }]} busy={busy}
        onAction={runAction} onError={() => setNoteStatus("failed")}>
        <ListRow title={note.title} />
      </SwipeActions>
      <Text as="p" role="status">{t(noteStatusKey[noteStatus])}</Text>
    </Section>
    <ContentTransition stateKey={record}>
      <Heading level="level4" semanticLevel={3}>{t(recordKey[record])}</Heading>
    </ContentTransition>
  </Stack>
  {eventId ? <Celebration eventId={eventId} /> : null}
</Container>
```

```tsx
// Native
import { ScrollView, View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Container, Section, Stack, Text } from "@hjmds/react-native/primitives";
import { ListRow } from "@hjmds/react-native/data-display";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { SortableCollection } from "@hjmds/react-native/sortable";
import { SwipeActions } from "@hjmds/react-native/swipe-actions";
import { CarouselMotion } from "@hjmds/react-native/carousel-motion";
import { Celebration } from "@hjmds/react-native/celebration";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const { spacing } = useHjmNativeTheme().tokens;
const insets = useSafeAreaInsets();
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<GestureHandlerRootView style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
  <ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
    <Container gutter={gutter}>
      <Stack gap="xl">
        <Section title={t("fav.title")}>
          <SortableCollection items={items} label={t("fav.label")} labels={sortLabels} disabled={savingOrder}
            renderItem={() => null} onCommit={(intent) => void commitOrder(intent.orderedIds)} />
        </Section>
        <Section title={t("note.title")}>
          <SwipeActions rowId={note.id} label={note.title} actionsLabel={t("note.showActions")}
            openRowId={openRow} onOpenRowChange={setOpenRow} busy={busy}
            actions={[{ id: "archive", label: t("note.archive") }]} onAction={runAction} onError={() => setNoteStatus("failed")}>
            <ListRow title={note.title} />
          </SwipeActions>
          <Text accessibilityLiveRegion="polite">{t(noteStatusKey[noteStatus])}</Text>
        </Section>
        <View onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}>
          <CarouselMotion width={cardWidth} height={cardHeight} slides={slides} currentKey={slideKey} onCurrentKeyChange={setSlideKey}
            label={t("places.label")} previousLabel={t("places.previous")} nextLabel={t("places.next")} renderSlide={renderCard} />
        </View>
      </Stack>
    </Container>
  </ScrollView>
  {eventId ? <Celebration eventId={eventId} /> : null}{/* 스크롤 밖 */}
</GestureHandlerRootView>
```

`sortLabels`·`commitOrder`·`runAction`·카드 내용·높이·색은 제품 소유다. 스토리의 Unsplash 이미지·장소 이름은 예시다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 순서 이동 엔진 | `@dnd-kit/react` 0.5.0, 키보드(스페이스·화살표·Escape) | `react-native-sortables` 1.10.1, 길게 눌러 끌기 + 조절 접근성 행동 |
| 행 작업 | 버튼 상시 노출 | 스와이프로 드러냄 + 상시 "작업 보기", `rowId`·`openRowId`·`actionsLabel` 필수 |
| 카드 크기 | 부모 폭 | 측정한 `width`·`height` 필수 |
| 축하 위치 | 자체 canvas | 스크롤 밖 화면 오버레이, Skia 필요 |
| 화면 전환 | 없음(제품 라우터) | `screen-transition`(experimental, React Navigation 7.4.1 + exports patch) |
| 제스처 host | — | 화면 루트 `GestureHandlerRootView` |

## 함정

- Native `SortableCollection`은 손잡이 줄에 `item.label`을 이미 그린다. `renderItem`은 `() => null`로 두거나 보조 정보만 그린다.
- Native 화면 전환은 현재 포트폴리오 Expo 앱(expo-router, React Navigation 미사용)에서 바로 쓸 수 없다. exports patch를 제품 패키지 관리자에 등록해야 한다.
- 어댑터 peer 없이 subpath를 import하면 자동 대체 없이 기기 Metro 번들이 실패한다.
- 예제는 Heading·Container·Stack·ListRow를 사용한다. 플랫폼별 드래그/스와이프 host는 유지하고 동일한 배치 역할을 재사용한다.
- Native 결과 문구는 iOS 알림을 포함한 `PatternStatus` 예제 helper로 표시한다. 제품은 showcase 파일을 import하지 말고 제품 알림 계층에 연결한다.
