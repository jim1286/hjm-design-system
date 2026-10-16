# NotificationRow

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.26.0
- 검토일: 2026-10-16
- 근거: [알림 화면](../screens/common-inbox.md), `src/screen-patterns.ts`의 `notificationRowRecipe`, 양 renderer `src/screens.tsx`
- 스토리북: 별도 예제 미등록

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
<Link href={destination} aria-label={accessibleSummary}>
  <NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread} />
</Link>
```

```tsx
// Native
import { NotificationRow } from '@hjmds/react-native/screens';
<Pressable accessibilityRole="link" accessibilityLabel={accessibleSummary} onPress={openNotification}>
  <NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread} />
</Pressable>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| avatar | ReactNode | 필수 | 행위자 아바타(원형으로 잘림) |
| preview | ReactNode | 필수 | 인라인 텍스트 콘텐츠. 상호작용 요소를 넣지 않는다 |
| metadata | string | 필수 | 현지화된 시간 |
| avatarBadge | ReactNode | 없음 | 아바타 오른쪽 아래 유형 배지 |
| thumbnail | ReactNode | 없음 | 대상 썸네일 |
| unread | boolean | false | 시간 옆 읽지 않음 점 |

## 배치

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 아바타·썸네일 44, 유형 배지 20, 읽지 않음 점 6 | `notificationRowRecipe` |
| 간격 | 가로 gap 12, 내용 gap 4, 안쪽 여백 세로 12 · 가로 16 | 같은 recipe |
| 순서·정렬 | 아바타(+배지) → 미리보기 / 시간·읽지 않음 점 → 썸네일, 세로 가운데 | 양 renderer |
| 고정·스크롤 | 바깥 목록 host 소유 | 별도 scroller 없음 |
| 좁은 폭·큰 글자 | 미리보기 최대 2줄 말줄임, 아바타·썸네일은 줄지 않는다 | `previewLines: 2`, `flexShrink: 0` |

HJM이 44px 아바타·썸네일, 20px 유형 배지, 2줄 미리보기와 간격을 소유한다. `avatarBadge`·`thumbnail`은 선택 슬롯이다. 앱은 별도 행 padding을 넣지 않는다.

## 꼭 지킬 것

제품은 바깥 링크/Pressable 하나에서 이동, disabled, 전체 접근성 이름을 연결한다. 내부는 장식 표현이므로 별도 클릭 대상을 넣지 않는다. `preview`는 인라인 텍스트 콘텐츠다. HJM 내부 색·간격을 제품 CSS로 덮지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 낭독 숨김 | 루트 `aria-hidden="true"` | `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"` |
| 미리보기 줄 수 | `-webkit-line-clamp: 2` | `numberOfLines={2}` |

## 관련 지침

[알림 화면](../screens/common-inbox.md), [ConversationRow](conversation-row.md), [ListRow](list-row.md).
