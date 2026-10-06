# 서비스 소개

- 단계: 화면
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/web/src/patterns/Landing.stories.tsx`·`Landing.previews.tsx`, `showcase/native/src/Landing.stories.tsx`·`introduction-preview.tsx`, 변형 `showcase/*/reference-flow-previews.tsx`(`ServiceIntroduction`), `showcase/shared/landing-pattern.ts`, `showcase/native/src/pattern-status.tsx`, `packages/react/src/effect-surface.tsx`, `packages/react-native/src/effect-surface.tsx`. 2026-10-06 사용자 승인으로 실험 `서비스 소개/제품 체험 중심`(설명과 사례 중심 포함)을 배포하면서 같은 소개 목적의 배포 `화면/랜딩 화면`과 한 항목으로 합쳤다(Web id `patterns-landing` 보존, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/화면/소개/서비스 소개`

## 목적

제품을 처음 보는 사람에게 한 문장 가치 제안을 보여 주고 같은 화면에서 첫 행동(짧은 입력)을 체험하게 하는 소개 화면이다.
히어로 → 결과 미리보기 → 기능 소개 → 자주 묻는 질문 → 마지막 행동 순서의 세로 한 열이다. 가입·결제·후기·실적 수치는
이 화면에 없고 제품이 실제 근거와 함께 더한다.
스토리 `기본`이 이 랜딩이고, 같은 목적의 두 변형은 첫 구획 배치만 다르다: `제품 체험 중심`(히어로·행동과 제품 미리보기를 두 열로),
`설명과 사례 중심`(히어로를 먼저 한 열로 두고 설명과 미리보기를 두 열로). 변형은 아래 [변형](#변형-제품-체험-중심설명과-사례-중심) 절을 본다.

## 영역 구조

```text
좁은 폭(Native·모바일 Web) — 전체가 하나의 세로 스크롤, 하단 고정 영역 없음
┌ 상단 안전 영역(헤더 소유) ───────────────┐
│ 바깥 틀: 좌우 Container gutter            │
│   (폭 < 600 compact 16 · 이상 regular 20) │
│   Native 위아래 spacing.lg 20             │
│ ┌ ① 히어로 EffectSurface(mesh+grain) ──┐ │
│ │ (안쪽 여백 spacing.xl 24 — 제품이 줌) │ │
│ │ eyebrow  Text tone=muted             │ │  Stack gap lg 20
│ │ 제목     Heading level1 (h1)         │ │
│ │ 소개     Text as=p                   │ │
│ │ [ 첫 기록 써보기 ]  ← 주 행동(primary) │ │
│ └──────────────────────────────────────┘ │
│              ↕ spacing.xl 24             │
│ ┌ ② 미리보기 Surface padding lg 20 ────┐ │
│ │ Heading level2                       │ │  Stack gap md 16
│ │ (저장 직후) "추가했어요" status        │ │
│ │ List > ListRow 한 줄씩(최신이 위)     │ │
│ └──────────────────────────────────────┘ │
│ ③ 기능 Heading level2                    │
│ ┌ Surface padding lg ─┐ Heading level3 + Text (Stack gap sm 12)
│ └─────────────────────┘ × 3, 사이 24     │
│ ④ FAQ Heading level2                     │
│   ▸ 질문 1   Collapsible (트리거 최소 44) │
│   ▸ 질문 2                               │
│ ⑤ [ 첫 기록 써보기 ]  ← 같은 행동 반복     │  secondary
│   범위 안내 Text tone=muted              │
└ 하단: 고정 영역 없음, 내용이 스크롤 ─────┘

⑥ 입력 Sheet(주 행동을 누르면)
┌ 첫 기록을 남겨요 ─────────────── (닫기) ┐
│ (저장 실패면 Notice danger)             │  Stack gap lg 20
│ 오늘의 한 줄  [ TextField          ]    │
│               (비면 오류 문구)          │
│────────────────────────────────────────│
│ footer: [   미리보기에 추가   ] (고정)   │  ← 시트 주 행동
└ 하단 안전 영역(시트 소유) / Native는 키보드 위로 ┘
```

넓은 폭 Web도 한 열이다. 바깥은 [Container](../components/container.md) `size="content"`(`layout.contentMaxWidth` 1200)로
묶는다. 기능 카드 3개를 가로로 놓는 배치는 스토리에서 확인되지 않았다.

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web `main` > `Container size="content" gutter={gutter}` > `Stack gap="xl"`(문서 스크롤) · Native `ScrollView`(`contentContainerStyle={{ paddingVertical: spacing.lg }}`) > `Container size="content" gutter={gutter}` > `Stack gap="xl"` | 화면 전체, 스크롤. 위 안전 영역은 내비게이션 헤더(또는 [TopBar](../components/top-bar.md) `safeAreaTop`)가 맡고 헤더 없이 띄울 때만 제품이 감싼다. 아래 고정 영역은 없다. 바깥에는 입력이 없어 키보드 처리는 ⑥ 시트가 맡는다 | 좌우 gutter: 폭 600 미만 `compact` 16(`layout.pagePadding.compact`), 이상 `regular` 20([화면 여백](../tokens/layout.md)). Native 위아래 `spacing.lg` 20. 직계 요소 사이 `spacing.xl` 24(`layout.sectionGap`) |
| ① 히어로 | EffectSurface `descriptor={{ layers: ["mesh","grain"], active: false }}` > Stack `gap="lg"` > Text·Heading·Text·Button | 맨 위 | 요소 사이 `spacing.lg` 20. EffectSurface는 안쪽 여백이 없어 제품이 컨테이너에 `spacing.xl` 24를 준다(Web `className`, Native `style`) |
| ② 미리보기 | Surface `padding="lg"` > Stack `gap="md"` > Heading·상태 Text·List | 히어로 아래 | 안쪽 20, 요소 사이 `spacing.md` 16, 한 줄 행 최소 56(`layout.rowHeight.singleLine`). 새 기록이 맨 위 |
| ③ 기능 | Heading level2 + Surface `padding="lg"` ×3 > Stack `gap="sm"` | 미리보기 아래 | 카드 안 `spacing.sm` 12, 카드 사이 24 |
| ④ FAQ | Heading level2 + Collapsible × n | 기능 아래 | 트리거 최소 44(`control.minTouchTarget`), 트리거 위아래 `spacing.xs` 8(Web) |
| ⑤ 마지막 행동 | Button `secondary` + Text `tone="muted"` | 맨 아래 | 사이 24 |
| ⑥ 입력 | Sheet(Native `keyboardAvoidance` `scrollable`) > Stack `gap="lg"` > Notice(실패 때)·TextField, 제출은 `footer` | 오버레이, 화면 아래 | 시트 좌우 `spacing.lg` 20, TextField 높이 44(`control.fieldHeight`). 아래 안전 영역·키보드는 시트가 맡는다 |

### 변형: 제품 체험 중심·설명과 사례 중심

```text
ScreenLayout(제목 = 소개 문장, 최대 720, 바깥 padding spacing.md 16) — 본문 스크롤
├─ 제품 체험 중심:   [히어로·행동 | 제품 미리보기] → 특징 3열 → FAQ → 끝 행동 카드
└─ 설명과 사례 중심: 히어로·행동 → [설명 | 제품 미리보기] → 특징 3열 → FAQ → 끝 행동 카드
   [a | b] = Grid 두 열(열 최소 240), 좁은 폭·큰 글자에서 한 열로 접힌다
입력: Sheet(아래 고정 footer에 저장)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | ScreenLayout `title`(소개 문장) | route 본문, host가 남은 높이·safe area | 폭 최대 720, 바깥 padding `spacing.md` 16([ScreenLayout 배치](../components/screen-layout.md#배치)) |
| 내용 | Stack `gap="xl"` > Grid(`columns={{ compact: 2 }}`·`{{ compact: 3 }}`, `gap={{ compact: "xl" }}`, `minColumnWidth={{ compact: 240 }}`) | 위 순서 | 구획 사이 `spacing.xl` 24, 열 최소 240. 구획 제목은 Heading `level4`·`level5` |
| 끝 행동 | Surface `padding="lg"` > Stack `gap="md"` > Heading `level5` + Button primary | FAQ 아래 | 안쪽 20, 사이 16 |
| 입력 | Sheet > TextField, 저장은 `footer` | 오버레이 | 빈 입력이면 저장 비활성 |

## 버튼과 행동 위치

| 행동 | 컴포넌트·tone | 위치 | 개수·순서 |
| --- | --- | --- | --- |
| 주 행동(체험 시작) | Button 기본 primary, `medium` | ① 히어로 소개문 바로 아래 | 1 |
| 같은 행동 반복 | Button `secondary`, 같은 라벨·같은 동작 | ⑤ FAQ 다음 | 1. 큰 글자에서 히어로 행동이 첫 화면 밖으로 밀리므로 끝에 한 번 더 둔다 |
| FAQ 펼치기 | Collapsible 트리거 | ④ 각 질문 행 전체 | 질문마다 1 |
| 입력 제출 | Button 기본 primary | ⑥ Sheet `footer`(Web 끝 정렬, Native 꽉 찬 폭) | 1. 시트 안에서 따로 센다([Button](../components/button.md#꼭-지킬-것)) |
| 시트 닫기 | Sheet `closeLabel` | 시트 머리 끝 | 1. 저장 중에는 Sheet `busy`로 막는다 |
| 파괴 행동 | — | — | 없음 |

화면의 primary는 히어로 행동 하나다. 시트 `footer`의 제출은 시트 안에서 따로 센다.
두 변형은 히어로 행동과 끝 행동 카드의 버튼이 같은 Sheet를 연다(같은 행동 반복). FAQ는 Collapsible 대신 `selected` 토글 Button 하나로 답을 연다.

키보드: Native 시트는 `keyboardAvoidance`로 키보드 위에 붙고 `footer`가 키보드 위에 고정돼 제출 버튼이 가려지지 않는다.
바깥 ScrollView에는 입력이 없다.

## 상태

| 상태 | 화면 모습 | 행동 |
| --- | --- | --- |
| 기본 | ①~⑤, ②에 예시 한 줄 | 주 행동 |
| 로딩 | 스토리에 없음. 저장이 비동기면 `footer` 제출 Button `loading`, Sheet `busy`로 닫기를 막는다. 입력 값은 그대로 둔다 | 기다림 |
| 빈 | ②에 기록이 0개인 경우는 스토리에 없다. 예시 한 줄을 처음부터 넣어 미리보기가 비지 않게 한다 | — |
| 오류 | 입력 오류: ⑥ TextField `error`(`landing.error.empty`). 입력을 바꾸면 지워지고 시트는 닫히지 않는다. 저장 실패는 스토리에 없음. 시트 본문 맨 위에 [Notice](../components/notice.md) `tone="danger"`(Native `announcement="assertive"` — 기본 `none`), 문구는 원인별 키: 네트워크 `landing.error.offline`, 서버 `landing.error.server`. 입력 값과 ②의 이전 기록은 유지하고 시트를 닫지 않는다. 다시 시도는 같은 `footer` 제출 버튼이며, 또 실패하면 Notice를 같은 자리에 두고 `loading`·`busy`만 푼다 | 다시 입력 · 다시 제출 |
| 성공 | 시트가 닫히고 ② 맨 위에 새 행, "추가했어요" 상태 문구가 읽힌다 | — |
| FAQ 펼침 | 질문 아래에 답이 열린다(같은 자리 enter/exit 모션) | 다시 눌러 접기 |
| 제품 체험 중심 | `제품 체험 중심` 스토리: 히어로·행동과 제품 미리보기 두 열 → 특징 3열 → FAQ → 끝 행동 카드. 저장하면 미리보기가 방금 쓴 장면으로 바뀐다 | 히어로·끝 행동 = 같은 Sheet |
| 설명과 사례 중심 | `설명과 사례 중심` 스토리: 히어로·행동 한 열 → 설명과 미리보기 두 열 → 이하 같음 | 같은 Sheet |

## 사용하는 지침

| 지침 | 쓰는 곳 |
| --- | --- |
| [Container](../components/container.md) | 바깥 틀 폭·좌우 여백 |
| [화면 여백과 너비](../tokens/layout.md) | gutter 선택(`resolveWindowClass`) |
| [EffectSurface](../components/effect-surface.md) | ① 히어로 배경 장식 |
| [Heading](../components/heading.md) | 히어로 level1, 영역 제목 level2, 기능 카드 level3 |
| [Text](../components/text.md) | eyebrow·소개·범위 안내·상태 문구 |
| [Button](../components/button.md) | 주 행동, 반복 행동, 시트 제출 |
| [Surface](../components/surface.md) | ② 미리보기, ③ 기능 카드 |
| [List](../components/list.md) · [ListRow](../components/list-row.md) | ② 기록 목록 |
| [Collapsible](../components/collapsible.md) | ④ FAQ |
| [ScreenLayout](../components/screen-layout.md) · [Grid](../components/grid.md) | 변형의 바깥 틀 · 두 열 ↔ 한 열 |
| [Sheet](../components/sheet.md) | ⑥ 입력 |
| [Field](../components/field.md) | ⑥ `TextField` |
| [Notice](../components/notice.md) | ⑥ 저장 실패 |
| [Stack](../components/stack.md) | 모든 세로 리듬 |
| [간격](../tokens/spacing.md) | `spacing.sm`·`md`·`lg`·`xl` |

## 코드 골격

카피·기능 목록·FAQ·장식 seed는 제품 소유다. 오류 문구는 상태→키 상수 표로 고른다.

```tsx
// Web
import { Container, Stack, Surface, Text } from "@hjmds/react/layout";
import { Heading } from "@hjmds/react/heading";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { Notice } from "@hjmds/react/feedback";
import { Sheet } from "@hjmds/react/overlays";
import { Collapsible } from "@hjmds/react/collapsible";
import { EffectSurface } from "@hjmds/react/effect-surface";
import { List, ListRow } from "@hjmds/react/display";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

const failureKey = { offline: "landing.error.offline", server: "landing.error.server" } as const;
const gutter = resolveWindowClass(window.innerWidth) === "compact" ? "compact" : "regular";

<main><Container size="content" gutter={gutter}><Stack gap="xl">
  {/* landing-hero: padding: var(--hjm-space-xl) — EffectSurface는 안쪽 여백이 없다 */}
  <EffectSurface className="landing-hero" descriptor={{ layers: ["mesh", "grain"], seed: "landing", active: false }}>
    <Stack gap="lg">
      <Text tone="muted">{t("landing.eyebrow")}</Text>
      <Heading level="level1">{t("landing.title")}</Heading>
      <Text as="p">{t("landing.intro")}</Text>
      <Button onClick={start}>{t("landing.cta")}</Button>
    </Stack>
  </EffectSurface>
  <Surface padding="lg"><Stack gap="md">
    <Heading level="level2">{t("landing.preview")}</Heading>
    {saved ? <Text role="status">{t("landing.saved")}</Text> : null}
    <List label={t("landing.preview")}>{notes.map(n => <ListRow key={n.id} title={n.text} />)}</List>
  </Stack></Surface>
  <Heading level="level2">{t("landing.features")}</Heading>
  {features.map(f => <Surface key={f.id} padding="lg"><Stack gap="sm">
    <Heading level="level3">{t(f.titleKey)}</Heading><Text>{t(f.bodyKey)}</Text></Stack></Surface>)}
  <Heading level="level2">{t("landing.faq")}</Heading>
  {faqs.map(q => <Collapsible key={q.id} trigger={t(q.questionKey)}><Text>{t(q.answerKey)}</Text></Collapsible>)}
  <Button tone="secondary" onClick={start}>{t("landing.cta")}</Button>
  <Text tone="muted">{t("landing.scope")}</Text>
