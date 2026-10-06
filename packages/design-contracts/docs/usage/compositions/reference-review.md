# 선택 내용 검토와 수정

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.12.1 이후)
- 검토일: 2026-10-06
- 근거: [반복 화면 조합](../../screen-patterns.md); 공통 API와 실제 Web·Native 예제의 슬롯·상태를 대조해 중복 조립 방지. 2026-10-06 사용자 승인으로 스토리북 배포(이전 `실험/구성/확인/선택 내용 검토와 수정`, [승인 기록](../../../../../docs/STORYBOOK_NAVIGATION.md#21-2026-10-06-전체-승격과-규격-확정))
- 스토리북: `배포/구성/입력과 작성/선택 내용 검토와 수정`

## 언제 쓰나

선택 내용을 검토하고 수정 후 명시적으로 확정 흐름이 필요할 때 쓴다. Form의 상태·콜백을 제품 로직에 연결하며 새 데이터 엔진을 만들지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Form | 선택 내용을 검토하고 수정 후 명시적으로 확정 | [공개 계약](../components/form.md) |
| Button | 명시 행동·재시도 | [Button](../components/button.md) |

## 배치

```text
부모 화면의 공개 슬롯
└─ 입력 → 요약 → 수정·저장
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Form 또는 포함 Surface | 부모 화면의 해당 슬롯 | [배치](../components/form.md#배치)에 따른다 |
| 내용 | Form 내부 슬롯 | 입력 → 요약 → 수정·저장 | spacing 토큰과 포함 컴포넌트 recipe |
| 행동 | Button 또는 공개 콜백 | 내용과 가까운 명시 진입점 | 주 행동 하나, 보조 행동과 구분 |

## 흐름과 상태

1. 선택 내용을 검토하고 수정 후 명시적으로 확정.
2. 진행 상태와 제품의 실제 확정을 분리한다.
3. 실패한 저장은 요약·입력 유지; 확인 전 자동 저장 금지.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 입력 → 요약 → 수정·저장 | 이름·선택 여부를 보조공학에 노출 |
| 진행 중 | 해당 작업 pending, 입력·기존 결과 보존 | 중복 요청 차단, 로딩에 포커스를 옮기지 않음 |
| 실패 | 실패한 저장은 요약·입력 유지; 확인 전 자동 저장 금지 | 오류 근처 재시도, 필요할 때만 오류 읽기 |

## 코드 골격

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
import { useRef } from "react";
import type { TextInput } from "react-native";
import { Form } from "@hjmds/react-native/forms";
import { TextField } from "@hjmds/react-native/inputs";

const nicknameInputRef = useRef<TextInput>(null);

<Form
  label={t("profile.formLabel")}
  values={values}
  onSubmit={save} // 거절되면 Form이 오류를 표시한다(메시지가 없으면 fallbackErrorMessage)
  submitLabel={t("profile.save")}
  fallbackErrorMessage={t("profile.saveFailed")}
  {...(nicknameError ? { firstInvalidFieldRef: nicknameInputRef } : {})} // Native는 Form이 첫 오류로 포커스를 옮긴다
>
  <TextField ref={nicknameInputRef} label={t("profile.nickname")} value={values.nickname}
    onValueChange={setNickname} {...(nicknameError ? { error: t(nicknameError) } : {})} />
</Form>
```

제품 데이터·콜백은 주입한다. 위 공개 API 지침에 Web·Native 차이를 유지한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 첫 오류 포커스 | 제품이 `onSubmit`에서 해당 입력 `ref.focus()` | `firstInvalidFieldRef`를 주면 Form이 그 입력에 포커스·보조공학 포커스를 옮기고 제출을 멈춘다 |
| 저장 실패 표시 | 제품이 `formError`로 넘긴다 | `onSubmit`이 거절되면 Form이 오류 메시지(없으면 `fallbackErrorMessage`)를 표시한다 |
| 제출 버튼 | `actions`에 `type="submit"` Button | `submitLabel`로 내장 버튼, `actions`로 교체 가능 |

## 함정

- 실패한 저장은 요약·입력 유지; 확인 전 자동 저장 금지.
- 포인터·제스처만으로 기능을 숨기지 않는다. 키보드·단일 탭 경로와 취소 후 복귀도 검증한다.
