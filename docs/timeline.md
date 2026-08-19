# Timeline contract

## 문제

이미 일어난 일들을 시간 순서로 보여준다 — 야잘알의 경기 플레이 기록(PBP, "1회 초 안타 →
도루 → 득점")과 구단의 영입·유출 이력이 같은 문제를 각자 화면에서 풀고 있다. 둘 다
"무슨 일이 언제 일어났는가"의 기록이며, 사용자가 다음에 무엇을 해야 하는지는 말하지
않는다.

## Steps와의 경계

같은 저장소에 이미 있는 `Steps`([[steps]])와 겉모습이 비슷해 보이기 쉽다 — 둘 다 순서가
있는 항목 목록에 마커와 커넥터를 그린다. 그러나 두 계약이 푸는 문제는 반대 방향이다.

| | Steps | Timeline |
| --- | --- | --- |
| 무엇을 보여주는가 | 흐름의 어디에 서 있는지 | 이미 일어난 일의 기록 |
| "현재 위치" | 항상 있다(`currentStepId`) | 없을 수도 있다 — PBP는 마지막 항목이 "지금"이지만, 구단 영입 이력에는 커서 개념이 없다 |
| 상태 유도 | `pending/current/complete/error`를 커서 위치로 **유도**한다 | 유도하지 않는다 — 모든 항목이 이미 "일어난 일"이고, `tone`은 위치가 아니라 제품이 항목마다 직접 붙인다 |
| 앞으로 갈 곳 | 있다(pending 단계) | 없다 — 기록은 뒤로만 자란다 |
| connector 색 | `reached`/`unreached` 두 값(커서 기준) | 한 값뿐 — 커서가 없으니 "아직 안 닿음"이 성립하지 않는다 |

이 표가 실제로 다른 타입으로 이어진다: `TimelineItemDescriptor`에는 `StepItemDescriptor`의
`status` 유도가 없고, `timelineRecipe.connector.tone`은 `stepsRecipe.connector.tone`의
`reached | unreached` 레코드가 아니라 `ColorReference` 하나다. 두 계약이 겹쳤다면 둘 중
하나는 필요 없었을 것이다 — 겹치지 않으므로 둘 다 남긴다.

## 일반화한 계약

### collection 기본 계약과의 대응

각 항목은 stable string `id`와 보이는 `label`을 가진다(Collection 기본 계약의 최소
부분집합, [[collection]] 참고). `textValue`, `none|single|multiple` selection mode,
`idle|loading|loadingMore|empty|error` async 상태는 Steps와 같은 이유로 가져오지 않는다 —
Timeline은 검색/타이핑 탐색 대상이 아니고, 사용자가 고르는 대상도 아니다. 비동기 로딩은
이 계약이 직접 다루지 않는다 — 항목이 뒤로(과거로) 더 늘어나야 하면 기존 항목을 그대로
둔 채 다음 페이지만 요청하는 문제이므로, List가 그렇듯 `LoadMore`([[load-more]])와
합성한다. Timeline 자체가 `idle|loading|empty` 축을 새로 만들지 않는다 — 항목이 하나도
없는 순간은 제품이 Timeline을 아예 마운트하지 않고 `EmptyState`로 대신한다(Statistic
그룹이 빈 배열을 던지는 것과 같은 판단, [[statistic]]).

### 항목의 시각·설명은 제품이 포맷한 문자열이다

`timestamp`(예: "3회 초", "2024-01-15")와 `description`은 모두 선택 필드이고 제품이 이미
포맷을 끝낸 문자열이다. Timeline은 날짜·이닝 연산을 하지 않는다(Statistic이 숫자를
포맷하지 않는 것과 같은 경계, [[statistic]]).

### 순서를 접근성 이름에 남긴다

`resolveTimelineDescriptor`는 각 항목에 `position`(1-based), `total`, 그리고 제품이 공급한
`composeAccessibleName({ position, total, label })`으로 만든 `accessibleName`을 붙인다 —
Steps와 정확히 같은 이유(RN에는 순서를 알려주는 기본 semantics가 없고, 한국어/영어
어순이 다르다)로 같은 해법을 재사용한다. 다만 Steps처럼 상태 문구를 별도로 얹지 않는다
— Timeline에는 얹을 상태가 없다. `timestamp`/`description`은 그대로 통과시켜 renderer가
보충 텍스트로 쓴다.

### dot tone은 공용 의미만 갖는다

`TimelineItemTone`은 `neutral | info | success | attention` 넷뿐이다. `warning`과
`danger`는 뺐다 — Timeline 항목은 실패나 경고를 표시하는 자리가 아니라 이미 일어난
사실을 분류하는 자리이고, 두 사용처(PBP, 구단 이력) 모두 위험/경고를 표현할 필요가
없었다. 제품 전용 색(구단 색 등)은 adapter가 이 넷 중 하나로 먼저 매핑한다
(`identity.md`의 제품 매핑 원칙).

### 양방향 배치는 넣지 않는다

Ant Design Timeline의 `mode="alternate"`(항목이 좌우로 번갈아 배치)는 계약에 없다. 이건
넓은 Web 화면의 장식적 여유 공간을 쓰는 패턴이고, 좁은 세로 스크롤 목록인 Native에는
대응 개념이 없다 — 왼쪽/오른쪽이라는 방향 자체가 성립하지 않는다. 강제로 Native
버전을 만들면 항목마다 좌우 정렬이 바뀌는 것을 읽는 순서로 오인하게 만들 위험도 있다.
계약은 항상 한 방향(세로, 위→아래)만 표현한다.

## HJM 기본값

- `itemTone` 기본값은 `"neutral"`(`timelineDefaults.itemTone`).
- dot은 `diameter: 10`, `borderWidth: stroke.default`. `neutral`은 Steps의 `pending`
  마커처럼 테두리가 없고(`border: null`) `content.secondary`로만 채운다. `info/success/
  attention`은 Badge의 tone 3단 구성(테두리+채움)을 재사용해, 항목의 시각 표시가 색만이
  아니라 테두리 유무로도 구분된다 — 다만 Steps의 마커와 달리 Timeline dot은 항목의
  유일한 의미 전달자가 아니다(label 텍스트가 항상 있다), 그래서 숫자·체크·에러 같은
  전용 글리프는 넣지 않는다.
- `connector.tone`은 항상 `semanticColors.border.default` 하나다. Steps의
  `reached/unreached` 구분이 성립하려면 커서가 있어야 하는데 Timeline에는 없다.
- 텍스트(`label`/`timestamp`/`description`)는 Steps·Statistic과 같은 4.5:1 기준을
  만족하는 기존 색 참조만 쓴다. dot의 `fill` 색은 3:1(non-text) 기준을 만족한다(test로
  분리 검증).

## 플랫폼 번역

- Web: 목록 시맨틱을 실제로 사용한다 — `root`는 `<ol>`(순서가 있는 목록), 각 `item`은
  `<li>`. dot과 connector는 `aria-hidden`(장식이며 label/timestamp 텍스트가 이미 정보를
  전달한다). 각 항목의 접근 가능한 이름은 `accessibleName`(순서+label) 하나이고,
  `timestamp`/`description`은 같은 항목 안의 보이는 텍스트로 함께 낭독된다 — 별도로
  감추지 않는다.
- Native(RN): `<ol>/<li>` 동등물이 없으므로 각 item root에
  `accessibilityLabel=accessibleName`을 명시적으로 달아 순서를 보존한다(Steps가 RN의
  `aria-current` 부재를 `accessibilityHint`로 메우는 것과 같은 종류의 처리, 다만
  Timeline은 보충 상태가 아니라 순서 자체를 보존하는 것이 목적이다). dot과 connector는
  `accessibilityElementsHidden`/`importantForAccessibility="no"`.
- Reduce Motion: 항목이 새로 추가될 때(예: PBP 실시간 갱신) 등장 애니메이션은 즉시
  전환 또는 짧은 opacity로 대체한다. 이동·반복 모션은 두지 않는다.

## 공개한 축 / 배제한 축

| 축 | 상태 |
| --- | --- |
| 순서(`position`/`total`) + 접근 가능한 이름 | 공개 |
| dot tone(`neutral/info/success/attention`) | 공개 — `warning`/`danger` 배제(위 근거) |
| `textValue`, selection mode, async 상태 | **배제** — Steps와 같은 이유(검색/선택/비동기 목록 대상이 아님). 비동기 페이지네이션이 필요하면 `LoadMore`와 합성한다 |
| `pending/current/complete/error` 상태 유도 | **배제** — Timeline에는 커서가 없다(위 Steps 경계 표) |
| 양방향(alternate) 배치 | **배제** — Web 장식이고 Native에 대응이 없다(위 근거) |
| 항목별 커스텀 아이콘 | **배제** — 측정된 요구가 없고, dot은 보조 표시일 뿐이라 임의 아이콘까지 허용할 필요가 없다 |

## 보조 배지와의 경계 — 새 축이 아니라 Tag와의 조합

야잘알 라이브 화면의 플레이 기록(`modules/app-rn/src/features/live/LiveScreen.tsx:797-821`,
`PlayLogRowView`)이 이 계약의 실사용처를 이미 보여 준다 — "일어난 일을 순서대로, 커서
없이" 보여주는 문제와 정확히 일치한다. 그런데 이 화면은 각 항목에 아웃 카운트
(`1사`/`2사`, 3아웃이면 배지 자체를 생략)를 짧은 배지로 붙인다
(`badge={<AppBadge label={outLabel} />}`, `LiveScreen.tsx:820`).

이걸 보고 처음 든 질문은 "`TimelineItemDescriptor`에 `badge` 필드를 추가해야 하는가"였다.
답은 아니다 — 이 배지가 요구하는 것은 **정적 메타데이터 한 조각, 상호작용 없음, tone
있음**이고, 이건 이미 `Tag`([[tag]])가 소유한 문제와 글자 그대로 같다
(`docs/tag.md`: "화면에 반복해서 등장하는 한 조각의 정적 메타데이터... 누를 수 없고,
선택되지도 않고, 지워지지도 않는다"). `TimelineItemDescriptor`에 별도 `badge`/`count` 축을
추가하면, 같은 "정적 라벨+톤"을 Tag와 Timeline 두 계약이 서로 다른 이름으로 갖게 된다 —
이 저장소가 반복해서 피해 온 바로 그 실수(Dropdown이 Menu와, Chip의 `closable`이 Tag의
`selected`와 같은 자리를 두 번 계약할 뻔했던 것)와 같은 자리다.

그래서 이 계약이 내리는 판단은: **Timeline은 항목별 보조 배지를 위한 새 필드를 열지
않는다.** 필요하면 렌더러가 `content` 슬롯 안에 `Tag`를 조합한다 — Carousel이 슬라이드
내부 콘텐츠를 렌더링하지 않고 제품에 맡기는 것과 같은 경계다. 지금 야잘알 코드가
`AppBadge`를 쓰는 것도 사실은 이 조합이 필요한 자리에 아직 `Tag`가 없어서 `Badge`를
대신 쓰고 있는 것이다(`docs/tag.md`가 `FaCenterScreen.tsx`의 등급 배지에도 같은 진단을
내렸다) — Tag가 승격되면 이 자리도 자연히 Tag로 옮겨갈 자리이지, Timeline이 새 축을
얻을 자리가 아니다.

## 검증 화면

`LiveScreen.tsx:797-821`의 PBP 플레이 기록이 실제로 존재하는 후보다 — "일어난 일,
순서, 커서 없음"이라는 경계는 정확히 일치한다. 다만 지금은 `timelineRecipe`의 dot/
connector 시각이 아니라 평평한 `AppListRow` 목록으로 그려져 있어, 시각 recipe 쪽
vertical slice는 아직 없다. `planned → beta` 승격은 실제 제품 vertical slice 이후
리드가 진행한다(로드맵 maturity gate). 구단 상세의 영입·유출 이력은 여전히 미확인
후보로 남긴다.
