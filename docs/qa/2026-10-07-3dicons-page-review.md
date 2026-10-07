# QA 리포트 — 3dicons 공개 페이지 검토

## 1. 최종 판정

**부분 확인. 11개 사이트 전체 전수 검토와 이 사이트의 모든 상태 검증은 미완료다.** 공개 경로 222개 중 아이콘 상세 211개의 고유 본문과 기본 아이콘·상세 영역, 일반 페이지 11개의 본문과 보이는 전체 레이아웃을 확인했다. 색상·각도 변형, 모든 상호작용, 아이콘 페이지 하단 similar 목록은 남아 있다.

사용자가 최초 요청의 전수 검토 누락을 지적한 뒤, 기존 HJM 반영·게시와 페이지 조사 증거를 분리해 기록했다. 기본 화면 확인을 실험 구현·승격·릴리스 완료로 계산하지 않는다.

## 2. 대상과 이력

- 기준 HJM main: `809fa28ebf1efaec9e48ec3b10c0c242f4b6131b`. 이 조사에서 제품 코드·공개 API·배포·새 자산 설치는 변경하지 않았다.
- 대상: `https://3dicons.co`의 공개 sitemap과 동일 호스트 HTML 경로. 2026-10-07 KST 확인.
- URL 변형 224개 중 HTTP 200은 223개다. 홈 slash 변형을 경로 하나로 계산하면 공개 경로는 222개다. privacy-policy 한 경로는 robots disallowed로 읽지 않았다.
- 원본 commit 대신 HTML 본문·렌더 본문·스크린샷 SHA-256과 검토 범위를 [페이지 원장](../plans/3dicons-page-review-ledger.json)에 기록했다.

## 3. 환경과 검증 범위

- 별도 headless Google Chrome 154.0.8037.98, 1440×1000, 기본 light/desktop, 실제 공개 사이트. 로그인·쿠키 동의 변경·다운로드·설치·외부 양식 제출 없음.
- 상세 211개: 공통 헤더/푸터를 따로 읽고 각 이름·태그·라이선스 표시·컬렉션·기본 스타일/각도·다운로드 UI의 고유 본문을 읽었다. 기본 아이콘과 상세 영역을 모음 12장으로 모두 확인했다.
- 일반 11개: 홈·About·Collection·컬렉션 4개·Contact·Explore·Figma·Showcase. 전체 페이지를 나눈 모음 6장의 보이는 레이아웃을 확인했다. 쿠키 배너 아래 가려진 카드 픽셀까지 검토했다고 주장하지 않는다.
- 컬렉션 설명의 항목 수는 V1 122, Social 48, Halloween 21, Christmas 20으로 합계 211이다. marketing의 렌더 수와 아이콘 항목 수를 같은 수로 취급하지 않는다.

## 4. 확인 결과·재현과 흡수 방향

| 대상 | 실제 관찰 | 판단 |
| --- | --- | --- |
| 공개 상세 211개 | 기본 아이콘·이름·태그·컬렉션·스타일 및 각도 선택 UI | 제품 장식 자산 후보. 기능 아이콘 엔진을 교체할 근거는 아님 |
| Threads·Coffine box | 첫 캡처에서 main image가 미로드, 재확인에서 둘 다 정상 로드·표시 | 재확인 화면을 직접 읽고 digest 갱신. 지속적인 사이트 결함으로 보고하지 않음 |
| Halloween Calendar | 달력 그림과 candle 관련 태그가 어긋남 | 검색 태그를 제품 대체 텍스트로 그대로 복사하지 않음 |
| 홈·컬렉션·Explore | 자산 grid, 색상/각도 선택, 컬렉션 분류와 홍보 카드 | 기존 Grid/선택 구성과 비교할 표현. 모든 필터 동작 통과는 아님 |
| Figma·Showcase | plugin 홍보와 UI mockup 이미지 | 그림의 버튼·통계는 실제 기능 검증 대상이 아님. 설치하거나 mockup 데이터를 복사하지 않음 |
| 라이선스 표시 | About은 초기 버전 CC0를 설명하고 사이트에는 Premium/Pro도 표시 | 초기 버전과 유료 자산 범위를 섞지 않음. 새 자산 채택 시 해당 자산 조건을 별도 확인 |

기존 `illustrated-outcome` 구성은 제품 소유 자산을 EmptyState/OnboardingScreen/Result의 공개 슬롯에 연결한다. 3D 장식은 해당 구성과 Asset을 먼저 비교한다. 삭제·확인·탐색 등 기능 아이콘의 의미와 hit target은 HJM Icon/Button이 소유한다. Social 컬렉션을 공식 로그인 제공자 로고 대신 넣지 않는다.