</Stack></Container>
  <Sheet title={t("landing.sheetTitle")} closeLabel={t("common.close")} open={open} onOpenChange={setOpen} busy={saving}
    footer={<Button loading={saving} onClick={submit}>{t("landing.submit")}</Button>}>
    <Stack gap="lg">
      {failure ? <Notice tone="danger" title={t(failureKey[failure])} /> : null}
      <TextField label={t("landing.field")} value={draft} onValueChange={v => { setDraft(v); setEmpty(false); }}
        {...(empty ? { error: t("landing.error.empty") } : {})} />
    </Stack>
  </Sheet>
</main>
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";
import { Container, Stack, Text } from "@hjmds/react-native/primitives";
import { Heading } from "@hjmds/react-native/heading";
import { Button } from "@hjmds/react-native/actions";
import { TextField } from "@hjmds/react-native/inputs";
import { Notice } from "@hjmds/react-native/feedback";
import { Sheet } from "@hjmds/react-native/overlays";
import { EffectSurface } from "@hjmds/react-native/effect-surface";

const failureKey = { offline: "landing.error.offline", server: "landing.error.server" } as const;
const { width } = useWindowDimensions();
const gutter = resolveWindowClass(width) === "compact" ? "compact" : "regular";

<ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
  <Container size="content" gutter={gutter}><Stack gap="xl">
    <EffectSurface style={{ padding: spacing.xl }} descriptor={{ layers: ["mesh", "grain"], seed: "landing", active: false }}>
      <Stack gap="lg">
        <Heading level="level1">{t("landing.title")}</Heading>
        <Text>{t("landing.intro")}</Text>
        <Button onPress={start}>{t("landing.cta")}</Button>
      </Stack>
    </EffectSurface>
    {/* 미리보기·기능·FAQ·반복 행동(secondary)·범위 안내: Web과 같은 순서, onPress */}
  </Stack></Container>
  <Sheet keyboardAvoidance scrollable busy={saving} title={t("landing.sheetTitle")} closeLabel={t("common.close")}
    open={open} onOpenChange={setOpen}
    footer={<Button fullWidth loading={saving} onPress={submit}>{t("landing.submit")}</Button>}>
    <Stack gap="lg">
      {failure ? <Notice tone="danger" announcement="assertive" title={t(failureKey[failure])} /> : null}
      <TextField label={t("landing.field")} value={draft} onValueChange={v => { setDraft(v); setEmpty(false); }}
        {...(empty ? { error: t("landing.error.empty") } : {})} />
    </Stack>
  </Sheet>
