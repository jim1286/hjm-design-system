# CommandPalette contract

검토일: 2026-10-06 (Web renderer의 local/external 필터링·빈 결과·section 이름·닫기 버튼 반영)

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

- `filtering`을 생략하거나 `"local"`이면 renderer가 `query`로 `source`를 거른다. 규칙은
  `label`·`textValue`에 대한 대소문자 무시 부분 일치이며 Native Combobox의 local 규칙과 같다. 접두 일치(typeahead 규칙)는 "지우기"처럼 단어 중간으로 찾는 명령
  검색에 맞지 않아 쓰지 않았다.
- `"external"`이면 제품이 이미 거르거나 순위를 매긴 결과(서버·fuzzy 검색)를 그대로 보여 주고,
  `queryValue !== resultQuery`인 낡은 결과는 표시하되 실행할 수 없다(Native Combobox와 같은 규칙).
- 거른 뒤 비는 section은 제목째 뺀다.
- 이 해석은 contracts helper가 아니라 Web renderer 내부 함수에 둔다. 소비하는 renderer가 Web 하나뿐이고
  (Native unsupported), 이 모듈을 재수출하는 contracts `./behaviors` 묶음이 2026-10-06 측정에서 바이트 상한
  바로 아래(약 345.0 kB)라 helper 약 2 kB가 경보를 냈기 때문이다. Native 대응이 생기면 contracts로 올린다.

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
**필수**다. 2026-10-06에 선택 필드 두 개를 더했다. 기존 descriptor가 그대로 유효하도록 선택으로 두었고,
값이 있으면 비어 있지 않아야 한다.

- `emptyMessage` — 보이는 결과가 0개일 때 목록 전체에 **한 번** 알리는 문구. `asyncState`가
  `idle`이 아니면 그 message가 우선한다(제품 어댑터가 더 많이 안다). 없으면 빈 상태 문구를 표시하지 않는다.
  renderer가 번역되지 않은 대체 문구를 만들지 않기 위해서다.
- `closeLabel` — 보이는 닫기 버튼의 접근 가능한 이름. 있으면 버튼이 `"close-action"`으로 닫는다
  (정책상 `dismissible: false`면 막힌다). 없으면 이전처럼 Escape·바깥·실행으로만 닫힌다. Popover의 `accessibilityLabel`은 선택 사항이었다(콘텐츠가 보통 자체
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

이 조사 당시 제품 채택은 미확인이었다. 2026-09-29부터 제품 채택은 관측으로 분리하며,
현재 성숙도는 catalog와 [승격 기준](stable-promotion.md)을 따른다.

## Web renderer (2026-09-18)

`@hjmds/react/command-palette`의 `CommandPalette`가 이 계약을 실행한다. Web은 키보드 검색·
실행·dismiss와 320px의 긴 한글 명령 설명 proof를 통과해 2026-09-29 stable로 승격한다.
Native는 `unsupported`다. 전역 단축키는 제품 소유다.

- **모달 takeover다.** Dialog·Sheet·SidePanel과 같은 모달 스택·스크롤 락·배경 격리를
  공유한다(`packages/react/src/modal.tsx`). 별도 `modal` 축은 없다.
- **실행은 언제나 닫는다.** `activation`은 정책이 거부할 수 없는 dismiss 사유이고,
  `onActivateAfterDismiss`는 팔레트가 사라진 뒤에 실행된다 — 다음 표면을 여는 명령이
  겹쳐 뜨지 않도록.
- **결과 목록은 Combobox 어휘 그대로다.** 검색 input이 `role="combobox"`,
  결과가 `listbox`/`option`, 활성 행은 `aria-activedescendant`로 가리킨다.
  방향키는 계약의 `getCollectionNavigationTarget`(disabled 건너뜀)을 쓴다.
- **query가 바뀌면 활성 행이 첫 결과로 되돌아간다.** Enter의 대상이 언제나 분명해야 한다.
- **전역 단축키는 제품 소유다.** 이 renderer는 여는 키를 정하지 않는다.
- 로컬 검증: `test/command-palette.browser.test.tsx`(이름·초점·배경 inert, 좁은 화면 긴 문구, 활성 행과
  disabled 건너뜀·재필터, 실행 시 강제 종료와 사유, 종료 후 후속 명령 순서, Escape·바깥
  pointer 종료)와 `컴포넌트/탐색/Command Palette`.

### 2026-10-06 보강

사용 지침 작성 중 이 계약이 말하는 local/external 필터링과 빈 결과 상태가 renderer에 없다는 것이
드러났다. 그때까지 Web renderer는 받은 `source`를 거르지 않고 그대로 그렸고(제품이 직접 걸렀다),
빈 결과는 `asyncState` message로만 표시했으며, section의 `accessibilityLabel`을 쓰지 않았고,
`close-action` 사유를 낼 닫기 버튼이 없었다. 지금은 다음과 같다.

- **local 필터링이 기본이다.** `ComboboxCollectionState`의 기본값이 원래 local이었으므로 계약 쪽으로
  맞췄다. 이미 직접 거르던 제품은 그대로 동작한다(부분 집합을 다시 거를 뿐). 자체 순위·fuzzy·서버
  검색처럼 local 규칙보다 넓은 결과를 주는 제품은 `queryState={{ filtering: "external", asyncState,
  queryValue, resultQuery }}`를 넘겨야 결과가 줄지 않는다.
- **빈 결과는 목록 전체에 한 번** `role="status"`로 알린다(`descriptor.emptyMessage` 또는 asyncState).
  활성 행이 없으므로 `aria-activedescendant`도 비운다.
- **section 이름**은 `accessibilityLabel ?? label`로 `role="group"`의 `aria-label`에 연결한다.
  보이는 제목은 group 이름과 겹쳐 두 번 읽히지 않도록 `aria-hidden`이다.
- **닫기 버튼**은 `descriptor.closeLabel`이 있을 때만 검색 행에 그린다.
- **typeahead는 별도로 구현하지 않는다.** 초점이 항상 검색 입력에 있어 입력한 글자가 곧 query다.
  `getCollectionTypeaheadMatch`를 겹쳐 쓰면 같은 키 입력이 필터와 활성 행 점프를 동시에 일으킨다.
  표의 "typeahead 재사용"은 이 renderer에서는 검색 입력이 그 역할을 대신하는 것으로 읽는다.
- **Native는 여전히 `unsupported`다.** catalog가 `platform: web`이고 Native renderer 파일이 없다.
  이번 보강은 Web만 바꿨다.
- 검증: 위 파일에 local 필터링·빈 section 제거, 단일 빈 상태, external 결과 유지와 낡은 결과 실행 차단,
  닫기 버튼 사유 4개를 더했고 contracts `test/command-palette.test.ts`에 선택 문구 검증을 더했다.
