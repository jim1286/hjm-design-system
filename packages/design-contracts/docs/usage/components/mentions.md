# Mentions

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.12.1
- 검토일: 2026-10-07
- 근거: [Mentions](../../mentions.md), 트리거 판정 `src/mentions.ts`
- 스토리북: `배포/컴포넌트/입력/사용자 언급`

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

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `Mentions` | 기본 | `@hjmds/react`, `/mentions` | `@hjmds/react-native`, `/mentions` |

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

표의 prop은 Web·Native 공통이다. 타입 `MentionMatch`·`MentionTriggerConfig`는 `@hjmds/design-contracts/components/mentions`,
`MentionCandidate`는 각 `/mentions` entry에서 가져온다.

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | 문자열 | 필수 | 제어 값. 비제어(`defaultValue`)는 받지 않는다 |
| `onValueChange` | `(value: string) => void` | 필수 | 입력·후보 확정 때마다 전체 본문을 넘긴다 |
| `triggers` | `readonly { id: TriggerId; trigger: string }[]` | 필수 | trigger는 공백 아닌 한 글자이고 글자·id 모두 중복 불가 |
| `candidates` | `readonly { id, label, insertText?, description? }[]` | 필수 | 넣는 글자는 `insertText`, 없으면 `label` |
| `onMentionQueryChange` | `(match: { triggerId, trigger, triggerStart, query } \| null) => void` | — | 활성 트리거가 바뀔 때마다(닫힐 때 `null`) 호출. 후보 필터링·로딩은 제품이 한다 |
| `renderCandidate` | `(candidate: MentionCandidate) => ReactNode` | `label`(Web은 + `description`) | 후보 한 줄의 내용 |
| `emptyMessage` · `listLabel` | 문자열 | 필수 | 현지화 |
| `layoutStyle` | 배치 전용 style 객체 | — | Web은 입력+후보 기준 블록 전체, Native는 입력 영역만 배치한다 |
| 나머지 입력 prop | `label`, `description`, `error` 등 | — | [TextArea](text-area.md)를 따른다 |

## 배치

Native 후보 목록의 모서리는 `comboboxRecipe.popover.radius` 역할을 Provider의 `tokens.radius`에서 해석한다. 프로필 교체가 입력·caret·후보 선택을 초기화하지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 후보 한 줄 최소 높이 44(`control.minTouchTarget`). Web 목록 최대 높이 `14rem`, 입력 폭에 맞춤 | `.hjm-mentions__option`·`__list`, Native `minHeight: 44` |
| 간격 | 라벨·입력·설명·오류 사이 `spacing.xs` 8. Web 목록은 입력과 8, 화면 가장자리 8, 안쪽 8, radius `radius.md` 12 — 모두 Combobox 목록과 같은 `comboboxRecipe.popover`(sideOffset·collisionPadding·padding `spacing.xs`). Native 목록 안쪽 8(같은 recipe)·항목 사이 4, radius `radius.md` 12. 후보 좌우 여백 8. 2026-10-06까지 Web 가장자리 16·안쪽 4, Native 안쪽 4였다(1.12.1 이후 미게시) | `comboboxRecipe.popover`, `.hjm-mentions__*`, `react-native/src/mentions.tsx` |
| 순서·정렬 | 후보 목록은 입력 **바로 아래**. Web은 아래 공간이 모자라면 위로 뒤집는다. Web 후보는 `label` 옆에 `description`, 좁으면 줄바꿈 | `useAnchoredPopup`, `.hjm-mentions__option` |
| 고정·스크롤 | Web 목록은 떠 있는 portal(z-index `layer.dropdown` 400)이고 넘치면 목록 안 스크롤. Native 목록은 문서 흐름 안에 끼어들어 아래 내용을 민다 | `src/mentions.tsx`(Web·Native) |
| 좁은 폭·큰 글자 | 키보드 위 입력이면 Native 목록이 가려질 수 있으니 [KeyboardFormScrollView](keyboard-form-scroll-view.md) 안에 둔다 | — |

```text
Web                                   Native
┌ 본문 ──────────────────────┐        ┌ 본문 ──────────────────────┐
│ 라벨                        │        │ 라벨                        │
│ ┌─────────────────────────┐ │        │ ┌─────────────────────────┐ │
│ │ 안녕 @ji|               │ │        │ │ 안녕 @ji|               │ │
│ └─────────────────────────┘ │        │ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │ ← 8   │ ┌─────────────────────────┐ │ ← 흐름 안
│ │ jimin   설명            │ │ 떠 있음│ │ jimin                   │ │   (아래 내용이 밀림)
│ │ jiho                    │ │ ≤14rem │ │ jiho                    │ │
│ └─────────────────────────┘ │        │ └─────────────────────────┘ │
└─────────────────────────────┘        └─────────────────────────────┘
```

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
| 추가 prop | `className`, ref(`HTMLTextAreaElement`). `style`은 안쪽 textarea에 붙는다 | `listStyle`은 deprecated(다음 major 제거, 대체 없음 — 후보 목록 recipe가 외형을 가진다) |

## 함정

- 결과는 평문 문자열이다. 어느 후보를 골랐는지(id)는 돌려주지 않으므로 서버에 구조화된 멘션이 필요하면
  제품이 따로 기록하거나 본문을 파싱한다.
- Native는 커서를 `onSelectionChange`로 추적하므로 이 prop을 넘겨도 컴포넌트 것으로 덮인다.
