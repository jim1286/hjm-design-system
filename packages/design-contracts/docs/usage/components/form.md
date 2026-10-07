# Form

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Form](../../form.md), recipe `formRecipe`(`src/form.ts`)
- 스토리북: `배포/컴포넌트/입력/입력 양식`

## 언제 쓰나

여러 [Field](field.md)를 한 화면에 쌓고 한 번에 제출할 때 쓴다. Form은 필드 사이의 세로 리듬과
**제출 세션**(중복 제출 차단, 진행 중 잠금, 폼 단위 오류 표시)만 소유한다. 값·검증·dirty 판단은
제품(React Hook Form 등)이 소유한다.

Form은 주소·연락처처럼 관련 입력을 이름 붙여 묶는 일반 fieldset API가 아니다.
Web 내부 fieldset은 제출 중 잠금을 위한 것이며 그룹 legend를 제공하지 않는다.
그룹 제목을 만들려고 Form을 중첩하지 않는다. 일반 관련 입력은 [FieldGroup](../compositions/field-group.md) 실험에서 제공한다. 2026-10-07 GOV.UK 주소 그룹과 대조해
제출 경계와 입력 그룹을 구분했다. 선택 묶음은 CheckboxGroup/RadioGroup, 날짜 부분 입력은 DateEntry를 사용한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 입력 하나와 즉시 반영(검색, 토글) | [SearchField](search-field.md), [Switch](switch.md) |
| 한 번 확인하고 닫히는 위험 행동 | [AlertDialog](alert-dialog.md) |
| 필드 하나의 라벨·도움말·오류 프레임 | [Field](field.md) |
| 약관 동의 묶음 | [Agreement](agreement.md) |

