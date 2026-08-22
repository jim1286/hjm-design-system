# Beta 승격 후보 실측 — 2026-08-19

`componentCatalog`에서 `status: "planned"`이고 `recipe`가 이미 연결된 항목 전부를
대상으로, Yajalal RN(`/Users/jimin/Desktop/yajalal/modules/app-rn`)과
BurnTok(`/Users/jimin/Desktop/BurnTok`) 양쪽에서 **같은 문제를 이미 손으로 풀고 있는
화면**을 찾았다. import 흔적이 아니라(렌더러가 없으니 당연히 없다) 자체 구현을 찾는
조사다. 두 저장소 모두 읽기 전용으로만 확인했고, `catalog.ts` 등 공유 파일과 두 제품
저장소는 한 줄도 고치지 않았다. `docs/promotion-candidates.md` 이 파일 하나만 새로
만든다.

**승격은 여기서 하지 않는다.** 아래는 리드가 `catalog.ts`를 고칠 때 참고할 실측
자료다.

## 요약

| 판단 | 개수 | 컴포넌트 |
| --- | --- | --- |
| 승격 가능 | **1** | Tag |
| 계약 보완 필요 (실제 요구가 계약 밖에 있음) | 2 | Timeline, Form(사실상 아직 없음에 가까움) |
| 전제 재검토 필요 (문제는 있으나 계약의 핵심 축을 다른 컴포넌트가 이미 풀고 있음) | 1 | DescriptionList |
| 보류 — 화면은 있으나 계약의 **필수** 축이 전혀 구현돼 있지 않음 | 1 | Carousel |
| 아직 없음 | 21 | 나머지 전부 |

승격 가능은 **하나뿐이다.** 나머지는 후하게 매기지 않았다 — 특히 Carousel은 다른
조사자가 "승격 가능"으로 보고했으나 직접 코드를 읽고 계약 문서(`docs/carousel.md`)의
"공개(필수 계약)" 표를 대조한 결과 하향 조정했다(아래 상세 참고).

## 전체 표

