# ChatDateSeparator

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.31.0
- 검토일: 2026-10-18
- 근거: [반복 화면 조합](../../screen-patterns.md), `src/screen-patterns.ts`의 `chatDateSeparatorRecipe`; Web·Native `src/screens.tsx`
- 스토리북: `배포/컴포넌트/데이터 표시/대화 날짜 구분`

## 언제 쓰나

대화 타임라인에서 날짜(또는 오래 쉰 뒤의 시각)가 바뀌는 자리에 가운데 정렬 구분 줄을 둘 때 쓴다. 문구 포맷("오늘", "10월 18일 토요일", "오후 3:04")과
구분을 넣을 위치(날짜 변경·간격 기준)는 제품이 정하고, HJM은 줄의 배치·글자·간격을 맡는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 일반 목록의 구획 제목 | [Section](section.md), [List](list.md) 묶음 제목 |
| 선만 필요한 구분 | [Divider](divider.md) |
| 메시지마다 붙는 시각 | [ChatMessage](chat-message.md) `timestamp` |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `ChatDateSeparator` | 기본 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

루트 barrel에는 없다.

## 최소 사용 예

```tsx
// Web
import { ChatDateSeparator, ChatMessage } from "@hjmds/react/screens";

{rows.map(row => <Fragment key={row.message.id}>
  {row.dayChanged ? <ChatDateSeparator label={formatDay(row.message.sentAt)} dateTime={row.message.sentAt.slice(0, 10)} /> : null}
  <ChatMessage {...toMessageProps(row.message)}>{row.message.text}</ChatMessage>
</Fragment>)}
```

```tsx
// Native
import { ChatDateSeparator, ChatMessage } from "@hjmds/react-native/screens";

const renderItem = ({ item }: { item: Row }) => <>
  {item.dayChanged ? <ChatDateSeparator label={formatDay(item.message.sentAt)} /> : null}
  <ChatMessage {...toMessageProps(item.message)}><Text>{item.message.text}</Text></ChatMessage>
</>;
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `label` | `string` | 필수 | 제품이 포맷한 날짜·시각. 빈 문자열은 `TypeError` |
| `dateTime` | `string` | 없음 | Web `<time dateTime>` 값(예: `2026-10-18`). Native는 쓰지 않는다 |
| `layoutStyle` | `HjmCompositionStyleProp` | 없음 | 행 배치 전용. 색·여백을 덮지 않는다 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 타임라인 폭 전체 행, 글자 `textVariant` caption · `tone` muted | `chatDateSeparatorRecipe` |
| 간격 | 위 `paddingTop`(`spacing.sm`) 12, 아래 `paddingBottom`(`spacing.xxs`) 4. 다음 메시지는 자기 `groupPosition` 위 여백(새 묶음 12)을 그대로 가진다 | `chatDateSeparatorRecipe`, `resolveChatMessageGroupDisplay` |
| 순서·정렬 | 구분할 메시지 바로 앞, 가로 가운데 | Web·Native `ChatDateSeparator` |
| 고정·스크롤 | 자체 고정 없음. 타임라인과 함께 스크롤한다 | — |
| 좁은 폭·큰 글자 | 글자는 줄바꿈되고 자르지 않는다 | Web·Native `ChatDateSeparator` |

## 꼭 지킬 것

- 구분 줄 뒤의 메시지는 새 묶음으로 시작한다(`resolveChatMessageGroups`가 같은 시각 문자열이면 묶으므로, 날짜가 바뀌면 제품이 묶음을 끊는다).
- 문구는 제품이 지역화·포맷한다. HJM은 날짜를 해석하지 않는다.
- 읽기 순서상 메시지 사이 일반 글자로 읽힌다. 따로 live region이나 heading 역할을 주지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 시각 의미 | `dateTime`이 있으면 `<time>` | 글자만 |

## 근거

- 공통 날짜 구분: 2026-10-18 유틸버스 채팅. ChatScreen에 시각 구분 줄이 없어 가운데 흐린 caption을 제품이 직접 그렸다(위 12·아래 8 여백). 아래 여백은 다음 메시지의 묶음 여백 12와 겹치지 않도록 4로 정했다.