</ScrollView>
```

### 변형 코드

`제품 체험 중심` 골격이다. `설명과 사례 중심`은 히어로(`intro`)를 Grid 밖 맨 위에 두고 Grid 첫 칸에 설명(Heading `level4` + 본문)을 넣는다.

```tsx
// Web
import { Button } from "@hjmds/react/actions";
import { Heading } from "@hjmds/react/heading";
import { TextField } from "@hjmds/react/forms";
import { Grid, Stack, Surface, Text } from "@hjmds/react/layout";
import { Sheet } from "@hjmds/react/overlays";
import { ScreenLayout } from "@hjmds/react/screens";

<>
  <ScreenLayout title={t("intro.title")}>
    <Stack gap="xl">
      <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={{ compact: 240 }}>
        <Stack gap="lg">
          <Text tone="brand" variant="label">{t("intro.eyebrow")}</Text>
          <Text>{t("intro.lead")}</Text>
          <Button onClick={() => setOpen(true)}>{t("intro.start")}</Button>
        </Stack>
        {preview}
      </Grid>
      <Grid columns={{ compact: 3 }} gap={{ compact: "xl" }} minColumnWidth={{ compact: 240 }}>
        {features.map((item) => <Stack key={item.id} gap="sm"><Heading level="level5" semanticLevel={2}>{item.title}</Heading><Text>{item.body}</Text></Stack>)}
      </Grid>
      <Button tone="secondary" selected={faqOpen} onClick={toggleFaq}>{t("intro.faq.question")}</Button>
      {faqOpen ? <Text>{t("intro.faq.answer")}</Text> : null}
      <Surface padding="lg">
        <Stack gap="md">
          <Heading level="level5" semanticLevel={2}>{t("intro.closing")}</Heading>
          <Button onClick={() => setOpen(true)}>{t("intro.startAgain")}</Button>
        </Stack>
      </Surface>
    </Stack>
  </ScreenLayout>
  <Sheet open={open} onOpenChange={setOpen} title={t("intro.sheet.title")} closeLabel={t("common.close")}
    footer={<Button disabled={!draft.trim()} onClick={saveDraft}>{t("intro.sheet.save")}</Button>}>
    <TextField label={t("intro.sheet.field")} value={draft} onValueChange={setDraft} />
  </Sheet>
