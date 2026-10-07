# AuthScreenLayout — 로그인 화면의 두 영역 골격

검토일: 2026-10-07

## 문제

계정이 있는 제품들이 같은 화면을 각자 만들었고, 같은 실수를 각자 했다.

- 로고·태그라인·설명·동의 고지·정책 링크를 위에서부터 쌓아 **주 행동(제공자 버튼)이 화면 밖으로
  밀렸다.** 번뚝 2026-09-19 iPhone 17 Pro 실측 — 첫 화면에서 버튼 카드가 잘려 보였다.
- 간격·최대 폭·마크 크기가 제품마다 달랐다. 다를 이유가 없는데 제품마다 다시 정해졌다.
- 정책 링크가 글자 높이만큼만 눌렸다(44pt 미만).

이 화면은 할 일이 하나뿐이라 배치가 곧 기능이다. 그래서 배치를 제품이 매번 다시 정하는 것이
문제였다.

## 일반화한 계약

**두 영역만 둔다.**

- 위: `hero`(마크·제목·설명) + `main`(주 행동). 둘이 한 덩어리로 남는 세로 공간을 차지하고 그
  안에서 가운데 정렬한다.
- 아래: `footer`(동의 고지·정책 링크). 바닥에 붙는다.

세 영역 이상으로 나누지 않는다 — 셋이 되면 어느 것이 주 행동인지가 배치로 드러나지 않는다.
내용이 화면보다 길어지면 **스크롤로 전환**하고, 아래 영역을 위로 끌어올려 겹치지 않는다.

`density`는 `compact`/`regular` 둘뿐이다. 제품이 화면 높이를 보고 고르며 HJM은 기기 종류를
추측하지 않는다 — 같은 폭이라도 키보드가 올라오면 좁아진다.

## 로그인 카드 진행 상태

2026-10-01 사용자 요청에 따라 로그인 화면의 제공자 버튼은 이름만 표시한다
(`카카오`, `네이버`, `Google`, `Apple`). HJM은 전달받은 label을 임의로 잘라내지 않으며
제품이 지역화 카탈로그에서 문구를 바꾼다.

Web·Native `AuthScreenLayout`의 `mainCard`는 주 행동을 공통 카드로 감싼다. 이미 제품이
카드를 공급하는 기존 화면과 중첩되지 않도록 기본값은 false이며, 새 조합은 mainCard를 켜고
main 슬롯에는 버튼 목록만 넣는다. 배경·padding·radius는 바깥 카드가 계속 소유한다.

2026-10-07 테마 소비 점검에서 Native 카드만 숫자로 확정된 recipe 모서리를 읽어
Web과 달리 profile을 무시했다. 카드의 모서리는 가장 가까운 Provider의 `tokens.radius.lg`를
따르며 profile이 없으면 기존 recipe 16을 유지한다. 제공자 버튼의 별도 브랜드/정렬
계약은 이 카드 역할과 구분하고, 테마 변경으로 main의 입력·인증 진행 상태를 재생성하지 않는다.

인증 시작 시 지역화된 `pendingLabel`(예: `로그인 중`)을 전달하면 모든 주 행동을 숨기고
같은 카드의 정중앙에 하나의 로딩 표시를 띄운다. 내용은 크기와 폼 상태를 유지하기 위해
mount된 채 남지만 Web inert와 Native touch/accessibility 제외로 조작할 수 없다.
2026-10-01 추가 사용자 요청에 따라 pendingLabel은 스크린리더 안내로만 사용하며 로딩 아래에 문구를 표시하지 않는다.
pendingLabel은 비어 있으면 거부한다. 취소·실패 시 이 prop을 제거하면 버튼이 돌아온다.
hero와 footer는 진행 중에도 유지한다. 버튼별 busy spinner와 함께 쓰지 않는다.

```tsx
<AuthScreenLayout
  mainCard
  {...(loginPending ? { pendingLabel: t("auth.pending") } : {})}
  hero={hero}
  main={providerButtons}
  footer={policyLinks}
/>
```

