# Calendar contract

## 문제

한 달의 날짜를 격자로 보여주고, 날짜마다 제품이 붙인 콘텐츠(경기 수, 점 표시 등)를 함께
드러내며, 오늘·선택된 날짜·선택 불가능한 날짜를 색이 아닌 방식으로 구분한다. Yajalal의
일정 탐색기(`schedule-explorer`)가 겨냥한 화면이 이 문제다.

## Calendar와 DatePicker의 경계 — 이 저작의 핵심 판정

antd는 `Calendar`(data-display, 상시 표시)와 `DatePicker`(data-entry, 트리거+오버레이)를
분리한다. 둘 다 "월 격자, 날짜 셀, 오늘, 선택, 비활성 날짜"라는 **같은 조각**을 공유한다.
그래서:

- 격자(월 표시, 날짜 셀, 오늘 표시, 선택 표시, 비활성 날짜, 방향키 이동)는 **공유 조각**이며
  이 파일(`calendar.ts`)에 전부 담는다.
- `Calendar` = 이 격자 그 자체 + 날짜별 콘텐츠. 트리거도 오버레이도 없이 항상 화면에 있다.
- `DatePicker`(`date-picker.ts`)는 필드 트리거 + 오버레이(Web popover / Native Sheet) 안에
  **이 격자를 그대로** 담는다. `resolveDatePickerGrid`는 `resolveCalendarGridDescriptor`를
  그대로 호출할 뿐, 셀 의미를 다시 정의하지 않는다.

`Select`/`Combobox`가 `collection.ts`를 공유하는 것과 같은 구조다 — 다만 여기서는 "제공자"가
`Calendar`(격자 자체가 컴포넌트인 쪽)이고 `DatePicker`가 그 격자를 오버레이 안에 담는 소비자다.

## Yajalal 실사용처 재확인 — 전제가 이미 바뀌어 있었다

이 작업을 위임받을 때 "일정 탐색기가 월 달력 격자를 자체 구현하고 있다"는 전제가 있었다.
`modules/app-rn/src/features/schedule-explorer/model.ts`와 `ScheduleExplorerScreen.tsx`를
직접 읽은 결과, 그 전제는 **더 이상 사실이 아니다**:

- `buildCalendarCells`/`CalendarDayCell`는 여전히 존재하지만, 커밋
  `0f4887c 비교 프리셋 제목 정정, 일정 탐색기 월 그리드를 날짜 레일로 교체`에서 **화면에
  격자를 그리는 코드 자체가 삭제**됐다. 지금 남은 역할은 월 범위 쿼리(`monthRange`)와
  §6 날짜 레일(`createScheduleDateRail`)의 입력을 만드는 내부 데이터 계산뿐이다.
- 실제로 렌더되는 것은 `MonthHeader`(월 이름 + 이전/다음 버튼, 격자 없음)와
  `ScheduleDateRail`(7일 문맥의 가로 스크롤 레일, §6 계약)이다. 레일은 이 저작의 범위 밖으로
  지정됐고, 레일 자체도 날짜 그리드가 아니라 완전히 다른 형태(승/패/응원/휴식 마크가 있는
  1차원 트랙)다.
- 앱 전체를 훑어도(`날짜 선택`/`DatePicker` 검색) 값 하나를 고르는 압축 트리거형 UI는
  어디에도 없다. `calendar` 아이콘이 쓰이는 다른 화면(FA, 선수 기록, 데일리 픽, 온보딩)은
  모두 장식 아이콘일 뿐 날짜 격자가 아니다.

**결론.** 현재 Yajalal에는 Calendar나 DatePicker의 살아있는 vertical slice 후보가 없다.
그렇다고 Notification/Dropdown처럼 "만들지 않는다"로 판정하지는 않았다 — 그 두 문서의
판정 근거는 "문제 자체가 이미 다른 컴포넌트로 완결됐다"였고, 날짜 격자를 보여주거나
고르는 문제는 Select/Menu/Toast 어느 것으로도 흡수되지 않는 별개의 문제이기 때문이다(로드맵
Batch 3에도 명시적으로 planned로 예약돼 있다). 다만 `planned → beta` 승격에 필요한 실제
vertical slice는 **아직 없다** — 이 계약은 그 전 단계("계약+recipe 준비됨")만 완성한다.
후보가 다시 필요해지면 일정 탐색기가 아니라 (a) 언젠가 월 그리드가 되돌아오는 화면이거나
(b) 생년월일·계약일처럼 값 하나를 고르는 새 폼 필드가 될 것이다.

