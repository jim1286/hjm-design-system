# CompositionLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 미게시(1.22.0 이후)
- 검토일: 2026-10-15
- 근거: 양 renderer `src/screens.tsx`, [소유권](../SELECTION.md#소유권). 제품별 제목·배지·상태·하단 영역 재조립을 줄이기 위해 기존 Stack·상태 계약을 합성한다.
- 스토리북: `배포/화면/설정/알림 설정`

## 언제 쓰나

카드·패널·화면 본문 안의 콘텐츠 묶음에 제목·배지·행동·안내·본문·하단 영역이 필요할 때 쓴다.
전용 구성 API가 있으면 그것을 우선 사용한다. 단순 Stack은 배치 primitive이며 이 구성은 영역 순서와 상태 교체를 소유한다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 전체 화면 높이와 고정 헤더/footer·스크롤 | [ScreenLayout](screen-layout.md) |
| 댓글·채팅 | [CommentThreadScreen](comment-thread-screen.md)·[ChatScreen](chat-screen.md) |
| 장식 표면 | [Surface](surface.md)를 바깥에 사용 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `CompositionLayout` | 구성 골격 | `/screens` | `/screens` |

## 최소 사용 예

```tsx
// Web
import { CompositionLayout } from "@hjmds/react/screens";
<CompositionLayout title={title} badge={badge} actions={actions}
  notice={notice} state={state} stateAction={retry} footer={footer}>
  {content}
</CompositionLayout>
```

```tsx
// Native
import { CompositionLayout } from "@hjmds/react-native/screens";
<CompositionLayout title={title} badge={badge} actions={actions}
  notice={notice} state={state} stateAction={retry} footer={footer}>
  {content}
</CompositionLayout>
```

## 축과 기본값

| prop | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| title / description | string | 없음 | 제품 지역화 문구 |
| leading / badge / actions | ReactNode | 없음 | 앞 콘텐츠·제목 옆 배지·끝 행동. 자리와 간격은 HJM |
| notice | ReactNode | 없음 | 초안을 유지하는 비차단 안내 |
| children | ReactNode | 없음 | 제품 도메인 콘텐츠 또는 HJM 전용 구성 |
| footer | ReactNode | 없음 | 본문 다음 보조/주 행동; 고정은 바깥 ScreenLayout 소유 |
| state | ScreenContentState | ready | 본문 교체; loading은 Spinner만 표시 |
| stateAction | ReactNode | 없음 | 본문 상태와 중앙 정렬되는 복구 행동 |
| layoutStyle | HjmCompositionStyleProp | 없음 | 부모가 제공하는 영역 크기·배치 |

## 배치

```text
leading → 제목·배지 / 설명 → actions
notice
본문 또는 중앙 상태·복구
footer
```

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | 부모의 가용 폭·높이 | 별도 고정 높이나 스크롤 없음 |
| 간격 | 영역 spacing.md 16, 제목 행 spacing.sm 12, 배지 spacing.xs 8, 제목/설명 spacing.xxs 4 | Stack props |
| 순서·정렬 | 머리글 → notice → 본문 → footer | renderer |
| 고정·스크롤 | 부모 HJM 화면이 소유, 자체 ScrollView 없음 | renderer |
| 좁은 폭·큰 글자 | 머리글·배지 줄바꿈, 본문 폭 축소 허용 | flexWrap·minWidth |

## 꼭 지킬 것

- 데이터·권한·초안·저장·배지 의미는 제품에서 연결한다. 전송 성공을 추정하거나 초안을 자동으로 지우지 않는다.
- 본문 교체는 초기 조회에, 기존 입력을 유지하는 실패는 notice에 연결한다.
- 중앙 상태는 이 구성에 주어진 영역을 기준으로 한다. 화면 높이를 임의 여백으로 흉내 내지 않는다.
- 별도 스크롤을 중첩하지 않는다. 기본 구조를 children 안에서 다시 만들지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 의미 | Heading·alert/status | header·accessibilityLiveRegion |
| 환경 | 부모 화면의 높이 | 부모 화면의 safe area·키보드 |
