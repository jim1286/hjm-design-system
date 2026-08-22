# DatePicker contract

## 문제

압축된 필드 하나에서 날짜 값 하나를 고른다 — 상시 표시되는 달력이 화면 공간을 쓸 수 없는
폼/필터 자리(생년월일, 계약일, 시작일 필터)를 위한 것이다. `docs/calendar.md`가 이미
판정했듯 이 문제의 "격자" 부분은 `Calendar`와 완전히 같은 문제이고, DatePicker가 새로
푸는 부분은 **그 격자를 트리거+오버레이 뒤에 숨기고, 커밋 시 닫는 생명주기**뿐이다.

## antd 대응

`DatePicker`(data-entry) → HJM `DatePicker`, `direct`. `crosswalk`는 이미 이 이름 그대로
연결돼 있다(`component-references.ts:76`). `RangePicker`(같은 antd 컴포넌트의 variant)는
이 계약에 없다 — range 선택 자체를 배제했기 때문이다(아래 참고).

## Calendar와의 경계

`docs/calendar.md`의 판정을 그대로 따른다: 격자(월 표시, 셀, 오늘/선택/비활성, 방향키
이동)는 `calendar.ts`가 소유하고, 이 파일은 그 위에 세 가지만 더한다.

1. **필드 트리거** — `fieldFrameContract`를 그대로 재사용한다(NumberField, Select가 각자
   독립적으로 같은 재사용을 하는 것과 같은 이유 — 프레임이 두 벌이면 하나만 바뀌는 순간
   어긋난다).
2. **적응형 오버레이** — `selectRecipe.adaptive`와 동일한 `{ web: "popover", native:
   "sheet" }`. Select가 이미 검증한 패턴을 그대로 따른다(`src/behaviorRegistry.select`,
   `docs/architecture.md`의 「Select와 Combobox의 적응형 경계」).
3. **커밋·닫힘 생명주기** — 날짜를 고르면 `onSelectionChange`가 불리고 팝오버/시트가
   닫힌다. Select의 `selection-requests-close-and-restores-trigger-focus` 시나리오와
   동일한 결과를 낸다.

`resolveDatePickerGrid`는 `resolveCalendarGridDescriptor`를 그대로 호출한다 — 셀의 의미,
오늘/선택/비활성 판정, 방향키 산수 중 어느 것도 다시 정의하지 않는다. DatePicker의
`docs/calendar.md`가 다루는 접근성 회색지대(격자 안 이동)를 다시 열지 않기 위해서다.

## 공개한 상태 축

| 축 | 값 |
| --- | --- |
| availability | enabled, disabled, readOnly, busy |
| value | empty, selected, open |
| validation | valid, invalid |

Select의 축과 동일하되 `content`(idle/loading/loadingMore/error)는 없다 — 격자 자체가
비동기 컬렉션이 아니라는 `docs/calendar.md`의 판정이 그대로 이어진다.

### 배제한 축

- **range 선택**: 측정된 수요가 없다(`docs/calendar.md` 참고). 시작~끝 날짜 구간이
  필요해지면 `DatePickerSelection`을 넓히지 않고 별도 `DateRangePicker` 계약을 여는 쪽을
  권한다 — 단일 날짜 소비자의 타입을 좁히지 않기 위해서다(Steps가 clickable을 얹지 않고
  새 축을 배제한 것과 같은 판단 방식).
- **자유 입력 텍스트 필드(Combobox 스타일)**: antd의 `DatePicker`는 텍스트 입력으로 날짜를
  타이핑하는 것도 허용하지만, 이 계약은 트리거(버튼)로만 연다 — Combobox의 `inputValue`
  같은 별도 편집 축을 추가하려면 날짜 문자열 파싱을 이 패키지가 갖게 되어 "제품이 포맷한
  문자열을 받는다" 원칙과 정면으로 충돌한다. 필요해지면 별도 컴포넌트로 연다.
- **PageUp/PageDown 월·년 단축키**: `docs/calendar.md`와 같은 이유로 배제.

## HJM 기본값

- 트리거는 `displayValue`(제품이 포맷한 문자열, 예: "2026년 8월 19일")를 보여주고, 없으면
  `placeholder`를 보여준다. Statistic이 값을 절대 스스로 포맷하지 않는 것과 같은 원칙이다.
- `clear`는 `onSelectionChange(null, "clear")`를 커밋하고 닫는다 — 별도 "빈 선택 금지"
  설정을 두지 않았다. 대부분의 날짜 필드는 선택 사항이고(Select가 기본으로 빈 선택을
  허용하는 것과 같다), 강제로 채워야 하는 날짜 필드는 폼 레벨 validation(`invalid` 축)이
  이미 표현한다.

## 플랫폼 번역

- Web: 트리거는 `button`(`aria-haspopup="dialog"`, `aria-expanded`). 열린 표면은 실제
  DOM 포커스가 셀 사이를 이동하는 `dialog` + `grid`다 — Select의 `activeDescendant`
  리스트박스 패턴과 다르다(Select 팝업의 옵션은 실제 포커스를 받지 않고 트리거가 계속
  포커스를 쥔다). 날짜 격자는 WAI-ARIA Date Picker Dialog 패턴을 따라 실제 focus가
  gridcell 사이를 roving하므로, `datePickerBehavior.web.focus`는 `"roving"`이다. 닫히면
  포커스는 트리거로 복원된다.
- Native: 트리거는 버튼, 오버레이는 Sheet — Select의 Native 렌더러와 동일한 조합이다.
- 두 플랫폼 모두 Escape/뒤로가기·바깥 탭·선택 커밋이 같은 세 가지 닫힘 경로를 낸다
  (`dismiss: ["selection", "escape"/"back", "outside"]`).

## 검증 화면

아직 없다. `docs/calendar.md`가 밝힌 대로 Yajalal에 현재 이 문제의 살아있는 vertical
slice가 없다 — 값 하나를 고르는 새 폼 필드(생년월일, 계약일 같은)가 나오면 그때 리드가
`planned → beta` 승격을 진행한다.
