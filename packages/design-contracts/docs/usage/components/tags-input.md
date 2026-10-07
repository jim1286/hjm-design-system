# TagsInput

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [TagsInput](../../tags-input.md), `src/tags-input.ts`(`tagsInputRecipe`)
- 스토리북: `배포/컴포넌트/입력/태그 입력`

## 언제 쓰나

사용자가 **자유 입력으로 여러 값을 모으는 필드**에 쓴다. 해시태그, 초대할 사람, 검색 필터처럼
목록이 없거나, 후보가 있어도 목록 밖의 값을 만들 수 있는 경우다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 정해진 목록에서만 고름 | [Combobox](combobox.md), [Select](select.md) |
| 고정된 몇 개 선택지를 여러 개 켬 | [CheckboxGroup](checkbox-group.md), [Chip](chip.md) |
| 본문 중 `@사람` 언급 | [Mentions](mentions.md) |
| 값 하나만 입력 | [Field](field.md) |
| 정적 라벨 표시 | [Tag](tag.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `TagsInput` | 기본 | `@hjmds/react`, `/tags-input` | `@hjmds/react-native`, `/tags-input` |

## 최소 사용 예

```tsx
// Web
import type { TagsInputRejectionReason } from "@hjmds/design-contracts/components/tags-input";
import { TagsInput } from "@hjmds/react/tags-input";

// 상태 → i18n 키 상수 표. 키를 템플릿 문자열로 만들지 않는다.
const tagErrorKey: Record<TagsInputRejectionReason, string> = {
  empty: "post.tagError.empty",
  duplicate: "post.tagError.duplicate",
  limit: "post.tagError.limit",
  invalid: "post.tagError.invalid",
};

<TagsInput
  label={t("post.tags")}
  tags={tags}
  onTagsChange={setTags}
  policy={{ maxTags: 10 }}
  onReject={(result) => setError(result.reason ? t(tagErrorKey[result.reason]) : undefined)}
  composeRemoveLabel={(tag) => t("post.removeTag", { tag })}
/>
```

```tsx
// Native
import { TagsInput } from "@hjmds/react-native/tags-input";

<TagsInput
  label={t("post.tags")}
  tags={tags}
  onTagsChange={setTags}
  composeRemoveLabel={(tag) => t("post.removeTag", { tag })}
/>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `tags` + `onTagsChange` / `defaultTags` | `readonly string[]`, `(tags: readonly string[]) => void` | `defaultTags` `[]` | controlled 또는 uncontrolled. 콜백은 다음 태그 배열 전체를 받는다 |
| `policy.allowDuplicates` | `boolean` | 막음 | 중복 허용 여부 |
| `policy.maxTags` · `policy.isValid` | `number` · `(value: string) => boolean` | — | 거절되면 `onReject`가 결과를 받는다 |
| `onReject` | `(result: { accepted: boolean, value: string, reason?: "empty" \| "duplicate" \| "limit" \| "invalid" }) => void` | — | 사유 문장은 제품이 `reason`으로 고른다 |
| `onDraftChange` | `(draft: string) => void` | — | 입력 중 문자. 후보 필터링에 쓴다 |
| `composeRemoveLabel` | `(tag: string) => string` | — (필수) | 태그 삭제 버튼 이름 |
| `commitKeys` | `Enter` · `Comma` · `Space` · `Blur` | `["Enter"]` | Web만. Native는 Return 하나다 |
| `suggestions` · `suggestionsLabel` | 제품이 거른 후보(`id`·`label`·`value?`·`disabled?`)와 목록 이름 | — | 거르려면 `onDraftChange`로 입력 중 문자를 받는다 |
| `placeholder`·`description`·`disabled` | `string`·`string`·`boolean` | — | `disabled`는 라벨과 입력 틀을 `fieldRecipe.disabledOpacity`(0.6)로 흐리고 `description`은 그대로 둔다([Field](field.md)) |
| `layoutStyle` | `HjmCompositionStyleProp` | — | 필드 전체 배치. Web·Native 모두 |
| `style`(Native) | `StyleProp<ViewStyle>` | — | deprecated — `layoutStyle`. 개발 모드에서 한 번 경고하고 다음 major에서 제거된다 |

## 배치

Native는 제품 프로필의 `tokens.fontFamily.ui`를 실제 텍스트/입력 host에 연결한다. 기본 UI stack은 OS 서체를 유지하고, 제품이 지정한 첫 named font의 등록·글리프 확인은 제품이 맡는다.
Native 입력칸은 `tokens.typography.body`의 글자·줄 높이도 읽는다. Provider가 textScale을 제어하면 한 번만 확대하고 시스템의 추가 확대를 끈다. 태그/편집 초안은 테마 전환 때 유지한다.

Native 입력 프레임의 `md` 모서리는 Provider의 `tokens.radius.md`를 읽는다. pill 태그와 고정 삭제 glyph는 그대로이며 프로필 교체는 입력 중인 초안·태그를 유지한다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 입력 틀 최소 높이 44(필드 틀과 같음), 모서리 `radius.md` 12. 입력 칸 최소 Web `8ch`, Native 80. 태그 칩 높이 28, 삭제 버튼 터치 영역 44(`control.minTouchTarget`). 후보 행 최소 높이 44(두 플랫폼, Native는 미게시(1.12.1 이후). 1.12.1 Native는 28) | `tagsInputRecipe`, `.hjm-tags-input__frame`·`__remove::after`·`__suggestion` |
| 간격 | 라벨과 틀 사이 Web `spacing.xxs` 4, Native `spacing.xs` 8. 틀 안 태그·입력 칸 사이 `spacing.xs` 8. 이웃 필드와의 간격은 폼이 정한다 | `.hjm-tags-input`, `react-native/src/tags-input.tsx` |
| 순서·정렬 | 라벨 → 입력 틀 → 후보 목록 → 설명. 폼 안에서 다른 [Field](field.md)와 같은 세로 줄에 두고 폭을 꽉 채운다 | `react/src/tags-input.tsx`, `react-native/src/tags-input.tsx` |
| 고정·스크롤 | 후보 목록은 틀 바로 아래 문서 흐름에 펼쳐진다(떠 있는 층이 아니다). Web은 최대 높이 12rem에서 스크롤 | `.hjm-tags-input__suggestions` |
| 좁은 폭·큰 글자 | 태그와 입력 칸이 넘치면 줄바꿈해 틀이 세로로 자란다. 태그 글자는 잘리지 않는다(`overflow-wrap: anywhere`) | `.hjm-tags-input__frame`·`__tag` |

## 꼭 지킬 것

- `label`과 `composeRemoveLabel`은 필수다. 삭제 버튼 이름은 태그 글자를 넣은 i18n 문장으로 만든다.
- 거절 사유 문장("이미 있어요")은 제품이 `reason`으로 만든다. HJM은 판정만 한다.
- 한국어처럼 공백이 값의 일부인 도메인에서는 `Space`를 확정 키로 켜지 않는다.
- 후보 필터링·정렬은 제품이 한다. HJM은 받은 후보를 보여 주고 고른 값을 확정한다.
- 배치는 `layoutStyle`로 한다(Web `className`도 받는다). Native `style`은 deprecated다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 확정 키 | `commitKeys` | Return만(`commitKeys` 없음), 포커스 이탈로 확정하지 않음 |
| 빈 입력 Backspace | 첫 번째는 마지막 태그 선택, 두 번째에 삭제 | 해당 키 계약 없음, 태그 옆 삭제 버튼 |
| 후보 이동 | ArrowUp/Down(끝에서 순환) | 후보를 버튼으로 누름 |
| ref | `forwardRef`(`input`) | 없음 |
| 스타일 prop | `className`, `layoutStyle` | `layoutStyle`(`style`은 deprecated) |


### 고정 아이콘과 큰 글자

2026-10-06 최근 검색 삭제 기호가 큰 글자에서 잘린 재현에 따라 Native 내장 삭제·메뉴 기호는 고정 아이콘 틀의 크기를 유지한다. 주변 제목·라벨은 계속 확대한다. Chip의 체크와 Toast 닫기는 기존 비확대 경로를 유지하며 회귀 검사에 포함한다. 제품이 전달한 아이콘 슬롯은 제품이 같은 조건을 검증한다.
