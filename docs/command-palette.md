# CommandPalette contract

## 문제

키보드로 전체 앱의 행동을 검색해 실행한다(⌘K 스타일). antd에는 이 문제에 직접
대응하는 컴포넌트가 없다 — `antDesignReferenceComponents`에 `CommandPalette`
crosswalk가 없다. 가장 가까운 antd 표면인 `AutoComplete`/`showSearch` Select는
정확히 아래 판정이 다루는 질문이지, 별도 커버리지 공백이 아니다.

## Combobox와의 경계 (판정)

CommandPalette는 "Combobox + 모달 표면 + 전역 단축키"로 보일 수 있지만, 결정적으로
다른 지점이 하나 있고 거기서 나머지 판단이 갈린다.

**결과가 값이 아니라 행동이다.** Combobox의 commit은 `selectedKey`를 필드의
지속되는 값으로 만들고 `inputValue`가 그것을 계속 반영한다. "새 트윗 작성"을
실행하는 데는 기억할 지속 값이 없다 — 팔레트는 닫히고 다음에 열 때 리셋된다.
여기에 `selectedKey`/`onCommit`을 억지로 씌우면 열 때마다 `null`로 되돌아가는
유령 값을 만들게 된다 — `docs/dropdown.md`가 Menu의 문제를 다른 이름으로 다시
계약하지 않은 것과 같은 종류의 실수다. 그래서 항목 타입은 `SelectItemDescriptor`
(shortcut/tone을 의도적으로 뺀)가 아니라 `MenuItemDescriptor`(shortcut/tone을
가진, 위험한 명령에 danger tone을 줄 수 있는) 모양을 그대로 쓴다
(`CommandPaletteItemDescriptor<Key> = MenuItemDescriptor<Key>`).

이 한 가지를 빼면 나머지는 전부 기존 계약의 조합이다.

| 조각 | 판정 | 근거 |
| --- | --- | --- |
| 여러 출처가 섞인 목록(최근/명령어/검색 결과) | **Collection의 `sections`로 이미 된다** | `CollectionSource`가 이미 그룹 items를 표현한다. 새 데이터 모델 불필요 |
| 검색어 입력·필터링 | **Combobox의 `ComboboxInput`/`ComboboxCollectionState` 그대로 재사용** | local vs external filtering, `queryValue`/`resultQuery` staleness guard는 이미 완결된 계약이고, 명령 검색도 같은 비동기 검색 문제다 |
| 항목 간 키보드 탐색·typeahead | **`getCollectionNavigationTarget`/`getCollectionTypeaheadMatch` 그대로 재사용** | 어떤 `CollectionSource`에도 이미 일반화돼 있다 |
| 결과 실행(activate) | **새로 계약** | Select/Combobox의 `selectedKey` 모델이 맞지 않는 자리 — 위 판정 |
| 표면(모달, 포커스 트랩, Escape/outside) | **새로 계약(자급자족)**, Dialog 모양을 그대로 복사 | Dialog는 `src/dialog.ts`가 없어 import할 타입이 없다. SidePanel이 Sheet 모양을 복사해 자급자족한 것과 같은 이유 |
| 전역 단축키(⌘K) | **배제 — 제품 몫** | 어떤 키 조합인지, 전역인지 범위 한정인지는 앱의 결정이다. Link가 navigation을 소유하지 않는 것과 같은 경계 |

## 일반화한 계약

### 항목·출처

`CommandPaletteItemDescriptor`/`CommandPaletteSource`는 각각 `MenuItemDescriptor`/
`CollectionSource`의 별칭이다 — 새 필드를 만들지 않았다.

### 검색·필터

`CommandPaletteInput`/`CommandPaletteQueryState`는 각각 `ComboboxInput`/
`ComboboxCollectionState`의 별칭이다.

### 실행(activate)은 Menu의 onAction 모양을 따르되 자급자족한다