## 일반화한 계약

### Collection 기본 계약을 적용하지 않는다

격자는 목록이 아니라 2차원이다. `stable id / label / textValue / none|single|multiple
selection mode / idle|loading|loadingMore|empty|error` 중 어느 것도 날짜 셀에 억지로
채우지 않았다:

- 날짜 자체(`"YYYY-MM-DD"`)가 이미 stable id다. 별도 `id`/`label`/`textValue` 삼중주를
  만들면 같은 값을 두 번 말하는 유령 필드가 된다.
- 날짜 셀은 검색·타이핑 대상이 아니다(Steps가 같은 이유로 `textValue`를 배제한 것과 같다).
- 격자는 서버에서 비동기로 채워지는 목록이 아니다. 어느 달의 날짜가 며칠까지 있는지는
  제품이 항상 동기로 안다 — `idle|loading|loadingMore|empty|error`는 셀이 아니라 그 안의
  `content`(경기 데이터)에 대한 것이고, 그건 제품이 격자 바깥에서 스스로 감싼다(Yajalal의
  `AppStateRegion`처럼). Statistic이 값 포맷을 소유하지 않듯, Calendar도 그 로딩 상태를
  소유하지 않는다.

### 날짜는 항상 문자열이다

`Date` 객체는 계약 어디에도 없다. `cells[].date`, `todayDate`, `selectedDate`,
`focusedMonth`는 전부 `"YYYY-MM-DD"` 또는 `"YYYY-MM"` 문자열이다 — Yajalal이 이미
`gameDate.slice(0, 10)`을 키로 쓰는 이유와 같다(시간대에 따라 같은 순간이 다른 날짜가
되는 문제를 원천 차단). `validateCalendarGridDescriptor`는 형태(정규식)만 검사하고
달력 산수(윤년, 월별 일수, 요일 계산)는 절대 하지 않는다 — 제품이 이미 그 계산을
가지고 있고(Yajalal의 `buildCalendarCells`), 시간대 의존적인 `Date` 연산을 이 패키지에
들이면 "런타임 의존성 금지"와 "제품이 포맷한 문자열을 받는다" 원칙을 동시에 어긴다.

### 격자 모양은 제품이 만들고, 의미는 HJM이 유도한다

`CalendarGridDescriptor`는 이미 계산된 7열 배열(`cells`, row-major)을 받는다. 어떤 날짜가
이 달에 속하는지, 앞뒤로 몇 칸이 비는지는 제품이 이미 안다. HJM은:

- 모양을 검증한다(7의 배수, 요일 라벨 7개, 날짜 형식, 중복 없음).
- 셀마다 `row`/`column`/`isToday`/`isSelected`/`selectable`을 유도한다(Steps가 `currentStepId`
  하나에서 `pending/current/complete`를 유도하는 것과 같은 원칙 — 제품이 상태를 배열로 다시
  넘기지 않는다).
- `date`가 없는 셀은 순수한 채움칸이다(이번 달 1일 전 요일들처럼). 채움칸은 절대 포커스,
  선택, 접근성 이름을 갖지 않는다.

### 낭독은 제품이 조립한다

"8월 19일 수요일, 경기 2개, 선택됨" 같은 문장은 `composeAccessibleName`이 만든다 — Steps의
`composeAccessibleName`과 같은 이유(어순·조사는 언어마다 다르고, `content`의 의미는 제품만
안다). 빈 문자열을 반환하면 resolver가 던진다.

### 선택 불가능한 날짜는 포커스를 잃지 않는다

`getCollectionNavigationTarget`(Menu/Select/Combobox)은 disabled 항목을 건너뛴다. Calendar는
**건너뛰지 않는다** — WAI-ARIA Date Picker Dialog 패턴처럼, 화살표 아래는 항상 정확히 한 주
아래로 이동해야 예측 가능하다. 비활성 날짜에 포커스가 앉는 것과 그 날짜를 **활성화**할 수
있는 것은 별개다: `resolveCalendarGridDescriptor`가 내주는 `selectable: false`가 그 경계를
표시하고, activate(Enter/Space/tap) 자체를 막는 책임은 renderer에 있다.

