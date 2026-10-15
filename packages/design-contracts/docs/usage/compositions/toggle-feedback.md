# 선택 반응 버튼

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.20.0 이후)
- 검토일: 2026-10-15
- 근거: [선택 반응 계약](../../toggle-feedback.md), `src/toggle-feedback.ts`, 양 renderer의 `src/toggle-feedback.tsx`
- 스토리북: `실험/구성/직접 조작과 모션/선택 반응 버튼`

## 언제 쓰나

구독·북마크·좋아요에서 선택 요청과 실제 인원 수의 실패 복구, 국소 모션이 함께 필요할 때 쓴다.
단순 선택은 Button.selected, 프로필 카드가 필요하면 FollowProfileCard, 전체 축하는 Celebration을 고른다.
Web의 counter는 기존 AnimatedStatistic과 같은 `@number-flow/react`, Native의 도형은 기존 `react-native-svg`를 사용한다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| ToggleFeedbackButton | counted selection·실제 mutation·실패 복구 | [Button](../components/button.md) |
| AnimatedStatistic | 확인된 수 또는 pending 제안 수의 전환 | [Statistic](../components/statistic.md) |
| SVG/제품 아이콘 슬롯 | ripple/ribbon/burst의 국소 시각 반응 | [선택 반응 계약](../../toggle-feedback.md) |

## 배치

```text
[아이콘 + 선택 행동]    인원 label / count
                       ↑ AnimatedStatistic
오류: 이 구성의 안내 영역 중앙
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 카드·상세 본문 안 | gap=sm (`spacing.sm`, 12px) |
| 행동·수치 | Button · AnimatedStatistic | inline 행, 부족하면 wrap | gap=md (`spacing.md`, 16px), 수치 compact |
| 아이콘 | 기본 SVG / icon / renderIcon | 버튼 leading | glyph=24px, effect=40px, 중심 유지 |
| 오류 | Text | 안내 영역 가로·세로 중앙 | 임의 상단 여백 없음 |

## 흐름과 상태

1. `state={selected,count}`에 서버가 확인한 현재 값을 넣는다.
2. 선택할 때만 effect를 재생하고, 요청 중 제안 snapshot을 표시한다. 동시에 여러 요청을 보내지 않는다.
3. `onSelectedChange`는 실제 서버 snapshot으로 제품 state를 갱신한 뒤 resolve한다.
4. 실패하면 confirmed props로 복구한다. 같은 버튼으로 재시도한다. entityId를 바꾸면 이전 응답을 분리한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 실제 selected와 인원, 초기 선택에는 장식 없음 | 기존 Button 선택/키보드 계약 |
| 진행 중 | 제안 선택·수치, 버튼 내부 로딩·중복 잠금 | 선택 시만 국소 모션 |
| 실패 | confirmed 상태·중앙 오류 | Web alert / Native assertive, 같은 행동으로 재시도 |
| 해제 | selected 해제·인원 감소 | burst/ripple/ribbon 재생 없음 |
| 환경 정지 | 최종 아이콘과 실제 수치 | reducedMotion·active=false·백그라운드에서 장식 제거 |

모션은 `motion.slow` 320ms이며 Web/Native 모두 React 프레임 state를 만들지 않는다.
제품의 커스텀 아이콘은 `renderIcon({selected,pending})`으로 pending 선택까지 반영할 수 있다.

## 코드 골격

```tsx
// Web
import { ToggleFeedbackButton } from "@hjmds/react/toggle-feedback";
<ToggleFeedbackButton entityId={channel.id} state={confirmedSubscription} effect="ripple"
  locale={locale} labels={subscriptionLabels} renderIcon={renderBrandBell}
  onSelectedChange={async selected => {
    const confirmed = await api.setSubscription(channel.id, selected);
    updateChannelCache(channel.id, confirmed);
  }} />;
```

```tsx
// Native
import { ToggleFeedbackButton } from "@hjmds/react-native/toggle-feedback";
<ToggleFeedbackButton entityId={post.id} state={confirmedLike} effect="burst"
  locale={locale} labels={likeLabels} renderIcon={renderProductHeart}
  onSelectedChange={async selected => {
    const confirmed = await api.setLike(post.id, selected);
    updatePostCache(post.id, confirmed);
  }} />;
```

북마크는 같은 API에 `effect="ribbon"`을 준다. 실제 실행 예제는
Web `showcase/web/src/patterns/toggle-feedback-preview.tsx`, Native `showcase/native/src/toggle-feedback-preview.tsx`다.
예시 callback은 명시적 fixture이며 제품 서버나 기기 성능 검증이 아니다.
