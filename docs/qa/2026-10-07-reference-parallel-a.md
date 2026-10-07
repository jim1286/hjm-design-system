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

## 순서별 시각 checkpoint — 상세 0–419

기본 화면 실제 독해 **420/505**(desktop/mobile415, desktop-only5)까지 진행했다. fullPage 저장 수와 실제 독해 수는 이번 checkpoint에서420이지만 원제품 flow/코드·작은 모든 문구·전체 상태 검증은 별도 pending이다. CTA 전체551의 소개/분류 또는 비상세 고유 본문 읽기 층은 기존과 같고, live 신규 Numa는 별도 pending으로 유지한다.

Sapphic365의 pink paper/scissors 입력 구성, Spring390의 photo+paper 형태 이름/성/이메일 구성, Studioloop404의 cream/handdraw newsletter는 기존 Card/Form/Button에 질감·폰트·브랜드 asset 옵션을 조합할 후보다. CAPTCHA가 보이는 Sage363은 challenge를 실행하지 않았으며 form 성공/실패 상태도 확인하지 않았다. Slush380의 newsletter/help 두 패널과 Storytale400의 resource/newsletter 두 카드는 기능 의도에 따라 composition을 고르는 사례다.

Sui407의 iridescent image와 translucent form은 정적 캡처에서 확인했으며 실제 motion/glass 성능 검증은 아니다. Teachable418은 audience size 선택이 있는 첫 step처럼 보이는 폼 캡처로, 선택 후 이동/복구/전송 동작은 미확인이다. SVZ412와 svz413은 같은 브랜드라도 yellow organic3D와 white fuzzy3D로 다르므로 시각 URL을 합치지 않았다.

## 순서별 시각 checkpoint — 알려진 상세 505 기본 화면 층

기존551 snapshot의 상세 **505/505 기본 정적 화면을 실제 읽었다**. desktop/mobile 두 이미지500, desktop-only template5(Draftr, Habitline, FintechX, Flexora, Pixera)다. crop/contact-sheet의 색·기본 영역·행동 위치·정적 세로 재배치를 확인한 층이며 **사이트 전체 페이지/전체 상태 검토 완료가 아니다**. 46 비상세 기본 시각·갤러리 live 전체 동작·related CTA 상세 연결·원제품 코드/상태/라이선스·발견 closure·작은 모든 문구의 정밀 판독은 남았다. 551 소개/분류/비상세 고유 본문층과505 기본시각층은 서로 다른 집계다.

420–504에서는 The Subtext427의 black/white mailbox photo와 white newsletter, Victoria463의 pink ruled paper/taped note와 purple action, Workflow493의 dotted paper 같은 바탕, Zenwood502의 dashed card edge/작은 tree 장식을 확인했다. Forest/paper/retro 조합에는 texture나 brand asset을 표현 슬롯으로 공급하고 기존 form 입력·action·focus·pending/recovery 계약을 유지하는 방향이 맞다. Zkpass504는 lime stepped action과 선형 글자, Wheregiantsroam481은 화살표 패턴과 Play를 보여 주지만 실제 hover/motion을 확인한 것은 아니다.

Thursdayboots429는 newsletter modal에 Men/Women 선택이 있고 Transform9437은 전화 입력/action과 demo를 나누므로 필드 의미와 전송 intent는 theme가 임의로 바꾸지 않는다. Web-meetcleo475는 단일 Get app 카드, web.meetcleo476은 QR와 두 store action으로 달라 유사 소개 URL도 별도 이미지로 읽었다. Unikorns450 갤러리는 forest/photo 폼이지만 앞서 확인한 현재 원제품 form과 capture 필드가 다르므로 gallery를 최신 implementation 증거로 사용하지 않는다.

### live 신규 Numa — snapshot 밖 별도 읽기

