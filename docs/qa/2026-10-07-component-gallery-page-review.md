# QA 리포트 — Component Gallery 공개 페이지 검토

## 1. 최종 판정

**부분 확인. 11개 사이트 전수조사와 이 사이트의 전체 예제 검토는 미완료다.** 공개 HTML 66개 경로의 첫 화면, 컴포넌트 정의 60개와 상세 지침 12개를 읽었다. 131개 URL의 본문을 비교해 65개 slash 변형이 같은 본문임을 확인했다. URL 발견·본문 추출·전체 페이지 캡처를 사람이 모든 예제를 검토한 것으로 처리하지 않는다.

2026-10-07 사용자가 처음 요청한 전체 페이지 검토의 누락을 지적했다. 이미 수행한 HJM 반영·게시와 이 전수조사의 완료 상태를 분리하기 위해 페이지별 증거를 기록한다.

## 2. 대상과 이력

- 기준 HJM: main `809fa28ebf1efaec9e48ec3b10c0c242f4b6131b`. 이 검토에서 제품 구현·공개 API·릴리스는 변경하지 않았다.
- 대상: 실제 공개 `https://component.gallery/`, sitemap-index와 sitemap-0, HTML anchor로 발견한 동일 호스트 페이지.
- 실행: 2026-10-07 KST, Codex. 로그인·양식 제출·외부 디자인 시스템의 변경 없음.
- 외부 source commit은 제공되지 않아 본문 SHA-256·스크린샷 SHA-256·시각 검토 범위를 작업 중 보유한다.

| 대상 | 전·후 | 판정과 주요 변화 |
| --- | --- | --- |
| URL 목록 | slash 변형을 별도 페이지로 계산 → 131변형/66본문 경로로 분리 | 동일 본문 65쌍, 불일치 0. redirect를 확인했다고 표현하지 않음 |
| 정의·상세 지침 | 추출 → 실제 읽기 | 정의 60개, 상세 지침 12개. 원문의 ARIA 오류 2개를 W3C와 대조 |
| 시각 확인 | 캡처 → 첫 본문/첫 예제 행 확인 | 전체 폭 모음 11장으로 66개 경로 확인. 하단 모든 예제는 미완료 |

## 3. 환경과 검증 범위

- 별도 headless Google Chrome 154.0.8037.98, 1440×1000, 기본 light/desktop, 로그인 없음. 실서비스 페이지이며 합성 fixture가 아니다.
- 첫 시각 검토: 1440px 전체 폭, y=75~1200 본문·첫 예제 행. 초기 모음의 좌측 절단은 작업 산출물 crop 문제라 전체 폭으로 다시 만들고 66페이지를 재확인했다. 사이트 UI 결함으로 보고하지 않는다.
- 공통 정의/별칭 60개, 상세 본문이 있는 Accordion·Breadcrumbs·Button group·Button·Carousel·Pagination·Popover·Quote·Rating·Rich text editor·Tabs·Tree view의 상세 지침 전체를 읽었다.
- About·Contribute·Design systems·홈의 본문과 목록을 읽었다. Changelog 전체 본문도 추가로 읽었고, general 페이지의 하단 시각 확인은 계속 진행한다.
- 2,671개 예제의 전체 thumbnail·하단 목록, linked design system의 원래 구현·동작, dark/mobile/큰 글자/RTL·스크린리더는 미완료다.

## 4. 확인 결과·발견한 문제·재현과 수정

| 시나리오·조건 | 실제 결과 | 판단·흡수 방향 |
| --- | --- | --- |
| 131개 동일 호스트 URL의 본문 digest 비교 | 66개 경로, 65쌍 동일, 불일치 0 | 중복을 완료 페이지 수로 늘리지 않음 |
| Tabs 상세 지침 | 세로 탭에 Left/Right, 가로 탭에 Up/Down 설명 | 축이 반대로 적혀 있다. 원문 그대로 HJM 키보드 계약에 넣지 않음 |
| Popover 상세 지침 | 열린 상태에 aria-expanded=false 설명 | 열린 상태의 실제 의미와 모순. 열린 상태 true/닫힘 false 계약을 유지 |
| Carousel 상세 지침 | 부분 노출·보이는 탐색·비활성 콘텐츠·자동 재생 정지 지침 | Carousel/CarouselMotion의 peek·표현 비교 후보. 문서의 최소 크기를 기존 HJM 44px 행동 기준 대신 사용하지 않음 |
| Accordion·Breadcrumbs·Pagination·Tree view | 구조·현재 항목·내용 연결·계층과 키보드에 관한 설명 | 기존 상태·접근성 엔진 유지. 갤러리의 실제 구현과 동작을 추가 검토한 뒤 표현만 비교 |
| Quote 상세 지침 | blockquote/figure/cite·중복 pull quote·언어별 인용부호 구분 | 독립 구성 필요 여부를 기존 공개 API와 비교. 저자 이름을 창작물 cite 의미로 잘못 넣지 않음 |
| Rating·Rich text editor | 읽기 전용/선택형 평점과 문서 편집 구분 | Rating은 기존 1.14 API 비교. 편집 모델·paste·HTML 보안·플랫폼 host는 별도 소유 경계 |
| Button·Button group | 링크/버튼 의미, 행동 묶음과 toolbar 구분 | 특정 primary 위치·단일 줄·cursor 관례를 제품 RTL·큰 글자 계약보다 우선하지 않음 |
| About·Contribute | 재사용 가능한 코드·사용 지침·고유 기능을 디자인 시스템 조건으로 설명 | 스크린샷/재색상만으로 새 공개 API를 추가하지 않는 기존 HJM 원칙과 비교 |

