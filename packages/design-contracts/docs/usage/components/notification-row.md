# NotificationRow

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-16
- 근거: [알림 화면](../screens/common-inbox.md), `src/screen-patterns.ts`의 `notificationRowRecipe`, 양 renderer `src/screens.tsx`
- 스토리북: `배포/컴포넌트/데이터 표시/알림 미리보기 행`

## 언제 쓰나

알림 목록에서 아바타, 유형 배지, 미리보기, 시간, 읽지 않음 표시, 선택적 썸네일을 나란히 배치한다. 2026-10-15 소비 앱이 같은 알림 배치를 각각 복제한 원인을 공통 구현에서 해결했다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 대화 목록 미리보기 | [ConversationRow](conversation-row.md) |
| 일반 설정·목록 행 | [ListRow](list-row.md) |
| 알림 화면 전체 틀 | [NotificationInboxScreen](notification-inbox-screen.md) |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `NotificationRow` | 알림 한 행 표시 | `@hjmds/react/screens` | `@hjmds/react-native/screens` |

## 최소 사용 예

```tsx
// Web
import { NotificationRow } from '@hjmds/react/screens';
<NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread}
  separator={index > 0}
  action={{ label: accessibleSummary, disabled: !destination, onActivate: openNotification }} />
```

```tsx
// Native
import { NotificationRow } from '@hjmds/react-native/screens';
<NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread}
  separator={index > 0}
  action={{ label: accessibleSummary, disabled: !destination, onActivate: openNotification }} />
```

`action`·`separator`는 로컬 개발 중인 미게시 보완이다. 번뚝이 각 플랫폼에 클릭/비활성 host와
서로 다른 구분선 inset을 복제해 본문 시작점과 선이 어긋난 것이 계기다. 이 보완 전의 설치 패키지에서는
기존 바깥 링크/Pressable host를 사용한다. 로컬 소스에서 API를 확인한 뒤 이관한다.

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| avatar | ReactNode | 필수 | 행위자 아바타(원형으로 잘림) |
| preview | ReactNode | 필수 | 인라인 텍스트 콘텐츠. 상호작용 요소를 넣지 않는다 |
| metadata | string | 필수 | 현지화된 시간 |
| avatarBadge | ReactNode | 없음 | 아바타 오른쪽 아래 유형 배지 |
| thumbnail | ReactNode | 없음 | 대상 썸네일 |
| unread | boolean | false | 시간 옆 읽지 않음 점 |
| action | `{ label: string, onActivate(): void, disabled?: boolean }` | 없음 | 미게시. 이동/권한은 제품이 결정하고 버튼 대상·포커스·피드백은 HJM 소유. 빈 label은 TypeError |
| separator | boolean | false | 미게시. 같은 날짜 구역의 두 번째 행부터 true. 행 위에서 미리보기 시작점에 맞춘 구분선 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아바타·썸네일 44, 유형 배지 20, 읽지 않음 점 6 | `notificationRowRecipe` |
| 간격 | 가로 gap 12, 내용 gap 4, 안쪽 여백 세로 12 · 가로 16 | 같은 recipe |
| 순서·정렬 | 아바타(+배지) → 미리보기 / 시간·읽지 않음 점 → 썸네일, 세로 가운데 | 양 renderer |
| 고정·스크롤 | 바깥 목록 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 미리보기 최대 2줄 말줄임, 아바타·썸네일은 줄지 않는다 | `previewLines: 2`, `flexShrink: 0` |

구분선의 시작점은 행 여백 16 + 아바타 44 + 간격 12 = 72이며 제품은 이를 다시 계산하지 않는다.

HJM이 44px 아바타·썸네일, 20px 유형 배지, 2줄 미리보기와 간격을 소유한다. `avatarBadge`·`thumbnail`은 선택 슬롯이다. 앱은 별도 행 padding을 넣지 않는다.

## 꼭 지킬 것

`action`을 주면 바깥 버튼/링크를 추가하지 않는다. HJM이 하나의 버튼과 전체 접근성 이름을 제공하며
비활성은 콜백을 실행하지 않는다. 가상화·드래그 등 외부 target이 필요한 기존 소비자는 `action` 없이
바깥 링크/Pressable 하나에서 이동·disabled·전체 접근성 이름을 연결할 수 있다. 내부는 장식 표현이므로 별도 클릭 대상을 넣지 않는다. `preview`는 인라인 텍스트 콘텐츠다. HJM 내부 색·간격을 제품 CSS로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 낭독 숨김 | 루트 `aria-hidden="true"` | `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"` |
| 미리보기 줄 수 | `-webkit-line-clamp: 2` | `numberOfLines={2}` |

## 관련 지침

[알림 화면](../screens/common-inbox.md), [ConversationRow](conversation-row.md), [ListRow](list-row.md).