</>
```

```tsx
// Native
import { Button } from "@hjmds/react-native/actions";
import { Heading } from "@hjmds/react-native/heading";
import { TextField } from "@hjmds/react-native/inputs";
import { Grid, Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Sheet } from "@hjmds/react-native/overlays";
import { ScreenLayout } from "@hjmds/react-native/screens";

<>
  <ScreenLayout title={t("intro.title")}>
    <Stack gap="xl">
      <Grid columns={{ compact: 2 }} gap={{ compact: "xl" }} minColumnWidth={{ compact: 240 }}>
        <Stack gap="lg">
          <Text tone="brand" variant="label">{t("intro.eyebrow")}</Text>
          <Text>{t("intro.lead")}</Text>
          <Button onPress={() => setOpen(true)}>{t("intro.start")}</Button>
        </Stack>
        {preview}
      </Grid>
      <Grid columns={{ compact: 3 }} gap={{ compact: "xl" }} minColumnWidth={{ compact: 240 }}>
        {features.map((item) => <Stack key={item.id} gap="sm"><Heading level="level5">{item.title}</Heading><Text>{item.body}</Text></Stack>)}
      </Grid>
      <Button tone="secondary" selected={faqOpen} onPress={toggleFaq}>{t("intro.faq.question")}</Button>
      {faqOpen ? <Text>{t("intro.faq.answer")}</Text> : null}
      <Surface padding="lg">
        <Stack gap="md">
          <Heading level="level5">{t("intro.closing")}</Heading>
          <Button onPress={() => setOpen(true)}>{t("intro.startAgain")}</Button>
        </Stack>
      </Surface>
    </Stack>
  </ScreenLayout>
  <Sheet open={open} onOpenChange={setOpen} title={t("intro.sheet.title")} closeLabel={t("common.close")}
    footer={<Button disabled={!draft.trim()} onPress={saveDraft}>{t("intro.sheet.save")}</Button>}>
    <TextField label={t("intro.sheet.field")} value={draft} onValueChange={setDraft} />
  </Sheet>
