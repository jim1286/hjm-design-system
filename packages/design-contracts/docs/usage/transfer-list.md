# TransferList 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [TransferList](../transfer-list.md)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TransferList` | `@hjmds/react`, `/transfer-list` | `@hjmds/react-native`, `/transfer-list` | 기본 |

## 최소 사용 예

```tsx
// Web
import { TransferList } from "@hjmds/react/transfer-list";

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
  onMove={(ids, direction) => announce(t(`members.moved.${direction}`, { count: ids.length }))}
/>
```

```tsx
// Native
import { TransferList } from "@hjmds/react-native/transfer-list";

<TransferList items={items} labels={labels} targetKeys={confirmed} onTargetKeysChange={setConfirmed} />
```

## 축과 기본값

- 값: `targetKeys`+`onTargetKeysChange`(제어) 또는 `defaultTargetKeys`(비제어, 기본 빈 집합).
  source 패널은 `items` 중 target이 아닌 나머지이고, 두 패널 모두 `items` 순서를 유지한다.
- 패널별 체크 선택은 이동 전 임시 상태라 내부에서만 관리하며 prop으로 받지 않는다.
- 항목은 `{ id, label, textValue, description?, disabled? }`. `disabled` 항목은 선택도 이동도 되지 않는다.
- 이동 버튼은 해당 패널에 선택이 있을 때만 활성화된다.

## 꼭 지킬 것

- `labels`의 여섯 문구는 모두 제품 i18n으로 넣는다. HJM은 문장을 만들지 않는다.
- 이동 결과 낭독은 제품 몫이다. `onMove(movedIds, direction)`로 "2명 이동" 같은 문장을 만들어 알린다.
- 꾸밈 수단은 Web `className`, Native `style`(최상위 컨테이너)뿐이다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 배치 | 두 패널 좌우 + 가운데 버튼 | 세로로 쌓음(source → 버튼 → target) |
| 행 의미 | `listbox`/`option`(`aria-selected`) | `checkbox` 행 |
| 키보드 | 화살표·Home/End 이동, Space 선택, Enter로 그 행만 이동 | 없음 |
| 이동 후 포커스 | 빈 자리로 올라온 행, 비면 빈 상태 문구 | 옮기지 않음 |
| 패널 비었을 때 전체 선택 | 활성 | `disabled` |
| 외부 꾸밈 | `className`, `ref` | `style` |
