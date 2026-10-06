# 시각 효과 모음

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [EffectSurface](../../effect-surface.md), [Avatar fallback](../../avatar-fallback.md), [Icon](../../icon.md), `showcase/shared/visual-foundations.ts`, `showcase/{web/src/patterns,native/src}/visual-previews.tsx`, `src/container.ts`, `packages/react/src/composition-style.ts`
- 스토리북: `배포/구성/비교와 검증/시각 효과 모음`

## 언제 쓰나

배경 질감, 의미 이름 아이콘, 사진 없는 프로필 얼굴, 문장 전환처럼 화면의 분위기를 더하는 선택 표현을 고를 때 이 모음을 본다.
네 스토리(배경 효과·의미별 루시드 아이콘·블로바타 표정·내용 전환 효과)가 각 표현의 선택지를 나란히 비교한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| EffectSurface | `mesh`·`glow`·`grain` 배경 층 위에 내용을 둔다 | [EffectSurface](../components/effect-surface.md) |
| Icon + `createLucideGlyph` | 의미 이름(`search`·`settings`·`notifications`·`back`)을 Lucide 그림에 연결 | [Icon](../components/icon.md) |
| Avatar + `createBlobatarFallback` | 사진이 없을 때 seed로 정해지는 얼굴, `expression: "happy"` | [Avatar](../components/avatar.md) |
| TextTransition | 문장이 바뀔 때 `fade`·`rise`·`slide`·`scale` 전환 | [TextTransition](../components/text-transition.md) |
| Heading | 효과 표면 안 제목, 얼굴 묶음 제목(`level2`) | [Heading](../components/heading.md) |
| Button | 효과 켜기(`selected`)·다음 장면 | [Button](../components/button.md) |
| `ScrollView` + `Container`(Native) | 바깥 틀. 세로 스크롤·위아래 여백, 좌우 gutter | [Container](../components/container.md), [화면 여백과 너비](../tokens/layout.md) |

비교 결과로 고르는 기준이다.

| 비교 | 선택지 | 고르는 기준 |
| --- | --- | --- |
| 배경 효과 | `mesh` / `glow` / `grain` / 셋 모두, `active` 켬·끔 | 히어로·빈 화면 배경 하나에만. 위 글자는 일반 대비 tone으로 둔다 |
| 의미별 아이콘 | 의미 이름 → 제품 아이콘 세트 | 컴포넌트에는 이름만 넘기고 그림은 제품이 `renderGlyph`로 연결 |
| 블로바타 표정 | 기본 / `happy` | 사진이 없을 때만. seed는 공개 제품 식별자 |
| 내용 전환 | `fade`(기본) / `rise` 12 / `slide` 16 / `scale` 0.96 | 같은 자리의 문장 교체는 `fade`, 단계가 넘어가면 `slide` |

## 배치

