# 명령 기록 표시

- 단계: 구성
- 상태: 배포
- 지원: Web · Native
- 적용: 1.16.0
- 검토일: 2026-10-08
- 근거: [후보 조사](../../../../../docs/qa/2026-10-07-reference-parallel-b.md), 양 Showcase `command-records-preview.tsx`
- 스토리북: `배포/구성/정보 표시/명령 기록 표시`

## 언제 쓰나

명령 원문과 출력 기록을 선택·읽기·복사할 때 쓴다. [Magic Terminal](https://magicui.design/docs/components/terminal)의
명령/출력 구분과 [Aceternity 코드 블록](https://ui.aceternity.com/components/code-block)의 탭/복사 표현을
기존 API에 합성했다. 터미널 에뮬레이터·명령 실행기·구문 분석기·서버 스트리밍 엔진이 아니다.
자동 타이핑은 정확한 전체 원문과 복사 계약을 대신하지 않는다. 해당 기능은 별도 lifecycle/읽기 검토 대상이다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Provider | 10개 테마 표현 상속 | [프로필](../../design-profile.md) |
| Container·Section·Stack | 제목·세로 흐름·폭 | [컨테이너](../components/container.md) · [구역](../components/section.md) · [스택](../components/stack.md) |
| SegmentedControl | 줄바꿈/가로 스크롤 중 하나 선택 | [선택 입력](../components/segmented-control.md) |
| Tabs·TabPanel | 명령/출력 두 패널 중 하나 | [탭](../components/tabs.md) |
| CodeBlock | 선택 가능한 LTR 원문 | [코드 블록](../components/code-block.md) |
| ClipboardButton | Web 원문 복사와 성공/오류 callback | [코드 블록의 복사 슬롯](../components/code-block.md#최소-사용-예) |
| Button·Notice·Text | 갱신·진행·실패·원문 선택 안내 | [버튼](../components/button.md) · [알림](../components/notice.md) |
| Collapsible | 결정적인 Storybook 응답 도구 | [접기](../components/collapsible.md) |

## 배치

```text
Section 제목/설명 → 현재 테마/다음 테마
긴 줄 표시: 줄바꿈 / 가로 스크롤
명령 / 출력 탭 → 언어·복사 보조 행동 → 선택 가능한 원문
복사 실패 안내 / 닫기
갱신 진행 또는 원문을 유지한 실패 알림
표시 새로고침(주 행동) → 예제 응답 안내
검증 도구: 미리보기 응답 받기 / 다음 갱신 실패
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Container·Section·Stack | 세로 문서 흐름 | Container `gutter="compact"` 16, Stack `spacing.md` 16. Native ScrollView 위아래 `spacing.lg` 20 |
| 보기 선택 | SegmentedControl | 탭 목록 위 | `presentation="pills"`, 큰 글자에서 줄바꿈 |
| 패널 | TabPanel·CodeBlock | 탭 목록 아래 | dynamic 단일 패널. CodeBlock의 `radius.lg`·`spacing.md`·프로필 code font, 원문 LTR |
| 복사 | ClipboardButton | Web CodeBlock 머리 줄 끝 | `tone="secondary" size="small"`. Native는 원문 시스템 선택; 제품 host action이 있으면 같은 슬롯 |
| 갱신·복구 | Button·Notice | 원문 아래 | 기본 Button 높이 `control.buttonHeight.medium` 44; 진행 중 잠금, 이전 원문 유지 |

## 흐름과 상태

1. 명령 또는 출력을 고른다. manual Tabs의 화살표는 포커스만 움직이고 Enter/Space로 선택한다.
2. 긴 줄 표시를 바꾼다. 줄바꿈은 원문을 바꾸지 않고 가로 스크롤은 코드 영역에 한정한다.
3. 테마를 바꿔도 현재 패널·보기·원문·갱신 상태를 유지한다. CodeBlock이나 복사 행동을 key로 다시 만들지 않는다.
4. Web 복사는 현재 원문 전체를 전달하며 권한 거부를 Notice로 알린다. Native는 시스템 선택 또는 제품이 공급한 복사 host를 쓴다.
5. 표시 새로고침 동안 이전 원문을 읽을 수 있다. fixture 응답 실패도 원문을 유지하며 재시도할 수 있다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 정확한 전체 원문, 두 패널·두 보기 방식 | 탭 manual focus, Web pre focus/Native selectable Text |
| 진행 중 | 갱신 버튼 loading, 기존 원문·선택 유지 | 응답 도구만 갱신 상태 확정, Web status/Native PatternStatus |
| 실패 | danger Notice·같은 갱신 재시도, 이전 원문 유지 | Web alert/Native Notice, Web 응답 뒤 갱신 버튼으로 복귀 |
| 복사 실패 | danger Notice·직접 원문 선택 안내 | 닫기는 안내만 제거하며 성공 아님. Web 닫기 후 복사 버튼으로 복귀 |
| 복사 성공 | Web ClipboardButton copied | OS 요청 뒤 live status, 진행 중 포커스 유지 |

## 코드 골격

```tsx
// Web: 원문·출력·갱신 상태는 제품 데이터이며 실행하지 않는다.
import { Tabs, TabPanel } from "@hjmds/react/navigation";
import { CodeBlock } from "@hjmds/react/code-block";
import { ClipboardButton } from "@hjmds/react/clipboard";
<Tabs id={id} label={tabsLabel} items={items} value={selected} onValueChange={setSelected}
  renderPanels={false} panelMode="dynamic" activationMode="manual" />
<TabPanel tabsId={id} activeValue={selected} mode="dynamic">
  <CodeBlock code={code} label={sourceLabel} wrap={wrap} copyAction={
    <ClipboardButton value={code} labels={copyLabels} tone="secondary" size="small"
      onCopy={onCopy} onCopyError={onCopyError} />
  } />
</TabPanel>
```

```tsx
// Native: 선택 가능한 원문은 기존 CodeBlock, OS 복사는 제품 host 경계다.
import { CodeBlock } from "@hjmds/react-native/code-block";
<CodeBlock code={code} label={sourceLabel} wrap={wrap} copyAction={productCopyAction} />
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 복사 | ClipboardButton·OS Promise·live status | 원문 길게 누르기와 시스템 선택. ClipboardButton API 없음 |
| 원문 | focus 가능한 pre, 긴 줄 자체 scroll | selectable Text, 긴 줄 horizontal ScrollView |
| 갱신 응답 뒤 포커스 | fixture는 주 갱신 행동으로 복귀 | 기기/AT 검증 별도 |
| 진행 알림 | Text role=status | Showcase PatternStatus iOS announce/Android live region. 제품은 같은 정책 연결 |

## 함정

Showcase fixture를 제품에서 import하지 않는다. 제품은 i18n 문구·원문·허용 데이터·조회/스트리밍
정책을 공급한다. 출력 문자열은 실제 CI·배포 성공 증거가 아니다. 비밀값은 제품이 표시 전에 제거한다.
token.text는 공백까지 원문과 같아야 하며 HTML로 삽입하지 않는다.
미게시 Web ClipboardButton 후속 수정은 중복 OS 쓰기를 막고, 원문 변경/언마운트 뒤 이전 결과 callback과
성공 표시를 무시한다. 취소할 수 없는 OS 쓰기가 끝날 때까지 loading 잠금을 유지해 다음 쓰기와 순서가
뒤집히지 않게 한다. Native 복사 실패 스토리는 제품 host 오류의 표시 fixture이며 실제 OS 거부 재현이 아니다.
