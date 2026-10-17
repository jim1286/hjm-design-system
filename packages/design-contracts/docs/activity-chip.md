# Activity chip

검토일: 2026-10-17 · 제공 확인: 1.26.1(설치된 Web·Native 공개 타입 기준, 최초 출시 버전 아님)

2026-10-10 사용자 요청("칩이랑 패널 디자인시스템에 넣고 구성에 칩 누르면 나오게 하자 … 칩은 있으면 다른 이름으로
새로 만들고")으로 BurnTok 검수 상태 칩을 공통화했다. 기존 `Chip`은 행동/선택 칩이라 `radio`·`checkbox` 또는 단순
button 의미를 가진다. 이 칩은 **상세 패널을 여닫는 공개(disclosure) 트리거**라 `aria-expanded`/`expanded` 상태가 필요하고,
작은 장식 미디어와 한 줄 상태 문구를 가진다. Chip에 축을 더하면 선택 의미와 펼침 의미가 한 API에 섞이므로
`ActivityChip`으로 분리했다. 공개 API 대응표에서는 supplemental로 분류하며, 이 분류는
Chip의 안정성을 상속하거나 독립적인 stable 승격을 뜻하지 않는다. 현재 지원은 Web·Native이고
기기 검증 제한은 아래 검증 범위를 따른다. 카탈로그 등록은 [공통 기준](stable-promotion.md#카탈로그-등록과-공개-api-분류)을 따른다.

계약과 두 renderer의 granular subpath는 `/activity-chip`이다(contracts는 root에서도 재노출). 추가 peer는 없다.

## 계약

- `resolveActivityChipDescriptor({ label, accessibilityLabel?, emphasis?, expanded? })`가 두 renderer의 공통 검증이다.
  빈 label/accessibilityLabel, 알 수 없는 emphasis, boolean이 아닌 expanded는 `TypeError`다.
- `emphasis`: `default`(surface/text/border) · `emphasis`(brand action fill/content, 결과가 사용자를 기다릴 때).
  두 쌍 모두 light/dark에서 4.5:1을 contract test가 지킨다.
- `activityChipRecipe`: 최소 높이 44(`control.minTouchTarget`), 최대 폭 180, 모서리 full, 미디어 28, 간격 `spacing.xxs`,
  시작 inset `spacing.xxs`(미디어가 있을 때)·끝 inset `spacing.sm`, 라벨 `label` variant medium(500) 한 줄.
- 작업 상태·문구·미디어·패널 내용은 제품 소유다. HJM은 트리거 모양, 펼침 의미, 패널(Toast) 수명주기를 소유한다.

## Renderer

- Web: `<button type="button" aria-expanded>`. `accessibilityLabel`이 있을 때만 `aria-label`을 둔다. 미디어는 `aria-hidden`.
  색은 recipe가 가리키는 theme 역할(`--hjm-color-surface`·`text`·`border`, `primary`·`on-primary`)을 읽고
  recipe 전용 크기만 컴포넌트가 custom property로 넘긴다. theme.ts에 넣지 않은 이유는 선택형 계약을 모든 Web graph에
  끌어오지 않기 위해서다.
- Native: `Pressable` + `accessibilityRole="button"` + `accessibilityState.expanded`. 미디어 View는
  `importantForAccessibility="no-hide-descendants"`. 큰 글자에서 높이는 바닥값이라 늘어나고 라벨은 한 줄로 줄임표 처리된다.

검증: contracts `test/activity-chip.test.ts`, Web `test/activity-chip.browser.test.tsx`, Native `test/activity-chip.test.tsx`.
기기 시각·VoiceOver/TalkBack 확인은 아직 하지 않았다.

## 근거

2026-10-17 사용자 결정("굵기 좀더 줄여"): 모든 글자 굵기를 한 단계 낮췄다. 큰 숫자·선택 상태 600(큰 제목 단계는 같은 날 폐지), 제목·강조 500, label 500, 본문 400이며 정본은 [타이포그래피](usage/tokens/typography.md)다.
