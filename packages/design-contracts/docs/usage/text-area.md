# TextArea 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
recipe `fieldRecipe`(`src/base-recipes.ts`)

## 언제 쓰나

여러 줄 자유 글을 받는 입력에 쓴다. 자기소개, 후기, 문의 본문처럼 줄바꿈이 값의 일부인 경우다.
라벨·설명·오류 문구 틀은 [Field](field.md)와 같다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 한 줄 값(이름, 이메일) | [Field](field.md)의 `TextField` |
| 채팅·댓글 입력줄과 전송 버튼 | [MessageComposer](message-composer.md) |
| `@사람` 언급이 있는 본문 | [Mentions](mentions.md) |
| 서식이 있는 긴 글 편집 화면 | [EditorScreen](editor-screen.md) |
| 비밀번호·숫자·인증 코드 | [PasswordField](password-field.md), [NumberField](number-field.md), [OTPField](otp-field.md) |
| 검색어 | [SearchField](search-field.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TextArea` | `@hjmds/react`, `/forms` | `@hjmds/react-native`, `/inputs` | 기본 |

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

- `variant`: `surface`(기본) · `inset`. `shape`: `medium`(기본) · `large` · `full`. `align`: `start`(기본) · `center`.
- 높이: `minVisibleLines`·`maxVisibleLines`(줄 수)로만 정한다. 생략하면 최소 높이 80, 위로는 제한 없이 늘어난다.
- `description`·`error`·`required`·`disabled`는 Field와 같은 틀로 그려지고 보조기기 설명에 연결된다.
- `trailing`: 입력칸 안 끝에 붙는 보조 요소(예: 글자 수).

## 꼭 지킬 것

- `label` 또는 접근 이름(Web `aria-label`, Native `accessibilityLabel`)이 반드시 있어야 한다. 둘 다 없으면 `TypeError`.
- 라벨·설명·오류·placeholder는 i18n 키로 넣는다. placeholder를 라벨 대신 쓰지 않는다.
- 높이를 `style`의 `minHeight`/`maxHeight`로 바꾸지 않는다. `minVisibleLines`/`maxVisibleLines`를 쓴다.
- 오류는 `error`로 넘긴다. 테두리 색을 직접 바꾸지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 값 변경 | DOM `onChange`(`onValueChange` 없음) | `onValueChange(value)` |
| 배치 | `layoutStyle` 없음(바깥 틀은 `fieldClassName`) | `layoutStyle`(필드 전체) |
| `style` | `textarea`에 전달 | 타입에서 제외 |
| 진행 표시 | 없음 | `busy` |
| 라벨·문구 타입 | `ReactNode` | `string` |
| import 경로 | `/forms` | `/inputs` |

## 함정

- Web `TextField`의 주석은 "Web TextArea와 같은 `onValueChange`"라고 적지만 Web `TextAreaProps`에는
  `onValueChange`가 없다(1.12.1). 공유 폼 코드는 Web에서 `onChange`로 분기한다.