```text
Native 화면(ScrollView, 위아래 spacing.lg 20) > Container gutter 16(폭 < 600) · 20(폭 ≥ 600)
배경 효과 (Stack gap spacing.xl 24)
[ 배경 움직임 ]  ← selected 토글
┌──── EffectSurface (mesh) ────────────────────┐
│ 안쪽 여백 spacing.xl 24(두 플랫폼 같음)       │
│ mesh                (label)                   │
│ 작은 시작, 새로운 장면.  (Heading level2) ↕ lg 20 │
│ 설명 (body)                                   │
│ [ 이야기 시작하기 ]  secondary                │
└──────────────────────────────────────────────┘
┌──── EffectSurface (glow) ─── ... ────────────┐
┌──── EffectSurface (grain) ── ... ────────────┐
┌──── EffectSurface (mesh+glow+grain) ─────────┐

아이콘 / 얼굴 (행마다 가로, gap spacing.md 16)
(🔍) search          (☺)(☻) 이름
  고정 영역 없음. 안전 영역은 화면 골격이 맡는다
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: 제품 화면 레이아웃(문서 스크롤) > Stack. Native: `ScrollView` > `Container` > Stack | 이 구성은 바깥 폭·여백을 정하지 않는다. Native는 `ScrollView` 안 [Container](../components/container.md)에 둔다. 입력이 없어 키보드 처리는 없다. 안전 영역은 화면 골격(내비게이션 헤더·탭 바)이 맡는다 | Native ScrollView 위아래 `spacing.lg` 20, Container gutter 폭 600 미만 `compact` 16 · 이상 `regular` 20. 묶음 사이 Stack `gap="xl"` 24 |
| 효과 표면 | EffectSurface > 안쪽 틀 > Stack `gap="lg"` | 세로로 쌓음(비교용. 실제 화면은 히어로 하나) | EffectSurface는 여백이 없다. 안쪽 틀 여백 `spacing.xl` 24(두 플랫폼 같음, [랜딩](../screens/landing.md) 히어로와 같다), 내용 사이 `spacing.lg` 20, `intensity` 0.4(예) |
| 아이콘 행 | Icon `size="lg"` + Text | 가로(Stack `axis="inline"`) | 아이콘 `lg` 28, 사이 `spacing.md` 16 |
| 얼굴 행 | Avatar ×2 + Text | 가로(Stack `axis="inline"`) | 두 플랫폼 48(Web `size="large"`, Native `size={48}`), 사이 `spacing.md` 16 |
| 전환 | Text label + TextTransition | 세로 | 사이 `spacing.md` 16, 시간 `motion.normal` |

## 흐름과 상태

1. "배경 움직임"을 켜면 모든 EffectSurface `active`가 켜져 천천히 움직인다. 다시 누르면 멈춘다.
2. "다음 장면"을 누르면 네 preset의 문장이 동시에 다음 문장으로 바뀐다.

- 장면 문구 키는 순서 있는 상수 배열로 둔다(`sceneKeys[index]`). 번호로 키를 조립하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 효과 정지(`active` 기본 `false`) | 효과 층은 장식 |
| 진행 중 | — (요청이 없다). 문장 전환 중에는 이전 문장이 나가고 새 문장이 들어온다 | — |
| 실패 | — (요청이 없다). 프로필 사진이 없거나 로드에 실패하면 Avatar가 `renderFallback`(Blobatar)으로 바꾼다 | Avatar 이름이 읽힌다 |
| 움직임 켬 | 층이 `period` 주기(기본 12초)로 움직인다 | 토글 버튼 `selected` 상태로 알린다 |
| reduced motion | 효과·전환 모두 즉시·정지 | — |
| 사진 없음 | Blobatar 얼굴, 같은 seed는 같은 얼굴 | 그림은 장식, Avatar 이름이 읽힌다 |
| 다크 | 효과 색이 `primary`·`contentBrand`·`surfaceAccent` 테마 값을 따른다 | — |

## 코드 골격

```tsx
// Web
import { Search } from "lucide-react";
import { Button } from "@hjmds/react/actions";
import { TextTransition } from "@hjmds/react/content-transition";
import { Avatar, Icon } from "@hjmds/react/display";
import { createBlobatarFallback } from "@hjmds/react/avatar-blobatar";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { Heading } from "@hjmds/react/heading";
import { createLucideGlyph } from "@hjmds/react/icon-lucide";
import { Stack, Text } from "@hjmds/react/layout";

const glyph = createLucideGlyph({ search: Search });
const sceneKeys = ["intro.scene.welcome", "intro.scene.collect", "intro.scene.ready"] as const;

<Stack gap="xl">
  <EffectSurface descriptor={{ layers: ["mesh", "glow"], active, seed: "home-hero" }}>
    {/* EffectSurface는 여백이 없다. 안쪽 틀: .hero-inner { padding: var(--hjm-space-xl) } */}
    <div className="hero-inner">
      <Stack gap="lg">
        <Heading level="level2">{t("hero.title")}</Heading>
        <Text>{t("hero.body")}</Text>
        <Button tone="secondary" onClick={start}>{t("hero.start")}</Button>
      </Stack>
    </div>
  </EffectSurface>
  <Stack axis="inline" gap="md">
    <Icon name="search" size="lg" renderGlyph={glyph} />
    <Text>{t("icons.search")}</Text>
  </Stack>
  <Avatar name={user.name} size="large" renderFallback={createBlobatarFallback({ seed: user.publicId })} />
  <TextTransition preset="fade" text={t(sceneKeys[index])} />
