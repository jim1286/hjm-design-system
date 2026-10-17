# 목록 편집과 복구

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-15
- 근거: [목록 편집과 복구 계약](../../collection-editing.md), `src/collection-editing.ts`, 양 renderer의 `src/collection-editing.tsx`
- 스토리북: `배포/구성/입력과 작성/제목 바로 편집`, `배포/구성/입력과 작성/반복 입력`, `배포/구성/선택과 필터/선택 항목 묶음 작업`, `배포/구성/피드백과 복구/검색 필터 완화`, `배포/구성/선택과 필터/표 열 설정`

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

목록의 제목을 바로 고치거나, 입력 행을 늘리거나, 여러 항목에 같은 행동을 하거나, 빈 검색에서 조건을 풀거나, 표의 열을 설정할 때 쓴다.
Lucian 예제 전수 검토에서 재사용할 실익이 있는 다섯 작업을 기존 HJM 구성으로 연결했다.
다섯 API를 한 화면에 모두 넣는 것이 아니라 사용자 과제에 해당하는 하나를 고른다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| InlineEdit | 값 표시 → 같은 자리 입력·저장·취소 | [계약](../../collection-editing.md) |
| RepeatableFieldGroup | stable ID로 묶은 입력 행 추가·삭제 | [FieldGroup](field-group.md) |
| SelectionActionBar | 선택 개수·묶음 행동·작업별 복구 | [보관과 실행 취소](action-recovery-undo.md) |
| FilterRecovery | 실제 결과가 나오는 필터 완화 제안 | [검색 화면](../components/search-screen.md) |
| TableColumnSettings | 보이는 열·순서를 제어 | [DataTable](../components/data-table.md) |

## 배치

```text
제목 편집             반복 입력              묶음 행동
라벨(caption)         이름                   N개 선택
값(strong)     [✎]    [입력        ] [🗑]    [보관] [해제]
↓                     [사람 추가]           [방금 작업 복구]
[입력]
[취소] [저장]

필터 완화: 자기 본문 영역 중앙        열 설정: 그룹 라벨(Text strong) + 열마다 한 행
제목·설명                            [✓ 이름 (고정)]        [↑] [↓]
[주제 해제 · 실제 N개 보기]           [✓ 점수]               [↑] [↓]
실패 안내                            제어된 실제 DataTable
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 제품 화면 host | 기존 본문·시트·패널 안; host가 스크롤·safe area·키보드를 소유 | 기존 Container/ScreenLayout 규격 |
| 입력/행 | TextField, FieldGroup | 값과 같은 자리; 반복 행은 위→아래 | `collectionEditingRecipe.gap` = `md` |
| 제목 읽기 | Text caption muted(라벨) · Text strong(값) · IconButton(ghost, `edit`) | 라벨 위·값 아래, 수정 도구는 행 끝. IconButton label = `editLabel`, 저장·취소 뒤 포커스는 이 도구로 돌아온다 | 라벨–값 `spacing.xxs`, 값–도구 `spacing.sm` 12 |
| 행 삭제 | IconButton(ghost, `delete`) | 각 반복 입력 행 끝, 입력과 아래 끝 정렬. label = `removeLabel(id)`로 행 대상을 말한다([IconButton](../components/icon-button.md)) | 입력–도구 `spacing.xs` 8 |
| 행동 | Button | 입력 아래 취소→저장, 행 묶음 마지막 추가 | `collectionEditingRecipe.actionGap` = `sm`, 좁으면 줄바꿈 |
| 선택 바 | SelectionActionBar | 대상 목록 바로 아래 또는 제품 footer 슬롯 | 제품이 고정 위치 결정; 화면 전체 좌표를 새로 소유하지 않음 |
| 열 설정 행 | Checkbox · IconButton ×2 | 열마다 한 행: 보이기 Checkbox(남은 폭) → 앞으로·뒤로 IconButton(ghost, 위·아래 화살표). IconButton label = `earlierLabel`·`laterLabel` | 행 안 `spacing.xs` 8, 행 사이 `spacing.sm` 12. 그룹 라벨은 Web·Native 모두 HJM Text strong |
| 상태 | Text·Button | 해당 구성 영역 중앙 | 임의 상단 margin 없이 가로·세로 중앙 정렬 |

## 흐름과 상태

1. 제품이 ID·문구·확정 데이터와 callbacks를 전달한다.
2. 편집·선택·제안 클릭에서만 변경을 시작한다. blur는 저장하지 않고 제안은 자동 적용하지 않는다.
3. 비동기 callback의 resolve/reject를 기다린다. 성공 결과·선택 해제·항목 복구는 제품 데이터로 반영한다.
4. 실패하면 기존 입력·필터·항목을 유지하고 같은 위치에서 다시 실행할 수 있다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 값/입력/선택 요약/제안/열 선택 | stable ID로 기존 입력 host 유지 |
| 진행 중 | 실행한 버튼 내부 로딩, 경쟁 행동 잠금 | 중복 실행 차단; 카드 높이를 임의로 접지 않음 |
| 실패 | 중앙 실패 문구, 재실행 가능한 행동 | Web alert / Native assertive live region; 초안 유지 |

## 코드 골격

```tsx
// Web. Native는 @hjmds/react-native/collection-editing에서 같은 공개 이름을 가져온다.
import { InlineEdit, TableColumnSettings } from "@hjmds/react/collection-editing";