| 컴포넌트 | 실사용처(파일:줄) | 자체 구현이 하는 일 | 계약이 덮는가 | 승격 판단 |
| --- | --- | --- | --- | --- |
| Stack | 없음 | — | — | 아직 없음 |
| Layout | 없음(BurnTok 각 페이지가 헤더+본문을 화면마다 개별 조립, skip link 없음) | — | — | 아직 없음 |
| Splitter | 없음 | — | — | 아직 없음 |
| DescriptionList | `PlayerScreen.tsx:181-258`(프로필 라벨→값), `PlayerScreen.tsx:507-525`(`PlainRows`) | 라벨→값 사실 나열은 실재하지만 `AppList`+`AppListRow`(단일 열, 이미 beta)로 풀려 있다 | 계약의 핵심 축(`columns:1\|2` 그리드 + `resolveDescriptionListColumnCount` 폰트스케일 reflow)을 쓰는 화면이 없다 | **전제 재검토 필요** — 아래 상세 |
| PasswordField | 없음(Yajalal 로그인 자체 없음, BurnTok은 OAuth-only) | — | — | 아직 없음 |
| OtpField | 없음(두 제품 다 인증번호 단계 없음) | — | — | 아직 없음 |
| Slider | 없음 | — | — | 아직 없음 |
| NumberField | 없음(BurnTok `sharedIncrement`는 서버 카운터이지 바운드 입력 UI가 아님) | — | — | 아직 없음 |
| Form | BurnTok `CommentsSheet.tsx:54-77,156,262` | `draft`/`submitError` + `isPending` + 실패 시 로컬라이즈 오류 — submit-session의 절반과 닮았다 | 단일 필드 컴포저라 계약의 핵심(다중 필드 중 첫 invalid 포커스 라우팅)은 전혀 쓰이지 않는다 | **계약 보완 필요, 사실상 아직 없음** |
| DatePicker | `ScheduleExplorerScreen.tsx:87-102` | 월그리드→날짜 레일 교체가 **의도된 설계 결정**(코드 주석에 명시) — 압축 트리거+팝업/시트라는 계약의 모양 자체를 쓰지 않기로 함 | — | 아직 없음 |
| FilePicker | 없음(BurnTok `create/page.tsx`는 텍스트→AI 생성이지 파일 선택 아님) | — | — | 아직 없음 |
| UploadItem | 없음 | — | — | 아직 없음 |
| Breadcrumb | 없음(`docs/breadcrumb.md`가 예시로 든 "구단→선수단→선수"는 **Native** 화면인데 Breadcrumb는 `platform:"web"` 전용이라 애초에 근거가 될 수 없음) | — | — | 아직 없음 — **문서 정정 필요** |
| Pagination | 없음(BurnTok `hooks.ts:68,96`의 `FEED_PAGE_SIZE`는 LoadMore용 상수) | — | — | 아직 없음 — LoadMore가 이미 이 자리를 가짐 |
| Steps | `OnboardingScreen.tsx:182-189` | `AppProgress`(연속 막대) + 현재 단계 라벨 하나만 — 개별 단계 마커 배열이 아니다. `docs/steps.md`가 "유력 후보"로 든 것은 **아직 실현되지 않은 계획**이다 | — | 아직 없음 — **문서 정정 필요**(예정 vs 실재 혼동) |
| Timeline | `LiveScreen.tsx:797-821`(`PlayLogRowView`) | 플레이 로그를 `AppListRow`+`badge={<AppBadge label={outLabel}/>}`로 나열 — "일어난 일, 순서, 커서 없음"이라는 Timeline 경계와 정확히 일치 | 각 항목의 짧은 배지(`1사`/`2사`)를 `TimelineItemDescriptor`가 담을 슬롯이 없다 | **계약 보완 필요** — `badge`/`count` 축 추가 검토 |
| DataTable | `StatTable.tsx`, `StandingsTable.tsx` | 고정 열 통계 표시, 첫 열만 고정 — 정렬·선택·페이지네이션 전혀 없음 | 계약의 핵심(정렬 `aria-sort`, 행 선택)을 쓰는 화면이 없다 | 아직 없음 — List/ListRow-고정열 영역이지 그리드가 아니다 |
| Tree | 없음 | — | — | 아직 없음 |
| Calendar | `ScheduleExplorerScreen.tsx:31,84` | `buildCalendarCells`는 남아 있지만 7열 그리드로 렌더된 적이 없다(레일만 소비) — 로드맵의 기존 판정 그대로 | — | 아직 없음(재확인 완료) |
| Carousel | `HomeMatchHero.tsx`(`HomeGameCarousel`) | 순서(`orderCarouselGames`)·시작 카드(`resolveCarouselStartIndex`)·클램프(`snapToOffsets`)·자동재생 없음은 계약과 정확히 일치 | **`docs/carousel.md`가 "공개(필수 계약)"으로 못 박은 축 — previous/next/dot 컨트롤의 tab 순서, 비활성 슬라이드 `inert`, Native `accessibilityRole="adjustable"`+`increment`/`decrement` — 가 이 화면에 전혀 없다.** 스와이프 전용 `ScrollView`뿐, 키보드/스크린리더로 넘길 방법이 없다 | **보류** — 아래 상세 |
| Image | 없음(`docs/image.md`가 든 "선수 프로필 사진·FA 등급 차트"는 코드에 없다) | `TeamMark.tsx:96`의 RN `Image`는 있지만 고정 정사각 엠블럼 + 로드 실패 시 대체 라벨 없음 — Avatar 영역이지 Image 계약의 대상이 아니다 | — | 아직 없음 — **문서 정정 필요** |
| Tag | `FaCenterScreen.tsx:270,369` | `AppBadge label={item.grade} tone="neutral"` / `AppBadge label={`${player.grade}등급`} tone="neutral"` — 정적 라벨, 상호작용 전혀 없음 | `label`+`tone` 뿐인 계약이 정확히 이 요구를 덮는다. `docs/tag.md`가 미리 지목한 후보와 일치 | **승격 가능** |
| Result | `_layout.tsx:142-166`(`ErrorFallback`), `PlayerScreen.tsx:44,85-99` | 둘 다 `AppStateView`를 거쳐 `AppEmptyState`의 아이콘만 바꿔 재사용 — 후속 조사 결과 **흡수가 아니라 둘 다 vertical slice가 없어서 같은 화면에 동원된 것**(아래, `docs/result.md`에 반영 완료) | Result의 실제 문제(행동 뒤 flow terminus)는 두 제품에 없다. 화면이 실제로 쓰는 건 `content` 축(로드 상태)이지 Result도 EmptyState의 tone도 아니다 | 아직 없음 — **흡수 아님, 둘 다 검증할 화면 없음**(`docs/result.md` 참고) |
| SidePanel | 없음 | — | — | 아직 없음 |
| Popover | 없음(BurnTok `AppSelect.tsx`의 팝업은 Select 자체 계약) | — | — | 아직 없음 |
| CommandPalette | 없음 | — | — | 아직 없음 |

