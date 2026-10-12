# ActivityChip

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.17.2 이후)
- 검토일: 2026-10-10
- 근거: [ActivityChip 계약](../../activity-chip.md), `src/activity-chip.ts`(`activityChipRecipe`)
- 스토리북: `실험/컴포넌트/상태와 알림/작업 상태 칩`, `실험/구성/피드백과 복구/백그라운드 작업 상태`

## 언제 쓰나

백그라운드에서 돌고 있는 작업 하나(검수·업로드·동기화)의 상태를 헤더의 빈 자리에 짧게 보여 주고, 누르면 그 작업의
진행 패널([Toast](toast.md) 패널)을 여닫을 때 쓴다. 작업이 끝나면 결과 문구와 `emphasis`로 잠깐 바뀐다.
흐름 전체는 [백그라운드 작업 상태](../compositions/activity-status.md) 구성을 따른다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 필터·선택처럼 켜고 끄는 값 | [Chip](chip.md)(`selectionMode`) |
| 누르면 바로 동작하는 짧은 행동 | [Button](button.md)·[Chip](chip.md)(action) |
| 개수만 알리는 표시 | [CounterBadge](counter-badge.md) |
| 진행 상황을 화면 안에 계속 보여야 함 | [Progress](progress.md)·[Steps](steps.md) |

선택 기준: 누르면 **상세 패널이 열리고 닫히는** 상태 표시면 ActivityChip이다. 값을 고르면 Chip, 실행이면 Button이다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ActivityChip` | 보조(작업 상태 칩, 펼침 트리거) | `@hjmds/react/activity-chip` | `@hjmds/react-native/activity-chip` |
| `resolveActivityChipDescriptor`·`activityChipRecipe` | 계약(검증·크기·색) | `@hjmds/design-contracts/activity-chip` | 같음 |

## 최소 사용 예

```tsx
// Web
import { ActivityChip } from "@hjmds/react/activity-chip";

<ActivityChip
  label={t("review.chip.running")}
  accessibilityLabel={t("review.chip.runningSpoken")}
  expanded={panelOpen}
  media={<img src={mascotUrl} alt="" />}
  onClick={togglePanel}
/>;
```

```tsx
// Native
import { Image } from "react-native";
import { ActivityChip } from "@hjmds/react-native/activity-chip";

<ActivityChip
  label={t("review.chip.running")}
  accessibilityLabel={t("review.chip.runningSpoken")}
  expanded={panelOpen}
  media={<Image source={mascot} style={{ width: 28, height: 28 }} />}
  onPress={togglePanel}
/>;
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | — | 필수. 보이는 짧은 상태(한 줄, 넘치면 줄임표). 빈 문자열이면 throw |
| `accessibilityLabel` | `string` | `label` | 화면 낭독용 전체 문장. Web은 줄 때만 `aria-label`을 둔다 |
| `emphasis` | `default` · `emphasis` | `default` | `emphasis`는 결과가 사용자를 기다릴 때(brand fill) |
| `expanded` | `boolean` | `false` | 이 칩이 여닫는 패널이 열렸는지. Web `aria-expanded`, Native `accessibilityState.expanded` |
| `media` | `ReactNode` | — | 장식 시각물(마스코트·아바타). 28×28 원 안에 그리고 보조기술에서 숨긴다 |
| `onClick`(Web) · `onPress`(Native) | 함수 | — | Web은 `<button>` 속성(`onClick`·`disabled`·`id`·`data-*`)을 받는다. Native는 `onPress` 필수, `disabled`·`accessibilityHint`·`testID` 선택 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 배치만. Web은 raw `style`을 받지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 44(`control.minTouchTarget`), 최대 폭 180, 미디어 28, 모서리 full | `activityChipRecipe.root`·`media` |
| 간격 | 미디어와 라벨 사이 `spacing.xxs` 4. 안쪽 여백 시작 `spacing.xxs` 4(미디어 있을 때, 없으면 `spacing.sm` 12)·끝 `spacing.sm` 12 | `activityChipRecipe.root`, `.hjm-activity-chip` |
| 순서·정렬 | [미디어][라벨]. TopBar의 `trailing` 첫 자리 또는 제목이 없는 헤더의 빈 자리에 하나만 둔다 | 구성 [백그라운드 작업 상태](../compositions/activity-status.md) |
| 고정·스크롤 | 헤더와 함께 고정된다. 작업이 없으면 칩을 렌더하지 않는다(빈 자리 유지) | 구성 예제 |
| 좁은 폭·큰 글자 | 폭은 180에서 멈추고 라벨은 한 줄 줄임표. 큰 글자에서는 높이가 늘어난다(44는 바닥값) | `label.maxLines` 1, `minHeight` |

```text
┌ TopBar ───────────────────────────────────────────┐
│ [←]  내 작업                     ( (🐥) 다듬는 중 ) │  ← ActivityChip, 높이 44 · 최대 폭 180
└───────────────────────────────────────────────────┘
```

## 꼭 지킬 것

- 칩은 상태 표시 겸 펼침 트리거다. 누르면 같은 작업의 패널 Toast를 열고, 다시 누르면 닫는다. 다른 화면 이동에 쓰지 않는다.
- `expanded`는 실제 패널 상태와 같아야 한다. 패널이 닫기 버튼·스와이프·Escape로 닫혀도 Toast `onDismiss`에서 `false`로 되돌린다.
- 문구는 i18n 문자열, 미디어는 제품 자산이다. HJM은 칩 모양·펼침 의미·색 쌍을 소유한다. 색을 `layoutStyle`로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 누름 | `onClick`(button 속성 전부) | `onPress` 필수 |
| 펼침 상태 | `aria-expanded` | `accessibilityState.expanded` |
| 낭독 이름 | `accessibilityLabel`이 있을 때만 `aria-label` | `accessibilityLabel ?? label` |

## 함정

- 새 컴포넌트라 canonical catalog 행이 없다(동결 중). 공개 API 대응표에서는 supplemental로 분류된다.
- 실험 항목이다. 기기 시각·VoiceOver/TalkBack 확인은 아직 하지 않았다.
