# 날짜와 시각 선택

- 단계: 구성
- 상태: 실험
- 지원: Web · Native
- 적용: 미게시(1.14.0 이후)
- 검토일: 2026-10-07
- 근거: [Magic 조사](../../../../../docs/qa/2026-10-07-reference-parallel-b.md), 양 Showcase `date-time-selection-preview.tsx`, shared `date-time-selection.ts`
- 스토리북: `실험/구성/선택과 필터/날짜와 시각 선택`

## 언제 쓰나

기록·알림의 날짜 하나와 하루 안의 시각을 함께 고를 때 쓴다. [기존 시간 선택](time-selection.md)에
날짜 선택을 붙이는 구성이다. 서버 예약·시간대 변환을 담당하는 새 DateTimePicker API가 아니다.
[Magic 글](https://magicui.design/blog/time-and-date-picker)은 공개 interface와 설명을 제공하며
동작하는 picker 구현은 제공하지 않는다. 설명의 구성 아이디어만 기존 API에 연결했다.

## 구성 요소

| 컴포넌트 | 역할 | 지침 |
| --- | --- | --- |
| Provider | 10개 테마 순회와 필드 표현 상속 | [프로필 계약](../../design-profile.md) |
| DatePicker | ISO 날짜 하나와 표시 달, 접근 가능한 달력 표면 | [날짜 선택](../components/date-picker.md) |
| Select ×2 | 시·분 선택 | [선택 목록](../components/select.md) |
| Section·Container·Stack | 제목·전체 흐름·폭 | [구역](../components/section.md) · [컨테이너](../components/container.md) · [스택](../components/stack.md) |
| Button | 확인·다시 선택 | [버튼](../components/button.md) |
| Text·Notice | 선택값·진행·실패·확인 결과 | [텍스트](../components/text.md) · [알림](../components/notice.md) |
| Collapsible | Storybook의 결정적 응답/실패 검증 도구 | [접기](../components/collapsible.md) |

## 배치

```text
Section 제목/설명 → 선택 테마/다음 테마
날짜 트리거 → 달력(선택/지우기/이전·다음 달/닫기)
시 Select → 분 Select
같은 선택값 → 시간대/서버는 제품 소유 안내
확인(주 행동) → 다시 고르기(보조)
실패/확인 결과
검증 도구: 미리보기 응답 받기 → 다음 확인 실패
```

| 영역 | 컴포넌트 | 위치 | 크기·간격 |
| --- | --- | --- | --- |
| 바깥 틀 | Container·Section·Stack | 세로 문서 흐름; Native ScrollView | `gutter="compact"` 16, `spacing.md` 16. Native 위아래 `spacing.lg` 20 |
| 날짜 | DatePicker | 제목 아래 | 기존 [날짜 필드 배치](../components/date-picker.md#배치); Web popover/Native Sheet |
| 시각 | Select | 날짜 아래, 시→분 | `control.fieldHeight` 44, 사이 `spacing.md` 16 |
| 주·보조 행동 | Button | 선택 상태 아래 | 확인→다시 고르기, `control.buttonHeight.medium` 44 기본. 고정하지 않음 |
| 결과 | Notice | 행동 아래 | 실패는 danger, 확인은 success. 위 `spacing.md` 16 |

## 흐름과 상태

1. 날짜를 고른다. 테마를 순회해도 같은 값·표시 달·진행 요청을 유지한다. 달 이동은 표시 달만 바꾸며 이미 고른 날짜·시각을 지우지 않는다.
2. 시0–23와 분0–59를 고른다. 셋 중 하나라도 없으면 확인은 비활성이다. 어느 값을 바꾸면 이전 결과를 지운다.
3. 선택 확인 후 진행 상태 동안 날짜·시·분·재설정·실패 예약을 잠근다. 진행 상태는 제품 mutation이 소유한다.
4. 미리보기에서는 응답 받기로 현재 요청의 선택값을 확정한다. 실패를 예약했다면 값이 남은 실패 상태가 된다.
5. 실패 후 다시 확인하고 응답 받기로 복구한다. 다시 고르기는 모든 선택과 결과를 비운다.

| 상태 | 모습 | 포커스·알림 |
| --- | --- | --- |
| 기본 | 세 선택값 없음·확인 비활성 | 날짜·시·분 모두 필수 이름. 셀 disabled는 API 계약으로 제어 |
| 진행 중 | 확인 버튼 loading·입력/재설정 잠김 | placeholder를 서버 성공으로 바꾸지 않음; 이미 고른 값 유지 |
| 실패 | danger Notice·다시 확인 | 같은 날짜·시·분 보존; Web alert·Native assertive; Web 응답 뒤 확인 버튼으로 포커스 복귀 |
| 성공 | success Notice·확정한 날짜와 시각 | 값 변경 시 이전 결과 제거. 실제 예약·서버 저장을 뜻하지 않음 |
| 비활성 | 선택 트리거/행동 비활성 | CSS pointer-events로만 차단하지 않음 |

## 코드 골격

```tsx
// Web: 날짜·시각·시간대 정책과 서버 응답은 제품 소유다.
import { DatePicker } from "@hjmds/react/date-picker";
import { Select } from "@hjmds/react/forms";
<DatePicker descriptor={{ grid, label: dateLabel, placeholder, displayValue: date,
  selectedDate: date, onSelectionChange: setDate, focusedMonth: month,
  onFocusedMonthChange: setMonth, disabled: busy }} monthLabel={monthLabel}
  composeAccessibleName={composeAccessibleName} clearLabel={clearLabel} closeLabel={closeLabel} />
<Select label={hourLabel} placeholder={hourPlaceholder} emptySelectionLabel={hourClearLabel}
  items={hours} selectedKey={hour} onSelectionChange={setHour} disabled={busy} />
<Select label={minuteLabel} placeholder={minutePlaceholder} emptySelectionLabel={minuteClearLabel}
  items={minutes} selectedKey={minute} onSelectionChange={setMinute} disabled={busy} />
```

```tsx
// Native: 같은 날짜 descriptor, 시간 목록은 닫기 문구도 공급한다.
import { DatePicker } from "@hjmds/react-native/date-picker";
import { Select } from "@hjmds/react-native/forms";
<DatePicker descriptor={descriptor} monthLabel={monthLabel} composeAccessibleName={composeAccessibleName}
  clearLabel={clearLabel} closeLabel={closeLabel} />
<Select label={hourLabel} placeholder={hourPlaceholder} dismissLabel={hourDismissLabel}
  items={hours} selectedKey={hour} onSelectionChange={setHour} disabled={busy} />
```

## 플랫폼 차이

| 항목 | Web | Native |
| --- | --- | --- |
| 날짜 표면 | 필드에 붙은 popover | Sheet |
| 시각 표면 | listbox popover | modal sheet |
| 상태 | Text role=status | Showcase PatternStatus의 Android live region/iOS announce 보완. 제품은 공개Text/Notice와 같은 정책을 연결 |
| 날짜 키보드 | Calendar roving focus, 달 경계 callback은 제품 설정 | touch/AT, 실기기 확인 별도 |

## 함정

제품 문구는 제품의 i18n으로 공급한다.
Showcase shared fixture/검증 도구를 제품에서 import하지 않는다. 이 화면은 날짜를 기기 시간대의
Date timestamp로 암묵 변환하지 않는다. 민간 날짜·시간대·DST·예약 허용 범위·로캘·전송 값은
제품 계약에서 결정한다. 직접 CSS 색/모서리나 새 날짜 라이브러리를 이 구성에 추가하지 않는다.

ISO 날짜와 시각을 한 줄에 표시할 때는 제품 display 문자열에 LTR isolate를 적용해 RTL에서도
날짜→시각 순서를 유지한다. 표시용 Unicode 제어 문자를 원래 civil/전송 값에 넣지 않는다.
이는 이 실험의 ISO 표시 선택이며 실제 제품은 자신의 locale format을 공급한다.
