# 관련 입력 묶음

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.13.1 이후)
- 검토일: 2026-10-07
- 근거: [입력 그룹 조사](../../../../../docs/plans/field-group-experiment.md), `src/field-group.ts`
- 스토리북: `실험/구성/입력과 작성/관련 입력 묶음`

## 언제 쓰나

주소·연락처처럼 여러 입력이 하나의 질문에 답할 때 쓴다. FieldGroup은 관련성·도움말·오류·잠금을
소유하고 값·검증 시점·제출은 제품이 소유한다. Form 안에 여러 그룹을 둘 수 있다. 선택만 묶으면
CheckboxGroup/RadioGroup, 날짜 조각이면 DateEntry를 먼저 사용한다. 공통 제출 세션은 Form의 몫이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| FieldGroup | 그룹 이름·설명·오류와 입력 연결 | 이 문서 |
| TextField 등 | renderField로 공급하는 개별 입력 | [Field](../components/field.md) |
| Form | 제품 제출 경계 | [Form](../components/form.md) |

## 배치

```text
그룹 이름
그룹 설명(선택)
그룹 오류(선택, 한 번)
[입력 1]
필드 설명 / 필드 오류
[입력 2]
필드 설명 / 필드 오류
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web fieldset / Native View | 기존 폼 안 | 테두리 없음, Web 최소 폭 0 |
| 그룹 이름 | Web legend / Native Text label | 맨 위 | Web 아래 spacing.sm 12, Native 그룹 간격 spacing.sm 12 |
| 입력 묶음 | renderField | descriptor.fields 순서 | 세로 간격 spacing.md 16 |
| 개별 도움말 | FieldGroup | 해당 입력 바로 아래 | Native 간격 spacing.xs 8, 글자 크기는 Text 기본 |

## 흐름과 상태

1. descriptor에 label과 fields를 넣는다. 필드 id는 그룹 안에서 고유하며 재정렬에도 유지한다.
2. description·error는 이미 현지화한 문구다. 빈 문자열은 허용하지 않는다. 표시할 오류가 없으면 생략한다.
3. 그룹 error는 message와 fieldIds를 받는다. 영향을 받는 필드만 invalid가 되고, 빈 배열은 그룹 전용 오류다.
4. renderField의 controlProps를 개별 입력에 전달한다. FieldGroup이 도움말·오류를 이미 그리므로 같은 내용을
   TextField description/error에 다시 넣지 않는다. Web id·aria 연결을 덮어쓰지 않는다.
5. 값 변경에는 guardChange로 감싼 callback을 전달한다. 그룹 잠금·개별 잠금·필드 제거·언마운트 후
   남은 callback을 차단한다. 잠금 해제 시 원래 disabled인 필드는 계속 잠긴다.
6. dynamic 필드 제거 시 해당 그룹 오류 대상도 함께 갱신한다. 사라진 id나 중복 오류 대상은 TypeError다.
7. 제품이 값과 검증을 유지한다. 입력 순서·그룹 잠금 변경은 값을 초기화하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 그룹 설명과 독립 입력 | 자동 포커스 없음 |
| 진행 중 | 제품 값 편집 | 일반 Tab·터치 이동 |
| 실패 | 그룹 오류 한 번, 해당 입력 invalid, 개별 오류 보존 | Web 연결된 설명, Native hint에 그룹/개별 설명과 오류 |
| 비활성 | 각 입력 disabled | guardChange가 늦은 값 변경도 차단 |

## 코드 골격

```tsx
// Web
import { FieldGroup } from "@hjmds/react/field-group";
import { TextField } from "@hjmds/react/forms";
<FieldGroup descriptor={group} renderField={({ id, controlProps, guardChange }) =>
  <TextField {...controlProps} value={values[id] ?? ""}
    onValueChange={guardChange((value: string) => updateField(id, value))} />} />
```

```tsx
// Native
import { FieldGroup } from "@hjmds/react-native/field-group";
import { TextField } from "@hjmds/react-native/inputs";
<FieldGroup descriptor={group} renderField={({ id, controlProps, guardChange }) =>
  <TextField {...controlProps} value={values[id] ?? ""}
    onValueChange={guardChange((value: string) => updateField(id, value))} />} />
```

공통 descriptor/resolver/edit session은 `@hjmds/design-contracts/field-group`에 있다.
사용자 정의 입력은 label·disabled·invalid·도움말을 자신의 실제 입력 host에 연결해야 한다.
controlProps는 TextField에 바로 연결되는 형태이며 Checkbox/Select 등 다른 공개 API와 호환되는지
확인 없이 그대로 펼치지 않는다. renderField의 반환값 안에 독립 제출 버튼을 넣지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 그룹 의미 | fieldset의 첫 legend | 개별 입력 accessibilityLabel에 그룹 이름 포함, 부모 accessible=false |
| 필드 연결 | id·aria-invalid·aria-describedby | label·invalid·accessibilityLabel·accessibilityHint |
| 그룹 오류 | role=alert | assertive live region, iOS 별도 announcement |
| 화면 스크롤 | 제품 host | 제품 ScrollView·키보드 회피 host |

## 함정

- 실제 스크린리더·Native 기기·제품 팔레트 검증은 아직 남았다. 자동 검사 통과를 승격 근거로 단독 사용하지 않는다.
- 국가·주소·연락처의 필드 순서와 autocomplete는 제품별로 정한다. 예제의 한국 주소 순서를 공통 규칙으로 복사하지 않는다.
