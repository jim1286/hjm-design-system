# TimePicker — 새 컴포넌트를 만들지 않는다

## 문제로 제기된 것

Ant Design `TimePicker`는 필드 트리거를 누르면 시·분(·초) 열이 나란히 있는 팝업이 뜨고,
각 열에서 스크롤/클릭으로 값을 고르는 컴포넌트다. crosswalk는 이미
`{ name: "TimePicker", category: "data-entry", targets: ["TimePicker"], relationship:
"direct" }`로 연결돼 있다(`src/component-references.ts:86`).

## 판정: 새 컴포넌트가 필요 없다 — 문제가 이미 Select로 완결된다

시·분은 **격자가 아니라 목록**이다(Calendar의 날짜 격자와 다르다 — 그건 2차원이라
Collection 기본 계약을 적용하지 않기로 했지만, 시·분은 처음부터 1차원 목록이라 정확히
그 계약이 맞는 자리다). 시(0~23)와 분(0~59)은 각각:

- stable id(`"00"`..`"23"`, `"00"`..`"59"`)
- 보이는 label(제품이 포맷 — 24시간제, 앞자리 0)
- 선택적 `disabled`(예: 영업시간 밖 시각을 회색 처리)
- `none|single` 선택 모드, 정적 목록(비동기 상태 불필요)

인 **정확히 `CollectionItemDescriptor` 하나**다. 그리고 "트리거 + 적응형 오버레이(Web
popover / Native Sheet) + 단일 committed key + disabled 항목 skip 없는 예측 가능한
방향키 이동"은 이미 `Select`가 `beta`로 검증한 계약 그대로다. 즉:

**시 Select 하나 + 분 Select 하나 = TimePicker.** 제품이 두 값을 `"HH:mm"` 문자열로
합치기만 하면 antd `TimePicker`가 푸는 사용자 문제(하루 중 시각 하나를 고른다)는 이미
완결된다. 새 recipe도, 새 behavior도, 새 상태 축도 필요하지 않다 — Dropdown이
`Menu`로 완전히 흡수된 것과 같은 자리다: 격자처럼 여기서만 필요한 새 조각
(Calendar의 `row`/`column`/`overflow` 같은)이 하나도 없다.

## 실사용처 확인

Yajalal 전체(`날짜/시간 선택`, `TimePicker`, 알림 설정 화면 `NotificationSettingsScreen.tsx`
등)를 검색했지만 하루 중 시각 하나를 고르는 UI 자체가 어디에도 없다. 측정된 요구가
없다는 점에서도 지금 새 계약을 여는 것을 정당화할 근거가 없다.

## 왜 압축된 단일 트리거(진짜 antd 형태)를 만들지 않았는가

두 개의 Select를 나란히 두는 것과 antd처럼 **트리거 하나 + 팝업 하나 안에 두 열이
동기화된 형태**는 시각적으로 다르다. 후자를 만들려면:

- 하나의 열림 상태가 두 열을 동시에 제어해야 하고,
- 트리거의 표시 문자열이 두 committed key를 조합해야 하며(Statistic/Calendar와 같은
  "제품이 포맷한 문자열을 받는다" 원칙),
- **"selection"이 더 이상 자동 닫힘 사유가 아니어야 한다** — 시만 고르고 분을 아직
  안 골랐는데 닫히면 안 되기 때문이다(DatePicker/Select는 값 하나를 고르면 바로
  닫히지만, 여기서는 두 값이 다 맞아떨어져야 "완료"다).

이 세 가지는 실제로 작겠지만 **새로운 축**이다 — Select의 트리거/오버레이/커밋 계약을
그대로 복제하면서 "selection은 안 닫는다"는 예외 하나만 얹는 얇은 wrapper가 된다.
지금은 이 압축 형태를 요구하는 화면이 없으므로, 순전히 미관상의 이유로 그 wrapper를
먼저 만들지 않는다 — 로드맵의 "측정된 요구가 나타나면 그때 기본을 재검토한다" 원칙과
`docs/notification.md`/`docs/dropdown.md`가 이미 세운 관례를 그대로 따른다.

## 제품이 지금 composing할 때 지킬 것 (판정이 이대로 유지되는 동안)

- 값은 각 Select의 committed key를 그대로 쓰되, 최종 시각은 **문자열** `"HH:mm"`
  (24시간제, 앞자리 0)로 합성한다. `Date` 객체를 어디에도 들이지 않는다 — DatePicker와
  같은 이유(시간대·서머타임을 이 패키지가 가지면 안 된다).
- **초 단위는 넣지 않는다.** 측정된 요구가 없고, 두 Select를 세 Select로 늘리는 것도
  같은 근거로 보류한다.
- **12시간제(오전/오후)는 넣지 않는다.** 24시간제 값 위에 표시만 로케일별로 다르게
  하고 싶다면 그건 제품이 표시 문자열을 포맷하는 몫이다(Statistic 원칙) — 값 자체에
  `period` 축을 추가하지 않는다.

## 판정이 뒤집힐 조건

실제 화면이 **트리거 하나 + 팝업 하나**의 압축된 형태를 구체적으로 요구하면(예: 경기
알림 시각 설정처럼 공간이 좁은 자리), 그때 얇은 `time-picker.ts`를 연다. 그 경우 권장
설계:

- `hours`/`minutes` 각 열은 `collection.ts`의 `CollectionItemDescriptor`/
  `validateCollection`/`getCollectionNavigationTarget`/`getCollectionTypeaheadMatch`를
  **그대로 재사용**한다 — 여기서 재정의할 것이 없다.
- 트리거/오버레이 축(`open`/`defaultOpen`/`onOpenChange`, 라벨)은 `DatePickerOpenState`/
  `DatePickerLabel`과 같은 모양으로 새 파일에 다시 선언한다(자급자족 원칙 — DatePicker가
  `collection.ts`의 Select 타입을 그대로 가져오지 않고 같은 모양을 다시 선언한 것과
  같은 이유).
- `dismiss`에서 `"selection"`을 뺀다 — 여기서만 다른 예외이므로 반드시 문서에
  남긴다. 대신 명시적 `"confirm"` 사유를 추가한다.
- 초·12시간제 축은 이 조건이 왔다고 해서 자동으로 열리지 않는다 — 그 축은 별도로
  다시 측정한다.

## 배선 명세 (리드 참고)

catalog의 `{ name: "TimePicker", category: "input", platform: "adaptive", status:
"planned" }`(`src/catalog.ts:69`) 행은 바꿀 것이 없다 — recipe/behavior가 원래 없었고,
지금도 없다. `src/time-picker.ts`, `test/time-picker.test.ts`는 만들지 않았다.
