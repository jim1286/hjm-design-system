# OverviewScreen

- 단계: 컴포넌트
- 상태: 실험
- 지원: Web · Native
- 적용: 1.15.0
- 검토일: 2026-10-07
- 근거: [디자인 프로필](../../design-profile.md), 양 renderer `src/design-profile.tsx`; 기존 ScreenLayout·Grid·Collapsible의 상태 엔진을 재사용한다.
- 스토리북: `실험/컴포넌트/레이아웃/목록 화면 골격`

## 언제 쓰나

같은 데이터와 기능을 유지하면서 테마별 행·카드·격자와 도구 배치를 선택하는 목록 화면에 쓴다.

기본 공개 API는 npm 1.15.0에 있다. 후속 글자 역할·종이 줄 간격·토큰 소비 개선의 main 구현은 별도 미게시이며, 이 적용 버전으로 후속 개선까지 게시됐다고 해석하지 않는다.

## 쓰지 않을 때

| 상황 | 대신 쓸 것 |
| --- | --- |
| 설정·검색·알림 | [SettingsScreen](settings-screen.md), [SearchScreen](search-screen.md), [NotificationInboxScreen](notification-inbox-screen.md) |
| 앱 전체 navigation | [Layout](layout.md) |
| 임의 마케팅 페이지 | 제품의 페이지 구조 |

## 공개 이름과 import

| 이름 | 역할 | Web | Native |
| --- | --- | --- | --- |
| `OverviewScreen` | 프로필 기반 목록 화면, supplemental | `@hjmds/react/design-profile` | `@hjmds/react-native/design-profile` |

root barrel에 넣지 않는다. Native 질감은 기존 optional `react-native-svg` host가 필요하다. 프로필 레지스트리는 renderer core에 번들하지 않는다.

## 최소 사용 예

```tsx
// Web
import { HjmProvider } from "@hjmds/react/provider";
import { OverviewScreen } from "@hjmds/react/design-profile";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
const design = defineHjmDesignProfile({ extends: "forest", id: "app-forest" });
<HjmProvider designProfile={design}>
  <OverviewScreen title={t("records.title")} toolbarLabel={t("records.tools")}
    toolbar={<RecordTools />} items={records.map(record => ({ id: record.id, children: <RecordSummary record={record} /> }))}
    footer={<SaveAction />} />
</HjmProvider>
```

```tsx
// Native
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
<HjmNativeProvider designProfile={design}>
  <OverviewScreen title={t("records.title")} toolbarLabel={t("records.tools")}
    toolbar={<RecordTools />} items={records.map(record => ({ id: record.id, children: <RecordSummary record={record} /> }))}
    footer={<SaveAction />} />
</HjmNativeProvider>
```

## 배치

헤더 → notice → 도구 → 목록 → footer. 뒤로는 leading, 화면 도구는 actions, 주 행동은 footer다. 하나의 화면에 경쟁하는 주 행동을 추가하지 않는다.

| 항목 | 값 | 근거 |
| --- | --- | --- |
| 크기 | editorial은 `layout.readingMaxWidth` 720, dashboard·landscape는 `layout.contentMaxWidth` 1200, host가 높이를 제공한다 | `resolveDesignProfileScreen`, ScreenLayout |
| 간격 | 도구–목록 `spacing.xl` 24, rows `spacing.sm` 12, cards/grid `spacing.lg` 20, 카드 내부 rows `spacing.md` 16 / 나머지 `spacing.xl` 24 | OverviewScreen·공유 collection resolver |
| 순서·정렬 | 헤더 → notice → 도구 → 목록 → footer. leading은 뒤로, actions는 화면 도구, footer는 주 행동 | ScreenLayout 슬롯 |
| 고정·스크롤 | 헤더·notice·footer 고정, 본문 스크롤. 가상 목록은 별도 ScreenLayout + `scroll="content"` | ScreenLayout 상태·스크롤 엔진 |
| 좁은 폭·큰 글자 | rows 1/1/1, cards 1/2/2, grid 1/2/3(compact/medium/expanded). 최소 열 폭 240이며 실제 컨테이너·글자 배율로 열 수를 줄인다 | `resolveDesignProfileCollection`·Grid |

`collection`, `toolbarPresentation`, `presentation` 명시값이 프로필을 이긴다. 작은 화면의 열 수는 늘리지 않는다. virtual list는 이 정적 items 목록 대신 기존 ScreenLayout의 `scroll="content"`와 제품 list를 쓴다.

## 꼭 지킬 것

ScreenLayout의 ready/loading/empty/error와 stateAction을 그대로 사용한다. 초기 조회 오류만 본문을 교체하고 저장 실패는 notice로 알린다. stable id가 중복되거나 비어 있으면 거부한다. 도구를 닫으면 입력 상태는 유지하되 접근성·포커스 대상에서 제외한다. 제품이 서버 확정·재시도·동시 저장 방지를 소유한다. 프로필은 같은 아이템의 입력 subtree를 갈아 끼우지 않는다.
