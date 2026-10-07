# 테마 조합

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.14.0 이후)
- 검토일: 2026-10-07
- 근거: [프로필 계약](../../design-profile.md), [조사와 QA](../../../../../docs/qa/2026-10-07-design-profile-research.md), 두 Showcase `design-profile-preview.tsx`
- 스토리북: `실험/구성/비교와 검증/테마 조합`

## 언제 쓰나

같은 기능에 10가지 표현을 적용하고, 앱 소유 테마 설정을 넣었을 때 네 단계의 전파와 상태 유지를 검토할 때 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Provider | 한 번 선택한 프로필 상속 | [프로필 계약](../../design-profile.md) |
| SegmentedControl | 테마/기간 선택 | [선택 입력](../components/segmented-control.md) |
| OverviewScreen | 도구·목록·주 행동 | [목록 화면](../components/overview-screen.md) |
| Tabs | 프로필 상속/명시 표시와 방문한 패널의 초안 유지 | [탭](../components/tabs.md) |
| Card | 무늬 위의 표면 질감과 초안 | [카드](../components/card.md) |
| Asset | 같은 그림의 프로필 둥근 액자와 명시한 정사각·원형 비교 | [자산](../components/asset.md) |
| Heading | 선택 테마의 5단계 제목 크기 | [제목](../components/heading.md) |
| BottomCTA | 저장·실패 재현과 위쪽 그림자 | [하단 행동](../components/bottom-cta.md) |
| Popover(Web) | 비모달 초안과 같은 프로필 순회 | [팝오버](../components/popover.md) |
| Dialog·Sheet | 열린 초안과 같은 프로필 순회 | [대화상자](../components/dialog.md) · [패널](../components/sheet.md) |
| Notice·Skeleton·Toast | 알림·로딩·확정 후 피드백의 모서리/그림자 | [알림](../components/notice.md) · [로딩](../components/skeleton.md) · [토스트](../components/toast.md) |
| ContentTransition | 실제 저장 상태 전환 | [내용 전환](../components/content-transition.md) |
| Collapsible | 전체 비교 접기 | [접기](../components/collapsible.md) |

## 배치

```text
설명 → 앱 테마 적용(참고 테마/산책 노트/문장 모음) → 표현 선택(기존 10종)
선택한 프로필: 헤더 → 저장 상태 → 이름/기간 → 같은 기록 3개 → 저장/실패 재현
선택한 프로필: 제목 크기 비교(5단계, 문서 단계 h3 유지)
표면 질감 비교: 장식 무늬 → Card 제목/설명 → 같은 초안 → 다음 테마
탭 선택 표시 비교: 테마 따르기/밑줄/이동/늘어남 → 기록/보관함 → 같은 초안 → 다음 테마
자산 액자 비교(기본 접힘): 같은 기존 Tick 그림 → 둥근/정사각/원형 → 다음 테마
입력·알림·오버레이 비교: Notice → Skeleton → Toast → Dialog/Sheet 열기
오버레이: 제목/닫기 → 같은 초안 → 다음 테마(현재 10종 순환)
10종 비교: 각 이름 → 같은 화면(현재 앱 설정도 함께 적용)
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 세로 | `spacing.xl` 24 |
| 앱/참고 테마 | SegmentedControl | 선택 화면 위 | 앱 설정 3개 후 참고 테마 10개; `presentation="pills"`, 큰 선택 목록의 좁은 폭 배치는 공개 선택 계약을 따른다 |
| 이름/기간 | TextField·SegmentedControl | 도구 | `spacing.md` 16 |
| 목록 | OverviewScreen | 본문 | [목록 배치](../components/overview-screen.md#배치) |
| 저장/실패 | BottomCTA | footer | `spacing.sm` 12; 주 행동 후 ghost 실패 재현 |
| 자산 비교 | Asset·Stack | 탭 비교 아래 | `xlarge` 120px, `spacing.md` 16, 좁으면 줄바꿈. rounded는 프로필 radius.md, square 0, circle foundation full 유지 |

## 흐름과 상태

1. 기록 이름·기간을 바꾼다. 앱 설정과 표현을 바꿔도 같은 선택 화면의 초안/선택을 유지한다.
   산책 노트는 녹색 잉크·cards/collapsible·landscape·slide/rise를, 문장 모음은 보라 잉크·rows/inline·editorial·none/fade를 지정한다.
   나머지 표면/모서리/글자/질감은 고른 참고 테마를 상속한다. 두 설정은 제품 소유 설정 파일을 보여 주는 fixture이며 새 HJM 프리셋이 아니다.
2. 도구 접기/펼치기를 확인한다. 항상 펼친 테마로 가면 내용이 보인다.
3. 무늬 배경의 카드에 입력하고 다음 테마를 누른다. 유리·클레이 질감과 같은 초안 유지를 확인한다. Native 지원/접근성 설정에 따라 불투명 대체 경로도 확인한다.
4. 대화상자/패널을 열고 초안을 바꾼 뒤 다음 테마를 누른다. 열린 오버레이 안에서 프로필을 바꾸며 초안/문서 역할을 유지한다. 닫고 다시 열어도 제어 초안은 남는다.
5. 미리보기 저장 또는 실패 재현을 누른다. 실패 후 같은 입력을 재시도한다.
6. 자산 액자 비교를 펼쳐 다음 테마를 누른다. 같은 기존 CC0 그림과 120px 액자를 유지하며
   rounded만 프로필을 따른다. 이 예제는 그림 재질·각도 자동 선택이나 Native 이미지 decode 검증의 완료 근거가 아니다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 저장 전 | 입력·선택 가능 |
| 진행 중 | 저장 버튼 pending | 입력을 제거하지 않음 |
| 실패 | 실패 문구·다시 저장 | 초안 유지·상태 알림 |
| 성공 | 미리보기 저장 문구 | 서버 저장으로 안내하지 않음 |

## 코드 골격

```tsx
// Web
import { HjmProvider } from "@hjmds/react/provider";
import { OverviewScreen } from "@hjmds/react/design-profile";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
const design = defineHjmDesignProfile({ extends: "paper", id: "my-app",
  compositions: { collection: "cards", toolbar: "collapsible" }, screens: { overview: "landscape" } });
