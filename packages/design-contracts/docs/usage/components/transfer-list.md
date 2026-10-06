# TransferList

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: [TransferList](../../transfer-list.md), `src/transfer-list.ts`(`transferListRecipe`)
- 스토리북: `배포/컴포넌트/입력/목록 간 항목 이동`

## 언제 쓰나

한 항목 집합을 두 목록으로 나누고 사용자가 항목을 오가게 할 때 쓴다. 후보 ↔ 확정 명단,
권한 없음 ↔ 권한 있음 같은 화면이다. 값은 오른쪽(target) 패널에 들어간 id 집합 하나다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 목록에서 여러 개를 체크만 함 | [CheckboxGroup](checkbox-group.md) |
| 드롭다운에서 하나 고름 | [Select](select.md), 검색이 필요하면 [Combobox](combobox.md) |
| 고른 값을 태그로 쌓음 | [TagsInput](tags-input.md) |
| 순서 바꾸기 | [SortableCollection](sortable-collection.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TransferList` | 기본 | `@hjmds/react`, `/transfer-list` | `@hjmds/react-native`, `/transfer-list` |

## 최소 사용 예

```tsx
// Web
import { TransferList } from "@hjmds/react/transfer-list";

// 상태 → i18n 키 상수 표. 키를 템플릿 문자열로 만들지 않는다.
const movedKey = { toTarget: "members.moved.toTarget", toSource: "members.moved.toSource" } as const;

const labels = {
  source: t("members.candidates"),
  target: t("members.confirmed"),
  toTarget: t("members.add"),
  toSource: t("members.remove"),
  selectAll: t("members.selectAll"),
  empty: t("members.empty"),
};

<TransferList
  items={people.map((p) => ({ id: p.id, label: p.name, textValue: p.name }))}
  labels={labels}
  targetKeys={confirmed}
  onTargetKeysChange={setConfirmed}
  onMove={(ids, direction) => announce(t(movedKey[direction], { count: ids.length }))}
/>
```

```tsx
// Native
import { TransferList } from "@hjmds/react-native/transfer-list";

<TransferList items={items} labels={labels} targetKeys={confirmed} onTargetKeysChange={setConfirmed} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `targetKeys` + `onTargetKeysChange` | `ReadonlySet<Id>`, `(keys: ReadonlySet<Id>) => void` | — | 제어. 콜백은 다음 target 집합 전체를 받는다. source 패널은 `items` 중 target이 아닌 나머지이고, 두 패널 모두 `items` 순서를 유지한다 |
| `defaultTargetKeys` | `ReadonlySet<Id>` | 빈 집합 | 비제어 |
| `onMove` | `(movedIds: readonly Id[], direction: "toTarget" \| "toSource") => void` | — | 이동 직후 한 번. 낭독 문장을 만든다 |
| `labels` | `{ source, target, toTarget, toSource, selectAll, empty }`(모두 `string`) | — (필수) | — |
| `items` | `{ id, label, textValue, description?, disabled? }[]` | — | `disabled` 항목은 선택도 이동도 되지 않는다 |
| 패널별 체크 선택 | 내부 상태 | — | 이동 전 임시 상태라 prop으로 받지 않는다. 이동 버튼은 해당 패널에 선택이 있을 때만 활성화된다 |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 최상위 컨테이너 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 페이지 폭 전체. 패널 머리(Web)·전체 선택 행(Native)·항목 행 최소 높이 `control.minTouchTarget` 44. Web 패널 테두리 1px, `radius.md` 12. 이동 버튼은 Button `secondary` `medium`(44). 패널 높이 상한은 HJM이 정하지 않는다 | `transferListRecipe.panelHeader`, `.hjm-transfer-list__*`, `react-native/src/transfer-list.tsx` |
| 간격 | Web 열 간격 `spacing.md` 16, 이동 버튼 열은 위에서 `spacing.xl` 24 내려와 버튼 사이 `moveControls.gap` `spacing.sm` 12. 머리 좌우 여백 `spacing.sm` 12, 목록 안쪽 여백 `spacing.xxs` 4, 행 좌우 여백·요소 사이 `collectionItemContract` `spacing.sm` 12(모서리 `radius.md`). Native 블록 사이·버튼 사이 `spacing.sm` 12 | `.hjm-transfer-list`, `.hjm-transfer-list__actions`, Native `gap: spacing.sm` |
| 순서·정렬 | Web 넓은 폭: `[source 패널] [이동 버튼 열] [target 패널]`. Native: source 라벨 → source 패널 → 이동 버튼 줄(가운데 정렬) → target 라벨 → target 패널. 주 행동(저장)은 컴포넌트 밖 폼 하단 | `react/src/transfer-list.tsx`, `react-native/src/transfer-list.tsx` |
| 고정·스크롤 | 화면 본문의 폼 영역에 두고 화면과 함께 스크롤한다 | — |
| 좁은 폭·큰 글자 | Web은 폭 30rem(480) 이하에서 한 열로 쌓여 source → 버튼 → target. Native는 항상 세로 | `@media (max-width: 30rem)` |

```text
Web ≥ 480                                  Web < 480 · Native
┌──────────┐            ┌──────────┐       ┌──────────────┐
│ 후보   ☐ │  [추가 →]  │ 확정   ☐ │       │ 후보 패널    │
├──────────┤  [← 빼기]  ├──────────┤       └──────────────┘
│ ☐ 항목   │            │ ☐ 항목   │       [추가] [빼기]
│ ☐ 항목   │            │          │       ┌──────────────┐
└──────────┘            └──────────┘       │ 확정 패널    │
    1fr     ← 16 → auto ← 16 →  1fr        └──────────────┘
```


## 꼭 지킬 것

- `labels`의 여섯 문구는 모두 제품 i18n으로 넣는다. HJM은 문장을 만들지 않는다.
- 이동 결과 낭독은 제품 몫이다. `onMove(movedIds, direction)`로 "2명 이동" 같은 문장을 만들어 알린다.
- 배치는 `layoutStyle`(최상위 컨테이너)로 한다. Web `className`·Native의 deprecated `style`로 패널·행 모양을 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | 두 패널 좌우 + 가운데 버튼 | 세로로 쌓음(source → 버튼 → target) |
| 행 의미 | `listbox`/`option`(`aria-selected`) | `checkbox` 행 |
| 키보드 | 화살표·Home/End 이동, Space 선택, Enter로 그 행만 이동 | 없음 |
| 이동 후 포커스 | 빈 자리로 올라온 행, 비면 빈 상태 문구 | 옮기지 않음 |
| 패널 비었을 때 전체 선택 | 활성 | `disabled` |
| 외부 꾸밈 | `className`, `ref`, `layoutStyle` | `layoutStyle`(`style`은 deprecated) |
