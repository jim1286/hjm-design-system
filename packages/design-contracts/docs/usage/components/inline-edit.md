# InlineEdit

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [목록 편집 계약](../../collection-editing.md), `src/collection-editing.ts`의 `collectionEditingRecipe`, 양 renderer `src/collection-editing.tsx`
- 스토리북: `배포/구성/입력과 작성/제목 바로 편집`

## 언제 쓰나

목록·상세의 제목처럼 이미 확정된 짧은 값 하나를 그 자리에서 명시적으로 편집·저장·취소할 때 쓴다.
Lucian #033 등 전수 검토 뒤 도입한 목록 편집 구성의 하나이며 TextField·Button·action-session을 합성한다.
저장은 제품 `onSave`가 실제로 확정한 뒤에만 닫히고, 실패하면 초안을 그대로 보존한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 항상 편집 상태인 입력 | `TextField` |
| 여러 입력을 함께 저장하는 양식 | `FieldGroup` |
| 같은 형식의 행을 추가·삭제 | `RepeatableFieldGroup` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `InlineEdit` | 보기↔편집 전환, 저장·취소·실패 보존 | `@hjmds/react/collection-editing` | `@hjmds/react-native/collection-editing` |

root barrel에는 없다. 구성 안내는 [목록 편집 구성 지침](../compositions/collection-editing.md)에 있다.

## 최소 사용 예

```tsx
// Web
import { InlineEdit } from "@hjmds/react/collection-editing";

<InlineEdit id={note.id} label={t("note.title")} value={note.title}
  editLabel={t("note.editTitle")} saveLabel={t("common.save")} cancelLabel={t("common.cancel")}
  errorLabel={t("note.saveFailed")}
  validate={draft => draft.trim() ? undefined : t("note.titleRequired")}
  onSave={async draft => { await saveTitle(note.id, draft); }} />
```

```tsx
// Native
import { InlineEdit } from "@hjmds/react-native/collection-editing";

<InlineEdit id={note.id} label={t("note.title")} value={note.title}
  editLabel={t("note.editTitle")} saveLabel={t("common.save")} cancelLabel={t("common.cancel")}
  errorLabel={t("note.saveFailed")}
  validate={draft => draft.trim() ? undefined : t("note.titleRequired")}
  onSave={async draft => { await saveTitle(note.id, draft); }} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| id | string | 필수 | 편집 대상 ID. 바뀌면 내부 상태 전체를 remount |
| value | string | 필수 | 제품이 확정한 현재 값 |
| label | string | 필수 | 편집 입력 라벨, Web group 이름 |
| editLabel / saveLabel / cancelLabel | string | 필수 | 편집 진입·저장·취소 버튼 문구 |
| errorLabel | string | 필수 | 저장 실패 안내 |
| validate | (draft) => string \| undefined | 없음 | 오류 문구를 돌려주면 저장 비활성 |
| onSave | (draft) => void \| Promise | 필수 | 실제 저장 확정 후 resolve, 실패하면 reject |
| disabled | boolean | false | 편집 진입·저장 차단 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 기존 TextField·Button 규격 그대로 | 양 renderer |
| 간격 | 보기 행·버튼 행 sm, 편집 묶음 `actionGap` sm | collectionEditingRecipe |
| 순서·정렬 | 보기: 값 → 편집(ghost), 세로 중앙. 편집: 입력 → [취소(ghost) · 저장(primary)] → 오류 보기 행 끝 편집 버튼은 `edge="end"`로 아이콘 칸이 묶음 끝에 온다(전에는 10 안쪽, 2026-10-17 실측 감사, [IconButton `edge`](icon-button.md#배치)) | 양 renderer |
| 고정·스크롤 | 바깥 목록·화면 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 보기 행과 버튼 행은 `wrap`으로 줄바꿈 | 양 renderer |

오류 문구는 구성 안에서 가로 중앙에 둔다. 앱이 별도 padding이나 버튼 순서를 바꾸지 않는다.

## 꼭 지킬 것

- `onSave`는 서버·저장소가 실제로 확정한 뒤 resolve하고 `value`를 확정 값으로 갱신한다. 실패는 reject해야 초안이 보존된다.
- 다른 항목으로 바뀌면 `id`를 바꾼다. 같은 `id`로 다른 항목을 넣으면 이전 초안이 남는다.
- 모든 문구는 i18n 키로 전달한다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 보기 | 값과 편집 버튼. 편집에 들어가면 초안을 현재 `value`로 초기화하고 입력에 포커스 |
| 편집 | 입력·취소·저장. `validate` 오류가 있으면 입력에 오류 표시, 저장 비활성 |
| 저장 중 | 저장 버튼 로딩, 취소 비활성, 입력 잠금. 중복 저장은 무시 |
| 실패 | 초안 유지, 중앙 오류, 같은 저장으로 재시도 |
| 성공 | 보기로 돌아가 편집 버튼으로 포커스 복귀 |

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 저장·취소 키 | Enter 저장, Escape 취소. IME 조합 중 Enter는 무시 | 키보드 제출(`onSubmitEditing`) 저장 |
| 저장 중 입력 | `readOnly` | `disabled` |
| 포커스 복귀 | 포커스가 구성 안에 있을 때만 편집 버튼으로 | 성공 시 입력이 아직 포커스일 때만 복귀 |
| 실패 알림 | `role="alert"` | `accessibilityRole="alert"`·assertive, iOS는 announce |