</>
```

## 큰 글자·다크·좁은 폭

| 조건 | 바뀌는 것 |
| --- | --- |
| 큰 글자(`textScale` 2) | 제목·카드가 세로로 길어질 뿐 순서는 같다. 히어로 주 행동이 첫 화면 밖으로 밀릴 수 있어 ⑤의 반복 행동이 필요하다. 시트 본문이 길어져도 `footer` 제출은 고정이다 |
| 다크 | EffectSurface 배경은 테마 팔레트의 `bg`를 쓰고 장식 층이 그 위에 그려진다. 나머지는 테마 토큰 |
| 좁은 폭 | 한 열 그대로, 폭 600 미만은 gutter `compact` 16. 시트는 아래에 붙고 Native는 키보드 위로 올라간다 |
| 넓은 폭 Web | 한 열 유지, Container `content` 1200으로 폭을 묶고 gutter `regular` 20 |
| 모션 줄이기 | 스토리는 `active: false`로 장식 움직임을 끈다. Native는 `visible={false}`로 화면 밖 장식을 멈춘다 |
| 변형의 두 열 | 열 최소 240을 못 채우면(좁은 폭·큰 글자) Grid가 한 열로 접어 히어로 → 미리보기 순서로 읽힌다. Sheet `footer` 저장은 고정이다 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 바깥 스크롤 | 문서 스크롤 | `ScrollView`(위아래 `spacing.lg` 20), 좌우는 Container gutter |
| 시트 키보드 처리 | 브라우저가 처리 | `keyboardAvoidance` 명시 |
| 시트 본문 스크롤 | 자동 | `scrollable` 명시 |
| 시트 `footer` 버튼 | 끝 정렬 가로 줄 | 꽉 찬 폭 세로 열(`fullWidth`) |
| 저장 알림 | `role="status"` | 라이브 영역(Android) + iOS는 제품이 직접 알림. 문구가 새로 나타날 때 한 번 읽히게 한다(스토리 `PatternStatus announceOnMount`) |
| 실패 알림 | Notice가 자기 역할로 읽힌다 | Notice `announcement="assertive"` 명시(기본 `none`) |
| 히어로 안쪽 여백 | `className`으로 `var(--hjm-space-xl)` | `style`의 `padding: spacing.xl` |

## 함정

- 히어로는 Surface padding="xl"로 내부 여백을 갖고, 바깥 폭·gutter는 Container가 소유한다. 시트 저장은 footer에 둔다(2026-10-06 지침과 예제 정합성 수정).
- 위·아래 CTA는 동일 행동이다. 긴 스크롤 구간의 접근성을 위한 반복 primary 예외이며 서로 다른 주 행동을 허용하지 않는다.
- 미리보기 행은 번역 문구나 배열 위치 대신 생성 시 부여한 id로 유지한다.
- 변형 예제의 저장은 메모리에만 남고 Sheet를 닫아도 입력 초안이 남는다. 운영 저장·실패 처리는 위 오류 행 규칙을 따른다.
- 현재 변형 스토리는 FAQ를 Collapsible이 아니라 `selected` 토글 Button 하나로 그린다. 질문이 여럿이면 기본처럼 Collapsible을 쓴다.