<InlineEdit id={note.id} value={note.title} label={t("note.title")}
  editLabel={t("edit")} saveLabel={t("save")} cancelLabel={t("cancel")}
  errorLabel={t("saveFailed")} onSave={saveConfirmedTitle} />

<TableColumnSettings label={t("table.columns")} columns={settings}
  earlierLabel={column => t("table.earlier", { name: column.label })}
  laterLabel={column => t("table.later", { name: column.label })}
  onColumnsChange={setSettings} />
// DataTable: settings.filter(c => c.visible).map(c => originalColumnsById[c.id])
```

```tsx
// Native
import { InlineEdit } from "@hjmds/react-native/collection-editing";

<InlineEdit id={note.id} value={note.title} label={t("note.title")}
  editLabel={t("edit")} saveLabel={t("save")} cancelLabel={t("cancel")}
  errorLabel={t("saveFailed")} onSave={saveConfirmedTitle} />
```

다섯 구성의 완전한 실행 원본:

- Web: `showcase/web/src/patterns/CollectionEditing.previews.tsx`
- Native: `showcase/native/src/collection-editing-preview.tsx`

각 예제는 공개 import로 구성한다. 제품이 showcase 소스를 import하지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제목 확정 | Enter(IME 제외)·저장, Escape·취소 | TextInput submit·저장, 취소 버튼 |
| 행 포커스 | focusRef를 HTML 입력 ref에 연결 | focusRef를 TextInput ref에 연결 |
| 다중 선택 공급원 | DataTable 또는 CheckboxGroup | CheckboxGroup 등; Native DataTable의 단일 행 강조와 구분 |

## 함정

- 원본 데모의 고정 성공·전체 복구를 복사하지 않는다. 실패를 callback에서 삼키면 HJM은 성공으로 해석한다.
- `onAdd`가 반환한 ID와 새 field ID가 같아야 한다. 입력 값을 배열 index에 저장하지 않는다.
- 표 원본 descriptor의 pinned·width·sort를 보존한다. 설정 화면의 잠금은 서버 권한 검증을 대체하지 않는다.
- npm 1.21.0 API다. 소비 제품의 실제 설치 버전을 확인한다.

## 근거

- 2026-10-17 구성 리뷰: 반복 입력의 삭제가 행과 떨어진 전체 폭 ghost 텍스트 버튼이었고, 제목 편집은 라벨 없이 값 옆에 "제목 수정" 텍스트 버튼을 두었다. 그래서 두 행동을 행 끝 IconButton 도구로 바꾸고 읽기 상태에 라벨을 표시했다.