</Stack>;
```

```tsx
// Native
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Search } from "lucide-react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Button } from "@hjmds/react-native/actions";
import { TextTransition } from "@hjmds/react-native/content-transition";
import { Avatar } from "@hjmds/react-native/data-display";
import { createBlobatarFallback } from "@hjmds/react-native/avatar-blobatar";
import { EffectSurface } from "@hjmds/react-native/effect-surface";
import { Heading } from "@hjmds/react-native/heading";
import { createLucideGlyph } from "@hjmds/react-native/icon-lucide";
import { Container, Icon, Stack, Text } from "@hjmds/react-native/primitives";

const glyph = createLucideGlyph({ search: Search });
const sceneKeys = ["intro.scene.welcome", "intro.scene.collect", "intro.scene.ready"] as const;
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container gutter={gutter}>
    <Stack gap="xl">
      <EffectSurface descriptor={{ layers: ["mesh", "glow"], active, seed: "home-hero" }} visible={isFocused}>
        {/* EffectSurface는 여백이 없다. 안쪽 틀만 View padding으로 준다 */}
        <View style={{ padding: spacing.xl }}>
          <Stack gap="lg">
            <Heading level="level2">{t("hero.title")}</Heading>
            <Text>{t("hero.body")}</Text>
            <Button tone="secondary" onPress={start}>{t("hero.start")}</Button>
          </Stack>
        </View>
      </EffectSurface>
      <Stack axis="inline" gap="md">
        <Icon descriptor={{ name: "search", size: "lg" }} renderGlyph={glyph} />
        <Text>{t("icons.search")}</Text>
      </Stack>
      <Avatar name={user.name} accessibilityLabel={user.name} size={48}
        renderFallback={createBlobatarFallback({ seed: user.publicId })} />
      <TextTransition preset="fade" text={t(sceneKeys[index])} />
    </Stack>
  </Container>
</ScrollView>;
```

seed·문구·아이콘 세트·얼굴 목록은 제품 소유다. `createBlobatarFallback`은 optional peer `blobatar@2.7.0`이 필요하다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 효과 표면 안쪽 틀 | `div` + CSS `padding: var(--hjm-space-xl)`(`layoutStyle`은 padding을 받지 않는다) | `View style={{ padding: spacing.xl }}` |
| Avatar 크기 | 이름 단계 `large` 48 | 숫자 pt `48` |
| 바깥 틀 | 제품 화면 레이아웃(문서 스크롤) | `ScrollView` > `Container` |
| 가려짐 알림 | 없음 | EffectSurface `visible`(화면 focus) |
| Icon 크기 지정 | `size` prop | `descriptor.size` |
| 표정 접근성 이름 | `name`에 넣음 | `accessibilityLabel` |

## 함정

- 움직이는 glow 위의 작은 글자를 브랜드 색으로 두면 대비가 4.5:1 아래로 떨어진다. 일반 본문 tone을 쓴다.
- Blobatar seed에 이름·이메일을 쓰지 않는다. 공개 제품 식별자를 쓴다.
- EffectSurface는 화면 위쪽 히어로 하나에만 둔다. 스토리의 네 장 세로 쌓기는 비교용이다.
- 2026-10-06 예제 검수에서 Container·Stack·Heading을 두 플랫폼에 맞췄다. 효과 안쪽 여백은 spacing.xxl(32), 얼굴은 64, 제목은 level2로 동일하다. 행은 큰 글자에서 줄바꿈한다.
- Native EffectSurface는 AppState·reducedMotion을 반영한다. 백그라운드 중단과 내비게이션으로 가려진 화면의 중단은 다르므로, 마운트된 채 가려지는 제품 화면·목록은 `visible`을 연결한다. Storybook 정지 화면만으로 이 제품 연결을 검증했다고 보고하지 않는다.
