# 목록 편집과 복구 구성

검토일: 2026-10-15 · 상태: Storybook 배포 · npm 1.21.0 · Web / React Native

Lucian UX/UI [#033](https://lucianlabs.dev/uxui-prompt/#033), [#092](https://lucianlabs.dev/uxui-prompt/#092),
[#131](https://lucianlabs.dev/uxui-prompt/#131), [#144](https://lucianlabs.dev/uxui-prompt/#144),
[#178](https://lucianlabs.dev/uxui-prompt/#178)의 전수 검토 후 도입한 다섯 구성이다.
원본의 HTML/CSS/스크립트를 복사하지 않고 기존 HJM API로 구현한다. 특히 시연용 저장 성공,
전체 항목 복구, 고정 데이터·색은 가져오지 않는다. 새 의존성·canonical catalog 항목은 추가하지 않는다.

## 소유권과 기존 API와의 관계

| 공개 구성 | 기존 기반 | 새로 제공하는 행동 | 제품 소유 |
| --- | --- | --- | --- |
| InlineEdit | TextField, Button, ActionSession | 명시적 편집·저장·취소, 실패 초안 보존, Web IME/Enter/Escape, 중복·오래된 완료 차단 | ID, 확정 값, 검증, 저장, 오류 문구 |
| RepeatableFieldGroup | FieldGroup | stable ID 행 추가·삭제, 행 이동 시 host 유지, 삭제 뒤 다음 행/추가 버튼 포커스 | 행 배열·값·오류, 새 ID 발급, 삭제 실행 |
| SelectionActionBar | Button, Text, ActionSession | 선택 요약·행동·정확한 선택 snapshot, 작업 진행·실패, 제품 역연산 호출 | 선택 ID, 행동·권한, 실제 보관/복구, 결과 반영 |
| FilterRecovery | Button, Text, ActionSession | 양수 결과가 있는 제안만 표시, 명시적 적용, 실패 복구 | 검색·필터·실제 개수, 제안 라벨, 확정 결과 |
| TableColumnSettings | Checkbox, Button, DataTable 제어 columns | 마지막 표시 열 보호, 고정 열 숨김/이동 차단, 인접 교환 | 원본 열 정의, 보이는 순서, 정렬·선택·설정 저장 |

단일 이름 입력이면 TextField, 고정 입력 묶음이면 FieldGroup, 단순 선택이면 CheckboxGroup을 쓴다.
이번 구성은 해당 API를 대체하는 엔진이 아니라 그 위의 반복되는 작업 흐름이다.
선택 바는 Native DataTable에 다중 선택 기능을 추가하지 않는다. Native에서는 CheckboxGroup 등의 실제 선택 공급원을 연결한다.

## 공개 경로와 상태

- Web: `@hjmds/react/collection-editing`
- Native: `@hjmds/react-native/collection-editing`
- 순수 모델/헬퍼: `@hjmds/design-contracts/collection-editing`
- root barrel에 추가하지 않는다. 양 플랫폼 공개 API가 있지만 1.21.0으로 게시되었으며 소비 앱에서 같은 버전을 설치한 뒤 사용한다.
- 다섯 구성은 각각 `배포/구성/…` Storybook에 있다. 실행 예제와 배치는 [사용 지침](usage/compositions/collection-editing.md)을 따른다.

## 주요 타입

```ts
type ColumnSetting = Readonly<{ id: string; label: string; visible: boolean; locked?: boolean }>;
type FilterRecoveryOption = Readonly<{ id: string; label: string; resultCount: number }>;
type SelectionAction = Readonly<{ id: string; label: string; destructive?: boolean }>;
```

모든 문구와 formatter는 제품에서 지역화해 전달한다. renderer에는 기본 한국어 성공/실패 문구가 없다.
색·서체·간격·버튼·입력은 기존 HJM theme/recipe를 사용한다. 묶음 간격 `md`, 행동 간격 `sm`은
`collectionEditingRecipe`가 소유한다. 상태·오류 묶음은 자기 영역 중앙에 정렬한다.

## 저장·동시성·복구

- `onSave`, `onAction`, `onApply`, `onUndo`는 동기 함수 또는 Promise다. 성공은 resolve,
  실패는 reject로 전달한다. catch 후 정상 resolve하면 HJM은 실패를 알 수 없다.
- `onSave`는 확정 값이 제품 `value`에 반영된 뒤 resolve한다. 실패는 편집기·초안을 유지한다.
  blur는 자동 저장하지 않는다. 편집 중 외부 값 갱신이 와도 초안을 덮지 않는다. 동시 편집 충돌 처리는 제품 책임이다.
- `InlineEdit.id`는 엔티티 ID다. 다른 항목으로 바뀌면 내부 편집 세션을 교체해 이전 완료가 새 초안을 닫지 못한다.
- 비동기 행동은 기존 `createActionSession`으로 직렬화한다. unmount는 결과를 무시할 뿐 이미 서버가 받은 작업을 취소하지 않는다.
  자동 재시도·저장·네트워크 요청을 추가하지 않는다.
- `selectedIds`는 실행 시 복사·freeze한다. 이후 선택 변경이 이미 진행 중인 요청의 대상을 바꾸지 않는다.
  성공했다고 HJM이 선택을 임의로 비우지 않는다. 제품이 실제 결과를 반영하며 부분 실패는 항목 ID별로 처리한다.
- `recovery`는 제품이 확정한 **해당 작업**의 역연산이다. 다른 작업까지 복구하지 않는다.
  버튼은 현재 selection과 무관하게 해당 callback을 호출한다. 작업 기록의 만료·중복 방지·idempotency는 제품 소유다.
- 필터의 `resultCount`는 0 이상 safe integer다. 0개인 제안은 숨긴다. 로컬 자료가 전체가 아니라면
  서버가 계산한 개수를 전달하고 추정치를 실제 결과인 것처럼 표시하지 않는다.
- 행 ID는 배열 index가 아니다. `renderField`의 `guardChange`로 값 변경을 감싸고 `focusRef`를 실제 입력 ref에 연결한다.
  `onAdd`는 제품이 발급한 ID를 반환하고 같은 변경에서 descriptor에 포함한다. `minFields`/`maxFields`는 행 수 경계다.
- 열 설정은 원본 DataTable descriptor를 ID로 다시 고른다. `{id,header}`만 새로 만들어 pinned/width/sort 정보를 버리지 않는다.
  `locked`는 위치 경계이며 주변 열도 그 열을 넘지 못한다. 실제 pinned 열은 제품이 locked로 매핑한다.

## 플랫폼 경계

Web은 표준 fieldset/label·포커스·키보드를 사용한다. Enter는 IME 조합 중 저장하지 않고, Escape는 pending이 아닐 때 취소한다.
Native는 TextInput submit와 명시적 저장·취소 버튼을 제공한다. 각 입력을 독립적으로 접근 가능하게 유지하고 부모 View로 합치지 않는다.
공통 구성은 스크롤·safe area·키보드 높이를 소유하지 않는다. 실제 화면 host 안에 넣는다.

검증은 관련 계약·Chromium·Native host renderer와 타입 검사로 구분해 보고한다.
이 문서는 iOS/Android 실기기·화면 낭독기·성능·npm 게시 또는 소비 앱 적용 증거가 아니다.

## 이번 변경의 확인 결과

2026-10-15: 관련 순수 계약 3건, Chromium 7건, Native host renderer 5건 통과.
Chromium에는 375px host에서 두 브랜드 fixture(violet/green)의 light/dark 상속과 가로 넘침 확인을 포함한다.
세 패키지 build, Web/Native renderer typecheck와 두 Showcase typecheck를 수행했다.
로컬 Storybook에서 다섯 구성의 375px 화면과 제목 저장 실패 상태를 직접 확인했다.

새 Web story ID 15개는 원본을 읽는 기존 생성 로직으로 등록했다. 선택적 전체 Storybook 규약 검사에서
기존 `components-data-display--chart` ID의 snapshot 누락을 발견했지만 이번 구성과 무관해 변경하지 않았다.
전체 회귀·실기기·VoiceOver/TalkBack·성능 측정·소비 화면 적용은 미실행이다. npm 1.21.0 게시·설치 범위는 도입 기록을 따른다.