## 승격 가능 — Tag

`docs/tag.md`가 이미 "야잘알의 `AppBadge`가 지금 이 역할(포지션·등급·시즌 라벨)을
수행하고 있습니다"라고 적어 둔 예측이 그대로 들어맞는다. `FaCenterScreen.tsx:270`
(`<AppBadge label={item.grade} tone="neutral" />`, FA 등급 시트)과 `:369`
(`<AppBadge label={`${player.grade}등급`} tone="neutral" />`, FA 명단 행)가 실제 코드다.
둘 다:

- 정적 메타데이터 하나(등급)만 표시하고 누를 수 없다 — `TagDescriptor`가 가정하는 정확히
  그 모양.
- `tone="neutral"` 하나만 쓴다 — `tagRecipe`의 다섯 톤(`neutral|info|success|attention|
  brand`) 중 이미 지원 범위 안.
- `selected`/`closable`/포커스 등 Tag가 명시적으로 배제한 축을 요구하지 않는다.

계약이 못 덮는 부분이 없다. **승격 가능.**

## 보류 — Carousel

다른 조사자는 `HomeGameCarousel`(`HomeMatchHero.tsx`)을 "승격 가능"으로 보고했다. 직접
`src/carousel.ts`와 `docs/carousel.md`를 읽고 재검증한 결과 하향 조정한다.

`docs/carousel.md` "공개한 축 / 배제한 축" 표는 "previous/next/dot 컨트롤 tab 순서,
비활성 슬라이드 `inert`"를 **"공개(필수 계약)"**로 명시한다 — 선택 사항이 아니다.
Native 번역 절도 `accessibilityRole="adjustable"` + `accessibilityValue` +
`increment`/`decrement` action을 요구한다. 그런데 실제 `HomeGameCarousel`은:

- previous/next 버튼이 **없다**.
- dot indicator가 **없다**.
- 화면 밖 카드를 `inert` 처리하는 코드가 **없다**.
- `ScrollView`에 `accessibilityRole`/`accessibilityValue`/`accessibilityActions`가
  **전혀 설정돼 있지 않다** — 순수 스와이프 제스처 하나뿐이다.

즉 이 화면이 증명하는 것은 계약의 "무엇을 보여주는가"(순서, 현재 카드, 클램프, 자동재생
끔, 카드 내용은 제품 소유) 절반뿐이고, 계약이 **필수**로 못 박은 다른 절반(키보드·
스크린리더로 넘길 수 있는 경로)은 이 화면에 실증된 적이 없다. `docs/carousel.md` 자신도
"검증 화면: 아직 없음... 유력 후보: 야잘알 홈의 내 구단 경기 스트립"이라고 이미 적어
뒀다 — 즉 이 문서를 쓴 사람도 이 화면을 후보로만 남기고 검증 완료로 적지 않았다.

`architecture.md`의 surface gate 구분(`planned → beta`는 first-party public renderer와
canonical default proof, 제품 채택·접근성 실기기 검증은 `beta → stable`)을 감안해도,
"필수 계약"이라고 못 박힌 축이 화면에
**하나도** 없는 상태를 "vertical slice가 있다"고 보기는 무리라고 판단했다. 승격하려면
최소한 previous/next 컨트롤(시각적으로 숨기더라도 키보드/VoiceOver 경로) 하나는 먼저
붙어야 근거가 된다. 지금은 **보류**를 권한다.

## 계약 보완 필요 — Timeline

`LiveScreen.tsx:797-821`의 `PlayLogRowView`는 "일어난 일을 순서대로, 커서 없이" 보여주는
정확히 Timeline의 문제를 푼다. 그런데 아웃 카운트(`1사`/`2사`, 3아웃이면 배지 생략)를
`badge={<AppBadge label={outLabel} />}`로 각 행에 붙인다. `TimelineItemDescriptor`
(`id/label/timestamp?/description?/tone`)에는 이 짧은 인라인 배지를 담을 자리가 없다.
**리드에게 제안**: `badge?: string` 같은 짧은 보조 표시 축을 계약에 추가할지 검토.
(참고: 렌더링은 dot-connector가 아니라 flat `AppListRow`라 시각 recipe 쪽도 실제 화면과
다르다 — 이건 승격 논의와 별개로 recipe 저작자가 참고할 사실.)

## 전제 재검토 필요 — DescriptionList

