# Form 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Form](../form.md), recipe `formRecipe`(`src/form.ts`)

## 언제 쓰나

여러 [Field](field.md)를 한 화면에 쌓고 한 번에 제출할 때 쓴다. Form은 필드 사이의 세로 리듬과
**제출 세션**(중복 제출 차단, 진행 중 잠금, 폼 단위 오류 표시)만 소유한다. 값·검증·dirty 판단은
제품(React Hook Form 등)이 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 입력 하나와 즉시 반영(검색, 토글) | [SearchField](search-field.md), [Switch](switch.md) |
| 한 번 확인하고 닫히는 위험 행동 | [AlertDialog](alert-dialog.md) |
| 필드 하나의 라벨·도움말·오류 프레임 | [Field](field.md) |
| 약관 동의 묶음 | [Agreement](agreement.md) |
| 하단 고정 제출 버튼이 필요한 긴 화면 | Form 안의 필드 + [BottomCTA](bottom-cta.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Form` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/forms` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Form } from "@hjmds/react/forms";
import { Button } from "@hjmds/react/actions";

<Form
  onSubmit={async () => { setServerError(undefined); try { await save(values); } catch { setServerError(t("profile.saveFailed")); } }}
  formError={serverError}
  actions={<Button type="submit">{t("profile.save")}</Button>}
>
  {/* Field / TextField 들 */}
</Form>
```

```tsx
// Native
import { Form } from "@hjmds/react-native/forms";

<Form
  label={t("profile.formLabel")}
  values={values}
  onSubmit={save}
  submitLabel={t("profile.save")}
  fallbackErrorMessage={t("common.saveFailed")}
  firstInvalidFieldRef={firstInvalidRef} // 검증 통과면 current를 null로
>
  {/* Field / TextField 들 */}
</Form>
```

## 축과 기본값

- `density`: `compact` · `comfortable`(기본). 필드 사이 간격만 바꾼다. 필드 내부 리듬은 Field의 몫이다.
- Native `status`/`defaultStatus`(기본 `idle`)/`onStatusChange`: `idle` · `submitting` · `succeeded` · `failed`. 제어·비제어 둘 다 된다.
- Web `busy` 기본 `false`. `onSubmit`이 Promise를 돌려주면 끝날 때까지 스스로 busy가 된다.
- Native `disabled` 기본 `false`.

## 꼭 지킬 것

- 필드 오류는 각 Field의 `error`에 둔다. Form의 오류(`formError`/`error`)는 서버 거부·네트워크 같은
  폼 단위 실패에만 쓴다. 같은 문장을 두 곳에 넣지 않는다.
- 문구는 모두 i18n 키로 넣는다. Native는 `fallbackErrorMessage`가 필수다.
- 진행 중 표시는 Form에 맡긴다. Web은 `fieldset`을 비활성화하고 `aria-busy`를 건다. Native는 내장 제출
  버튼이 `loading`이 된다. 별도 Spinner를 겹치지 않는다.
- 제출 버튼은 하나다. Web은 `actions`에 `type="submit"` Button을 넣고, Native는 내장 버튼을 쓴다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 제출 버튼 | 없음(`actions` 슬롯에 제품이 넣음) | 내장(`submitLabel`) |
| `onSubmit` 인자 | `FormEvent`(기본 동작은 막힘) | `values` |
| 실패 처리 | Promise reject를 삼킨다. 제품이 `formError`를 설정 | reject하면 `failed`로 바꾸고 Error 메시지 또는 `fallbackErrorMessage`를 alert로 표시 |
| 첫 오류 필드로 이동 | 없음 | `firstInvalidFieldRef`(포커스 + 스크린 리더 포커스 후 제출 중단) |
| 접근성 이름 | `<form>` 속성(`aria-label` 등) | `label` 필수 |
| 배치 | `className`, `style`(form 속성) | `style`(View) |

## 함정

- Native는 reject된 `Error.message`를 그대로 화면에 보인다. 서버 원문이 노출되지 않도록 제품이 번역된
  메시지로 감싸 던지거나 메시지 없는 실패로 두어 `fallbackErrorMessage`가 쓰이게 한다.
- Web은 reject를 삼키므로 `formError`를 설정하지 않으면 실패가 화면에 아무것도 남기지 않는다.
