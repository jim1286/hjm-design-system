# Calendar

2026-09-16 · React / React Native beta. 날짜별 기록을 탐색하는 작동 예제를 제공한다.
제품의 실제 채택·기기 검증·npm 게시를 뜻하지 않는다.

## 설계와 참조

- [React Aria Calendar](https://react-aria.adobe.com/Calendar)의 선택과 현재 표시 월을
  별도로 통제하는 구성을 비교했다. HJM은 제품이 계산한 ISO 날짜 배열을 받는다.
  달력 체계·로케일·시간대 계산을 renderer에 추가하는 대안은 기존 문자열 계약을 깨므로 채택하지 않았다.
- [WAI 날짜 선택 예제](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)의
  격자·roving focus·요일 탐색을 참고했다. HJM은 inline Calendar와 DatePicker의 overlay를 구분한다.
- 토스 UI의 읽기 쉬운 제목, 평평한 콘텐츠, 하나의 명확한 선택 강조를 HJM 토큰으로 표현한다.
  외부 라이브러리의 코드·자산·폰트를 복사하지 않는다.

과거 Yajalal 조사에서는 월 격자가 날짜 레일로 바뀌어 살아 있는 Calendar 소비 화면이 없었다.
이번 구현의 근거는 React/RN 컴포넌트를 채우라는 명시 요청이며, 검증 화면은 Showcase의
`Patterns/Calendar` 기록 탐색이다. 이를 Yajalal 채택으로 기록하지 않는다.

## 경계

Calendar는 항상 표시되는 한 달의 격자다. DatePicker는 날짜 필드와 Web dialog / Native Sheet에
같은 Calendar를 담는다. 날짜 선택·접근성·큰 글자 수정이 양쪽에 동시에 반영되도록 렌더링을
공유한다. DatePicker의 선택 후 닫기·trigger copy·clear·읽기 전용은 바깥 필드가 맡는다.

- `grid.cells`: 제품이 만든 7열 row-major 배열. 길이는 양의 7의 배수다.
- `date`: ISO `YYYY-MM-DD` stable key. 빈 셀은 `{}`이며 focus나 접근성 이름을 갖지 않는다.
- `weekdayLabels`, `todayDate`, `monthLabel`: 제품이 정한 로케일·시계의 결과를 받는다.
- `selectedDate` / `defaultSelectedDate` / `onSelectionChange`: 단일 선택. 월 이동과 독립이다.
- `focusedMonth` / `defaultFocusedMonth` / `onFocusedMonthChange`: 제품의 표시 월 요청 계약.
  실제 `grid`와 `monthLabel` 갱신은 제품이 수행한다. handler가 없으면 월 버튼은 비활성이다.
- `composeAccessibleName`: 날짜·오늘·비활성·제품 콘텐츠를 현지화한다. 선택 상태는 별도
  `aria-selected` / native accessibilityState로도 제공한다.
- `renderCellContent`: 점·짧은 개수 등 장식 콘텐츠. 독립된 버튼/입력을 넣지 않는다.
  내용 의미는 `composeAccessibleName`에 포함한다. 중복 낭독 방지를 위해 slot은 접근성에서 숨긴다.

## 공개 API

```tsx
import { Calendar } from "@hjmds/react/calendar";
// Native: @hjmds/react-native/calendar

<Calendar
  descriptor={{ grid, monthLabel, focusedMonth: month, onFocusedMonthChange: setMonth,
    selectedDate: date, onSelectionChange: setDate }}
  previousMonth={{ month: previousMonthKey, label: "이전 달" }}
  nextMonth={{ month: nextMonthKey, label: "다음 달" }}
  composeAccessibleName={formatCellName}
/>
```

두 renderer는 `size="medium" | "large"`, `renderCellContent`,
`ref.current.focusDate(date)`를 지원한다. focus 요청 날짜가 다음 렌더에서 도착하면 그때 적용한다.
Web의 `autoFocus`는 기본 false이며 DatePicker가 열린 격자에만 true로 설정한다.

### Web 경계 이동

방향키는 좌우 하루/상하 한 주, RTL 좌우 반전, Home/End는 현재 행의 첫/마지막 날짜다.
비활성 날짜에도 초점은 이동하지만 클릭·Enter/Space로 선택할 수 없다. 월 페이지 밖으로 이동하면
`onNavigateBeyondGrid({ date, intent, overflow }, focusDate)`를 호출한다.

날짜 계산을 소유하는 제품이 다음 날짜/월을 계산하고 `setMonth(nextMonth); focusDate(nextDate)`를
호출한다. 이 handler가 없으면 격자 경계에 머무른다. 연속 키보드 월 탐색이 필요한 제품은 반드시
연결한다. DatePicker도 같은 callback을 받는다. Native는 명시적 이전/다음 버튼으로 월을 이동한다.

## 시각·접근성

- 오늘은 border, 선택은 fill, 비활성은 opacity와 접근성 상태로 구분한다.
- 7열의 최소 touch target을 유지한다. 폭이 부족하면 격자만 가로 스크롤하고 본문은 넘치지 않는다.
- 셀 높이를 고정하지 않아 2배 글자나 짧은 제품 콘텐츠가 잘리지 않는다.
- Web: grid / row / columnheader / gridcell, 하나의 날짜 tab stop, visible focus.
- Native: 각 날짜는 독립 접근 가능한 button. 실제 플랫폼과 RN Web의 focus 경로를 구분한다.
- 단일 날짜·한 페이지 계약이다. range, 연간 view, 비그레고리력 계산 엔진은 이 컴포넌트에 없다.
  제품이 준비한 날짜 배열의 의미를 보존하며 HJM은 날짜 형식·중복·격자 모양을 검증한다.

## 검증

Web 테스트는 비활성 날짜 focus/활성화 분리, 하루/주/Home/End, 경계에서 새 페이지의 지정 날짜로
focus 이동, controlled 선택 보존, 320px·2배 글자·RTL 최소 target과 본문 overflow를 검사한다.
Native 테스트는 개별 날짜의 접근성·비활성·선택, 명시적 월 이동, 크기와 스크롤 경계를 검사한다.
DatePicker의 기존 선택·닫기·방향키 회귀와 controlled-open 읽기 전용/disabled 활성화 방지도 검사한다.
전체 패키지·Showcase 검증 및 브라우저 확인은 `react-native-completion.md` 실행 기록에 남긴다.
