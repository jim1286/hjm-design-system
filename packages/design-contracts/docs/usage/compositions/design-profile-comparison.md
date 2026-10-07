# 테마 조합

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.14.0 이후)
- 검토일: 2026-10-07
- 근거: [프로필 계약](../../design-profile.md), [조사와 QA](../../../../../docs/qa/2026-10-07-design-profile-research.md), 두 Showcase `design-profile-preview.tsx`
- 스토리북: `실험/구성/비교와 검증/테마 조합`

## 언제 쓰나

같은 기능에 10가지 표현을 적용하고 앱의 프로필 선택을 검토할 때 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Provider | 한 번 선택한 프로필 상속 | [프로필 계약](../../design-profile.md) |
| SegmentedControl | 테마/기간 선택 | [선택 입력](../components/segmented-control.md) |
| OverviewScreen | 도구·목록·주 행동 | [목록 화면](../components/overview-screen.md) |
| Card | 무늬 위의 표면 질감과 초안 | [카드](../components/card.md) |
| Heading | 선택 테마의 5단계 제목 크기 | [제목](../components/heading.md) |
| Dialog·Sheet | 열린 초안과 같은 프로필 순회 | [대화상자](../components/dialog.md) · [패널](../components/sheet.md) |
| Notice·Skeleton·Toast | 알림·로딩·확정 후 피드백의 모서리/그림자 | [알림](../components/notice.md) · [로딩](../components/skeleton.md) · [토스트](../components/toast.md) |
| ContentTransition | 실제 저장 상태 전환 | [내용 전환](../components/content-transition.md) |
| Collapsible | 전체 비교 접기 | [접기](../components/collapsible.md) |

## 배치

```text
설명 → 표현 선택
선택한 프로필: 헤더 → 저장 상태 → 이름/기간 → 같은 기록 3개 → 저장/실패 재현
선택한 프로필: 제목 크기 비교(5단계, 문서 단계 h3 유지)
표면 질감 비교: 장식 무늬 → Card 제목/설명 → 같은 초안 → 다음 테마
입력·알림·오버레이 비교: Notice → Skeleton → Toast → Dialog/Sheet 열기
오버레이: 제목/닫기 → 같은 초안 → 다음 테마(현재 10종 순환)
10종 비교: 각 이름 → 같은 화면
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Stack | 세로 | `spacing.xl` 24 |
| 이름/기간 | TextField·SegmentedControl | 도구 | `spacing.md` 16 |
| 목록 | OverviewScreen | 본문 | [목록 배치](../components/overview-screen.md#배치) |
| 저장/실패 | Button | footer | `spacing.sm` 12; 주 행동 후 ghost 실패 재현 |

## 흐름과 상태

1. 기록 이름·기간을 바꾼다. 표현을 바꿔도 같은 선택 화면의 초안/선택을 유지한다.
2. 도구 접기/펼치기를 확인한다. 항상 펼친 테마로 가면 내용이 보인다.
3. 무늬 배경의 카드에 입력하고 다음 테마를 누른다. 유리·클레이 질감과 같은 초안 유지를 확인한다. Native 지원/접근성 설정에 따라 불투명 대체 경로도 확인한다.
4. 대화상자/패널을 열고 초안을 바꾼 뒤 다음 테마를 누른다. 열린 오버레이 안에서 프로필을 바꾸며 초안/문서 역할을 유지한다. 닫고 다시 열어도 제어 초안은 남는다.
5. 미리보기 저장 또는 실패 재현을 누른다. 실패 후 같은 입력을 재시도한다.

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
<HjmProvider designProfile={design}><OverviewScreen title={title} toolbarLabel={toolsLabel} toolbar={tools} items={items} footer={save} /></HjmProvider>
```

```tsx
// Native
import { HjmNativeProvider } from "@hjmds/react-native/provider";
import { OverviewScreen } from "@hjmds/react-native/design-profile";
<HjmNativeProvider designProfile={design}><OverviewScreen title={title} toolbarLabel={toolsLabel} toolbar={tools} items={items} footer={save} /></HjmNativeProvider>
```

제품은 Showcase를 import하지 않고 공개 API에 제품 문구/데이터를 넣는다. 유리 blur·클레이 inset shadow의 플랫폼 조건과 기기 미확인 범위는 [QA](../../../../../docs/qa/2026-10-07-design-profile-research.md)에 남긴다.
