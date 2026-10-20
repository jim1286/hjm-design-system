# ShortcutRail

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.34.0 이후)
- 검토일: 2026-10-19
- 근거: `src/shortcut-rail.ts`, `chipRecipe`. Spint 최근 도시에서 열기 버튼 안에 삭제 버튼을 넣어 두 행동과 접근성 경계가 겹친 2026-10-18 전수 이관.
- 스토리북: `배포/구성/콘텐츠/바로가기 목록`

## 언제 쓰나

최근 장소·최근 도구처럼 누르면 바로 열리는 유한 목록이다. 선택값·체크 표시가 없으며 항목의
열기와 삭제는 서로 중첩되지 않은 별도 버튼이다. 서버 조회·기록 저장·삭제 결과는 제품이 소유한다.
필터 선택에는 Chip/SegmentedControl, 최근 검색어를 입력에 확정하는 행에는 SearchScreen.recentQueries,
여러 카드와 탐색 버튼에는 CollectionRail, 직접 입력해 만드는 태그에는 TagsInput을 쓴다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| ShortcutRail | 열기/삭제와 가로 배치 | 이 문서 |
| Chip recipe | pill 표면과 라벨 간격 | [Chip](../components/chip.md) |
| Section | 필요할 때 보이는 제목 | [Section](../components/section.md) |

| 이름 | Web | Native |
| --- | --- | --- |
| ShortcutRail · ShortcutRailProps | `@hjmds/react/shortcut-rail` | `@hjmds/react-native/shortcut-rail` |

계약의 ShortcutRailItem · shortcutRailRecipe · validateShortcutRail · revealShortcut은
`@hjmds/design-contracts/shortcut-rail`에서 제공한다. Chip의 companion이며 새 canonical 항목은 아니다.

## 배치