색상·각도 미리보기는 기존 Asset과 SegmentedControl/선택 구성으로 재현할 수 있는지 비교할 후보다. 새 wrapper나 공개 API 필요성을 아직 확정하지 않았다. Notebook/Tick의 기존 채택 기록은 별도 이력이며 이번 211개 자산의 채택 완료를 의미하지 않는다.

## 5. 검사·관찰 결과

| 검사 | 결과 | 범위 |
| --- | --- | --- |
| 공개 본문 수집 | 224 URL 변형, HTTP 200 223, robots disallowed 1 | 수집과 실제 검토는 구분 |
| 공개 경로 렌더 | 222페이지, HTTP 200 222, page error 0 | 기본 desktop/light 캡처 |
| 아이콘 상세 시각 검토 | 211개 기본 상세 영역, 모음 12장 | 하단 similar/footer·모든 변형 제외 |
| 일반 페이지 시각 검토 | 11페이지 보이는 레이아웃, 모음 6장 | 쿠키 배너 가림 구간 제외 |
| 초기 main image 미로드 재확인 | 2개 모두 로드 회복, 화면 재확인 | 일시 미로드를 영구 결함으로 판정하지 않음 |
| 동일 호스트 추가 path anchor | 수집 본문에서 추가 경로 0 | query·동적 검색·색상/각도 상태 closure가 아님 |

## 6. 미확인 범위와 후속 조건

- 아이콘 상세의 similar/footer 전체, 모든 색상·각도 선택과 필터·검색·정렬·FAQ·키보드/초점 상태.
- mobile/dark/큰 글자/RTL·대비·스크린리더·Native 실제 자산 decode 및 실패 대체.
- 권장 자산별 제품 목적·테마·크기·용량·해당 라이선스 확인과 기존 Asset/선택 API 비교.
- 나머지 사이트 전체 검토, 권장 실험 구현·UI/기능 검증·승격·새 릴리스·Utilverse 적용. 이번 기본 화면 확인만으로 완료 처리하지 않는다.

## 7. 보관 처리

- 원시 HTML·캡처·재확인·도구는 전수 검토를 이어가는 자료이므로 종료와 QA 대조 전 보존한다.
- 영구 문서에는 판단·수치·재현·digest·미확인 범위를 남긴다. 임시 파일을 영구 링크로 사용하지 않는다.
- [11개 사이트 목록](../plans/reference-site-inventory.json)과 [페이지 원장](../plans/3dicons-page-review-ledger.json)에 현재 범위를 기록한다.

## 8. 재질·각도 실제 선택과 Asset 테마 상속 — 15:56 KST

후속은 임시 IAB 탭77에서 실제 공개 상세4개를 조작했다. 앞선222페이지 기본 검토를
전수 상태 검토로 올리지 않는다. 사용자 별도 로그인·설치·다운로드·copy는 하지 않았다.

| 상세 | 실제 이미지까지 확인한 변형 | 선택만 확인한 상태 |
| --- | --- | --- |
| Tick `1b714e` | color/front, clay/front, gradient/dynamic, gradient/iso, premium/iso (400px 실제 이미지) | gradient/front는 방향키 선택만 확인 |
| Ghost `231450` | color/front, clay/dynamic (400px 실제 이미지). clay/dynamic은 390×844에서도 표시 | clay/front 선택만 확인 |
| Threads `04e52c` | color/front, color/dynamic | — |
| Threads `537509` | color/front, color/dynamic. 원형 그림이며 첫 Threads의 둥근 사각과 별도 자산 | — |

Tick은 Space로 clay 선택, ArrowRight로 gradient 선택이 바뀐다. 모든7 radio의 tabindex는0,
두 radiogroup의 aria-labelledby 대상은 각0개였다. download의 Enter로 메뉴를 열어
current/각도별/all/FBX/Blend 항목을 읽고 Escape로 닫은 뒤 download 초점 복귀를 확인했다.
메뉴 이름을 파일 다운로드 성공이나 해당 파일 라이선스 확인으로 세지 않는다.

Ghost의390px 환경은 문서 scrollWidth=innerWidth=390, 프리뷰 폭172px이고 media query의
dark/reduced=true였다. 사이트는 이 환경에서도 밝은 상세 배경을 표시했다. 글자200%/RTL,
음성 AT, 모든 메뉴와 모든 자산 조합은 확인하지 않았다. 초기 전환에서 src가 비고 로딩
대체가 나온 뒤 실제 이미지가 로드됐다. 예약 프레임이 있는 모습만 확인했으며 CLS/시간축을
전수 계측하지 않았다. 기본 IAB 캡처가 viewport 축소로 보여 최종 proof는 CSS clip390×844로
다시 캡처했다. media/viewport를 해제하고 탭을 닫았다.