제품은 pending 여부가 바뀌어도 같은 버튼 목록을 main에 전달해야 카드 크기가 유지된다.
진행 중 버튼 목록을 조건부 제거하거나 다른 내용으로 교체하지 않는다. 로딩은 기존 로그인
카드가 있는 상태에서 전환하는 계약이며 최초 제공자 목록 조회의 skeleton을 대신하지 않는다.

## HJM 기본값

| 값 | 기본 | 근거 |
| --- | --- | --- |
| 최대 폭 | 416 (26rem) | `Container`의 reading(720)보다 좁다. 제공자 버튼이 노트북 폭만큼 길어지면 누를 곳이 아니라 띠로 보인다 |
| 마크 | 72 · radius `lg` | 아이콘(48)보다 크고 일러스트(120+)보다 작다 — 제품을 알아볼 최소 크기 |
| hero 간격 | `md`(compact `xs`) | 마크→제목→설명이 한 문장으로 읽히는 거리 |
| main 간격 | `xl`(compact `md`) | 히어로와 주 행동을 분리하되 한 덩어리로 유지 |
| footer 간격 | `xl`(compact `md`) | **최소값**이다. 화면이 길면 그 이상 벌어진다 |
| 제공자 버튼 높이 | `authProviderButtonRecipe.minHeight` | 여기서 다시 정하지 않는다. 두 계약이 각자 값을 들면 한쪽만 바뀌어 버튼 줄기가 어긋난다 |
| 정책 링크 터치 | `control.minTouchTarget` | 글자 높이만 누를 수 있으면 44pt에 못 미친다 |

## 이 계약에 없는 것

- **문구 전부** — 태그라인·설명·동의 고지·버튼 라벨. 제품이 지역화해서 넘긴다.
- **마크 자산** — 슬롯으로 받는다.
- **제공자 목록과 순서** — 서버가 정본인 제품이 있어 HJM이 정할 수 없다.
- **정책 링크의 목적지** — 제품의 게시 주소다.
- **인증 흐름** — 시작·취소·재개·세션. 화면 골격과 무관하다.
- **`main`에 무엇이 들어가는지** — 제공자 버튼만 넣는 제품도, 가입 재개·심사자 입력 같은
  제품 덩어리를 통째로 넣는 제품도 있다. 그 차이를 슬롯으로 되돌려 받으면 이름만 붙은
  Stack이 되므로, 아예 열어 둔다.

## 플랫폼 번역

| | Web | Native |
| --- | --- | --- |
| 뿌리 요소 | 기본 `<main>`, 앱 셸이 main을 소유하면 `as="section"` + 인라인 custom property | `ScrollView` + `contentContainerStyle.flexGrow: 1` |
| 세로 중앙 | `flex: 1` 블록의 `justify-content: center` | 같은 구조를 `View`의 `flex: 1`로 |
| 스크롤 전환 | `min-block-size: 100dvh` + 자연 스크롤 | `ScrollView`가 내용이 길 때만 스크롤 |
| 수치 전달 | 해석된 값을 CSS 변수로 — 스타일시트와 계약이 어긋날 수 없다 | 인라인 스타일 |

## 검증 화면

현재 catalog와 생성 evidence에서 Web·Native 모두 stable이며, canonical preview와
default·dark·long copy·large text·RTL·reduced motion·accessibility 증거가 연결돼 있다.
2026-10-01 문서 점검에서 초기 구현 시점의 “아직 없음” 설명이 현재 projection과 어긋나
이를 정정했다. 근거는 [성숙도](generated/component-maturity.md)와
[renderer evidence](generated/renderer-evidence.md)의 AuthScreenLayout 항목이다.

이 증거는 HJM renderer 범위다. 소비 제품의 로그인 이관·실제 OAuth·기기 실행·게시 상태는
제품별 검증으로 확인한다. [제품 채택 가이드](product-adoption-1.4.md)의 슬롯·키보드·
중첩 main 처리 기준을 따른다. 포트폴리오 제품은 상위 로그인 화면 표준(LS)을 함께 적용하며,
`hasFooter: false` 옵션이 필수 정책 링크 생략을 허용하는 것은 아니다.
