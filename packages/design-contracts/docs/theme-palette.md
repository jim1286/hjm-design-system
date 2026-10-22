# 테마 팔레트 결정 기록

`src/colors.ts`의 `THEMES` 값이 왜 지금 값인지를 적는다. 소스에는 포인터만 두는데,
`tsc`가 JSDoc을 `dist`에 그대로 실어서 긴 주석이 `./colors` 번들 예산을 넘기기 때문이다
(2026-09-14 실측: 주석만으로 raw 3.0 kB → 4.2 kB, colors를 재수출하는 tokens·recipes·
contracts·tree-select까지 연쇄로 초과).

## 다크는 라이트의 짝이어야 한다

2026-09-14 제품 보고: "다크 모드 색감이 탁하고, 포인트 색이 안 어울린다."

원인은 다크가 **두 색 계열을 섞어 쓴 것**이었다.

| 역할 | 종전 값 | 계열 |
| --- | --- | --- |
| `bg` | `#0b1026` | hsl 229° / 채도 55% — 채도 높은 인디고 |
| `surface` | `#131a36` | hsl 228° / 48% — 인디고 |
| `surfaceAlt` | `#1e293b` | hsl 217° / 33% — 슬레이트 |
| `border` | `#64748b` | hsl 215° / 16% — 슬레이트 |
| 텍스트 램프 | `#f1f5f9`…`#8292a9` | hsl 210-215° / 18-40% — 슬레이트 |

채도 높은 인디고 위에 채도 낮은 회청색 판을 얹으면 탁하게 읽힌다. 그리고 이 구조는
라이트에 짝이 없었다 — 라이트의 표면은 거의 중성 회색(hsl ~210°, 채도 9-23%)이고
채도가 높은 것은 강조색뿐이다. 즉 다크는 라이트의 다크 버전이 아니라 **다른 색 시스템**이었다.

그래서 표면과 중성 램프를 라이트와 같은 중성 계열(hsl 210-215°, 채도 11-26%)로 내렸다.
화면에서 채도가 높은 것은 강조색 하나뿐이 되고, 이것이 "포인트 색이 안 어울린다"의 답이기도
하다 — 강조색이 겉돈 이유는 주변이 이미 전부 물들어 있었기 때문이다.

**버린 대안:** 소비 제품(번뚝)의 표면만 손보기. 탁함의 원인이 이 공용 토큰이라 모든 소비자가
같은 교정을 각자 반복해야 했다.

## `primary`의 밝기 역전

다크 `primary`는 hsl 201° 90% **27%** 로, 라이트의 32%보다 **어두웠다**. 그래서 주요 동작이
배경으로 가라앉았다 — 세 표면 대비 1.93:1~2.49:1로, UI 요소가 형태로 식별되기 위한
**3:1에 미달**했다. WCAG의 텍스트 규칙은 버튼 위의 글자만 보기 때문에 이 결함을 잡지 못한다.

새 값 hsl 201° 96% 36%(`#0476b4`)는 라이트보다 밝고 세 표면 모두에서 3.20:1~3.84:1이다.
대신 흰 글자 대비가 7.56:1 → 4.93:1로 줄지만 AA는 유지한다.

**창이 좁다.** 이 색상에서 36% 미만이면 `surfaceAlt` 위에서 3:1이 깨지고, 37%를 넘으면
흰 라벨이 AA를 놓친다. 값을 조정할 때 두 경계를 함께 본다.

## 회귀 게이트

`test/contracts.test.ts`가 두 결정을 고정한다.

- `keeps the primary fill discernible against the surfaces it sits on` — 채운 컨트롤이
  형태로 보이는지(3:1). 기존 AA 검사가 못 잡던 축이다.
- `keeps neutral surfaces and text in one low-saturation family per theme` — 중성 역할의
  채도 상한 30%. 강조 역할(`primary`·`contentBrand`·`danger`·`surfaceAccent`)은 제외한다.

## 라이트 `textSub`를 AA로 올렸다 (2026-09-26)