[Get-ripe-copy/Numa](https://www.cta.gallery/cta/get-ripe-copy)의 현재 DOM 본문을 읽었다. 소개는 smart insulin pump concept, taxonomy는 All types/Call-to-Buy·Ecommerce·Light, related는 Get-ripe/Eternalblue/Animos다. 소개의 의료 기능은 사이트 자기 설명이며 제품의 의학적 효능을 확인하지 않았다. Desktop/mobile 정적 이미지 두 개를 실제 읽었고 white surface·blue gradient·큰 Start living 제목·product image·Pre-order Numa action을 확인했다. 작은 하단 disclaimer의 모든 문구, original pump/product 구현·구매 flow는 미확인이다.

기존551 snapshot source층과505상세 시각층은 그대로 유지하고, live 신규1의 DOM 본문/기본시각을 별도 필드로 기록했다. 현재 알려진 최소552이며 discoveryClosure=false, allPagesReviewComplete=false다. 이 페이지도 기존 hero/Card/Image/Button 슬롯의 제품 asset 조합으로 먼저 흡수하고 새로운 구매/의료 동작을 theme로 추가하지 않는다.

## Minimal/DesignBookmark 본문 순서 checkpoint — 각각 상세 80

Minimal 기존3,433 snapshot에서 `Back` 소개/preview metadata 구조의 상세3,199와 비상세234를 식별했다(구조 식별은 독해 완료 수가 아니다). 그 상세 순서 **0–79의80 URL**에서 소개·이름/외부 domain·type·submitter/credit·게시일·preview viewport/DPR·desktop/mobile label을 실제 읽었다. Related/Similar Websites와 원제품본문/HTML code는 제외한 층이며 시각/flow는 pending이다. 1991 Books·246Queen·3drops·AI Aerobics 등의 type은 비어 있고, 14islands/Aesse/Aaron Shapiro/Aino/246Queen처럼 같은 이름과 domain에도 다른 게시일의 별도 URL이 있으므로 합치지 않는다. Viewport/DPR metadata는 실제 breakpoint·접근성 증거가 아니다.

DesignBookmark 현재 수집1,659/knownqueue2,657 중tool 상세1,556 구조를 식별하고 tool순서 **0–79의80 URL**에서 breadcrumb·title·pricing label·About/Features 본문을 실제 읽었다. 원래 crawler/PID/raw data는 보존했다. Related/Alternatives·vendor 코드/라이선스/화면 동작은 pending이다. 8bitcn은 기존 읽기를 중복 합산하지 않고 이80에 포함했다. Adobe Spectrum40, Aceternity25, 3dicons10, 21st6, 23rd7, 8bitcn14의 소개는 참고 연결이며 원사이트 실제 계약/라이선스를 이 directory 소개로 인증하지 않는다. 특히 Free/Freemium/Paid 분류를 token이나 dependency 허용 정책으로 옮기지 않는다.

이전 추가 본문 읽기(새80과 별도): Minimal `/tag/editorial/`, `/tag/environmental/`, `/tag/museum-gallery/`, `/tag/science/`의 captured category navigation/item names; DesignBookmark `/design`, `/design/design-systems`의 captured 목록/소개. Design systems 목록의 Balsa UI와 Springs는 theme/DTGC·motion 관련 후보 소개지만 API/renderer/원본 license를 확인하지 않아 도입/교체하지 않는다. 기존 home/Ogon/검색/8bitcn drawer partiallive 범위는 최초 표를 유지한다.

### 순서 본문 checkpoint — 각각 0–159

Minimal 상세 소개/preview metadata160/3,199, DesignBookmark toolAbout/pricing/category160/현재수집tool분모까지 실제 읽었다. 범위는 앞선80과 동일하고 읽은 원문 excerpt·source SHA·URL을 A index에 보존했다. 서로 다른게시일의 AKU/Ajeeb/AndyChung 같은URL을 합치지 않으며 일부type 빈값은 추천 자동근거로 쓰지 않는다.

DesignBookmark Alphredo86은 translucent/opaque color 동일 appearance 변환 소개, ArkUI139는 unstyled accessible cross-framework 소개, AntDesign110/Atlassian156/Atomize157는 디자인시스템 소개다. 해당 원사이트 API나 contrast/accessibility 실측을 확인하지 않았으므로 HJM API교체·의존성 도입으로 승급하지 않는다. AppleHIG125 About에 JavaScript-required 문구가 섞이고 AmazonQ90은 end-of-support notice가 섞여 있어 수집 소개만으로 원문 정책/유효 버전을 확정하면 안 된다. 기존 token/color·primitives 접근성 계약에서 부족이 확인됐을 때만 해당 원문을 따라 검토한다.

### 순서 본문 checkpoint — 각각 0–279

Minimal **280/3,199 상세 고유preview metadata**를 실제 읽었다. 첫160은 description도 읽었고160–279는 `Back`부터 preview까지 고유 본문을 읽으며 exact공통 Copy link/Copied/Download/Viewport1440x800/DPR1.33 블록만 출력에서 제외했다. 이새120의 반복description 문장은 독해 완료로 세지 않았다. index에 URL별 scope와 읽은본문excerpt를 구분한다. DesignBookmark **280 tool 상세 About/pricing/category**를 읽었고 related/vendor/시각/flow는 pending이다.

DesignBookmark Balsa186·BoardUI244·BeautifulUI202·Bencho211·beUI218·BorderBeam253·BoringAvatars254는 각각 theme/source distribution·dashboard·AI state·interactive blocks·motion·border decoration·generated avatar 소개다. 현재HJM의 색/profile·Card/Grid·input/state·motion treatment·Avatar/primitive와 먼저 비교하는 후보이며 directory 텍스트만으로 교체할 이유는 아직 없다. 기능과 관련 없는 HR/결제/automation 도구 소개도 누락시키지 않고 순서읽기를 유지했다. Minimal은 Aspen Search234의 분리된brand/design/dev/illustration credits처럼 source별소유가 나뉘는 사례를 확인했고 브랜드자산을 sharedtoken으로 복사하지 않는다.

### 순서 본문 checkpoint — 각각 0–399

Minimal 상세metadata **400/3,199**(description추가160), DesignBookmark tool본문 **400**까지 실제 읽고 URL별 excerpt/SHA를 업데이트했다. snapshot 전수시각/flow완료로 합산하지 않는다. Minimal Bïrch337의 designer/developer credit, Bobbi353의 design/video credit, BlankInside341의 디자인 credit를 확인했고 provenance를 보존했다. BaseDesign282/Base283, Bedow300/301, Bleed343/344/345, Blok348/349는 별도 URL/domain/게시일을 그대로 남겼다.

DesignBookmark CanvasUI315·Carbon325·CentralIcon334·Chakra335·Checklist345·Chromatic352의 소개를 읽었다. Canvas/WebGL 효과는 웹 전용에 가까운 별도검토 대상이고 기존 두 renderer 공유를 대신하지 않는다. Checklists/visual testing 도구는 품질절차 참고이며 디자인API교체 후보로 분류하지 않는다. 일부 About(Clipwing378/Forms&Surveys 등) category는 소개기능과 어긋나므로 category별 자동승급하지 않는다. 원본계약·code·interaction은 pending이다.

## CTA46 비상세 desktop 첫viewport 읽기층

비상세46/46을 현재 desktop1280×720 첫viewport로 실제 읽었고 URL별 viewport/headings/screenshot SHA를 index에 저장했다. 긴listing의 모든 아래카드/전체페이지시각이나 gallery모바일레이아웃을 확인한 것은 아니므로 상세505 desktop/mobile preview층과 합산하지 않는다. 첫 `/categories` 캡처가 빈흰화면이어서 성공에서 제외한 뒤 해당URL을 다시 열어 AllCategories DOM과실제이미지가 나타난 것을 읽고 교정했다. 최초빈캡처는 `listing-03-initial-blank.png`로 분리했다.

현재 첫viewport에서 `/categories/all-types`는 제목이 없고 소개와grid가 시작하며 `/mode`에는 “Content here” 소개가 보였다. 이는 참고사이트구현 관찰이고 HJM미흡이나 디자인패턴으로 복제하지 않는다. submit에는 SiteURL/Designer/DesignerLink/Submittedby 이름 등의 입력이 보여 기존 form composition 참고이고 required·검증·전송/복구동작은 실행하지 않았다. subscribe에는 이메일과 SubscribeNow가 있으나 실제가입/전송을 하지 않았다. categories는8종, industry/mode는별도정보축이라는 목록구성을 기존navigation/filter/Card/Grid로 흡수할수있으며 엔진교체 근거는 아니다.

CTA 남음: 비상세46의긴전체시각/모바일live·gallery모든controls의flow·상세related연결 및원제품full본문/코드/라이선스/동작·발견closure·작은전체문구. 현재551snapshot소스층+상세505기본시각+비상세46첫viewport+신규Numa1은 각기 다른완료층으로 유지한다.

## Minimal 순서 시각 checkpoint — 상세 0–11

첫12 desktoppreview를 실제 읽었으며 제공된mobilepreview가있는6개(1/2/3/6/9/11)는 버튼전환 후 실제 모바일이미지도 읽었다. 나머지6은현재갤러리에 Mobile버튼이없어 desktop-only로 분리했다. 원제품실제mobilebreakpoint/전체상태/작은전체문구는 미확인이다. source메타400·이12시각·추가갤러리partialflow6은 별도층이다.

![Minimal 첫12 desktoppreview 기본배치](assets/parallel-a-minimal-000-011.jpg)

![제공된6 mobilepreview 전환후 확인](assets/parallel-a-minimal-mobile-001-011.jpg)

0 Landskab은 gray/white 프로젝트표,1 101은 sparkler photo와serif 문장·하단navigation,2 10Things는 dark imagegrid+newsletter,3 108Supply는 dark editorial motion-template grid/filter다. source E-commerce분류만으로 실제상품종류를 확정하지 않는다.4 10×16은white에 pastelgradient텍스트,5 124m2는white serif editorial+interior image,6 +13322566869는red/orange 큰타이포/portrait,7 14islands2017은geometricmulticolor로고,8 14islands2020은portrait/video+play,9 Tatem은blur/photo위 translucentwaitlistcard,10 1979Radio는black/white collage와INTRO글자,11 1991Books는blackphotogrid/editorial이다.

기존공개API색인과실제export를 대조하여 표는 DataTable(Web)·행구성, grid는Card/Grid, imagepreview는AspectRatio, 보기선택은SegmentedControl 또는서로다른panel인Tabs를 먼저고른다. Native DataTable export가없으므로 web표를 native지원으로 주장하지 않는다. 원본gallery의디자인별배치는brandasset/intentcomposition표현후보이며 입력/전송/탭계약을 교체할근거가아니다.

Mobile 전환은 최초 accessible name을 단순Mobile로 추정한selector가실패해서 현재DOM의 “View mobile screenshot”과button본문Mobile을 확인한뒤 전환했다. 실제viewport메타는1440x800/DPR1.33→375x667/DPR2로변경했고image도변했다. 이6개는갤러리의click+preview변경partialflow만확인했으며 keyboard/focus-return/원제품interaction은미완료다.

### Minimal 순서 시각 checkpoint — 상세0–23

첫24 desktoppreview(두preview11+desktop-only13)의 기본시각을 실제 읽었다. 제공Mobile11개는 click→metadata/image변경partialflow를 확인한 범위며 original동작·gallerykeyboard미완료다. 12 19h47은dark미니멀typo/작은하단링크,13 1×1은cloud/lamp사진,14 2020ISASONG은blue/white표와AddYourSong,15 23d.1은큰editorialtype,16/17 246Queen은white공간과건축사진,18 247은portrait/제품3열,19 27b는red큰로고와mockup,20 33Letters는blue/yellow3Dletter,21 3drops는darkphone3Dmockup,22 Unsplash는black큰연혁문장,23 52Obsessions는darkblogcard열이다.

특히27b의desktop/mobile중앙내용,33Letters의mobileheadline노출,2020ISASONG의mobile표밀도는 서로 달라 단순반응형재배치로 단정하지 않는다. gallery의서로다른capture시점/state/scroll일수있어 original동일성pending으로 유지한다. 19h47의작은darkcopy와2020ISASONG의아주작은mobilecopy는 정밀판독/대비실측미확인이다. 246Queen유사이미지는서로다른URL/게시일을 합치지않았다. 기존Card/Grid/Image/DataTable/typography표현후보이고 새로운interaction승급근거는 아니다.

### 순서 본문 checkpoint — 각각0–599

Minimal 고유preview메타 **600/3,199**(description도읽음160), DesignBookmark toolAbout/Features·pricing/category **600**을 실제읽고기존시각24의증거를보존한채 URL별index를갱신했다. 공통label·반복Submitter=이름·반복category/title만exact중복제거하여출력했고유일본문값·credits·dates·About/Features는유지했다. source평문파싱이나capture를독해완료로자동합산하지않는다.

Minimal ChusRetroOS507은이름에retro가있는portfolio고유메타,CozyJournal578은app분류의메타다. 실제시각/동작은아직pending으로두고이름만으로retro/paper테마에승급하지않는다. 여러brand/design/dev크레딧을가진ChainGPT465도원자산복사후보가아니다.

DesignBookmark ColorLeap406·ColorReview409·ConverlyColors441·Coolors450은역사palettes·contrast·Radix-style scales/radius·palette lock 소개이고 Ditther586은dither/ASCII/halftone/grain 소개다. theme참고팔레트/질감축에연결할수있는탐색후보지만실제원페이지출력·정확한contrast·code/license·renderer를보지않아HJMcolor contract나textureAPI를교체하지않는다. DesignSpells552/Details568은interaction참고소개,CreateUI472/DesignSystemsRepo557/DjectStudio588은라이브러리/kit소개라기존공개component·recipe·theme로흡수가능한항목을먼저비교해야한다. “free”,“accessible”,“open-source”directory분류를실제인증으로쓰지않는다.

## 조사 후 실험 등록 제안 — 현재 발견28개 후보

사용자추가요청 “조사끝나면 실험에다등록해줘 규격지키면서”에따라, **현재관찰된서로다른추가·개선·교체후보28개**를 아래처럼모았다. 사이트조사와등록은아직미완료이고 실제스토리/공개API는수정하지않았다. 수백개같은form/grid/hero는각기독해증거를보존하면서같은행동·표현후보로묶는다. 매번새component를만들어기존API를중복하지않는다. 아래경로는등록제안이며 `Default/Dark/LargeText`와그역할에맞는상태, globals환경, Web불변id·Nativeid제약 등 [스토리북규격](../STORYBOOK_NAVIGATION.md) §1.1–1.6을따라root가조사후등록한다.

기존실험 **테마조합/영상미리보기**는해당항목변형에흡수한다. 이미배포된 **질감비교/일정과식별정보티켓**은실험으로옮기지않고기존API재사용을검토한다. 기존`HjmDesignProfile`의11preset·palettecontrast·material표면·content/selection motion·collection/toolbar/overview값을읽어비교했다. 외부motion/라이브러리는소개만읽은경우별도보류한다. **확정API교체0건,등록완료0건**이다.

| 후보 | 제안 실험 경로 | 기존 API 우선 및 판단 | 불채택 이유·미확인 |
| --- | --- | --- | --- |
| A-01 테마 조합 | `실험/구성/비교와 검증/테마 조합` | HjmDesignProfile/hjmDesignPresets + theme tokens/material/interactions/compositions/screens; 기존11 presets · 흡수·기존실험변형 | 기존 실험 항목의 표현/구성 변형으로 흡수. 새 theme registry 또는11개별폴더 불필요. 원제품 motion/state·font/asset license 미확인. |
| A-02 종이 표면과 경계 | `실험/구성/비교와 검증/종이 표면과 경계` | EffectSurface grain/noise + Card/Form/Button + paper profile; 기존 배포 질감 비교/티켓 · 개선후보·기존API조합 | ruled/tape/rotation/perforation/scallop는 기존grain과 동일하지 않음. 두 renderer clip/큰글자/대비·원본asset 미확인. 배포 항목 이동 없이 새비교 또는 기존스토리변형 검토. |
| A-03 계단 모양 테두리 | `실험/컴포넌트/시각 효과/계단 모양 테두리` | retro radius/shadow + Card/Button; 일반radius만으로 stepped outline 동일표현 불가 · 추가후보·보류 | pixel/selection-handle 경계의 두renderer·확대글자·focusring clipping/code/license 검토 후 역할단일surface인지 결정. 신규primitive 확정 아님. |
| A-04 색 조합과 대비 | `실험/토큰/색과 글자/색 조합과 대비` | semantic palette/brandPalette + checkPaletteContrast + existing profile palette · 흡수·기존값비교 | 팔레트/gradient 참고를 제품의미와 대비계약 안에서 비교. directory 도구 소개만으로 WCAG/색재현/license 보증하지 않음. 새로운색엔진 불필요. |
| A-05 제목 위계와 줄바꿈 | `실험/토큰/색과 글자/제목 위계와 줄바꿈` | profile heading/typography/fontFamily + Heading/Text · 흡수·크기변형 | 큰editorial/serif/pixel title은 typography/profile 비교. 폰트 실제 license/Korean fallback·large text 및원제품resize 미확인. |
| A-06 사진 위 입력 카드 | `실험/구성/입력과 작성/사진 위 입력 카드` | Card/Image/Form/Field/TextField/Textarea/Button + forest/glass profile · 흡수·구성변형 | newsletter/contact field schema는 제품 intent. 사진은 제품asset이며 sharedtoken 복사아님. 갤러리와현재Unikorns필드가달라 원제품전송/복구미확인. |
| A-07 비쳐 보이는 표면 | `실험/컴포넌트/시각 효과/비쳐 보이는 표면` | profile material.surface blurStrength/fillOpacity/insetShadows + Card/EffectSurface · 흡수·기존표면비교 | 현재 surface contract 범위에서 비교; iridescent 사진/motion을 실제shader검증으로 세지 않음. renderer blur/performance/reduced motion·텍스트대비 미확인. |
| A-08 입체 장식과 행동 | `실험/구성/정보 표시/입체 장식과 행동` | Image/AspectRatio + Card/Button/Heading; clay/forest profile · 흡수·제품asset슬롯 | 3D mascot/geometry/portrait는 식별자산/장식. 새3Dengine/shared상표token 불필요. 원asset/code/license·nativeperformance 미확인. |
| A-09 버튼 순서와 의도 | `실험/구성/비교와 검증/버튼 순서와 의도` | Button/Link + action slots/Grid/Stack + overview/intent recipe · 개선후보·의도계약 | primary/secondary 순서는 theme로 무작위변경하지 않음. Langbase desktop free→demo/mobile demo→free 등 제품우선순위 별도. originalbreakpoint/state 미확인. |
| A-10 구독 정보 입력 | `실험/구성/입력과 작성/구독 정보 입력` | Form/Field/TextField/Select/Checkbox/Button + FormState/action recovery · 흡수·폼변형 | 이메일/name/budget/interest schema로 변형. mandatory/consent/전송API는 제품소유. gallery submit/pending/failed/success 미확인. |
| A-11 관심과 동의 선택 | `실험/구성/선택과 필터/관심과 동의 선택` | Checkbox/FieldGroup/Form + existing controlled selection · 흡수·기존입력조합 | 선택과법적동의 의미를 장식 theme로 치환하지 않음. consent/keyboard/error announcement/실전서버 미확인. |
| A-12 단계별 가입 입력 | `실험/구성/입력과 작성/단계별 가입 입력` | Form/Select/RadioGroup/FieldGroup + FormState; 상태는제품schema · 개선후보·짧은흐름 | 단계전환·이전입력유지·실패복구 필요성을 실험에서 검토. 정적 첫step만 확인하여 원제품 step엔진/자동다음동작은 미확인. |
| A-13 팝업 입력과 닫기 | `실험/구성/입력과 작성/팝업 입력과 닫기` | Dialog/Sheet/Form/close action + existing overlay contract · 흡수·기존오버레이변형 | close/YesNo/email/promo variant를 기존control로. original focus trap/keyboard/restore/backdrop-dismiss/submit 미확인; overlay엔진교체 없음. |
| A-14 신청 옵션과 비용 | `실험/화면/소개/신청 옵션과 비용` | Card/Grid/DescriptionList/Button + 기존티켓/상품소개구성 · 흡수·화면변형 | 가격tiers/free trial/구매/구독은 의미상다름. 원결제/약관/성공단계 미실행, theme가 구매intent를 바꾸지 않음. |
| A-15 문의와 질문 답변 | `실험/구성/정보 표시/문의와 질문 답변` | Accordion + help/action Card/Stack/Grid · 흡수·기존질문구성 | FAQ/help/newsletter/resource 조합의 정보순서. original accordion/route/supportflow 미확인. |
| A-16 자료 검색과 선택 | `실험/화면/검색/자료 검색과 선택` | SearchScreen/query/filters/suggestions/resultSummary + Grid/Card + existing300msdebounce/AbortSignal · 흡수·기존검색상태변형 | Minimal homepaper검색/DesignBookmarkretro검색 partiallive만 확인. 0건/loading/error/fullfilter·로그인bookmarkcloud/keyboard복구미확인. 새검색엔진 불필요. |
| A-17 목록 옆 상세 보기 | `실험/구성/탐색과 이동/목록 옆 상세 보기` | Sheet/Dialog + controlled query/selection; list/detail state separation · 흡수·기존상세변형 | DesignBookmark8bitcn drawer→Escapeclose후query유지는확인. focusreturn/URL/deeplink/scroll복구未확인. 새drawerengine 교체없음. |
| A-18 기기별 미리보기 | `실험/구성/정보 표시/기기별 미리보기` | Tabs 또는SegmentedControl + Image/AspectRatio; panel vs scalar semantics선택 · 흡수·기존선택과미디어 | Minimal11버튼click→viewport375x667/DPR2+image변경확인. gallerynative/keyboard/focus-return/원제품actualviewport 미확인. |
| A-19 달력과 문의 안내 | `실험/구성/정보 표시/달력과 문의 안내` | DatePicker/DateEntry/DataTable(Web) 또는staticGrid; 기존문의action · 보류·정적표시구분 | Janvi date/grid가 실제입력인지 장식/달력표시인지 미확인. theme에서 날짜입력엔진을 자동추가하지 않음. |
| A-20 영상 미리보기 | `실험/구성/정보 표시/영상 미리보기` | 기존실험영상미리보기 + Image/AspectRatio/explicitPlay action · 흡수·기존실험변형 | gallery정적play/영상thumb만 관찰. originalplay/pause/caption/reducedmotion 및리소스실패 未확인; autoplay엔진추가안함. |
| A-21 앱 받기와 코드 보기 | `실험/구성/탐색과 이동/앱 받기와 코드 보기` | Button/Link/Image/AspectRatio; file이면기존DocumentResource 검토 · 흡수·목적별download구성 | QR/store/freefile/gatedsignup 의미를 구분. QR 실제scan·store/download/권한/구매flow 미실행. storelogo는제품asset. |
| A-22 미리보기 실패와 재시도 | `실험/구성/피드백과 복구/미리보기 실패와 재시도` | Image/AspectRatio/loading/error recovery + existing support/actions · 개선후보·로딩관찰 | CTA clip광고오인·106–114blank·categoriesinitialblank와MinimalOgoninitialimageblank 근거. 로컬fixture 재시도/공간유지검토, 원사이트장애원인/HJM결함 확정아님. |
| A-23 화면 상태와 순서 | `실험/구성/비교와 검증/화면 상태와 순서` | DesignProfile/OverviewScreen + explicit intent/state + samefixture · 개선후보·동일상태비교 | 서로다른gallerycapture state/date/scroll을 theme반응형변화로오인하지않음. fixture동일상태·제품actionpriority 유지 검토; original실제statepending. |
| A-24 작업 목록과 설명 | `실험/화면/콘텐츠/작업 목록과 설명` | DataTable(Web)/Card/Grid/Text/Heading + collection rows/cards/grid · 흡수·기존목록변형 | Landskabtable/photo/art/editorial/blogcard 참고. native표export없으므로nativeDataTable지원주장않음; sort/filter/pagination/originalflow미확인. |
| A-25 질감과 글자 표현 | `실험/구성/비교와 검증/질감과 글자 표현` | EffectSurface grain/noise + typography/profile; ASCII/dither외부소개와 비교 · 조사보류·소개만읽음 | 원도구imageoutput/code/license·두renderer 실제동작 미확인. CSS/ASCII/GPUengine 무조건추가안함; 필요한표현차이확인후실험범위결정. |
| A-26 입력과 상태 구현 비교 | `실험/구성/비교와 검증/입력과 상태 구현 비교` | 현재공개입력/상태/오버레이/표면/recipe + 기존사용지침 · 교체후보보류·소개만읽음 | 라이브러리headless/React/Vue/theme/motion/AIstate 소개범위. 원API/code/라이선스/native지원/접근성 품질·현HJM결함 미확인이라 교체/의존성추가0건. |
| A-27 아이콘과 아바타 조합 | `실험/구성/정보 표시/아이콘과 아바타 조합` | Icon/Image/Avatar; AvatarGroup은Webexport + 제품assetrenderer슬롯 · 흡수·asset비교보류 | 3Dicon/portrait/mascot/대체avatar소개. 원source/code/license/semanticname/큰글자clip미확인, directoryfree주장은라이선스증거아님. 3dicons원사이트는C담당조사와합치기. |
| A-28 대비와 상태 검토 | `실험/구성/비교와 검증/대비와 상태 검토` | palettecontrast + existingDark/LargeText/ReducedMotion/Rtl/statefixtures + Storybook · 흡수·검토절차참고 | a11y/contrast/visualtest/viewport툴소개만읽음. 기존로컬criteria를먼저활용; 자동체커/의존성설치·원격CI실행없음. |

각후보의정확한URL/검토층은동반 A index `experimentCandidateCheckpoint.candidates[].sources`에전부기록했다. 아직도메인소개만있는대상은 실제vendor/code검토전등록완료나교체확정으로바꾸지않는다. 새후보발견시이목록에추가하며불필요한동일API는변형으로흡수한다.

### 후보 경로 정정·출처 정밀화

현재 소스를 다시 확인하니 영상 미리보기는 양 renderer에서 이미 `배포/구성/정보 표시/영상 미리보기`이며 Web id는 `compositions-information-video-preview`다. A-20은 기존 배포 항목의 변형·개선 후보로 연결하고 같은 이름의 실험을 새로 만들지 않는다. 이전 표의 기존 실험이라는 표현은 이 현재 상태로 정정한다. 등록·승급 완료는 주장하지 않는다.

구독 양식 후보에서 Janvi 연락 달력과 Wrike 무료 체험을 제외했고, 영상 후보에서 정적 장식만으로 영상이라고 확정할 수 없는 출처를 제외했다. 앱/코드 후보도 실제 download/store/QR가 관찰된 출처로 제한했다. Minimal 출처의 mobile 여부는 개별 visual record가 증명하는 경우에만 인정한다. 28개는 현재 기록된 후보 범주이며 이후 미검토 페이지에서 추가 후보가 나올 수 있으므로 목록 전수 완료 플래그는 false다.