하단 고정 행동·Native return 키 제출도 기존 Form을 사용한다. Native는 `actions={null}`과
`ref.current?.submit()`으로 같은 제출 경로를 호출하고 [배치](#배치)의 loading 연결을 따른다.
2026-10-07 참고 폼 조사에서 초기 선택 표가 이후 배치 안내와 모순된 것을 확인해 오래된
"내장 버튼 숨김·외부 제출 불가" 안내를 제거했다. Native 1.14.0 게시 타입의 FormHandle/actions/ref를
직접 대조했으며 새 폼 엔진을 제품에 복제할 이유가 없다. FormHandle·actions는 1.14.0부터다.

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Form` | 기본 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` |
| `FormHandle` | 같은 Native 제출을 밖에서 호출하는 ref 타입(1.14.0부터) | — | `/forms` |
| `createFormSubmitSession` | 보조 — 제출 결과를 값으로 받거나 언마운트 때 정산해야 할 때 쓰는 세션 | `@hjmds/design-contracts/components/form` | 같음 |
| `resolveFirstInvalidFieldFocusTarget` | 보조 — 필드 순서와 무효 id로 첫 오류 필드를 고른다 | `@hjmds/design-contracts/components/form` | 같음 |

## 최소 사용 예

```tsx
// Web
import { useRef } from "react";
import { Form, TextField } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";

const nicknameInputRef = useRef<HTMLInputElement>(null);

<Form
  aria-label={t("profile.formLabel")}
  onSubmit={async () => {
    setServerError(null);
    if (nicknameError) { nicknameInputRef.current?.focus(); return; } // Web은 첫 오류 포커스를 제품이 한다
    try { await save(values); } catch { setServerError(t("profile.saveFailed")); }
  }}
  formError={serverError}
  actions={<Button type="submit">{t("profile.save")}</Button>}
>
  <TextField ref={nicknameInputRef} label={t("profile.nickname")} value={values.nickname}
    onValueChange={setNickname} error={nicknameError ? t(nicknameError) : undefined} />
</Form>
```

```tsx
// Native
import { useEffect, useRef } from "react";
import type { TextInput } from "react-native";
import { Form } from "@hjmds/react-native/forms";
import { TextField } from "@hjmds/react-native/inputs";

const nicknameInputRef = useRef<TextInput>(null);
const firstInvalidRef = useRef<TextInput | null>(null);
// Form은 버튼을 누른 순간 current를 읽는다. 렌더 중이 아니라 effect에서 갱신한다(첫 렌더엔 필드 ref가 null).
useEffect(() => { firstInvalidRef.current = nicknameError ? nicknameInputRef.current : null; }, [nicknameError]);

<Form
  label={t("profile.formLabel")}
  values={values}
  onSubmit={save}
  submitLabel={t("profile.save")}
  fallbackErrorMessage={t("common.saveFailed")}
  firstInvalidFieldRef={firstInvalidRef}
>
  <TextField ref={nicknameInputRef} label={t("profile.nickname")} value={values.nickname}
    onValueChange={setNickname} {...(nicknameError ? { error: t(nicknameError) } : {})} />
</Form>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `density` | `compact` · `comfortable` | `comfortable` | 필드 사이 간격만 바꾼다. 필드 내부 리듬은 Field의 몫이다 |
| Web `onSubmit` | `(event: FormEvent<HTMLFormElement>) => void \| Promise<void>` | 필수 | 기본 동작은 막혀 있다. Promise면 정산까지 busy |
| Native `onSubmit` | `(values: Values) => void \| Promise<void>` | 필수 | 누른 순간의 `values`를 받는다. reject하면 `failed` |
| Native `status`/`defaultStatus` | `FormSubmitStatus` = `"idle"` · `"submitting"` · `"succeeded"` · `"failed"` | `idle` | 제어·비제어 둘 다 된다 |
| Native `onStatusChange` | `(status: FormSubmitStatus) => void` | — | 무효 제출(`firstInvalidFieldRef` non-null)에서는 불리지 않는다 |
| Native `firstInvalidFieldRef` | `RefObject<TextInput \| null>` | — | 누른 순간 non-null이면 그 칸에 포커스하고 제출하지 않는다 |
| Native `error` · Web `formError` | Native `string` · Web `ReactNode` | — | 폼 단위 실패 문장 |
| `busy`(Web) | `true` · `false` | `false` | `onSubmit`이 Promise를 돌려주면 끝날 때까지 스스로 busy가 된다 |
| `disabled`(Native) | `true` · `false` | `false` | — |

- 세션(`createFormSubmitSession({ onSubmit, fallbackErrorMessage, resolveErrorMessage? })`)의 상태는
  `getSnapshot()`이 주는 `{ status: "idle" | "submitting" | "succeeded" } | { status: "failed", message }`이고,
  `submit(values)`는 `{ outcome: "succeeded" } | { outcome: "failed", message } | { outcome: "blocked", reason } | { outcome: "interrupted" }`를
  돌려준다. 세션을 쓰면 Web은 `busy`·`formError`, Native는 `status`·`error`를 controlled로 넘기고 renderer 내장 상태를 함께 진실로 두지 않는다([계약](../../form.md)).

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | — | — |
| 간격 | 필드 사이 간격: `comfortable` `spacing.lg`(20), `compact` `spacing.sm`(12). Web은 필드 묶음 아래 폼 오류와 `actions`가 각각 `spacing.sm`(12) 위 여백을 갖고, `actions` 안 버튼 간격은 `spacing.sm`(12)이다. Native는 필드·오류·내장 제출 버튼을 같은 `fieldGap`으로 세로로 쌓는다 | `form.ts` `formRecipe`, `styles.css` `.hjm-form__*`, `react-native/src/forms.tsx` `Form` |
| 순서·정렬 | 위→아래 순서는 필드들 → 폼 오류 → 제출 행동이다. 폼 오류는 항상 행동 바로 위에 온다(`formRecipe.formError.position` `beforeActions`). Web `actions`는 줄바꿈되는 가로 줄이다. 버튼 둘이면 [Button](button.md)의 순서(보조 → 주 행동)를 따른다. Native 기본 제출 버튼은 마지막에 있으며 actions 슬롯으로 교체하거나 숨길 수 있다 | `form.ts` `formRecipe`, `styles.css` `.hjm-form__actions` |
| 고정·스크롤 | 폼 흐름 안에 둔다. 긴 화면에서 제출을 하단에 고정하려면 Web은 Form을 스크롤 영역에 두고 `actions` 대신 [BottomCTA](bottom-cta.md)로 뺀다. Native는 `actions={null}`로 내장 버튼을 숨기고 `FormHandle.submit()`으로 같은 제출을 호출한다 | `react-native/src/forms.tsx` `Form` |
| 좁은 폭·큰 글자 | — | — |

```text
┌──────────────────────────┐
│ 라벨                     │
│ [ 입력          ]        │
│ 도움말                    │   ↕ fieldGap(comfortable lg 20 / compact sm 12)
│ 라벨                     │
│ [ 입력          ]        │
│ 폼 오류(서버 거부)         │   ↕ Web sm 12
│            [취소] [저장]  │ ← actions(Web) / 내장 제출 버튼(Native)
└──────────────────────────┘
```

## 꼭 지킬 것

- Native `FormHandle`은 `/forms`에서 import한다. `ref.current?.submit()`은 키보드 return·시트 footer에서 동일 제출 경로를 호출한다. footer를 쓰면 `actions={null}`로 내장 버튼을 숨기고, `onStatusChange`로 footer의 loading을 연결한다. 이 경로는 2026-10-06 로그인/시트 지침에서 중복 폼 구현을 피하려고 추가했다.

- 필드 오류는 각 Field의 `error`에 둔다. Form의 오류(`formError`/`error`)는 서버 거부·네트워크 같은
  폼 단위 실패에만 쓴다. 같은 문장을 두 곳에 넣지 않는다.
- 문구는 모두 i18n 키로 넣는다. Native는 `fallbackErrorMessage`가 필수다.
- 진행 중 표시는 Form에 맡긴다. Web은 `fieldset`을 비활성화하고 `aria-busy`를 건다. Native는 내장 제출
  버튼이 `loading`이 된다. 별도 Spinner를 겹치지 않는다.
- 제출 버튼은 하나다. Web은 `actions`에 `type="submit"` Button을 넣고, Native는 내장 버튼 또는 `actions` 슬롯 중 하나를 쓴다. Native Form
  내장 버튼과 [BottomCTA](bottom-cta.md) 제출을 함께 두지 않는다.
- Native 필드 `error`는 제출 전에(입력 변경·blur 때) 이미 보이고 있어야 한다. 무효 제출은 포커스만 옮기고
  어떤 콜백도 부르지 않으므로, 그때 오류를 켜는 자리가 없다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제출 버튼 | 없음(`actions` 슬롯에 제품이 넣음) | 내장(`submitLabel`); `actions`로 교체, `null`로 숨김 |
| `onSubmit` 인자 | `FormEvent`(기본 동작은 막힘) | `values` |
| 실패 처리 | Promise reject를 삼킨다. 제품이 `formError`를 설정 | reject하면 `failed`로 바꾸고 Error 메시지 또는 `fallbackErrorMessage`를 alert로 표시 |
| 첫 오류 필드로 이동 | 없음. 제품이 `onSubmit` 안에서 첫 무효 입력에 `.focus()`한다 | `firstInvalidFieldRef`: 버튼을 누른 순간 `current`를 읽는다. non-null이면 그 입력에 focus와 스크린 리더 focus를 옮기고 `onSubmit`·`onStatusChange` 없이 멈춘다(상태 그대로). ref는 `useEffect`에서 갱신하고, 순서 계산은 `resolveFirstInvalidFieldFocusTarget(fieldOrder, invalidIds)`를 쓴다 |
| 접근성 이름 | `<form>` 속성(`aria-label` 등) | `label` 필수 |
| 배치 | `className`, `layoutStyle`(form 속성 `style`도 받음) | `layoutStyle`. `style`은 deprecated(개발 모드 1회 경고, 다음 major 제거) — `layoutStyle` 또는 `density` |
| 밖에서 제출 | `<form>`이므로 `type="submit"` 버튼·Enter로 된다 | `ref: Ref<FormHandle>`의 `submit()`으로 같은 validation·중복 제출 방지를 실행 |

## 함정

- Native는 reject된 `Error.message`를 그대로 화면에 보인다. 서버 원문이 노출되지 않도록 제품이 번역된
  메시지로 감싸 던지거나 메시지 없는 실패로 두어 `fallbackErrorMessage`가 쓰이게 한다.
- Web은 reject를 삼키므로 `formError`를 설정하지 않으면 실패가 화면에 아무것도 남기지 않는다.
- Native `firstInvalidFieldRef.current`를 렌더 중에 갱신하면 첫 렌더에는 필드 ref가 null이라 빈 값으로 바로 누르면
  그대로 `onSubmit`이 나간다. 위 예처럼 `useEffect`에서 갱신한다.
- Native 내장 제출 버튼은 tone이 `primary`로 고정이다. 소셜 로그인 아래 심사자 폼처럼 낮은 tone이 필요하면 Form 대신
  `actions`에 `Button tone="secondary"`를 넣고 `ref.current?.submit()`을 호출한다.
- Native `error`는 `string`이라 `exactOptionalPropertyTypes`에서 `undefined`를 받지 않는다. 조건부 spread로 넘긴다.