브랜드 팔레트 대비 검사([brand-boundary.md](./brand-boundary.md))를 만들면서 기본 팔레트에 같은 기준을 돌렸더니
라이트 `textSub` `#6b7684`가 `surface`(`#f2f4f6`) 위에서 **4.19:1**로 본문 AA(4.5)에 못 미쳤다. `textSub`는
`Text tone="subtle"`의 실제 글자색이라 장식 등급으로 볼 수 없다. 같은 색상·채도에서 명도만 내린 `#65707d`
(`surface` 4.57:1, `bg` 5.04:1)로 바꿨다. 텍스트 램프 순서(`textMuted` > `textSub` > `textWeak`)는 유지된다.
모펀은 같은 이유로 이미 `textSub`를 `#626E7D`로 보정해 쓰고 있었다.

`borderControl`은 `#6b7684`를 그대로 둔다. 비텍스트 기준(3:1)이고 `surface` 위 4.19:1로 충분하다.

**버린 대안:** 검사에서 `textSub`를 본문 기준에서 빼기. 실제 글자에 쓰이는 색을 기준에서 빼면 검사가 존재 이유를 잃는다.

## 입력과 선택 항목은 흰 내부와 상태 테두리로 구분한다 (2026-09-29)

전수 기기 확인 중 사용자가 회색·푸른색 입력/선택 배경을 제거하고, "푸른 테두리는 쓰는데 input 안은 흰색"으로 요청했다.
입력 프레임, 검색·OTP·숫자·날짜 입력, 선택 카드·Chip·SegmentedControl·ToggleGroup은 라이트의 `bg`(`#ffffff`)를 사용한다.
다크에는 같은 역할의 `bg`를 사용해 밝은 사각형이 따로 뜨지 않도록 한다. 포커스/선택 테두리와 체크 표시는 기존 브랜드색을 유지한다.
휴지 상태 입력 테두리는 글자색 `textMuted` 대신 전용 `borderControl`을 사용한다.

