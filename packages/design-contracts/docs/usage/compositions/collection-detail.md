# 카드 탐색과 상세 연결

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.16.0
- 검토일: 2026-10-08
- 근거: [원제품과 기존 API 대조](../../../../../docs/plans/aceternity-interaction-adoption-2026-10-07.md), 양 Showcase `collection-detail-preview.tsx`
- 스토리북: `배포/구성/직접 조작과 모션/카드 상세 연결`

## 언제 쓰나

유한 카드 여러 장의 독립 입력을 보존하면서 탐색하고 별도 상세 모달을 열 때 쓴다. 후기/상품/자료는
제품 데이터·콘텐츠 변형이며 가로 목록 또는 모달 엔진을 각각 복제하지 않는다. 예제는 합성 기록이며 서버 저장이 아니다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Container·Section·Stack | 제목/설명/폭·문서 흐름 | [Container](../components/container.md)·[Section](../components/section.md)·[Stack](../components/stack.md) |
| CollectionRail | 여러 항목과 유한 가로 탐색 | [가로 배치](../components/list.md#collectionrail-가로-배치) |
| Card | 제목·설명·본문 입력·별도 actions | [Card](../components/card.md) |
| TextField | 카드/상세의 독립 초안 | [입력](../components/field.md) |
| Dialog·Button | actions의 상세 열기·닫기·초점 복귀 | [Dialog](../components/dialog.md)·[Button](../components/button.md) |

## 배치

```text
제목/설명 → 현재 테마 → 다음 테마
가로 목록: [제목/설명 → 기록 메모 → 상세 보기] × 안정 ID
목록 밖 끝쪽: 이전 기록 / 다음 기록
상세: 제목/닫기 → 상세 메모 → 다음 테마
합성 예제 안내
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Container·Section·Stack | 세로 | gutter compact16, Stack spacing.md16 |
| 목록 | CollectionRail | 테마 아래 | comfortable 최대360, 간격16·edgeHint24, 실제 viewport 측정 |
| 카드 | Card·TextField | 각각 listitem | Card recipe padding/표면과 Provider 테마 상속 |
| 상세 열기 | Button in Card.actions | 카드 본문 아래 | tone secondary, 카드 전체를 button으로 감싸지 않음 |
| 상세 | Dialog·Stack | 기존 modal portal/Native Modal | Dialog size/keyboard/safe-area contract, Stack gap16 |

## 흐름과 상태

1. 카드 메모를 작성하고 이전/다음·touch·Web 키보드로 탐색한다. 모든 카드의 ID/초안은 남는다.
2. 일부 보이는 카드의 입력에 초점을 주면 필요한 만큼 노출한다. 입력의 방향/Home/End 키를 목록이 가로채지 않는다.
3. 상세 보기를 열어 별도 메모를 작성한다. Dialog가 배경 잠금/닫기/초점 복귀를 소유한다.
4. 본문 또는 상세 안에서 다음 테마를 누른다. 원문·초안·열린 대상이 유지된다. 닫고 다시 열어도 상세 초안이 남는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 여러 카드와 끝 controls | 목록/행동 이름, 선택값 없이 scroll anchor |
| 진행 중 | host scroll 또는 상세 편집 | reduced-motion 즉시 탐색, 편집 키/초안 유지 |
| 실패 | 이 fixture는 서버 요청을 실행하지 않음 | 제품 조회/저장 실패는 기존 Notice·복구 계약 합성; 가짜 서버 성공/실패 없음 |
| 빈 목록 | 제품 emptyContent | 양 끝 controls 잠김, stale 선택/모달 생성 없음 |

## 코드 골격

```tsx
// Web
import { CollectionRail } from "@hjmds/react/collection-rail";
import { Card } from "@hjmds/react/display";
import { Dialog } from "@hjmds/react/overlays";
<CollectionRail label={title} items={records} labels={labels}
  renderItem={item => <Card title={item.label} actions={<Dialog title={item.label}
    closeLabel={closeLabel} trigger={<OpenDetailButton item={item} />}><Detail item={item} /></Dialog>}>
    <RecordFields item={item} />
  </Card>} />
```

```tsx
// Native
import { CollectionRail } from "@hjmds/react-native/collection-rail";
import { Card } from "@hjmds/react-native/data-display";
import { Dialog } from "@hjmds/react-native/overlays";
<CollectionRail label={title} items={records} labels={labels}
  renderItem={item => <RecordCard item={item} />} />
// RecordCard owns open/close, stable drafts, Card.actions Button and Dialog.returnFocusRef.
```

Native는 controlled Dialog open/onOpenChange를 쓴다.
테마·초안·상세 open owner를 rail 밖 stable card에 두고 key는 item.id만 사용한다.

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 상세 호출 | Dialog의 canonical trigger in Card.actions | Card.actions Button과 controlled Dialog, 실제 OS 복귀 검수 별도 |
| 보기 변경 | ResizeObserver와 input focus 노출 | ScrollView layout/content-size와 focus 노출, OS touch/VoiceOver 별도 |
| 테마 | 같은 Provider 경로의 10 profiles | 같은 profiles/데이터, 플랫폼 표현 |
