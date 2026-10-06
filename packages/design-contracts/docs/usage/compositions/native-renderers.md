# 네이티브 컴포넌트 기기 확인

- 단계: 구성
- 상태: 배포
- 지원: Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `showcase/native/src/NativeRenderers.stories.tsx`, `showcase/native/src/story-registry.ts` `nativeRendererStoryGroups`
- 스토리북: `배포/구성/비교와 검증/네이티브 컴포넌트 기기 확인`

## 언제 쓰나

Native 공개 컴포넌트가 실제 기기·시뮬레이터에서 그려지고 눌리는지 범주별로 한 화면에서 확인할 때 쓴다. 화면 설계의 본보기가 아니라
렌더 확인용 모음이다. 여기서 범주를 찾은 뒤 배치·문구 규칙은 각 컴포넌트 지침에서 가져온다.

## 구성 요소

여덟 스토리가 아래 범주를 하나씩 그린다. 달력·떠 있는 버튼·데이터 배치·생각 구슬은 이 모음이 아니라 각자의 스토리에 있다.

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| 디자인 기초 | Provider·글자·표면·레이아웃·아이콘·제목, 로그인 화면 골격 | [DesignSystemProvider](../components/design-system-provider.md), [Text](../components/text.md), [Surface](../components/surface.md), [Stack](../components/stack.md), [Container](../components/container.md), [AspectRatio](../components/aspect-ratio.md), [Grid](../components/grid.md), [Layout](../components/layout.md), [Icon](../components/icon.md), [Section](../components/section.md), [Divider](../components/divider.md), [Top](../components/top.md), [Heading](../components/heading.md), [AuthScreenLayout](../components/auth-screen-layout.md) |
| 동작 | 버튼·링크·하단 고정 행동·소셜 로그인 버튼 | [Button](../components/button.md), [IconButton](../components/icon-button.md), [Link](../components/link.md), [BottomCTA](../components/bottom-cta.md), [AuthProviderButton](../components/auth-provider-button.md) |
| 약관 동의 | 전체 동의·필수/선택 항목·상세 보기 | [Agreement](../components/agreement.md) |
| 입력 | 텍스트·숫자·날짜·파일·선택 입력 | [Field](../components/field.md), [SearchField](../components/search-field.md), [TextArea](../components/text-area.md), [PasswordField](../components/password-field.md), [OtpField](../components/otp-field.md), [NumberField](../components/number-field.md), [Slider](../components/slider.md), [Form](../components/form.md), [DatePicker](../components/date-picker.md), [FilePicker](../components/file-picker.md), [Checkbox](../components/checkbox.md), [Radio](../components/radio.md), [CheckboxGroup](../components/checkbox-group.md), [RadioGroup](../components/radio-group.md), [Switch](../components/switch.md), [SegmentedControl](../components/segmented-control.md), [Select](../components/select.md), [Combobox](../components/combobox.md), [Chip](../components/chip.md), [ToggleGroup](../components/toggle-group.md), [TagsInput](../components/tags-input.md), [DateRangePicker](../components/date-range-picker.md), [Mentions](../components/mentions.md), [TransferList](../components/transfer-list.md) |
| 탐색 | 상단 막대·탭·단계·메뉴·하단 탭·더 보기 | [Tabs](../components/tabs.md), [Steps](../components/steps.md), [TopBar](../components/top-bar.md), [Menu](../components/menu.md), [BottomNavigation](../components/bottom-navigation.md), [LoadMore](../components/load-more.md) |
| 데이터 표시 | 목록·카드·배지·수치·미디어 | [Badge](../components/badge.md), [Avatar](../components/avatar.md), [Card](../components/card.md), [ListRow](../components/list-row.md), [Tag](../components/tag.md), [Timeline](../components/timeline.md), [DescriptionList](../components/description-list.md), [Image](../components/image.md), [CounterBadge](../components/counter-badge.md), [List](../components/list.md), [Carousel](../components/carousel.md), [Statistic](../components/statistic.md), [UploadItem](../components/upload-item.md), [Accordion](../components/accordion.md), [Collapsible](../components/collapsible.md), [Asset](../components/asset.md) |
| 상태와 알림 | 빈 상태·결과·알림·진행·토스트 | [EmptyState](../components/empty-state.md), [Result](../components/result.md), [Notice](../components/notice.md), [Progress](../components/progress.md), [Skeleton](../components/skeleton.md), [Spinner](../components/spinner.md), [Toast](../components/toast.md), [BottomInfo](../components/bottom-info.md) |
| 오버레이 | 대화상자·확인 대화상자·하단 시트 | [Dialog](../components/dialog.md), [AlertDialog](../components/alert-dialog.md), [Sheet](../components/sheet.md) |

## 배치