`onActivate`(즉시 실행)와 `onActivateAfterDismiss`(퇴장 전환이 끝난 뒤 실행)로
나눈다 — `behaviorRegistry.menu`의 `onAction`/`onActionAfterDismiss` 분리와 같은
이유다. Menu는 `src/menu.ts`가 없어 import할 타입이 없으므로 이 모듈이 같은 모양을
독자적으로 선언한다. 실행한 명령이 다른 오버레이(예: Dialog)를 열어야 한다면
`docs/architecture.md`의 오버레이 stacking 규칙("Sheet를 먼저 닫고 exit 완료 뒤 후속
surface를 연다")과 같은 순서가 필요하고, `onActivateAfterDismiss`가 그 시점을
제공한다.

### 열림·닫힘

`CommandPaletteOpenState`는 Tooltip/Popover와 같은 `open`/`defaultOpen`/
`onOpenChange` discriminated union이다. `CommandPaletteDismissReason`은
`close-action | outside | escape | activation | programmatic`이다.

- `back`/`swipe`가 없다 — web 전용, 항상 모달이라 SidePanel의 `modal` 축도 없다.
- **`activation`은 `programmatic`과 똑같이 항상 허용된다.** 명령 실행은 무엇을
  하든 팔레트를 닫아야 한다 — `dismissible: false`인 정책이라도 막을 수 없다.
  이것은 Menu의 항목 선택이 항상 표면을 닫는 것(다중 선택 모드 제외)과 같은 종류의
  "행동 완료는 표면 종료를 함의한다"는 규칙이다.
- `busy` 축은 없다. 팔레트 자신은 fire-and-forget이다 — `onActivate`가 실행되고
  팔레트는 닫힌다. 명령의 실제 효과가 비동기라면 그건 팔레트가 이미 사라진 뒤
  진행된다(`onActivateAfterDismiss`가 그 순서를 보장). AlertDialog의
  `idle→busy→error` session을 여기 복제하는 것은 "명령이 끝날 때까지 팔레트가
  열려 있어야 한다"는, 측정되지 않은 요구를 추측하는 일이다.

### 설명

`CommandPaletteDescriptor`는 `accessibilityLabel`과 `searchPlaceholder` 둘 다
**필수**다. Popover의 `accessibilityLabel`은 선택 사항이었다(콘텐츠가 보통 자체
heading을 가지므로) — CommandPalette는 다르다: `role="dialog"` 표면에 보이는 제목이
없고 검색 입력 하나뿐이라, 검색창 placeholder만으로 렌더러마다 다른 접근 가능한
이름을 만들 위험이 있다. 그래서 명시적으로 요구한다.

## HJM 기본값

- `commandPaletteRecipe`는 새 색이나 형태를 만들지 않는다. 모달 chrome은
  `floatingSurfaceContract`(배경/테두리/그림자), backdrop은 기존 `backdrop.modal`,
  검색창은 `fieldFrameContract`, 결과 행과 section label은 `collectionItemContract`를
  그대로 쓴다 — Menu/Select/Tree가 이미 쓰는 행 chrome과 시각적으로 같다.
- `maxWidth: 560`/`maxHeight: 420`만 새로 정했다 — 검색 결과 목록이 화면을 다 덮지
  않도록 하는 palette 특유의 크기 제약이다.

## 플랫폼 번역

- Web: `role="dialog"`(모달), `aria-label`은 `accessibilityLabel`. 초기 focus는
  검색 입력으로 이동한다. Escape·backdrop 클릭은 `outside`/`escape`로 닫는다.
  결과 목록은 `getCollectionNavigationTarget`/`getCollectionTypeaheadMatch`가 이미
  제공하는 키보드 모델을 그대로 쓴다 — 새 keyboard table을 정의하지 않는다.
- Native: 이 컴포넌트는 `platform: web`이다. Native의 대응 검토는 측정된 요구가
  나온 뒤로 미룬다.
- Reduce Motion: Dialog/Popover와 같은 `motionPreset.enter/exit`을 재사용한다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| 실행(`onActivate`/`onActivateAfterDismiss`) | 공개 |
| 검색/필터(`ComboboxInput`/`ComboboxCollectionState` 재사용) | 공개 |
| 여러 section 혼합 | 공개(Collection 기본 계약 그대로) |
| dismiss reason(`close-action`/`outside`/`escape`/`activation`/`programmatic`) | 공개 |
| `busy`(명령 실행 중 팔레트 유지) | **배제** — fire-and-forget, 측정된 요구 없음 |
| 전역 단축키 바인딩 | **배제** — 제품 몫 |
| 값 커밋(`selectedKey`) | **배제** — 결과는 값이 아니라 행동(위 판정) |

## 검증 화면

아직 없음. `planned → beta` 승격은 실제 제품 vertical slice 이후 리드가 진행한다.
