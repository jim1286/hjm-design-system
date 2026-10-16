# ImportFieldMapping

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.21.0
- 검토일: 2026-10-16
- 근거: [데이터 해석과 가져오기 계약](../../data-workflows.md), `src/data-workflows.ts`의 `resolveImportMapping`, 양 renderer `src/data-workflows.tsx`
- 스토리북: `배포/구성/입력과 작성/가져오기 열 연결`

## 언제 쓰나

CSV 등 원본 열을 제품의 대상 필드에 연결하고, 검증을 통과한 연결만 가져오기로 넘길 때 쓴다.
대상 중복·필수 누락이 있으면 미리보기와 가져오기를 막고, 명시적 건너뛰기를 지원한다.
`onImport`에는 동결된 연결 snapshot을 전달하므로 가져오는 동안 연결이 바뀌어도 요청 범위는 그대로다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 단일 값 선택 | `Select` |
| 고정 입력 묶음 | `FieldGroup` |
| 가져온 데이터 표시 | `DataTable` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ImportFieldMapping` | 원본 열 → 대상 필드 연결·검증·미리보기·가져오기 | `@hjmds/react/data-workflows` | `@hjmds/react-native/data-workflows` |

`WorkflowField`·`ImportMapping`·`resolveImportMapping`은 `@hjmds/design-contracts/data-workflows`에 있다. root barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { ImportFieldMapping } from "@hjmds/react/data-workflows";

<ImportFieldMapping label={t("import.title")} sources={csvColumns} targets={productFields}
  mapping={mapping} onMappingChange={setMapping} previewRows={firstRows}
  onImport={async snapshot => { await importer.run(file, snapshot); }}
  importLabel={t("import.confirm")} skipLabel={t("import.skip")} errorLabel={t("import.failed")}
  validationLabel={state => state.duplicateTargets.length ? t("import.duplicate") : t("import.required")} />
```

```tsx
// Native
import { ImportFieldMapping } from "@hjmds/react-native/data-workflows";

<ImportFieldMapping label={t("import.title")} sources={csvColumns} targets={productFields}
  mapping={mapping} onMappingChange={setMapping} previewRows={firstRows}
  onImport={async snapshot => { await importer.run(file, snapshot); }}
  importLabel={t("import.confirm")} skipLabel={t("import.skip")} dismissLabel={t("common.close")}
  errorLabel={t("import.failed")} validationLabel={validationLabel} />
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| label | string | 필수 | 제목, 미리보기 표 이름 |
| sources / targets | WorkflowField[] | 필수 | `{ id, label, required? }`. id는 각각 서로 달라야 함 |
| mapping / onMappingChange | `Record<sourceId, targetId \| null>` / fn | 필수 | 연결(제품 소유). null은 건너뛰기 |
| onImport | (mapping) => void \| Promise | 필수 | 동결 snapshot으로 실제 가져오기. 실패는 reject |
| importLabel / skipLabel / errorLabel | string | 필수 | 가져오기·건너뛰기·실패 문구 |
| validationLabel | (state) => string | 필수 | `duplicateTargets`·`missingTargets`로 안내 문구 선택 |
| previewRows | `{ id, values }[]` | [] | 유효할 때만 연결된 열로 미리보기 |
| dismissLabel | string | Native 필수 | Native Select 선택 창 닫기 문구(Web에는 없음) |
| disabled | boolean | false | 선택·가져오기 비활성 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | Select·DataTable·Button(primary) 기본 규격 | 양 renderer |
| 간격 | 세로 md | 양 renderer |
| 순서·정렬 | 제목 → 원본 열마다 Select(`sources` 순서) → 검증 안내(가로 중앙) 또는 미리보기 표 → 가져오기 → 오류(가로 중앙) | 양 renderer |
| 고정·스크롤 | 미리보기 표의 가로 스크롤은 DataTable 소유, 세로는 바깥 host | DataTable |
| 좁은 폭·큰 글자 | Select는 본문 폭, 표는 DataTable 규칙 | 양 renderer |

## 꼭 지킬 것

- 연결이 하나 이상이고, 대상 중복이 없고, 필수 대상이 모두 연결되어야 유효하다. 그 전에는 가져오기 버튼이 비활성이다.
- `mapping`에 없는 원본·대상 ID를 넣으면 `TypeError`다.
- CSV 파싱·인코딩·서버 검증·권한·멱등성은 제품 importer가 소유한다.

## 상태와 상호작용

| 상태 | 모습 |
| --- | --- |
| 미완성 | 검증 안내(Web `role="status"`, Native polite), 가져오기 비활성 |
| 유효 | `previewRows`가 있으면 연결된 대상 열로 미리보기 |
| 가져오는 중 | 버튼 로딩, Select 잠금 |
| 실패 | 연결 유지, 중앙 오류, 같은 버튼으로 재시도 |
