# RepeatableFieldGroup

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [목록 편집과 복구 계약](../../collection-editing.md), `src/collection-editing.ts`의 `collectionEditingRecipe`·`focusAfterRemoval`, 양 renderer `src/collection-editing.tsx`
- 스토리북: `배포/구성/입력과 작성/반복 입력`

## 언제 쓰나

참여자 이름·연락처처럼 같은 입력 행을 사용자가 추가·삭제하는 묶음에 쓴다. [FieldGroup](../compositions/field-group.md) 위에
행별 삭제 버튼과 마지막 추가 버튼, 추가·삭제 뒤 포커스 이동을 얹는다. 행은 stable id로 묶어 입력 host를 유지한다.
묶음 사용 기준은 [목록 편집과 복구](../compositions/collection-editing.md)다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 개수가 고정된 관련 입력 묶음 | [FieldGroup](../compositions/field-group.md) |
| 목록 항목 순서 바꾸기 | [SortableCollection](sortable-collection.md) |
| 자유 입력 태그 여러 개 | [TagsInput](tags-input.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `RepeatableFieldGroup` | 추가·삭제 가능한 입력 행 묶음 | `@hjmds/react/collection-editing` | `@hjmds/react-native/collection-editing` |

루트 barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { RepeatableFieldGroup } from "@hjmds/react/collection-editing";
import { TextField } from "@hjmds/react/forms";

<RepeatableFieldGroup descriptor={{ label: t("people.title"), fields: rows.map(row => ({ id: row.id, label: t("people.name") })) }}
  addLabel={t("people.add")} removeLabel={id => t("people.remove", { name: nameOf(id) })} minFields={1} maxFields={4}
  onAdd={() => { const id = createId(); setRows(r => [...r, { id, value: "" }]); return id; }}
  onRemove={id => setRows(r => r.filter(row => row.id !== id))}
  renderField={({ id, controlProps, guardChange, focusRef }) =>
    <TextField {...controlProps} ref={focusRef} value={valueOf(id)} onValueChange={guardChange((v: string) => update(id, v))} />} />
```

```tsx
// Native
import { RepeatableFieldGroup } from "@hjmds/react-native/collection-editing";
import { TextField } from "@hjmds/react-native/inputs";

<RepeatableFieldGroup descriptor={descriptor} addLabel={t("people.add")}
  removeLabel={id => t("people.remove", { name: nameOf(id) })} minFields={1} maxFields={4}
  onAdd={addRow} onRemove={removeRow}
  renderField={({ id, controlProps, guardChange, focusRef }) =>
    <TextField {...controlProps} ref={focusRef} value={valueOf(id)} onValueChange={guardChange((v: string) => update(id, v))} />} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `descriptor` | `FieldGroupDescriptor` | 필수 | 묶음 이름과 행(`fields`: id·label·disabled 등). FieldGroup과 같다 |
| `renderField` | `(binding & { focusRef }) => ReactNode` | 필수 | `controlProps`·`guardChange`는 FieldGroup binding, `focusRef`는 추가·삭제 뒤 포커스를 받을 입력에 연결 |
| `addLabel` | `string` | 필수 | 마지막 추가 버튼 |
| `removeLabel` | `(id) => string` | 필수 | 행마다 다른 삭제 이름(대상 이름 포함) |
| `minFields` / `maxFields` | `number` | `0` / `Infinity` | 이하면 삭제, 이상이면 추가 비활성 |
| `onAdd` | `() => string \| undefined` | 필수 | 새 행 id를 돌려주면 그 행이 descriptor에 나타난 뒤 포커스 |
| `onRemove` | `(id) => void` | 필수 | 제품 상태에서 행 제거 |
| `layout` · Web `className`·`layoutStyle` | FieldGroup 값 | FieldGroup 기본 | FieldGroup으로 전달 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 입력은 제품이 넣은 컨트롤, 버튼은 Button 기본 | 양 renderer |
| 간격 | 묶음과 추가 버튼 사이 `collectionEditingRecipe.gap`=`md`(16), 행 안 입력–삭제 `sm`(12) | `collectionEditingRecipe`, 양 renderer |
| 순서·정렬 | FieldGroup 제목 → 행마다 입력 → 삭제 IconButton(ghost, 행 이름을 담은 `label`) → … → 마지막 추가 Button(secondary). 행 끝 삭제는 `edge="end"`로 아이콘 칸이 묶음 끝에 온다(전에는 10 안쪽, 2026-10-17 실측 감사, [IconButton `edge`](icon-button.md#배치)) | 렌더 순서 |
| 고정·스크롤 | 자체 고정·스크롤 없음, 바깥 폼·화면 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 행은 세로로 쌓여 폭이 좁아도 입력과 삭제가 겹치지 않는다 | 세로 Stack |

## 꼭 지킬 것

- 행 id는 배열 index가 아니라 stable id다. index로 만들면 삭제 뒤 입력 host와 포커스가 다른 행으로 옮겨 간다.
- 입력 변경은 `guardChange`로 감싸 FieldGroup 편집 세션의 보호를 유지한다.
- `focusRef`를 연결하지 않으면 추가·삭제 뒤 포커스가 이동할 대상이 없다.

## 상태와 상호작용

삭제하면 `focusAfterRemoval`에 따라 다음 활성 행 → 이전 활성 행 → 추가 버튼 순서로 포커스를 옮긴다.
추가는 `onAdd`가 돌려준 id의 입력이 등록된 뒤 포커스한다. descriptor가 `disabled`이면 추가·삭제 모두 잠근다. 언마운트 뒤 늦은 클릭은 무시한다.