원문 오류의 재현: [Tabs](https://component.gallery/components/tabs/)와 [Popover](https://component.gallery/components/popover/) 상세 지침을 읽고 해당 키 설명·expanded 문구를 확인한다. [W3C APG Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)는 가로 Left/Right, 세로 Up/Down을 설명하며, [W3C APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)는 보이는 내용에 expanded=true를 설명한다. 외부 사이트는 수정하지 않았고 HJM 코드 오류로 분류하지 않았다.

## 5. 검사·관찰 결과

| 도구·조건 | 수치·판정 | 해석 |
| --- | --- | --- |
| sitemap + HTML anchor closure | 방문 131, 발견 131, 미방문 0, HTTP 200 131, page error 0 | 해당 공개 경로 발견의 closure이며 모든 UI 상태 완료는 아님 |
| 본문 SHA-256 그룹 | 고유 경로 66, 동일 slash 쌍 65, 불일치 0 | 동일 렌더된 본문 비교. HTTP redirect equivalence 주장 안 함 |
| 전체 폭 첫 본문 모음 | 11장, 66경로 실제 시각 확인 | 하단 예제 미리보기를 모두 확인한 것으로 계산하지 않음 |
| 상세 지침 + W3C 원문 | 12개 읽음, ARIA 설명 오류 2개 대조 | 다수 사례의 관례와 공식 행동 규칙을 구분 |
| lazy image 전체 scroll 캡처 | 66페이지 완료 | capture는 source/visual review와 별도 상태로 보존. main img 2,853개는 로드 실패 0, page error 0. 장식/중복 이미지가 포함되므로 2,671개 예제 전수 시각 확인 수로 쓰지 않음 |

### 긴 페이지 캡처의 신뢰성 재확인

하단 전수 시각 검토를 시작하면서 기존 fullPage 이미지의 일부 구간이 실제 본문과 다른 것을 발견했다. Changelog에는 빈 구간이 있었고 Accordion은 약 16,384px 부근에서 상단 내용이 다시 나타났다. 본문 추출과 이미지 로드 성공은 전체 긴 화면의 올바른 paint 증거가 아니다. 외부 사이트의 실제 사용자 화면 결함으로 확정하지 않는다.

content-visibility를 임시로 visible로 설정한 재캡처는 Changelog 본문을 보였지만 Accordion의 반복은 남았다. 이 캡처 방법은 채택하지 않았고 해당 작업 소유 프로세스만 종료했다. 원본을 수정하지 않은 실제 scroll viewport(1440×1000, 100px 겹침)를 차례로 캡처하는 방식으로 전환했다. 아직 모든 새 캡처를 시각 검토하지 않았으므로 하단 전수 완료로 계산하지 않는다.

기존 모음에서 홈·About·Contribute·Design systems의 보이는 본문/목록과 컴포넌트 색인 하단을 추가로 읽었다. Accordion 101개 예제의 기본 thumbnail/카드 표현은 확인했지만 원본 linked 구현과 실제 접힘 동작은 별도다. 분리선·묶인 테두리·카드형·본문 일부 노출·inline 더보기·좌/우 indicator를 기존 Accordion/Collapsible의 표현 비교 후보로 기록한다. 긴 페이지의 상세 지침/footer 화면은 새 viewport 캡처로 다시 확인한다.

### 실제 scroll viewport로 하단 재검토

Accordion의 y=15,300~22,817 구간을 실제 스크롤 viewport 9장으로 연속 확인했다. 마지막 Details/Workday 예제 카드, 상세 설명·두 markup 방식·상호작용·스타일·사용 지침·각주·Resources·Name distribution·footer가 정상 표시됐다. 기존 과대 fullPage 캡처의 상단 반복을 실제 사이트 결함으로 분류하지 않는다. 기본 예제 카드 101개 확인 범위는 기존 모음에서 보인 상단 목록과 이 마지막 카드 확인을 합친 것이며 linked design system의 구현/동작 검토는 여전히 남아 있다.

새 viewport 9장의 URL·위치·SHA-256·검토 시각을 작업 증거에 보존했다.

### 실제 viewport 추가 검토와 기존 API 대조

후속으로 실제 viewport 모음 43장, 원본 viewport 172장을 확인했다. 초기 9장과 겹치는 것을 중복 계산하지 않는다. 홈·About·Changelog·Contribute·Design systems·컴포넌트 색인 6개 경로와 Accordion·Alert·Avatar·Badge·Breadcrumbs 5개 컴포넌트 경로는 기본 desktop/light에서 상단부터 footer까지 확인했다. Button group은 첫 viewport만 추가 확인해 전체 검토로 세지 않는다.

Changelog의 실제 y=0~34,975 구간은 본문과 footer를 정상 표시한다. 기존 fullPage의 빈 구간/상단 반복은 이 실제 viewport에 나타나지 않았다. Design systems 목록 95개 카드와 컴포넌트 색인 60개 카드도 확인했으며 linked 원본 사이트의 현재 상태를 확인한 것은 아니다.

갤러리의 기본 예제 카드/thumbnail은 Accordion 101, Alert 108, Avatar 38, Badge 123, Breadcrumbs 55, 합계 425개를 확인했다. 이것은 2,671개 중 기본 목록의 시각 범위이며 예제의 실제 행동·hover·dark·모바일·접근성 통과 수가 아니다. 작은 thumbnail의 내부 문구·상태는 원본 구현을 확인해야 한다.

| 추가 관찰 | HJM 실제 구현 대조 | 후속 판단 |
| --- | --- | --- |
| Alert: inline 고지·banner·제목/본문·선택 action·닫기·상태 강조 | 양 Notice가 title/description/action/icon/tone을 제공한다. Web은 tone으로 live 역할을 정하고 Native는 announcement를 별도 선택한다 | 새 Alert wrapper를 만들지 않는다. 상시 안내/동적 고지와 확인 Dialog를 구분하고, dismissible/배치/강조 변형은 원본 행동과 기존 Toast/Notice를 비교 |
| Avatar: 원/둥근 사각형·초기 글자·사진·상태 표시·겹친 묶음/overflow | Web Avatar는 shape와 AvatarGroup을 제공한다. Native Avatar는 이미지 host와 fallback을 제공하지만 shape prop/AvatarGroup은 현재 없다 | 같은 이름의 양 플랫폼 지원을 추정하지 않는다. Native 모양·그룹과 상태 표시가 필요한지 원본 접근성/overflow 동작을 읽고 기존 Avatar 엔진 확장으로 검토 |
| Badge: 상태 label·카운터·dot·filled/outline·삭제/선택 chip·복합 label | 양 Badge의 variant/leading, Tag, CounterBadge, Chip/TagsInput은 서로 다른 의미를 제공한다 | 갤러리의 Tag/Chip 별칭을 API 통합 이유로 쓰지 않는다. static/selection/removal/count 의미별 기존 API에 흡수하고 compound/dot 표현만 추가 비교 |
| Breadcrumbs: 여러 separator·현재 항목·home·중간 경로 축약/menu | Web Breadcrumb는 label/items/현재 위치/separator를 제공한다. catalog는 Native unsupported다 | separator 표현은 기존 슬롯을 쓴다. 중간 경로 overflow는 실제 탐색·포커스 확인 뒤 검토하고 Native에 Web 탐색을 자동 복제하지 않음 |

위 판단은 공개 API 대응표, catalog, 양 renderer의 실제 구현과 대조한 후보 분류다. 새 변형 구현·실험 등록·기능 검증 완료를 뜻하지 않는다. 사용자 후속 요구에 따라 디자인 프리셋은 색·재질뿐 아니라 이런 상호작용·구성·화면 변형을 선택하는 경로까지 제공해야 한다. 단순 재색상으로 전 단계 요구를 완료 처리하지 않는다.

## 6. 미확인 범위와 후속 조건

| 미확인 항목 | 후속 조건 |
| --- | --- |
| 기본 thumbnail 미확인 2,246개와 나머지 하단 본문 | 확인한 425개와 분리해 실제 보이는 사례를 전수 시각 검토 |
| general-page 추가 환경/탐색 | 기본 desktop/light 하단 확인은 완료. filter/sort/search·환경과 linked 원본은 별도 확인 |
| filter/sort/search/테마·작은 화면·키보드 | 공개 탐색 흐름을 실제 UI로 확인. 외부 폼 제출 없음 |
| 원본 linked implementation | 채택 권장 후보의 의미·상태·모션·접근성·의존성·라이선스를 원본과 대조 |
| 11개 사이트 전체·HJM 실험·검증·승격·릴리스·소비 앱 | 이 사이트의 일부 확인을 전체 완료 근거로 사용하지 않고 전체 비교 후 진행 |

## 7. 보관 처리

- 원시 본문·캡처·digest·도구는 현재 전수조사의 재검토 자료이므로 보존한다. 검토와 QA 기록이 끝나기 전 삭제하지 않는다.
- 이 보고서는 지속 가능한 판단·확인 수치·재현·미확인 범위를 보존한다. 임시 raw 경로는 영구 문서 링크로 만들지 않는다.
- [사이트 목록](../plans/reference-site-inventory.json), [페이지별 검토 원장](../plans/reference-component-review-ledger.json)에 이 보고서를 연결한다.