<HjmProvider designProfile={design}><OverviewScreen title={title} toolbarLabel={toolsLabel} toolbar={tools} items={items} footer={save} /></HjmProvider>
```

```tsx
// Native
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
import { defineHjmDesignProfile } from "@hjmds/design-contracts/design-profile";
const design = defineHjmDesignProfile({ extends: "paper", id: "my-app",
  compositions: { collection: "cards", toolbar: "collapsible" }, screens: { overview: "landscape" } });
<HjmNativeProvider designProfile={design}><OverviewScreen title={title} toolbarLabel={toolsLabel} toolbar={tools} items={items} footer={save} /></HjmNativeProvider>
```

제품은 Showcase를 import하지 않고 공개 API에 제품 문구/데이터를 넣는다. 유리 blur·클레이 inset shadow의 플랫폼 조건과 기기 미확인 범위는 [QA](../../../../../docs/qa/2026-10-07-design-profile-research.md)에 남긴다.

`showcase/shared/product-design.ts`는 순수 설정과 fixture 조합만 공유한다. 양 renderer가 자신의 workspace에서
공개 `defineHjmDesignProfile`을 주입한다. 루트에 renderer peer를 설치하거나 TypeScript alias로 소비 경계를 우회하지 않는다.
실제 앱은 이 fixture를 import하지 않고 자신의 `theme.ts`에서 같은 공개 helper를 사용한다. 테마 저장/URL/계정 동기화와 폰트/자산 로딩은 앱이 소유한다.

두 앱 변형은 같은 항목의 `ProductNotes`(앱 테마 · 산책)·`ProductReading`(앱 테마 · 문장) 스토리다.
새 테마마다 폴더나 상태 엔진을 만들지 않으며 Provider/RecordSample/입력/탭/오버레이에 product/preset key를 달아 교체하지 않는다.
OS 최대 글자와 최대값을 모사한 확대는 이번 추가의 설계·검증·후속·완료/릴리스 조건에서 제외한다.

코드 비교는 양 플랫폼의 공개 `CodeBlock`을 사용한다. 같은 원문에 프로필 code font·body metrics를 적용하며 RTL에서도 코드 본문은 LTR로 읽는다.

탭 비교는 공개 `Tabs`·`TextField`와 `mountPolicy="visited"`를 사용한다. 테마/표시 방식 변경은
선택한 탭과 같은 입력 호스트를 유지한다. forest·glass·aurora·clay는 생략한 appearance가
slide로 해석되고 나머지 6종은 standard다. 명시 값은 프로필보다 우선한다. 실제 제품은
이 샘플의 패널 수명을 기본값으로 복사하지 않고 초안과 탭의 사용 목적에 맞춰 선택한다.

Web의 팝오버는 비모달 편집 초안과 테마 순회를 추가 비교한다. Native의 같은 용도는 기존 Sheet 경로다. 저장/실패 샘플은 두 플랫폼 공개 BottomCTA이며 브랜드가 바뀌어도 같은 저장 상태·초안·재시도 callback을 유지한다.