Social 두 상세는 color1종·각도2종만 제공한다. V1/Halloween의4×3 옵션을 모든 자산에
강제하면 없는 경로를 만든다. 테마는 제품 소유 manifest의 실제 제공 조합을 골라 Asset/Image
슬롯에 넣어야 하며 HJM이 재질/각도를 생성하거나 그림 뜻을 바꾸지 않는다. Tick의
TICK/TOCK/WATCH 태그를 제품의 확인/성공 대체 텍스트로 복사하지 않는다. 장식 3D는
기능 Icon/Button이나 공식 제공자 자산을 대신하지 않는다. 상세의 CC0 표시와 이미 채택된
Tick fixture 귀속을 확인했고 새로운 파일을 라이브러리에 도입하지 않았다.

기존 API 지도·Asset 계약·양 renderer를 비교하며 rounded 액자가 foundation12를
직접 써서 프로필 radius.md를 우회함을 발견했다. Web computed radius12px≠retro4px,
Native frame radius12≠4를 신규 회귀검사에서 각각 재현한 뒤 수정했다. rounded만 가장
가까운 프로필의 md를 따르고 명시 square0/circle999·120px 크기·라벨·미디어 인스턴스는
유지한다. 공개 wrapper/상태 엔진/새 자산 선택 API를 추가하지 않았다.

기존 `실험/구성/비교와 검증/테마 조합`의 접힌 ‘자산 액자 비교’에 같은 이미지를 넣었다.
Web·Native 두 Preview와 사용 지침에 기존 Tick fixture로 rounded/square/circle 및 다음
테마를 연결했다. 신규 후보의 실험 등록 수를 늘리지 않고 기존 테마 실험의 상속 누락을 고친다.
자산 변형 선택 구성 후보의 최종 등록·전체 조사·승격·npm 게시·제품 반영은 아직 남는다.

검사:

- 변경 전 신규 Web/Native 각1건이 같은 상속 누락으로 실패. 변경 후 Web Asset/profile+density
  2파일4건, Native Asset/profile+기존design-profile 2파일10건 통과. 무프로필·중립 포함11preset·
  사용자 프로필, light/dark·큰 글자/RTL/reduced·중첩 Provider·초안/초점/미디어 유지 확인.
- Native Showcase registry/component stories 2파일7건 통과.
- 양 renderer build/typecheck·양 Showcase typecheck 통과. docs579파일·usage
  12토큰/139컴포넌트/54구성/22화면·Storybook421파일/929Webid·공개API지도308·workspace/
  evidence 동기화·renderer graph 경계 통과. 해당 범위의 로컬 검사이며 전체 release gate가 아니다.
- 실제 로컬 Web의 LargeText story를390px·dark·RTL·reduced로 열어10preset을 다음 테마로
  순회했다. provider globals2/dark/rtl/reduced, 이미지 naturalWidth500, 세 액자120px,
  모든 상태 scrollWidth390을 확인했다. rounded radius는 아래 표와 같고 square0/circle999는
  계속 유지됐다. 기본 desktop/light의 레트로 액자도 직접 읽었다.

| preset | rounded radius.md(px) |
| --- | --- |
| retro | 4 |
| paper | 6 |
| forest | 16 |
| minimal | 8 |
| editorial | 2 |
| brutalist | 0 |
| glass | 18 |
| aurora | 14 |
| terminal | 4 |
| clay | 22 |

증거:

- [원본 Ghost의 모바일 변형](assets/2026-10-07-3dicons-ghost-clay-mobile.png), SHA-256
  `ed3454667265eac32156e07eff28d5751600297ecdf358d60ec72d87a3a6a73b`.
- [HJM10테마 액자 한 장 비교](assets/2026-10-07-asset-profile-contact-sheet.png), SHA-256
  `2189b419407dfd7354c5db8b2e5bdd305054acaf52fb8f0bbd39a255b0c7a947`.
  실제358px폭 패널 캡처10개를 픽셀 크기 유지한 채 합쳤다. 상단 preset/radius 표시는 실제
  DOM 관찰값을 추가한 라벨이며 원본 화면을 재생성하지 않았다. 직접 읽어 상속/동일그림/명시
  모양/큰 글자 줄바꿈을 확인했다. 검토 범위는 액자 패널이며 다른 화면까지 통과시킨 근거가 아니다.

미확인: Native 실제 decode/기기 레이아웃·VoiceOver/TalkBack, OS/GPU·성능·원사이트 모든
자산/선택 조합, 모든 기능 아이콘/다른 token consumer. 원격 CI·버전상승·릴리스 없음.
