# 외부 디자인 시스템 gap 분석 — 2026-08-31

## 조사 범위

HJM 0.8.2의 기존 91개 catalog 항목과 아래 공식 component inventory를 대조했다.

- [Radix Primitives](https://www.radix-ui.com/primitives/docs/components)
- [React Aria](https://react-spectrum.adobe.com/react-aria/getting-started.html)
- [Chakra UI](https://chakra-ui.com/docs/components/concepts/overview)
- [Material UI](https://mui.com/material-ui/all-components/)
- [Mantine](https://mantine.dev/core/package/)
- [Carbon](https://carbondesignsystem.com/components/overview/components/)
- [Tamagui](https://tamagui.dev/ui/intro/1.0.0)

빈 이름을 그대로 복사하지 않고 다음 기준으로 평가했다.

1. HJM의 기존 컴포넌트 조합으로 의미가 이미 완결되는가
2. Web/RN에서 같은 사용자 문제로 번역되는가
3. 제품 고유 콘텐츠·포맷·navigation을 침범하지 않는가
4. 접근성 또는 layout 오류를 중앙에서 줄이는가
5. 작은 public surface로 장기간 유지 가능한가

## 채택

### Container

MUI와 Mantine은 centered max-width + gutter를 독립 layout primitive로 제공하고 Chakra도
같은 역할을 core inventory에 둔다. HJM에는 `Layout.main`의 암묵적 max-width만 있어
온보딩·설정·상세 페이지가 shell 없이 같은 폭을 재사용할 수 없었다.

HJM은 임의 px prop을 열지 않고 `reading | content | full`과 token gutter만 공개한다.
Web은 logical inline margin/padding, Native는 centered `View`와 maxWidth로 번역한다.

### AspectRatio

Radix, Chakra, Mantine, Carbon에서 반복되는 media geometry primitive다. 이미지·동영상·지도
자체를 소유하지 않고 레이아웃 이동을 막는 비율만 소유하므로 HJM 경계와 잘 맞는다.

HJM은 `square | portrait | landscape | wide`와 양의 custom ratio를 허용한다. crop,
`object-fit`, alt text, playback은 자식 또는 제품이 소유한다.

### VisuallyHidden

Chakra는 독립 component로, React Aria는 전용 accessibility package로 제공한다. 아이콘이나
압축된 상태에 추가 문맥을 제공할 때 매번 잘못된 clip CSS를 복제하는 문제를 줄인다.

Web에서만 제공한다. Native는 invisible text node가 읽기 순서를 왜곡할 수 있으므로 host
control의 `accessibilityLabel`/`accessibilityHint`가 canonical 번역이다.

## 이번에 채택하지 않음

- `Kbd`, `Code`, `Blockquote`: 제품·문서 콘텐츠 표현이며 HJM의 상호작용 계약이 없다.
- `ScrollArea`: Web custom scrollbar와 Native `ScrollView`는 같은 public 의미가 아니고,
  기본 host scrolling을 감싸는 것만으로는 결함이 줄지 않는다.
- `Toolbar`, `Menubar`, `ContextMenu`: desktop keyboard model과 실제 제품 vertical slice가
  먼저 필요하다.
- `Heading`: `Section`과 semantic heading level, `Text` typography가 이미 책임을 나눠 가진다.
- `ProgressCircle`: 새 컴포넌트보다 기존 `Progress`의 presentation axis인지 먼저 검증해야 한다.
- `Popover`, `DataTable`, `SidePanel`, `CommandPalette`: 계약은 이미 준비되어 있다. 제품
  vertical slice가 확인되면 planned → beta로 올리며 별도 새 catalog 항목은 만들지 않는다.

## 후속 검토

분기마다 외부 inventory 전체를 다시 복사하지 않는다. 실제 제품에서 두 번 이상 반복된
문제를 먼저 기록하고, 이 문서의 기준으로 기존 조합과 새 primitive를 비교한다.