### 격자 밖으로 나가면 넘긴다, 감싸지 않는다

한 페이지(보이는 달)의 경계를 넘는 화살표 이동은 순환하지 않고 `{ overflow: "before" |
"after" }`를 돌려준다 — HJM은 인접 달의 모양을 모르기 때문이다. 제품이 이 신호를 받아
달을 넘기고(`focusedMonth` 변경) 해당 날짜에 포커스를 옮긴다. **월 이동은 별도 통제
축(`focusedMonth`/`onFocusedMonthChange`)이며, 선택(`selectedDate`)과 완전히 독립이다** —
달을 넘겨도 선택은 지워지지 않는다.

## HJM 기본값

- `today`는 지속되는 테두리(`border.focus`)로, `selected`는 채워진 배경
  (`action.brand.background`)으로 표시한다 — 겹쳐도(오늘이면서 선택된 날) 둘 다 읽힌다.
- 비활성 날짜와 이번 달 밖 날짜는 각각 `disabledOpacity`/`outsideFocusedMonthOpacity`로
  구분한다(같은 회색조가 아니라 서로 다른 강도).
- 셀 지름은 `control.minTouchTarget`(medium) 이상을 보장한다.

## 플랫폼 번역

- Web: `grid`/`row`/`gridcell` role과 roving tabindex 화살표 이동을 쓴다(같은 결과: 원하는
  날짜에 도달). 채움칸은 `aria-hidden`.
- Native: 복합 grid role의 동등물이 없다 — Steps/Breadcrumb가 이미 같은 결론을 냈다. 각
  날짜는 독립적으로 포커스·탭 가능한 요소이고, 월 이동은 두 플랫폼 모두 있는 이전/다음
  버튼으로만 이뤄진다(화살표 스와이프 같은 제스처 기반 이동은 이 계약에 없다).
- 두 플랫폼 모두 "오늘·선택·비활성"을 같은 세 가지 비-색 신호(테두리/배경/투명도)로
  전달한다. 픽셀 parity가 아니라 같은 action/result/announcement라는 `beta →
  stable(adaptive)` gate의 기준을 그대로 따랐다 — Calendar 자체는 `adaptive`가 아니라
  `shared`로 분류하지만(오버레이 선택이 없으므로), 접근성 경로가 플랫폼마다 다르다는 점은
  같다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| `today` / `selected` / `disabled` / `outsideFocusedMonth` | 공개 |
| 월 이동(`focusedMonth`, 선택과 독립) | 공개 |
| 방향키 격자 이동(일/주 단위, Home/End) | 공개 — Web roving tabindex |
| range 선택(시작~끝 날짜 구간) | **배제** — 측정된 요구가 없다. Yajalal FA 조회, 경기 일정
  어디에도 기간 선택 UI가 없다. 필요해지면 `CalendarSelection`을 확장하지 않고 별도
  `CalendarRangeSelection` 타입을 새로 여는 쪽을 권한다 — 단일 선택 소비자의 타입을
  좁히지 않기 위해서다. |
| 요일 시작(일요일/월요일) 로직 | **배제** — 제품이 `weekdayLabels`와 `cells` 순서로 이미
  결정해서 넘긴다. HJM이 로케일별 첫 요일을 판단하지 않는다. |
| PageUp/PageDown 월·년 이동 단축키 | **배제** — 화살표 overflow 신호 + 명시적 이전/다음
  버튼이 이미 월 이동을 커버한다. 측정된 단축키 요구가 나오면 추가한다. |
| 다중 월 동시 표시(antd `Calendar`의 연간 뷰 등) | **배제** — 한 번에 한 달만 다룬다. |

## 검증 화면

아직 없다. 위 「Yajalal 실사용처 재확인」에서 밝혔듯 현재 살아있는 vertical slice 후보가
없다 — `planned → beta` 승격은 실제 제품 화면이 나온 뒤 리드가 진행한다.
