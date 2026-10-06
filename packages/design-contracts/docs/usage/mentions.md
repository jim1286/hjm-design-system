# Mentions 사용 지침

적용: `@hjmds/react`·`@hjmds/react-native` 1.12.1 · 검토일: 2026-10-06 ·
계약: [Mentions](../mentions.md), 트리거 판정 `src/mentions.ts`

## 언제 쓰나

여러 줄 입력 중 `@`(사람)·`#`(해시태그) 같은 트리거를 치면 후보를 띄우고, 고른 후보를 트리거부터 커서까지
자리에 넣고 공백 하나를 붙이는 입력에 쓴다. 댓글·게시글 본문 같은 자유 텍스트다.
트리거는 단어의 시작에서만 열리고(`user@example.com`은 열리지 않음), 공백을 치면 닫힌다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 입력창 전체가 검색어인 자동완성 | [Combobox](combobox.md) |
| 태그를 칩으로 하나씩 추가 | [TagsInput](tags-input.md) |
| 트리거 없는 여러 줄 입력 | [TextArea](text-area.md) |
| 채팅·댓글 전송 입력창 | [MessageComposer](message-composer.md) |

## 공개 이름과 import

| 이름 | Web | Native | 역할 |
| --- | --- | --- | --- |
| `Mentions` | `@hjmds/react`, `/mentions` | `@hjmds/react-native`, `/mentions` | 기본 |

## 최소 사용 예

```tsx
// Web
import { Mentions } from "@hjmds/react/mentions";

<Mentions
  label={t("post.body")}
  value={body}
  onValueChange={setBody}
  triggers={[{ id: "user", trigger: "@" }, { id: "tag", trigger: "#" }]}
  candidates={candidates}
  onMentionQueryChange={(match) => setQuery(match)}
  emptyMessage={t("mention.noMatch")}
  listLabel={t("mention.candidates")}
/>
```

```tsx
// Native
import { Mentions } from "@hjmds/react-native/mentions";

<Mentions label={t("comment.body")} value={body} onValueChange={setBody}
  triggers={[{ id: "user", trigger: "@" }]} candidates={candidates}
  onMentionQueryChange={setQuery} emptyMessage={t("mention.noMatch")} listLabel={t("mention.candidates")} />
```

## 축과 기본값

- `triggers`: `{ id, trigger }` 배열. trigger는 공백 아닌 한 글자이고 글자·id 모두 중복 불가.
- `candidates`: `{ id, label, insertText?, description? }`. 넣는 글자는 `insertText`, 없으면 `label`.
- `onMentionQueryChange(match | null)`: 활성 트리거(`triggerId`, `query`)가 바뀔 때마다 호출. 후보 필터링·로딩은 제품이 한다.
- `emptyMessage`·`listLabel`(필수, 현지화). 나머지 입력 prop(`label`, `description`, `error` 등)은 TextArea를 따른다.

## 꼭 지킬 것

- `value`/`onValueChange`로 제어한다. 후보를 고르면 새 문자열이 `onValueChange`로 온다.
- 트리거 문자를 후보 `insertText`에 넣지 않는다. 컴포넌트가 정확히 한 번 붙인다.
- `triggerId`로 후보 출처(사람·태그)를 나눈다. 후보 조회 경합·취소는 제품이 처리한다.
- 문구는 모두 i18n 키로 넣는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 후보 표시 | 입력 아래 떠 있는 listbox(portal) | 입력 아래 문서 흐름 안 목록 |
| 키보드 | ↑↓ 이동, Enter 확정, Esc 닫기(입력은 유지) | 해당 없음(누름으로 확정) |
| 기본 후보 렌더 | `label` + `description` | `label`만 |
| 추가 prop | `className`, ref(textarea) | `listStyle` |

## 함정

- 결과는 평문 문자열이다. 어느 후보를 골랐는지(id)는 돌려주지 않으므로 서버에 구조화된 멘션이 필요하면
  제품이 따로 기록하거나 본문을 파싱한다.
- Native는 커서를 `onSelectionChange`로 추적하므로 이 prop을 넘겨도 컴포넌트 것으로 덮인다.
