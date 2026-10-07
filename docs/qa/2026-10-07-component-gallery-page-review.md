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

## 6. 미확인 범위와 후속 조건

| 미확인 항목 | 후속 조건 |
| --- | --- |
| 2,671개 갤러리 예제와 하단 본문 | 이미지 로드 상태·중복·대체 텍스트를 확인하고 실제 보이는 사례를 전수 시각 검토 |
| 모든 general-page 하단 | Changelog 본문 읽기는 완료했고 아직 보지 않은 화면 구간을 검토 |
| filter/sort/search/테마·작은 화면·키보드 | 공개 탐색 흐름을 실제 UI로 확인. 외부 폼 제출 없음 |
| 원본 linked implementation | 채택 권장 후보의 의미·상태·모션·접근성·의존성·라이선스를 원본과 대조 |
| 11개 사이트 전체·HJM 실험·검증·승격·릴리스·소비 앱 | 이 사이트의 일부 확인을 전체 완료 근거로 사용하지 않고 전체 비교 후 진행 |

## 7. 보관 처리

- 원시 본문·캡처·digest·도구는 현재 전수조사의 재검토 자료이므로 보존한다. 검토와 QA 기록이 끝나기 전 삭제하지 않는다.
- 이 보고서는 지속 가능한 판단·확인 수치·재현·미확인 범위를 보존한다. 임시 raw 경로는 영구 문서 링크로 만들지 않는다.
- [사이트 목록](../plans/reference-site-inventory.json), [페이지별 검토 원장](../plans/reference-component-review-ledger.json)에 이 보고서를 연결한다.
