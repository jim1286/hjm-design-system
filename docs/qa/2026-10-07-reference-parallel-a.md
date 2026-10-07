# 병렬 레퍼런스 조사 A — Minimal · DesignBookmark · CTA

검토일: 2026-10-07 · 상태: 진행 중, 전수 완료 아님

사용자의 병렬 전수 조사 요청으로 세 사이트를 분담했다. 수집된 HTML·소개 문구, 실제 갤러리 이미지, 원제품 동작을 분리한다. URL 수집만으로 독해·시각·상호작용 확인을 주장하지 않는다. 공용 inventory/ledger와 구현 소스는 root 담당이며 이 보고서는 조사 담당자 소유다.

## 분모와 현재 범위

2026-10-07 14:19 KST 읽기 전용 checkpoint. 알려진 URL queue의 discovery closure는 아직 확인하지 않았다.

| 사이트 | 알려진 URL | 기존 HTML 수집/HTTP 200 | 이번 실제 페이지 콘텐츠 확인 | 이번 시각 확인 | 동작 범위 |
| --- | ---: | ---: | --- | --- | --- |
| Minimal | 3,433 | 3,433 / 3,433 | 홈, Ogon 상세 2개 | 홈 상단, Ogon 모바일 갤러리 이미지 | 필터 열기·검색·Escape, Desktop/Mobile 선택 |
| DesignBookmark | 2,657 | 1,425 / 1,425, 기존 crawler 진행 중 | 홈, 8bitcn 상세 panel 2개 | 홈 상단, 검색 결과·상세 panel | 검색 결과 전환, 상세 열기·Escape, 검색어 보존 |
| CTA | 551 | 551 / 551 | Form category, Unikorns 상세 2개 | category 첫 카드 줄, Unikorns desktop/mobile 캡처 | category→detail 이동 |
| 연결 원제품 | 별도 | 별도 | Unikorns 홈 전체 DOM 본문 1개 | 초기 hero, 실제 Contact form | Contact anchor 이동만, 제출 안 함 |

이 표의 페이지 콘텐츠 확인은 해당 페이지 텍스트를 읽었다는 의미다. Minimal/CTA의 아래쪽 모든 썸네일, DesignBookmark의 lazy 목록 전체, 연결된 전체 원제품 사이트를 읽거나 모든 상태를 확인한 것은 아니다. DOM에 존재하는 숨은 내용과 화면에 보이는 내용을 혼동하지 않는다.

## 실제 URL별 관찰

### Minimal Gallery

