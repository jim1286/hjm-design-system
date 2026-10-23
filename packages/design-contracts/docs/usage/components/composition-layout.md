# CompositionLayout

- 단계: 컴포넌트
- 상태: 배포
- 지원: Web · Native
- 적용: 1.23.0
- 검토일: 2026-10-23
- 근거: 양 renderer `src/screens.tsx`, [소유권](../SELECTION.md#소유권). 제품별 제목·배지·상태·하단 영역 재조립을 줄이기 위해 기존 Stack·상태 계약을 합성한다.
- 스토리북: `배포/컴포넌트/레이아웃/구성 골격`, `배포/화면/설정/알림 설정`

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
| titleSize | default · compact | default | 1.37.0. compact는 body(14)·500으로 표시하고 제목 의미를 유지한다. 2026-10-20 Spint 시트의 TOP 제목 축소 요청 |
| title / description | string | 없음 | 제품 지역화 문구 |
| leading / badge / actions | ReactNode | 없음 | 앞 콘텐츠·제목 옆 배지·끝 행동. 자리와 간격은 HJM |
| notice | ReactNode | 없음 | 초안을 유지하는 비차단 안내 |
| loadingIndicator | ReactNode | 기본 Spinner | loading 상태의 제품 브랜드 그림. HJM이 제목·설명을 접근성 이름으로 전달하고 중앙 배치를 소유하며 ready/error에는 표시하지 않는다(1.24.0) |
| children | ReactNode | 없음 | 제품 도메인 콘텐츠 또는 HJM 전용 구성 |
| aside | ReactNode | 없음 | 제목·본문 옆의 비상호작용 보조 그림. 머리글 actions로 장식을 넣어 다음 줄로 밀리던 Diairy 엽서 카드 문제에서 추가(2026-10-20). 최대 폭 40%, 본문은 남은 폭에서 줄바꿈 |
| footerAside | ReactNode | 없음 | footer 끝의 짧은 보조 정보. 좁으면 다음 줄로 감싸며 본문 상태 교체와 독립 |
| footer | ReactNode | 없음 | 본문 다음 보조/주 행동; 고정은 바깥 ScreenLayout 소유 |
| state | ScreenContentState | ready | 본문 교체; loading은 Spinner만 표시. empty 제목은 body(14), 오류·접근 제한 제목은 title |
| stateAction | ReactNode | 없음 | 본문 상태와 중앙 정렬되는 복구 행동 |
| stateHeight | fit · compact · regular · large | fit | loading·empty·error·restricted가 본문을 대신할 때 그 자리에서 확보하는 최소 높이(`screenPatternRecipe.compositionState.minHeight`: compact 96 · regular 160 · large 220, fit은 상태 자체 높이). 부모가 높이를 주지 않아도 상태가 그 영역 가운데에 온다. ready 본문에는 적용하지 않는다. 개발 소스, 미게시 |
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
| 크기 | 부모의 가용 폭·높이. 상태 교체 영역만 `stateHeight` 단계의 최소 높이를 가진다 | 별도 고정 높이나 스크롤 없음 |
| 제목·상태 문구 | 제목은 두 플랫폼 모두 `Heading level5`(문서 단계는 `headingLevel`). 상태 블록은 제목(`Text title`)·설명이 블록 줄로 가운데 정렬된다 | renderer. 2026-10-17 화면 검토: Native 제목이 작은 `Text title`이었고 Web 상태 문구가 한 줄로 이어져 왼쪽 정렬됐다 |
| 간격 | 영역 spacing.md 16, 제목 행 spacing.sm 12, 배지 spacing.xs 8, 제목/설명 spacing.xxs 4 | Stack props |
| 순서·정렬 | 머리글 → notice → 본문 → footer | renderer |
| 고정·스크롤 | 부모 HJM 화면이 소유, 자체 ScrollView 없음 | renderer |
| 좁은 폭·큰 글자 | 머리글·배지 줄바꿈, 본문 폭 축소 허용 | flexWrap·minWidth |

## 꼭 지킬 것

- 데이터·권한·초안·저장·배지 의미는 제품에서 연결한다. 전송 성공을 추정하거나 초안을 자동으로 지우지 않는다.
- 본문 교체는 초기 조회에, 기존 입력을 유지하는 실패는 notice에 연결한다.
- 중앙 상태는 이 구성에 주어진 영역을 기준으로 한다. 화면 높이를 임의 여백으로 흉내 내지 않는다.
- 부모 높이가 없는 구획(카드·패널·탭 본문)에서 상태 자리를 확보할 때는 `stateHeight`를 쓴다. `<View style={{ minHeight: N }}>`로 감싸고 `layoutStyle={{ flex: 1 }}`을 주는 조립을 하지 않는다. 단계 선택: 레일·인라인 저장 오류·공유 카드 행은 `compact`, 목록·표 구획 본문은 `regular`, 필드·차트 패널은 `large`, 한 줄 인라인 로딩은 `fit`.
- 별도 스크롤을 중첩하지 않는다. 기본 구조를 children 안에서 다시 만들지 않는다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 의미 | Heading·alert/status | header·accessibilityLiveRegion |
| 환경 | 부모 화면의 높이 | 부모 화면의 safe area·키보드 |

제목과 설명 묶음은 자연 너비를 기준으로 늘어나며 부모 너비를 넘지 않는다. 제목과 actions가 한 줄에 들어가지 않으면 actions가 다음 줄로 이동한다. Spint 셀에서 제목이 정렬 버튼 옆의 남은 폭으로 압축되던 문제를 양 renderer에서 수정했다(1.37.0).

2026-10-19 사용자 지시: 앱·모바일 웹뷰의 큰 글씨를 지양하므로 구획 제목은 두 renderer 모두 18(level5)을 기본으로 쓴다.
headingLevel은 문서 구조만 결정한다. 기존 24는 상한이며 일반 카드·선택 영역 제목의 기본값이 아니다.

`stateHeight` 근거: 2026-10-23 소비 감사. 야잘알이 QueryRegion·LeadersRail·MatchFieldPanel 등 13곳 이상에서 상태 영역을 `minHeight` 36·68·88·96·120·160·180·220 View로 감쌌다. 이 값들을 세 단계(68–96 → 96, 120–180 → 160, 220)로 묶어 recipe가 소유한다.

`aside`는 제목·본문 묶음의 끝 쪽에 놓이고 footer는 카드 전체 폭을 사용한다. 지원 그림 자체의 크기·브랜드는 제품이 결정하며, 위치·본문의 가변 폭·footer 줄바꿈은 이 구성이 소유한다.