실제 라벨→값 사실 화면은 있다(`PlayerScreen.tsx:181-258` 프로필 섹션). 그런데 이
화면은 `columns:1|2` 그리드가 아니라 이미 beta인 `AppList`/`AppListRow`(단일 열)로
풀려 있다. `docs/description-list.md`가 든 두 후보(FA 등급 시트, 통산 화면)는 재확인
결과 둘 다 안 맞는다 — FA 등급 시트는 짧은 라벨→값이 아니라 등급별 긴 설명 문장이고,
통산 화면은 카드가 아니라 표(`StatTable`)라고 코드 주석에 명시돼 있다. 그리고
`resolveDescriptionListColumnCount`가 참고한 실제 폰트스케일 reflow 버그 수정은
`resolveStatisticColumnCount`(Statistic, 이미 beta)의 것이지 DescriptionList의 것이
아니다. **제안**: 승격 근거를 찾기 전에 "이 계약이 정말 그리드 reflow를 중심에 둬야
하는가, 아니면 실제로는 List/ListRow가 이미 푼 문제의 재포장인가"부터 재확인.

## 후속 판정 완료 — Result는 EmptyState에 흡수되지 않았다

위에서 유보했던 질문("Result가 EmptyState에 흡수된 것 아닌가")을 리드 지시로 끝까지
따라갔다. 결론은 `docs/result.md`의 "실측" 절에 반영했다 — 요약하면:

1. Result가 실제로 가리키는 문제(결제 성공, 제출 실패 같은 **행동 뒤** flow terminus)는
   두 제품 어디에도 없다. `ErrorFallback`/`PlayerScreen`의 에러 화면은 사용자 행동의
   결과가 아니라 **데이터 로드 상태**(`content` 축: loading/error/empty/success)다.
   BurnTok의 유일한 후보(`create/page.tsx`의 `Phase`)도 재확인해 보니 성공은 실제
   생성물 미리보기, 실패는 인라인 문장 하나일 뿐 추상적 Result 화면이 아니다.
2. "EmptyState는 tone이 없다"는 `docs/result.md`의 기존 근거는 실물과 어긋난다 —
   `AppStateView`/`AppStateRegion`이 이미 error에 danger 아이콘, empty에 중립 아이콘을
   고정 배정하고 있다. 하지만 이게 "그러니 흡수하라"로 이어지지는 않는다 — 실제 제품이
   가르는 축은 success/failure/info가 아니라 **"실패가 화면 전체를 막는가 구역만
   막는가"**(`AppStateView` vs `AppStateRegion`)이고, 이건 Result의 `status`에도
   EmptyState의 (없는) tone에도 없는 **제3의 축**이다.

**판정: 흡수 아님.** 둘 다 `docs/ant-design-coverage.md`의 「검증할 화면이 없음」
범주에 남는다 — catalog 행 변경 없음. 대신 실측에서 나온 "전체 화면 vs 구역"이라는
새 관찰을 다음 Result 저작 배치를 위해 `docs/result.md`에 남겨 뒀다.

## 문서 정정이 필요한 자리

이번 조사에서 기존 `docs/*.md`가 든 "실사용처"/"유력 후보"가 실물과 어긋난 경우를
넷 발견했다. 리드가 원 저작자와 함께 정정 여부를 판단해야 한다.

1. **`docs/steps.md`** — 유력 후보가 실현되지 않았다. `OnboardingScreen.tsx`는 여전히
   `AppProgress`(연속 막대)를 쓰고, 개별 단계 마커로 교체된 적이 없다.
2. **`docs/breadcrumb.md`** — 예시로 든 "구단 상세→선수단→선수 상세"는 **Native** 화면인데
   Breadcrumb는 `platform: "web"` 전용이라 애초에 근거가 될 수 없는 조합이다.
3. **`docs/description-list.md`** — 든 두 후보(FA 등급 시트, 통산 화면) 모두 재확인 결과
   맞지 않는다(위 상세 참고).
4. **`docs/image.md`** — "선수 프로필 사진, FA 등급 차트 이미지"가 vertical slice 후보로
   적혀 있지만 코드에 해당 화면이 없다(`PlayerScreen.tsx`/`FaCenterScreen.tsx`에 `Image`
   사용 자체가 없음).

## 게이트

`pnpm typecheck && pnpm test` — 변경한 파일이 이 문서 하나뿐이라 회귀 없음(hjm에서
`build`는 실행하지 않음). 두 제품 저장소는 읽기만 했다.