- [홈](https://minimal.gallery/): Website/Template/Tool 전환, 태그 분류, 뉴스레터, 카드 목록·페이지 이동, footer 본문을 읽었다. 실제 1280×720 화면은 검은 배경·연한 태그 pill·3열 preview 카드와 가운데 newsletter를 보여 줬다. `All types`로 분류/검색 overlay를 열고 `paper` 입력 뒤 Enter에서 `Flying Papers` 결과를 확인했다. Escape 뒤 overlay 요소가 AX에서 제거됐다. 포커스 반환 target은 확인하지 못했다. 첫 입력은 AX setValue였으며 이 결과를 debounce 자동 검색 증거로 주장하지 않는다.
- [Ogon 상세](https://minimal.gallery/ogon/): 설명용 긴 본문 대신 이름·외부 링크·유형(Agency/Production Studio)·게시일·submitter·viewport metadata와 유사 사이트가 있다. Desktop 첫 screenshot은 로딩 중 빈 자리였고 Mobile 선택 후 실제 이미지가 나타났다. 화면 캡처에 기재된 viewport는 375×667, DPR 2. 산 배경 사진 위 파란 로고·작은 intro·영상 작품 선택이 보였다. 이것은 Ogon 원제품의 실제 재생/선택 동작을 증명하지 않는다.

### DesignBookmark

- [홈](https://designbookmark.com/): 2,547 tools / 59 categories라는 현재 사이트 표기, 9개 상위 분류·OS별 목록·정렬·검색·bookmark 설명과 첫 목록 소개를 읽었다. 전수 queue 2,657과 tools 2,547은 서로 다른 분모다. 실제 화면은 좌측 탐색과 상단 분류, 3열 카드, 하단 검색 bar였다.
- `retro` 검색: AX setValue+Search 클릭만으로는 확정되지 않았다. Playwright textbox fill 후 바로 `1 result for retro`와 8bitcn 카드가 나타났고 Search button이 Clear search로 바뀌었다. 따라서 자동 입력 검색은 이 두 번째 시도에서 확인했다. 사라진 Search를 클릭하려던 후속 시도는 selector timeout으로 중단하고 새 DOM을 읽었다. 이를 사이트 오류로 분류하지 않는다.
- [8bitcn 상세](https://designbookmark.com/tool/8bitcn): 검색 카드 클릭으로 우측 `dialog "8bitcn details"`가 열렸다. 소개, Frameworks & Libraries 분류, 외부 도메인, 비슷한 도구 6개를 읽었다. 배경의 검색어·결과 카드가 유지됐다. Close details 버튼에 Escape를 보내 dialog가 제거되고 `retro`+1개 결과가 유지된 것을 확인했다. 그림은 흰 배경·검은 픽셀 경계·작은 RPG 캐릭터를 쓰는 UI screenshot이었다. 원래 8bitcn 코드·문서·인터랙션과 폰트 라이선스는 아직 확인하지 않았다.

### CTA Gallery와 연결 원제품

- [Form category](https://www.cta.gallery/categories/form): 제목·소개·모든 DOM 목록 이름/외부 링크·footer를 읽었다. 갤러리 첫 카드 줄에서는 자연 사진 위 독립 흰 폼, 보라색 배경의 작은 대화 카드, 노란 타이포 형태를 확인했다. 아래 목록 모두의 이미지 검토는 미완료다.
- [Unikorns 상세](https://www.cta.gallery/cta/unikorns.work): intro, category Form, industry Landing, mode Light, 관련 CTA 본문을 읽었다. desktop/mobile static capture 모두 자연 풍경에 흰 독립 폼을 둔다. mobile capture는 필드와 행동의 순서를 유지한다. 모바일은 실제 390px browser 실행이 아니라 갤러리의 static screenshot이다.
- [원제품](https://unikorns.work/): hero→대상팀→case study→시작 단계→고객 리뷰→가치→비교→FAQ→Contact→footer의 전체 DOM 텍스트를 읽었다. 현재 live Contact는 이름·회사·업무메일·프로젝트 설명의 **4개** required input/textarea다. 갤러리 screenshot은 예전 5필드처럼 보이므로 현재 원제품과 같다고 가정하면 안 된다. 상단 Contact 클릭 뒤 `#contact`로 이동하고 자연 배경의 흰 폼을 실제 봤다. 초기 screenshot은 smooth scroll 도중 hero였으며 다음 screenshot에서 도착을 확인했다. 입력·제출·서버 오류·성공 상태는 확인하지 않았다. 필드의 aria-label/aria-labelledby는 null이고 placeholder만 보였지만 전체 accessible-name 진단을 실행하지 않았으므로 접근성 실패로 단정하지 않는다.

![원제품의 Contact 폼 도착 상태](assets/parallel-a-unikorns-contact.png)

## 기존 HJM과 비교한 판단

공개 API 대응표와 실제 사용 지침, `design-profile.ts`를 대조했다. 새 API 추가를 전제로 하지 않는다.

| 관찰 | 기존 재사용/흡수 | 남은 차이·판단 |
| --- | --- | --- |
| 분류+검색+카드 | SearchScreen의 query/filters/suggestions/resultSummary, Grid·Card | debounce/취소·오류 복구는 이미 공유 계약. 갤러리마다 새 검색 엔진 불필요. 원본의 floating 검색 위치는 제품 레이아웃 판단이며 공통 화면 계약 우회 금지 |
| 결과→우측 상세→검색 보존 | 기존 Sheet/Dialog와 제품 controlled query/selected item | 현재 원본의 result context 보존을 기존 공개 구성으로 먼저 표현한다. 애니메이션·focus restore 비교는 미확인 |
| Desktop/Mobile preview 전환 | SegmentedControl+Image/AspectRatio | 독립 상태 엔진·새 preview component 불필요. 전환 시 접근성 label과 image metadata를 유지 |
| 픽셀 레트로 표현 | 기존 retro profile·radius/shadow/font tokens | pixel stepped outline은 현재 단순 모서리 축과 차이가 있을 수 있어 보류. 코드/양 renderer/확대 글자 확인 전 treatment를 추가하지 않는다. RPG 이미지·폰트는 제품 소유 |
| 자연 배경+흰 폼 | forest profile, 기존 Card·TextField·Textarea·Button, 기존 form composition | 숲 느낌을 임의 green input으로 바꾸는 것보다 읽을 수 있는 surface 대비와 제품 배경 asset 슬롯을 유지. 산/숲 bitmap 자체를 공유 token에 내장하지 않는다 |
| Contact 필드와 submit | 기존 FormState/field validation·Button pending/failed recovery 계약 | 원제품 성공/실패를 확인하지 않았으므로 동일 회복 품질이라고 주장하지 않는다. 반복 contact form wrapper 신설보다 기존 공개 form composition을 우선 |

테마는 HJM의 표현 옵션과 검증 기준을 공유하고 제품이 브랜드 자산·조합을 소유한다는 기존 방향을 유지한다. 이번 조사는 동작 계약을 브랜드 screenshot과 함께 복사하지 않는 근거다.

## 남은 전수 검토와 추정 한계

- Minimal 전체 3,433 URL 개별 소개/metadata 독해, 모든 screenshot, 실제 원제품 링크와 상태는 남았다.
- DesignBookmark 수집 queue가 진행 중이다. 전체 2,657 URL의 detail와 category 소개, tool 원제품·코드·동작, signed-in bookmark는 남았다. 기존 crawler를 재시작/종료하지 않았다.
- CTA 전체 551 URL 중 나머지 상세·분류·소개 독해와 전체 desktop/mobile 캡처·연결 원제품 상태는 남았다. 기존 Ente/Webflow 검토를 반복하지 않았다.
- 동일 layout category가 반복된다는 이유로 URL별 독해/검토를 생략했다고 보고하지 않는다. 반복 패턴과 URL 확인 수는 따로 기록한다.
- 이 첫 batch의 도구 round-trip에는 화면 전환·상태 확인이 포함된다. 수천 URL의 원제품 상태까지 포함한 완료 시간을 지금 신뢰할 수준으로 계산할 수 없다. 약 10분 첫 batch는 전체 전수 ETA가 아니다.

## 검증·산출물 경계

외부 UI는 CUA의 agent-owned 임시 탭 하나에서 확인했다. 기기·네이티브 build·원격 CI·릴리스·git 조작을 실행하지 않았다. 원본 HTML 수집 산출물은 읽기만 했고 소유 crawler/로그를 변경하지 않았다. 유지한 PNG는 실제 원제품 도착의 최소 증거다. package/runtime 검증은 이번 문서 조사 범위가 아니다.

## CTA 전수 독해 checkpoint — 2026-10-07 두 번째 batch

CTA의 알려진 551 URL은 상세 505개(`/cta/<slug>`)와 목록·분류·소개·폼·템플릿 46개로 나뉜다. 상세 **505/505의 고유 소개 및 Category/Industry/Mode**를 실제 순서대로 읽었다. 비상세 **46/46의 고유 추출 본문과 카드 제목**도 읽었다. 비상세는 반복 nav/footer와 responsive 복제 행만 제거했다. 상세 관련 CTA 목록 개별 독해·HTML 구현 코드·원제품 전체 본문과 상태는 이 완료층에 포함하지 않는다. 전체 페이지 검토 완료는 여전히 아니다.

URL별 source SHA, 읽은 범위와 pending 층은 [A 전용 index](2026-10-07-reference-parallel-a-index.json)에 남겼다. known queue의 discovery closure는 확인하지 않았다. CTA 작성 팁의 명확한 행동/이익/위험 감소/사회적 증거 원칙, 광고 페이지의 세 plan 및 quote form, 제출/구독 폼, template 소개도 읽었다. 사이트의 전환율·보안·의료·금융 효능 주장은 소개 문구일 뿐 검증 근거로 채택하지 않는다.

### 캡처 정정과 시각 완료층

초기 의미 기반 Desktop/Mobile 이미지 metadata 84개를 확보했지만 CUA clip PNG 일부가 **광고 영역**을 찍었다. 성공 수에서 제외했고 metadata를 시각 독해로 집계하지 않는다. 전체 화면 PNG를 다시 저장한 뒤 DOM image rect에 맞춰 로컬 QA crop을 만들었다. 교정 batch **0–7의 8/505** desktop/mobile 기본 화면은 실제 이미지 독해를 마쳤다. 교정 PNG 저장 수와 독해 완료 수는 index에서 별도 기록한다. 이 작업은 갤러리의 정적 desktop/mobile 이미지 비교다. 원제품의 breakpoint·키보드·focus·hover·pressed·loading·error·reduced-motion 검증은 아니다.

교정 0–7 관찰: 11x의 좌측 정보/우측 사막 사진은 모바일에서 사진이 아래로 이동한다. 13g는 두 명의 얼굴 portrait와 상담 행동, 247artists는 어두운 원근 grid와 중앙 보라 CTA, 8returns는 청록 패널·라임 제목·primary/secondary·신발 사진을 세로 재배치한다. Aaavatar는 avatar ring와 다운로드, Aboardhr는 파스텔 rainbow와 한 행동, Acctual은 초록 grid/종이 조각과 송장 행동, Adventurenannies는 teal/orange 도형과 채용 행동이다. 이들 각각은 기존 Card/Grid/Button/Image 및 브랜드 asset 구성으로 우선 흡수하며 별도 검색/상호작용 engine 교체 근거는 없다.

### 독해에서 나온 보수적 판단

- `poch-studio`/`poch.studio`, `web-meetcleo`/`web.meetcleo`처럼 유사 소개가 별도 URL로 존재한다. 각각 읽고 두 URL을 남겼으며 중복을 한 페이지로 줄이지 않는다.
- 일부 상세는 mode/industry/category 값이 비거나, 소개와 산업 분류가 맞지 않아 보인다. `backlog.design`의 Medical, `payy`의 Marketing 등은 테마 선택의 자동 근거로 사용하지 않는다. 분류 tag만으로 화면을 생성하면 원제품 목적을 잘못 추정할 수 있다.
- pricing/subscribe/form/modal/navigation/download는 의미·상태가 다르다. theme 변경으로 구매/구독/연락/다운로드 동작까지 서로 바꾸지 않는다. 기존 HJM action/form/modal 계약을 유지하며 화면 구성 recipe와 표현 옵션을 조합한다.
- 종이·숲·retro/pixel·rainbow·cosmic·editorial 표현은 참조할 수 있지만 현재 API를 대조한 재사용 우선 판단이다. 원제품 코드·라이선스·두 renderer·확대 글자 검증 전 새 token/treatment/컴포넌트를 공개 API로 추가하거나 교체하지 않는다.

남은 범위: 상세 기본 시각 497/505, 46 비상세의 전체 시각·실제 동작, 상세마다 related CTA와 연결 원제품 흐름, Minimal 3,433 및 DesignBookmark 2,657 전수 독해/시각/흐름. 이 checkpoint는 문서 조사이며 구현 적용·승급·게시·원격 CI를 수행하지 않았다.

## 교정 시각 checkpoint — 0–103 실제 독해

교정된 fullPage/DOM crop의 상세 **0–103 = 104/505**를 12개씩 contact sheet로 실제 읽었다. 이 층은 기본 배치·색·주/보조 행동 위치·정적 모바일 재배치 확인이며 작은 모든 문구의 판독이나 원제품 동작 검증은 아니다. URL별 corrected PNG SHA 및 읽은 contact-sheet SHA를 A index에 기록했다. 교정 PNG 저장 135개와 시각 독해 104개를 구분한다. metadata상 이미지가 아직 로드되지 않은 106–114는 시각 성공에서 제외하고 재캡처가 필요하다.

![CTA 44–55 교정된 desktop/mobile 기본 배치 비교](assets/parallel-a-cta-044-055.jpg)

새로 확인한 차이: Bouquetinfusions(50)는 노란 sticky note 형태 newsletter와 회전한 종이 표현, Alpbio(14)는 점 기반 픽셀 글자와 rounded 입력, Bluechip(49)는 stepped 경계와 가운데 download 버튼이다. 이들은 종이 rotation이나 pixel outline이라는 시각 옵션 후보지만 accessibility·확대 글자·native clip 검증 없이 공개 treatment로 승급하지 않는다. Forest 이미지 위 newsletter(Blok46), paper/green line contact form(Cultivatefood103), rainbow primary/secondary(Aboardhr5), dark neon single action(Aptosbuild23), 물 표면 위 white newsletter(Augustcollections30)는 기존 semantic surface와 Card/Button/Form/Image 표현 조합을 먼저 비교한다.

Collider(88)는 Yes/No 두 선택과 close, Bloomerang(47)/Cobfoods(81)/Aligne(11)/Chobani(72)는 입력 팝업을 정적으로 보여 준다. 클릭·dismiss/focus trap/전송 상태는 확인하지 않았다. 이를 HJM Dialog 또는 form recovery 교체의 근거로 사용하지 않는다. 일부 작은 글자는 contact sheet에서 정밀 판독할 수 없으므로 그 부분은 미확인이다.

### 알려진 분모 변경 발견

기존 수집 snapshot 551 URL에 없는 [Numa 상세](https://www.cta.gallery/cta/get-ripe-copy)가 현재 [Compoundplanning 상세](https://www.cta.gallery/cta/compoundplanning)와 [Cursor 상세](https://www.cta.gallery/cta/cursor)의 live `Related CTA's` AX에 나타났다. `link Description: Numa, Value: cta.gallery/cta/get-ripe-copy`; 연결 외부 href는 `numa.uprock.pro/`이다. 이 페이지는 아직 열지 않았으며 독해/시각/원제품 모두 pending이다. 따라서 기존 **551 snapshot 독해층**과 현재 **최소 552 known URL** 분모를 구분한다. discovery closure는 false를 유지한다.

## 순서별 시각 checkpoint — 상세 0–209

교정 시각 독해는 **0–209 총 210/505**의 사용 가능한 기본 화면까지 진행했다. 이 중 desktop/mobile 두 이미지 **206개**, desktop preview만 있는 template **4개**(Draftr121, Habitline192, FintechX208, Flexora209)를 분리한다. 106–114는 load 확인 후 재캡처한 9개를 다시 실제 읽었으며 이전 빈 이미지는 근거에서 제외했다. 작은 모든 필드 문구·테마 motion·실제 breakpoint·원제품 상태는 여전히 pending이다. 기본 화면이 210개 확인됐다는 것은 모든 상태/페이지 검토 완료가 아니다.

Debugger110의 연노랑 ruled paper·serrated 경계·name/email newsletter, Data.to.design107의 editor selection handle처럼 보이는 white card와 forest green surface, Dibi113의 paper ticket/perforation 형태 pricing, Heyjay201의 scallop+pink stripe/border 버튼을 확인했다. 종이 계열은 asset/texture·border·rotation·font 조합 후보로 두고 기존 Form/Card/Button 슬롯과 비교한다. 새로운 widget state나 전송 엔진은 필요하다는 근거가 없다. Halo dental193/Henge200/EdSheeran130은 checkbox consent와 입력/submit 순서를 정적 갤러리에서만 보여 준다. 동의 의미·disabled/pending/failed/성공 상태는 제품 기능 계약 소유다. 텍스처의 opacity와 대비는 동작 의미와 분리해야 한다.

## 순서별 시각 checkpoint — 상세 0–299

상세 기본 시각 독해 **300/505**(desktop/mobile 296, desktop-only template4). capture 저장 수와 기본 화면 실제 독해 수가 이 checkpoint에서는300으로 같지만 원제품 동작 층은 별도다. 알려진 snapshot 밖 internal link를 기계적으로 비교한 결과는 **0개**이며 `snapshotInternalLinkDiscovery`로 따로 기록했다. 현재 live Numa 신규 링크는 source snapshot 외부 발견1개다.

상세 210–299에서 form/modal의 의미 차이가 다시 보인다. Janvi217은 date/grid와 contact를 같이 둔 구성, Journa224는 관심 항목 checkbox와 이메일을 둔 sign-up, Michelbeaulieu264는 budget 선택과 email을 가진 listing 구독이다. 이는 theme 하나로 필드나 동의 의미를 바꿀 근거가 아니다. 브랜드/의도별 composition recipe가 field schema와 상태를 받고 theme는 표현 축을 공급하는 구조가 맞는다.

Langbase237은 desktop에서 Start free→Get a demo가 나란하고 mobile에서 demo→free 순서를 바꾼다. 이를 자동 theme interaction 변경으로 복제하지 않고 제품 행동 우선순위를 별도 계약으로 둔다. Katana227은 desktop 장식 object가 mobile에 덜 보이는 두 static 이미지다. 원제품의 실제 viewport 조건·reduced motion과 일치하는지는 확인하지 않았다. Lockerland249의 checkerboard·red grid, Memelord261의 pixel typography·초록 풀 배경·desktop-window motif, Obscura295의 pixel 캐릭터는 레트로 계열 참고다. 원본 상표/캐릭터 자산을 shared token으로 복사하지 않는다.

## 순서별 시각 checkpoint — 상세 0–359

기본 화면 실제 독해 **360/505**(desktop/mobile355, desktop-only5). 모든 상세 원제품 flow는 기존 Unikorns anchor 부분 확인을 제외하면 pending이며, 이 숫자는 정적 이미지 독해만 나타낸다. Rows357의 ruled paper/hand illustration과 yellow CTA는 paper 계열 참고, Ruul359의 좌측 help action+우측 FAQ는 기존 Accordion/FAQ composition 재사용 후보다.

유사 소개인 Poch-studio322와 Poch.studio323의 캡처는 큰 손그림 전화/Call us와 작은 portrait/video 카드로 다르다. 같은 소개라고 시각 검토 URL을 합치지 않았다. Revolut348은 desktop Stocks와 mobile Commodities라는 서로 다른 콘텐츠를 보여 준다. 단순 반응형 reflow로 단정할 수 없어 gallery preview의 서로 다른 state일 수 있다고 기록하며 원제품과의 동일성은 pending으로 둔다.
