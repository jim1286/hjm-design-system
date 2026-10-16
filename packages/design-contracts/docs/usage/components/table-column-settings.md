# TableColumnSettings

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [목록 편집과 복구 계약](../../collection-editing.md), `src/collection-editing.ts`의 `changeColumnSettings`, 양 renderer `src/collection-editing.tsx`
- 스토리북: `배포/구성/선택과 필터/표 열 설정`

## 언제 쓰나

표의 열마다 보이기 체크박스와 앞으로·뒤로 이동 버튼을 제공해 열 표시와 순서를 바꾼다. 결과 목록은 제품 상태로
돌려주며 표 자체([DataTable](data-table.md))의 `columns`에 그대로 반영한다. 고정 열(`locked`)은 움직이지 않는
경계이고, 보이는 열이 하나만 남으면 그 열은 숨길 수 없다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 표의 열 기준 정렬 | [DataTable](data-table.md)의 정렬 |
| 여러 항목을 두 목록 사이로 옮기기 | [TransferList](transfer-list.md) |
| 끌어서 순서 바꾸기 | 제품 정렬 목록(이 API는 끌기 없이 버튼 이동만 제공) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TableColumnSettings` | 열 표시·순서 설정 | `@hjmds/react/collection-editing` | `@hjmds/react-native/collection-editing` |

`ColumnSetting` 타입과 `changeColumnSettings`는 `@hjmds/design-contracts/collection-editing`에서 가져온다.

## 최소 사용 예

```tsx
// Web
import { TableColumnSettings } from "@hjmds/react/collection-editing";

<TableColumnSettings label={t("table.columns")} columns={columns} onColumnsChange={setColumns}
  earlierLabel={column => t("table.moveEarlier", { name: column.label })}
  laterLabel={column => t("table.moveLater", { name: column.label })} />
```

```tsx
// Native
import { TableColumnSettings } from "@hjmds/react-native/collection-editing";

<TableColumnSettings label={t("table.columns")} columns={columns} onColumnsChange={setColumns}
  earlierLabel={column => t("table.moveEarlier", { name: column.label })}
  laterLabel={column => t("table.moveLater", { name: column.label })} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | string | 필수 | 묶음 이름(Web `legend`) |
| `columns` | `readonly ColumnSetting[]`(`{ id, label, visible, locked? }`) | 필수 | 제어값. id가 비거나 겹치면 던진다 |
| `onColumnsChange` | `(columns) => void` | 필수 | 바뀐 경우에만 새 배열로 부른다 |
| `earlierLabel` · `laterLabel` | `(column) => string` | 필수 | 이동 버튼 문구. 열 이름을 넣어 구분한다 |
| `disabled` | boolean | false | 모든 체크박스·버튼을 잠근다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 체크박스는 [Checkbox](checkbox.md) 기본 `medium`, 이동 버튼은 `ghost` [Button](button.md) 기본 `medium`(높이 44) | `collection-editing.tsx` |
| 간격 | 열 사이·체크박스와 버튼 줄 사이·버튼 사이 모두 `spacing.sm` 12 | `Stack gap="sm"` |
| 순서·정렬 | 제목 → 열마다 [체크박스] 다음 줄 [앞으로] [뒤로], `columns` 순서대로 | 양 renderer |
| 고정·스크롤 | 자체 스크롤 없음. 시트·팝오버 등 놓는 영역이 소유한다 | — |
| 좁은 폭·큰 글자 | 이동 버튼 줄이 `wrap`으로 줄바꿈 | `Stack axis="inline" wrap` |

## 꼭 지킬 것

- `columns`는 제어값이다. `onColumnsChange`로 받은 배열을 저장하고 표에 반영한다.
- 고정 열은 숨기기·이동이 막히고, 고정 열을 넘어서는 이동도 막힌다. 이 규칙을 제품 쪽에서 다시 구현하지 않는다.
- 이동할 수 없는 방향의 버튼은 비활성이다. 마지막 보이는 열의 체크박스도 비활성이다.
- 설정 저장(사용자별 보존)은 제품이 한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 묶음 | `fieldset` + `legend`, `disabled`는 fieldset이 전파 | 강조 `Text` 제목, `disabled`를 각 컨트롤에 전달 |

## 관련 지침

[목록 편집과 복구](../compositions/collection-editing.md), [DataTable](data-table.md), [Checkbox](checkbox.md).
