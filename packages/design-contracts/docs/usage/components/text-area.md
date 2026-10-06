# TextArea

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-06
- 근거: `src/base-recipes.ts`(`fieldRecipe`)
- 스토리북: `배포/컴포넌트/입력/여러 줄 입력`

## 언제 쓰나

여러 줄 자유 글을 받는 입력에 쓴다. 자기소개, 후기, 문의 본문처럼 줄바꿈이 값의 일부인 경우다.
라벨·설명·오류 문구 틀은 [Field](field.md)와 같다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 줄 값(이름, 이메일) | [Field](field.md)의 `TextField` |
| `@사람` 언급이 있는 본문 | [Mentions](mentions.md) |
| 비밀번호·숫자·인증 코드 | [PasswordField](password-field.md), [NumberField](number-field.md), [OTPField](otp-field.md) |
| 검색어 | [SearchField](search-field.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TextArea` | 기본 | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` |

## 최소 사용 예

```tsx
// Web
import { TextArea } from "@hjmds/react/forms";

<TextArea
  label={t("review.body")}
  description={t("review.bodyHint")}
  error={bodyError ? t(bodyError) : undefined}
  value={body}
  onChange={(event) => setBody(event.currentTarget.value)}
  minVisibleLines={3}
  maxVisibleLines={8}
/>
```

```tsx
// Native
import { TextArea } from "@hjmds/react-native/inputs";

<TextArea
  label={t("review.body")}
  value={body}
  onValueChange={setBody}
  maxVisibleLines={8}
  layoutStyle={{ marginTop: 16 }}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `surface` · `inset` | `surface` | — |
| `shape` | `medium` · `large` · `full` | `medium` | — |
| `align` | `start` · `center` | `start` | — |
| `value`/`defaultValue` | `string` | — | — |
| `onChange`(Web) | `(event: ChangeEvent<HTMLTextAreaElement>) => void` | — | DOM 이벤트. 값은 `event.currentTarget.value` |
| `onValueChange`(Native) | `(value: string) => void` | — | 다음 문자열 |
| `minVisibleLines` · `maxVisibleLines` | 줄 수 | 최소 높이 80, 상한 없음 | 높이는 줄 수로만 정한다. 최소 높이는 `max(80, 줄 수 × typography.body 줄 높이 20 + spacing.sm 12 × 2)`라 `minVisibleLines`가 1·2여도 80(`fieldRecipe.multilineMinHeight`) 아래로 내려가지 않고 3부터 커진다(3줄 84). Web·Native 같다 |
| `leadingAction` | `ReactNode` | — | 틀 안 글자 앞 행동 버튼. 자라는 글자의 세로 가운데에 맞추고 흐린 affix 색을 쓰지 않는다. 미게시(1.12.1 이후) |
| `trailing` | `ReactNode` | — | 틀 안 글자 뒤 슬롯 |
| `description` · `error` · `required` · `disabled` | Web `ReactNode`, Native `string` · `boolean` | — | Field와 같은 틀로 그려지고 보조기기 설명에 연결된다 |
| `busy`(Native) | `boolean` | `false` | — |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 필드 전체(라벨·틀·설명) 배치. Web·Native 모두 |

`leading`(흐린 장식 affix)은 TextArea에 없다(TextField 전용). 행동은 `leadingAction`·`trailing`에 두고, 글자 수 같은 보조 표시는 `description`으로 둔다.

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 최소 높이 80(`fieldRecipe.multilineMinHeight`)에서 시작해 입력에 따라 자란다. 좌우 안쪽 여백 `spacing.md` 16, 모서리 기본 `radius.md` 12 | `fieldRecipe`, `.hjm-field__control--multiline` |
| 간격 | 라벨과 틀 사이 `spacing.xs` 8. 이웃 필드와의 간격은 폼이 정하고 TextArea는 바깥 여백이 없다(필요하면 `layoutStyle`로 준다) | `fieldRecipe.label.gap`, `.hjm-field` |
| 순서·정렬 | 라벨 → 입력 틀 → 설명/오류. 폼의 세로 줄에서 폭을 꽉 채운다 | `react-native/src/inputs.tsx`(`TextArea`) |
| 고정·스크롤 | `maxVisibleLines`에 닿으면 틀 안에서 스크롤한다. Web은 사용자가 세로로만 크기를 바꿀 수 있다(`resize: vertical`) | `.hjm-field__control--multiline textarea` |
| 좁은 폭·큰 글자 | 큰 글자에서는 줄 높이가 커져 `minVisibleLines`·`maxVisibleLines`의 실제 높이도 커진다. 픽셀 높이로 고정하지 않는다 | `.hjm-field__control--multiline textarea` |

## 꼭 지킬 것

- `label` 또는 접근 이름(Web `aria-label`, Native `accessibilityLabel`)이 반드시 있어야 한다. 둘 다 없으면 `TypeError`.
- 라벨·설명·오류·placeholder는 i18n 키로 넣는다. placeholder를 라벨 대신 쓰지 않는다.
- 높이를 `style`의 `minHeight`/`maxHeight`로 바꾸지 않는다. `minVisibleLines`/`maxVisibleLines`를 쓴다.
- 한 줄 높이(44)에서 시작해 자라는 입력이 필요하면 TextArea가 아니라 [MessageComposer](message-composer.md)를 쓴다. 한 줄 시작은 composer 내부 전용이며 공개 `minVisibleLines`로는 80 아래로 내려가지 않는다. 2026-10-06 리뷰에서 하한을 44로 낮춘 미게시 변경이 기존 `minVisibleLines={2}` 필드를 80에서 64로 줄여 되돌렸다.
- 오류는 `error`로 넘긴다. 테두리 색을 직접 바꾸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 변경 | DOM `onChange`(`onValueChange` 없음) | `onValueChange(value)` |
| 배치 | `layoutStyle`(필드 전체), 바깥 틀 class는 `fieldClassName` | `layoutStyle`(필드 전체) |
| `style` | `textarea`에 전달 | 타입에서 제외 |
| 진행 표시 | 없음 | `busy` |
| 라벨·문구 타입 | `ReactNode` | `string` |
| import 경로 | `/forms` | `/inputs` |

## 함정

- 현재 Web `TextField`의 `onValueChange` 주석은 "Web TextArea와 같은 콜백"이라고 적지만 Web `TextAreaProps`에는
  `onValueChange`가 없다(`react/src/forms.tsx`). 공유 폼 코드는 Web TextArea만 `onChange`로 분기한다.
