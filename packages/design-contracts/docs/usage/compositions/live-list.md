# 추가해도 유지되는 목록

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.14.0
- 검토일: 2026-10-15
- 근거: `showcase/web/src/patterns/live-list-preview.tsx`, `showcase/native/src/live-list-preview.tsx`
- 스토리북: `배포/구성/정보 표시/추가해도 유지되는 목록`

승급: 2026-10-07 사용자 승인, [검토 결과](../../../../../docs/qa/2026-10-07-experiment-promotion-release.md). Storybook 분류이며 제품 적용 증거는 별도다.

공통 구조·배치·상태·배지의 소유권은 [화면과 구성 선택](../SELECTION.md#소유권)을 따른다. 앱은 데이터·문구·브랜드·추가 기능을 공개 슬롯과 콜백으로 연결한다. 아래 코드 골격을 앱별 기본 구조 복제의 근거로 사용하지 않는다. 전용 구성 API가 없는 콘텐츠 묶음은 [CompositionLayout](../components/composition-layout.md)의 제목·배지·행동·본문·상태·footer 슬롯을 사용한다.

## 언제 쓰나

입력 중인 목록에 새 데이터가 추가되거나 순서가 바뀌어도 기존 초안과 항목의 정체성을 유지할 때 쓴다.
Magic UI Animated List의 소개 페이지 순차 노출에서 새 항목의 등장 표현만 흡수한다. 이미 도착한
데이터를 타이머로 늦추지 않고, 실제 알림 수신과 데모 재생을 혼동하지 않는다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| List · ListRow | stable key 항목의 목록 의미·제목·구분선 | [목록](../components/list.md), [행](../components/list-row.md) |
| ContentTransition | 새 항목 등장과 바깥 높이 전환 | [내용 전환](../components/content-transition.md) |
| TextField | 제품이 항목 id별로 보존하는 메모 | [필드](../components/field.md) |
| Button · Text | 명시적 데이터 변경과 변경 결과 | [버튼](../components/button.md), [글자](../components/text.md) |

## 배치

```text
[안내]
[기록 추가] [3개 함께 추가]
[순서 뒤집기] [첫 기록 삭제]
[움직임 멈추기]
[변경 결과]
┌ 기록 목록 ────────────┐
│ 제목·설명              │
│ 메모 입력              │
├───────────────────────┤
│ 다음 기록·메모         │
└───────────────────────┘
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Web: Stack, Native: KeyboardAvoiding → ScrollView → Stack | 위에서 아래. Native canvas는 자체 스크롤이 없으므로 명시적 host 사용 | gap lg=20px, Native keyboardShouldPersistTaps="handled"·하단 spacing.md |
| 변경 행동 | inline Stack · Button | 목록 위, 좁으면 감김 | 기본 Stack/Button recipe |
| 데이터 | List | 변경 결과 아래 | separator full, 공통 ListRow/TextField 크기 |
| 등장 | ContentTransition | 각 stable id 항목 | rise=12px, motion.normal, easing.enter |
| 높이 | ContentTransition animateHeight | 목록 바깥 | 같은 stateKey를 유지하며 실제 측정 높이만 전환 |

## 흐름과 상태

1. 초기 데이터는 바로 표시하고 최초 등장 모션은 끈다.
2. 추가된 항목은 고유 id를 부여해 즉시 배열에 반영한다. 해당 항목만 enterOnMount를 켠다.
3. 기존 id의 React key와 stateKey를 유지한다. 전체 목록 stateKey를 항목 개수로 바꾸지 않는다.
4. 순서 변경은 데이터 배열 순서만 바꾸며 초안은 id에 연결한다. 순서 변경 자체의 이동 애니메이션은 제공하지 않는다.
5. 삭제는 즉시 반영한다. 삭제된 입력·버튼을 담은 퇴장 사본을 남기지 않는다.
6. 움직임 멈추기는 데이터 처리를 멈추지 않는다. 다시 켜도 기존 항목은 재생하지 않는다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 기존 목록과 입력 | 초기 데이터 즉시 표시 |
| 진행 중 | 새 행만 짧게 등장 | 기존 입력 노드와 초안 유지 |
| 실패 | 서버 실패가 있는 제품은 기존 목록·초안을 보존하고 오류를 별도 표시 | 이 로컬 예제에는 네트워크 요청 없음 |
| 삭제 | 해당 행 즉시 제거 | Web pointer 삭제는 먼저 삭제 버튼으로 초점을 옮긴다. 마지막 행은 삭제 버튼도 비활성되므로 추가 버튼으로 이동 |
| 비어 있음 | 기록 없음과 추가 안내 | 추가 버튼 유지 |
| 모션 감소·정지 | 같은 데이터, 공간 전환 없음 | 의미·입력 순서 동일 |

## 코드 골격

```tsx
// Web
import { ContentTransition } from "@hjmds/react/content-transition";
<ContentTransition stateKey="records" animateHeight motion={paused ? 'none' : 'system'}>
  <List label={listLabel}>
    {items.map(item => <ContentTransition key={item.id} stateKey={item.id}
      enterOnMount={item.justAdded} preset="rise" motion={paused ? 'none' : 'system'}>
      <RecordEditor item={item} onChange={changeById} />
    </ContentTransition>)}
  </List>
</ContentTransition>
```

```tsx
// Native
import { ContentTransition } from "@hjmds/react-native/content-transition";

<ContentTransition stateKey={item.id} enterOnMount={item.justAdded} preset="rise">
  <RecordEditor item={item} onChange={changeById} />
</ContentTransition>
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 등장 | 기존 framer-motion optional peer | 기존 RN Animated native driver |
| 높이 | ResizeObserver + WAAPI | onLayout + JS driver |
| 변경 알림 | status | 공개 StatusText: Android polite live region + iOS active 변경 알림 |
| 접근성 | 기존 입력 초점·list 의미 | 기존 입력과 Native list 의미 |

데이터·중복 제거·정렬·서버 확정은 제품 소유다. 긴 목록은 VirtualList 선택을 먼저 검토하고
재활용 mount를 새 데이터로 오인해 enterOnMount를 켜지 않는다. 제품 팔레트·성능은 제품 도입 시 검증한다. Storybook 배포 분류와 제품 검증·npm 게시는 구분한다.

2026-10-13 실제 예제 검사에서 WebKit의 pointer 삭제는 버튼을 자동 focus하지 않아 삭제되는 입력의 초점이 body로 사라졌다. 삭제 전에 후속 행동으로 이동하도록 보강했다. Native는 기본 글자에서도 추가된 행에 접근할 수 있도록 스크롤·키보드 host를 제공한다. 변경 문구는 추가 후 총 개수, 삭제한 기록, 역순 후 첫 기록을 포함해 연속 같은 행동도 구분하고 초기 안내·반복 렌더는 재발표하지 않는다. 이 예제는 추가·첫 행 삭제·역순·메모 편집·모션 정지만 제공하며 검색/filter/선택·서버 갱신 기능은 없다.
