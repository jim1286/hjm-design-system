# 쉬운 말로 찾고 비교하기

2026-10-23 [앱 UI 메뉴판](https://giting.kr/skills/app-menu)의 별칭 → 명칭 → 요청 예시 접근을 참고했다.
일상 표현으로 기존 HJM API에 도달하도록 안내하며, 외부 사전의 플랫폼 설명을 HJM의 지원 계약으로 사용하지 않는다.

[Storybook 컴포넌트 찾기](https://storybook.jmstudioapps.com/?path=/story/components-overview--explorer)에서
쉬운 말·한글 이름·API 이름을 검색한다. 현재 checkout의 개발 변경이며 공개 사이트 반영은 별도다.
결과 카드에서 선택 기준·요청 예시를 읽고 실행 예제와 사용 지침으로 이동한다.
웹 Storybook은 작성 도구이며 Web 예제로 Native 동작을 검증했다고 판단하지 않는다.

## 이름이 떠오르지 않을 때

| 찾는 말 | 먼저 볼 API·지침 | 실행 예제 |
| --- | --- | --- |
| 아래에서 올라오는 판 | [Sheet](components/sheet.md) | [시트](https://storybook.jmstudioapps.com/?path=/story/components-overlays--sheet) |
| 맨 아래 붙은 버튼 | [BottomCTA](components/bottom-cta.md) | [하단 행동](https://storybook.jmstudioapps.com/?path=/story/components-actions--bottom-cta) |
| 목록 한 줄, 오른쪽 현재 값 | [ListRow](components/list-row.md) | [목록 행](https://storybook.jmstudioapps.com/?path=/story/components-data-display--list-row) |
| 밀면 나오는 삭제 버튼 | [SwipeActions](components/swipe-actions.md) | [끌기·밀기](https://storybook.jmstudioapps.com/?path=/story/experimental-interaction-adapters--default) |
| 꾹 눌러 순서 바꾸기 | [SortableCollection](components/sortable-collection.md) | [끌기·밀기](https://storybook.jmstudioapps.com/?path=/story/experimental-interaction-adapters--default) |
| 끝까지 내리면 더 나옴 | [LoadMore](components/load-more.md) | [추가 로딩](https://storybook.jmstudioapps.com/?path=/story/components-navigation--load-more) |
| 키보드가 입력칸을 가려 | [KeyboardFormScrollView](components/keyboard-form-scroll-view.md)·[입력 시트](compositions/input-sheet.md) | [입력 시트](https://storybook.jmstudioapps.com/?path=/story/patterns-input-sheet--default) |
| 갤러리·카메라 선택 | [PhotoSourceSheet](components/photo-source-sheet.md) | [사진 출처](https://storybook.jmstudioapps.com/?path=/story/components-overlays--photo-source-sheet) |

검색 결과에서 List·Form·Sheet가 나오면 카드에 안내된 선택형 API도 확인한다.
예를 들어 List는 표시 계약이고, SwipeActions·SortableCollection은 별도의 공개 진입점이다.
검색어를 공개 export 이름이나 canonical API 별칭으로 추가하지 않는다.

## 비슷한 UI 중 고르기

| 필요한 일 | 선택 | 비교할 경계 |
| --- | --- | --- |
| 앱의 주요 구역 이동 | [BottomNavigation](components/bottom-navigation.md) | 한 화면 안 짧은 보기 전환은 SegmentedControl, 관련 패널 탐색은 Tabs |
| 실행할 행동 고르기 | [Menu](components/menu.md) | 값 입력은 Select, 삭제 직전 확인은 AlertDialog |
| 보조 선택·입력 작업 | [Sheet](components/sheet.md) | 짧은 집중 작업은 Dialog. “모달”이라는 말만으로 풀스크린을 결정하지 않음 |
| 끌어서 높이 바꾸는 시트 | [선택형 Native GestureSheet](compositions/optional-adapters.md) | 기본 Sheet의 지원과 optional peer 설치·provider 조건을 구분 |
| 켜짐·꺼짐 설정 | [Switch](components/switch.md) | 여러 항목 동의는 Checkbox·Agreement, 하나의 선택지는 RadioGroup |
| 수량 늘리고 줄이기 | [NumberField](components/number-field.md) | Steps는 진행 단계 표시이며 수량 입력이 아님 |
| 처음 데이터가 없음 | [EmptyState](components/empty-state.md) | 로딩·오류·검색 결과 없음과 실제 상태를 구분 |
| 설정 화면 구성 | [SettingsScreen](screens/common-settings.md) | 제품에서 그룹·행 배치를 다시 조립하기 전에 화면 API부터 선택 |

웹·앱의 표현은 각 API 지침의 플랫폼 차이를 읽는다. 모든 Native Select를 시트로 바꾸거나,
모든 모달을 풀스크린으로 만드는 규칙은 두지 않는다. 화면 이동·딥링크·스플래시 초기화·권한·서버 저장은
[제품 소유 경계](SELECTION.md#소유권)다. HJM에는 공통 표시와 상호작용을 연결한다.

## 요청을 구현으로 연결하기

`화면 목적 + 필요한 구조 + 실제 상태 + 제품 콜백`으로 요청한다. 배치·지원 prop은 연결한 지침이 정본이다.

| 요청 예시 | 수정 위치 → 공개 API → 확인 범위 |
| --- | --- |
| “설정을 계정·알림·정보 그룹으로 나누고 행 오른쪽에 현재 값을 보여줘” | 제품 설정 데이터 → SettingsScreen·ListRow → 그룹 순서·값·행동 연결 |
| “댓글 더보기에서 신고·차단을 고르게 해줘” | 제품의 허용 행동 → Menu의 anchored 표현 → 대상·닫힘·후속 행동. [메뉴 지침](components/menu.md) |
| “사진 출처를 고른 뒤 카메라를 열어줘” | 제품 권한·picker adapter → PhotoSourceSheet → 닫힘 뒤 실행·권한 거부. [사진 출처 지침](components/photo-source-sheet.md) |
| “저장 실패하면 입력을 유지하고 키보드가 마지막 필드를 가리지 않게 해줘” | 제품 초안·요청 상태 → Form과 입력 host → 실패 후 초안·필드 도달·저장 행동. [입력 시트](compositions/input-sheet.md) |

공통 배치가 부족하면 제품별 보정 여백을 더하지 않고 [선택 기준](SELECTION.md)에 따라 HJM 소유 구현을 보완한다.
필요한 검사만 고르며 이 안내는 새 자동 검사나 승인 절차를 추가하지 않는다.

## 휠 피커 검토 결과

2026-10-23 구현: [TimePicker](components/time-picker.md)는 Web·Native 모두 `selectionStyle="wheel"`로
관성 스크롤과 중앙 스냅을 제공한다. 기본 `list`는 기존 탭 목록이다. 휠 옵션은 개발 소스의 미게시 변경이며,
검색에서 “휠 피커”를 입력하면 기존 TimePicker와 실행 예제로 연결한다.

선택한 설계는 **시각 선택에는 기존 TimePicker를 확장하는 방식**이다. 일반 WheelPicker를 먼저 별도로 만들면
초안·확정·취소·사용 불가 시각 계약이 중복된다. 기존 `HH:mm | null` 값·`minuteStep`·선택 불가 판정·명시적 확정을 유지하고,
선택 표현 옵션으로 스냅·관성·중앙 선택 표시를 추가했다. 일반 항목 선택 요구가 실제로 생기면
공유할 내부 선택 엔진의 범위를 판단한다.

검증은 스크롤 초안과 최종 확정, 불가능한 값 건너뛰기, 취소 복원, 보조기술 액션, 동작 줄이기와
플랫폼별 실제 동작으로 나눈다. host 검사·브라우저 검사·Native 기기 확인의 결과는 각각 구분한다.
