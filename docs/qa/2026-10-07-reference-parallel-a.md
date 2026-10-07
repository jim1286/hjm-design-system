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
