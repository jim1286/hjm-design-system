# NotificationRow

- 단계: 구성
- 상태: 후보
- 지원: Web · Native
- 근거: [알림 화면](../screens/common-inbox.md)

## 언제 쓰나
알림 목록에서 아바타, 유형 배지, 미리보기, 시간, 읽지 않음 표시, 선택적 썸네일을 나란히 배치한다. 2026-10-15 소비 앱이 같은 알림 배치를 각각 복제한 원인을 공통 구현에서 해결했다.

## 공개 이름과 import
Web은 `@hjmds/react/screens`, Native는 `@hjmds/react-native/screens`의 `NotificationRow`를 사용한다.

## 최소 사용 예
```tsx
// Web
import { NotificationRow } from '@hjmds/react/screens';
<NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread} />
```
```tsx
// Native
import { NotificationRow } from '@hjmds/react-native/screens';
<NotificationRow avatar={avatar} preview={message} metadata={timeLabel} unread={unread} />
```

## 배치와 소유권
HJM이 44px 아바타·썸네일, 20px 유형 배지, 2줄 미리보기와 간격을 소유한다. `avatarBadge`·`thumbnail`은 선택 슬롯이다. 제품은 바깥 링크/Pressable 하나에서 이동, disabled, 전체 접근성 이름을 연결한다. 내부는 장식 표현이므로 별도 클릭 대상을 넣지 않는다. `preview`는 인라인 텍스트 콘텐츠다.