```text
┌──────── 안전 영역 안(제품 화면 host) ────┐
│ ScrollView  위아래 spacing.md 16         │ ← 스크롤 영역, 탭 유지(handled)
│ └ Container gutter 16/20                 │
│   Section 범주 제목 (header 역할)        │
│   설명                                   │
│   ↕ contentGap 16 (Stack gap="md")       │
│   컴포넌트 A                             │
│   컴포넌트 B                             │
│   ...  공개 import 순서대로 세로로 쌓음   │
│   오버레이 트리거 → 열면 화면 위에 뜬다   │
└──────────────────────────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | `ScrollView keyboardShouldPersistTaps="handled"` → `Container` → `Section` | 화면 전체. 안전 영역은 제품 화면 host(또는 Provider `safeAreaInsets`)가 소유한다. 입력 범주는 키보드가 필드를 가리지 않게 `automaticallyAdjustKeyboardInsets`를 주거나, keyboard-controller가 있는 앱은 [KeyboardFormScrollView](../components/keyboard-form-scroll-view.md)로 바꾼다 | `ScrollView` 위아래 `spacing.md` 16, 좌우 `Container` `gutter`(폭 600 미만 `compact` 16, 이상 `regular` 20). 범주를 여럿 이으면 범주 사이 `layout.sectionGap` 24(`Stack gap="xl"`) |
| 범주 제목 | [Section](../components/section.md) `title`·`description` | 맨 위 | 제목과 본문 사이 `spacing.xs` 8, 제목과 설명 사이 `spacing.xxs` 4(`sectionRecipe`) |
| 컴포넌트 | 범주의 공개 컴포넌트, `Stack gap="md"` | 제목 아래 세로 | 요소 사이 `layout.contentGap` 16. 각 컴포넌트는 기본 크기 그대로 |
| 오버레이 | Dialog·AlertDialog·Sheet | 트리거를 누르면 화면 위 | 각 recipe |

## 흐름과 상태

1. 범주 스토리를 연다.
2. 각 컴포넌트를 눌러 보고, 아래 "Last action"·"Pressed" 같은 상태 문구로 이벤트가 왔는지 확인한다.
3. 같은 범주를 어두운 테마·큰 글자 전역 설정으로 다시 본다.
4. 문제가 있으면 해당 컴포넌트 지침과 계약에서 원인을 찾는다. 이 모음에서 배치를 베끼지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 범주의 컴포넌트가 기본 축으로 그려진다 | 키보드가 열려도 탭이 먹힌다(`handled`) |
| 진행 중 | 업로드 64%(UploadItem `uploading`·Progress), LoadMore 불러오기, AuthScreenLayout `pendingLabel`(카드 크기를 유지한 가운데 로딩) 같은 예시 상태 | 각 컴포넌트 지침의 진행 알림 |
| 실패 | — (렌더 확인 모음이라 네트워크 요청이 없다). 실패 표현은 상태와 알림 범주의 Result·Notice로 확인하고, 실제 실패·재시도 흐름은 [저장과 재시도](action-recovery-save.md) 같은 구성 지침을 따른다 | — |
| 비활성 | 동작 범주의 `disabled` Button | — |
| 다크·큰 글자 | 전역 설정으로 같은 화면을 다시 확인 | — |

## 코드 골격

```tsx
// Web
// 없음. Web은 각 컴포넌트 스토리(`배포/컴포넌트/...`)에서 확인한다.
```

```tsx
// Native
import { ScrollView, useWindowDimensions } from "react-native";
import { Container, Section, Stack } from "@hjmds/react-native/primitives";
import { useHjmNativeTheme } from "@hjmds/react-native/provider";
import { resolveWindowClass } from "@hjmds/design-contracts/responsive";

// 제품의 개발용 확인 화면에서 범주 하나를 같은 틀로 모을 때
const { spacing } = useHjmNativeTheme().tokens;
const gutter = resolveWindowClass(useWindowDimensions().width) === "compact" ? "compact" : "regular";

<ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
  contentContainerStyle={{ paddingVertical: spacing.md }}>
  <Container gutter={gutter}>
    <Section title={t("dev.inputs.title")} description={t("dev.inputs.description")}>
      <Stack gap="md">
        {/* 범주의 컴포넌트를 공개 import에서 가져와 순서대로 둔다 */}
      </Stack>
    </Section>
  </Container>
</ScrollView>
```

스토리의 영어 예시 문구, `Glyph`(첫 글자 아이콘), 직접 만든 입력의 `#667085` 테두리는 확인용이며 제품에 가져오지 않는다.

## 함정

- 이 모음의 순서·간격은 확인용이다. 실제 화면은 화면 지침과 각 구성 지침의 배치를 따른다.
- 구획 제목은 Heading으로 표시한다. 이전 Text heading 예제는 2026-10-06 제목 의미 구조를 맞추면서 수정했다.
- 스토리의 직접 만든 입력 스타일(`#667085`, radius 12)은 토큰이 아니다. 제품 코드에 숫자로 옮기지 않는다.
- StoryFrame은 Container compact·Stack md와 위아래 spacing.md를 사용하며 `automaticallyAdjustKeyboardInsets`를 켠다. Android 키보드 회피·큰 입력 폼은 해당 제품 기기에서 별도로 확인한다.