```text
이름 있는 가로 목록 (한 줄, 내용 폭)
[ 열기: 도시 이름 ][ × ]   [ 열기: 도시 이름 ][ × ] → 스크롤
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | 가로 목록 | 한 줄, 내용 폭 항목 | 항목 간 spacing.xs8 |
| 표면 | chipRecipe | 열기/삭제 뒤 하나의 pill | small36, medium44, full 모서리, idle 배경/테두리 |
| 열기 | button/Pressable | 이름 앞 leading 장식 가능 | 최소44 터치 영역, small 좌우 sm12/아이콘 간 xxs4, medium md16/xs8 |
| 삭제 | button/Pressable | 열기와 나란한 끝 쪽 | 폭44, 최소 높이44, 기본 glyph.xs14의 × |

36 표면도 각 버튼이 최소44 터치 영역을 가지며 영역을 서로 겹치지 않는다.
모든 항목이 마운트된 가로 한 줄이며 자동 회전·선택·가상화는 없다.
Native는 물리 LTR scroll 좌표와 RTL 행 배치를 분리한다.

## 흐름과 상태

1. 항목 열기는 onAction(item)으로 제품에 전달한다.
2. 삭제는 onRemove(item)만 전달하고 제품이 실제 새 items를 공급한다.
3. Web의 초점 있는 삭제가 실제로 제거되면 다음 사용 가능 항목, 없으면 이전 항목으로 초점을 옮긴다. 같은 ID가 기본값으로 남고 해제 버튼만 사라지면 그 항목의 본문으로 옮긴다. 남은 항목이 없으면 앞쪽 leading의 첫 사용 가능 행동, 그것도 없으면 이름 있는 목록으로 옮긴다. 제품이 해제를 거부해 같은 버튼이 남으면 기존 초점을 유지한다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 이름과 선택적 삭제, 선택 표시 없음 | 각 행동이 이름 있는 버튼 |
| 진행 중 | 제품이 disabled로 열기/삭제를 함께 잠금 | 별도 pending 선언은 제품 화면 상태에서 전달 |
| 실패 | 제품이 기존 items와 공통 Notice/재시도 유지 | 구성은 실패를 빈 결과로 바꾸지 않음 |

| prop | 기본값 | 의미 |
| --- | --- | --- |
| label | 필수 | 목록의 접근성 이름. 시각 제목이 필요하면 HJM Section으로 감싼다 |
| items | 필수 | `{id,label,disabled?}` 배열. 추가 제품 payload 타입을 그대로 유지한다 |
| onAction(item) | 필수 | 항목 열기. 제거는 이 콜백을 부르지 않는다 |
| onRemove(item) · removeLabel(item) | 없음 | 함께 제공한다. 제품이 항목을 제거하거나 같은 ID의 조건을 기본값으로 되돌려 새 items를 전달한다 |
| isRemovable(item) | 모두 | onRemove와 함께 쓰는 순수 판정. false인 항목에는 해제 버튼을 만들지 않는다. disabled는 별도로 본문/해제를 함께 잠근다 |
| leading | 없음 | 첫 항목 앞의 행동/범위 선택 슬롯. 같은 스크롤/줄바꿈 흐름에 놓이며 items가 비어도 남는다 |
| layout | scroll | 미게시. `scroll`은 기존 한 줄, `wrap`은 본문 폭에서 줄바꿈하며 별도 스크롤 host를 만들지 않는다. 긴 라벨도 부모 폭 안에서 감싼다 |
| items[].description | 없음 | 미게시. Native accessibilityHint / Web aria-description. 짧은 행동 설명 |
| size | small | small/medium. 선택 칩의 selected·selectionMode는 없다 |
| renderLeading · removeIcon | 없음/× | 장식 슬롯. 읽을 의미는 label/removeLabel에 쓴다 |
| layoutStyle | 없음 | 구성 바깥 배치 전용 |
| Native testID | 없음 | 루트. 항목은 `${testID}-${id}`, 제거는 `${testID}-remove-${id}` |

disabled 항목은 열기와 제거 모두 막힌다. 조회 중·실패·성공한 빈 결과는 구성 바깥의
SearchScreen/CompositionLayout에서 구분한다. 이 목록이 실패를 빈 결과로 바꾸지 않는다.
항목과 leading이 모두 없으면 Native는 표시하지 않으며 Web은 초점 복구용 빈 목록 host를 공간 없이 유지한다. leading이 있으면 두 플랫폼 모두 계속 표시한다.
Web에서 삭제 후 초점 복구를 쓰려면 제품이 마지막 삭제와 동시에 구성 자체를 unmount하지 않는다.

## 코드 골격

<!-- usage-example: Web ../../../../../showcase/web/src/patterns/ShortcutRail.stories.tsx -->
<!-- usage-example: Native ../../../../../showcase/native/src/ShortcutRail.stories.tsx -->

실행 예제: [Web](../../../../../showcase/web/src/patterns/ShortcutRail.stories.tsx),
[Native](../../../../../showcase/native/src/ShortcutRail.stories.tsx).

2026-10-19 다에리 설정 바로가기의 직접 Pressable·줄바꿈·누름 스타일을 이관하며 wrap을 추가했다. 유한한 설정 행동을 같은 화면의 세로 스크롤 안에 놓을 때 사용한다. Web의 문서 내 링크는 Anchor로 연결하고, Native host의 섹션 측정/스크롤은 onAction에 연결한다. 기본 scroll과 열기/삭제의 독립 target·포커스 복구는 그대로 유지한다.


2026-10-19 오늘야구 조건 요약의 직접 ScrollView/Chip/× 배치를 이관하며 leading과 isRemovable을 추가했다.
이 구성은 조건의 선택값을 바꾸는 입력이 아니라 현재 조건의 편집 창 열기·개별 해제 행동이다.
필터 열기와 독립 켜기/끄기는 leading에 두고, 조건 본문은 onAction으로 편집 창을 연다.
기본 시즌처럼 해제할 수 없는 조건도 같은 목록에 남길 수 있으며 onRemove를 제공했다는 이유로
모든 항목에 ×를 붙이지 않는다. Default/기존 열기·삭제·wrap은 그대로 유지한다.
양쪽 실행 예제의 FilterSummary는 같은 ID의2025 조건을2026 기본값으로 되돌리는 흐름을 보여준다.