공식 참조는 [Ant Design Input](https://ant.design/components/input/)의 outlined 변형(흰 active/hover 내부, 파란 active 테두리),
[Radix Text Field](https://www.radix-ui.com/themes/docs/components/text-field)의 surface/soft 변형 분리,
[Atlassian Border](https://atlassian.design/foundations/border)의 기본·선택·포커스 테두리 역할 분리다.
Ant의 원시 색상이나 낮은 테두리 대비까지 복제하지 않고, HJM의 의미 토큰과 대비를 유지한다.
포커스 링은 기존 2px 계약을 유지하며, 작은 체크·스위치 트랙·선택 날짜 표식과 주요 CTA는 넓은 입력 채움 배경과 구분한다.

**버린 대안:** 선택을 넓은 불투명 브랜드색 판으로 표현하거나 소비 앱에서 흰색 CSS만 덮어쓰기.
전자는 이번 사용자 방향과 맞지 않고 후자는 웹·네이티브 및 다크 테마에 서로 다른 표현을 남긴다.

### 전체 중립 표면으로 확대

같은 화면 검토에서 사용자가 입력뿐 아니라 회색·연한 파란색 배경 전체를 제거하되 Create draft의 진한 파란색은 유지하도록 명확히 했다.
`Surface`·Card·메뉴·목록·아바타·Skeleton·보조 버튼도 canvas를 사용하며, 경계가 사라지는 곳은 테두리로 구분한다.
`ButtonTone.primary`와 주요 CTA/FAB, 작은 체크·스위치·진행 표시, 성공·위험 상태색은 그대로 유지한다.
원시 팔레트의 surface/primary 색 자체를 흰색으로 덮지 않고 컴포넌트 배경 역할만 바꿔, 글자·아이콘·진행선의 의미가 바뀌지 않게 한다.

버튼의 배경색은 소비 화면에서 직접 지정하지 않고 `ButtonTone`의 `primary | secondary | ghost | danger | link`로 선택한다.
웹과 네이티브는 같은 `buttonRecipe`의 배경·글자·테두리 역할을 해석한다. Create draft는 `primary`를 유지하므로
일반 표면의 canvas 전환과 독립적으로 기존 브랜드 채움색을 보존한다.

## 단색 배지 판 (2026-10-18)

사용자가 제시한 오늘야구 경기 상태 배지의 단색 판과 흰 글자를 양 테마에서 유지하도록 `neutralFill`(#4e5968)·`strongFill`(#333d4b)을 추가했다. 기존 textMuted/text는 다크 모드에서 밝아지므로 판에 재사용하지 않는다. 상태색은 기존 `accentFill`과 `dangerFill`, 브랜드는 primary를 사용한다. 일반 본문과 Tag의 색 계약은 유지한다.

선택의창의 밝은 다크 브랜드 primary는 어두운 `onPrimary`를 사용하므로 이를 상태 배지의 회색·성공색 위에 재사용하면 대비가 무너진다. `onStatusFill`을 별도 역할로 두고 상태 채움의 글자와 아이콘에 함께 적용한다. 브랜드와 위험 채움은 각각 기존 `onPrimary`·`onDanger` 짝을 유지한다.

## 밝은 표면의 기본값 변경 (2026-10-21)

오늘야구의 기본 테마 적용 뒤 표와 카드의 회색 면이 두드러진다는 사용자 피드백에 따라,
이전 제품 표면색을 HJM의 밝은 테마 기본값으로 채택한다. `surface`는 `#ffffff`,
`surfaceAlt`는 `#ebeef2`다. `bg`는 기존 흰색을 유지하며 `raised` 카드도 기존처럼 `bg`를 쓴다.
다크 테마와 브랜드·상태 강조색은 이번 결정의 변경 대상이 아니다. 웹·Native가 같은 `THEMES`를 소비한다.

## 기본 선택 배경을 브랜드에서 분리한다 (2026-10-23)

휠의 하늘색과 카테고리 선택색을 비교한 뒤 사용자가 기본 테마의 뉴트럴 안을 승인했다.
`surfaceSelected`는 light `#f0f1f3`, dark `#30343b`이고 `semanticColors.selection`이 배경·글자·테두리를 묶는다.
TimePicker, Chip(그룹의 chips 표현 포함)과 기본 neutral SegmentedControl이 같은 선택 배경을 쓴다.
글자는 기존 `text`, Chip 테두리는 `borderControl`을 쓰며 체크·선택 테두리·포커스 표시를 보존한다.
이 결정은 위 2026-09-29 기록의 해당 선택 배경을 대체하며 입력 필드 배경은 바꾸지 않는다.
`surfaceAccent`는 브랜드 보조 배경, `primary`는 주요 동작으로 유지한다.
명시적인 `selectionTone="brand"`와 solid 탭은 기존 브랜드 강조를 유지한다.
제품은 `brandPalette`의 `surfaceSelected`로 선택 배경을 지정할 수 있다. 기존 팔레트 대비 검사에 `text`/`surfaceSelected` 4.5:1 쌍을 포함한다.

## 선택 상태 색상 기준 (2026-10-23)

기본 테마의 선택 토큰이 일부 컴포넌트에만 연결된 공백을 사용자 검토에서 확인했다.
색 이름이나 HTML `aria-selected`만으로 일괄 치환하지 않고, 제품에서 유지하는 값인지
현재 키보드/포인터 조작 위치인지에 따라 다음처럼 적용한다. 각 API의 기존 지원 플랫폼에 적용한다.

| 의미 | 색상 기준 | 해당 공개 표면 |
| --- | --- | --- |
| 지속되는 일반 선택 면 | `selection.background`/`selection.content`, 경계가 필요하면 `selection.border` | Chip·칩 그룹, neutral SegmentedControl, TimePicker, filled Tabs, capsule BottomNavigation, ReactionPicker, ToggleGroup, selected Button·IconButton, 선택 Card·ListRow·Select·Combobox·Menu·Tree·TransferList·DataTable 행 |
| 현재 조작 위치 | 기존 focus/hover/pressed 역할. 확정 선택과 합치지 않음 | CommandPalette·Mentions·TagsInput 제안의 active descendant, Select·Combobox의 active 항목, 포커스 링 |
| 명시적인 진한 브랜드 면 | `primary`/`onPrimary` | `Tabs indicator="solid"`, `SegmentedControl selectionTone="brand"`, `BottomNavigation selection="tile"`, prominent destination |
| 작은 값 표시·현재 위치 표시 | 기존 전용 체크·점·밑줄·테두리 계약 | Checkbox·Radio의 glyph, Switch on, Calendar 날짜 원, underline/text Tabs, 일반 BottomNavigation 아이콘·글자, Pagination·Steps·Anchor·Carousel 위치 표시, 읽기 전용 반응 요약 |
| 브랜드·장식·업무 강조 | 기존 브랜드/상태 역할 | ChatMessage outgoing, 폴더 그림, liquid toast, 표의 `highlighted` 업무 강조, 브랜드 Surface/Badge, 오류·성공 등 상태 |
| 미디어 위 선택 증거 | 읽을 수 있는 전용 링·스크림 유지 | ImageChoice·MediaSelection. 회색 면으로 사진을 덮지 않음 |

### 적용 규칙

- 선택 토큰은 현재 theme과 product palette로 해석한다. 제품별 직접 색상 분기는 추가하지 않는다.
- 정적 면과 이동하는 선택 배경은 같은 역할을 쓴다. reduced motion은 이동만 바꾸며 색상 의미를 바꾸지 않는다.
- 선택 값을 표현하는 체크·굵기·radio/pressed/selected 의미와 비활성·읽기 전용 동작은 보존한다.
- `Surface tone="selected"`는 선택 Card의 공통 면이다. `accent`는 브랜드 면으로 유지한다.
- 일반 선택을 브랜드로 보이게 하려고 primary를 바꾸거나, 포커스 위치를 확정 선택값처럼 칠하지 않는다.
- 선택 면에서 본문·보조·브랜드·위험 글자의 대비는 기존 palette 검사에서 각각 4.5:1을 확인한다.
  `textWeak`의 비활성/장식 용도는 기존 경계를 따른다.

선택 Card로 적용 범위를 넓히면서 light `textSub`가 새 회색 위에서 4.46:1인 것을 확인했다.
선택 면 `#f0f1f3`을 유지하고 `textSub`를 `#65707d`에서 `#646f7c`로 한 단계 조정해 4.52:1로 보완했다.
위 2026-09-26 값은 과거 기록이며 현재 값의 근거는 이 절이다.

### 확인 경계

이 기준은 HJM 개발 소스의 의미·renderer 연결 기준이다. 새 패키지 게시, 소비 앱의 설치 버전 채택,
각 제품 테마의 실기기 화면 확인을 대신하지 않는다. 브라우저의 light/dark·제품 선택색 override와
Native host 검사를 수행한 범위를 기록하며 실기기 결과는 따로 구분한다.

2026-10-23 개발 확인: Web/Native 선택색 회귀(정적·이동 면, 제품 override, 명시적 solid 강조,
Combobox의 확정 선택과 활성 후보 분리), 관련 선택 동작, palette 대비 검사에서 총 123건 통과했다.
기본 neutral을 포함한 11개 preset의 light/dark 22개 팔레트에서도 새 선택 면의 글자 대비 쌍을 확인했다.
Web의 `core-normalization.ssr.test.tsx` 중 기존 small Button/IconButton hit-slop CSS 문자열 검사
2건은 변경 전 HEAD에서도 불일치하며, 이번 선택색과 무관한 실패로 남겼다. 변경한 Card/선택 상태
검사는 통과했다. 세 패키지 소스 빌드는 통과했으며 Native 실기기 확인·패키지 게시·소비 앱 채택은 미실행이다.
