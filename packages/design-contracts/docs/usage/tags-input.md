# TagsInput 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [TagsInput contract](../tags-input.md), recipe `tagsInputRecipe`(`src/tags-input.ts`)

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

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `TagsInput` | `@hjmds/react`, `/tags-input` | `@hjmds/react-native`, `/tags-input` | 기본 |

## 최소 사용 예

```tsx
// Web
import { TagsInput } from "@hjmds/react/tags-input";

<TagsInput
  label={t("post.tags")}
  tags={tags}
  onTagsChange={setTags}
  policy={{ maxTags: 10 }}
  onReject={(result) => setError(result.reason ? t(`post.tagError.${result.reason}`) : undefined)}
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

- 값: `tags`+`onTagsChange`(controlled) 또는 `defaultTags`(기본 `[]`).
- `policy`: `allowDuplicates`(기본 막음) · `maxTags` · `isValid`. 거절되면 `onReject`가
  `{ accepted: false, value, reason }`을 받는다. `reason`은 `empty` · `duplicate` · `limit` · `invalid`.
- 확정: Web `commitKeys`는 기본 `["Enter"]`, `Comma` · `Space` · `Blur`를 더할 수 있다. Native는 Return 하나다.
- 후보: 제품이 거른 `suggestions`(`id`·`label`·`value?`·`disabled?`)와 `suggestionsLabel`을 넘긴다.
  거르려면 `onDraftChange`로 입력 중 문자를 받는다.

## 꼭 지킬 것

- `label`과 `composeRemoveLabel`은 필수다. 삭제 버튼 이름은 태그 글자를 넣은 i18n 문장으로 만든다.
- 거절 사유 문장("이미 있어요")은 제품이 `reason`으로 만든다. HJM은 판정만 한다.
- 한국어처럼 공백이 값의 일부인 도메인에서는 `Space`를 확정 키로 켜지 않는다.
- 후보 필터링·정렬은 제품이 한다. HJM은 받은 후보를 보여 주고 고른 값을 확정한다.
- `layoutStyle`은 없다. Web은 `className`, Native는 `style`만 받는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 확정 키 | `commitKeys` | Return만(`commitKeys` 없음), 포커스 이탈로 확정하지 않음 |
| 빈 입력 Backspace | 첫 번째는 마지막 태그 선택, 두 번째에 삭제 | 해당 키 계약 없음, 태그 옆 삭제 버튼 |
| 후보 이동 | ArrowUp/Down(끝에서 순환) | 후보를 버튼으로 누름 |
| ref | `forwardRef`(`input`) | 없음 |
| 스타일 prop | `className` | `style` |
