# HJM 컴포넌트 중복 개선 결과

2026년 10월 1일 전수 조사에서 발견한 여섯 영역을 현재 checkout에서 개선했다. 공개 컴포넌트를 삭제하는 대신 공통 행동과 표현의 소유권을 모았으며 기존 공개 이름과 선택형 의존성 경계를 유지했다. npm 게시, 소비 앱 업데이트, 원격 CI 실행은 수행하지 않았다.

## 반영한 변경

| 조사 항목 | 반영 결과 | 호환성 |
| --- | --- | --- |
| F1 Table과 DataTable | 같은 정렬 전환 계약과 내부 header button을 사용한다. 표시 전용으로 설명했던 문서도 실제 정렬 기능에 맞게 수정했다. | Table의 두 상태 순환·generic row·caption·emptyState와 DataTable의 선택·비동기 상태·정렬 해제를 유지한다. |
| F2 메뉴 검색 | Menu·MorphingMenu·ContextMenu가 textValue, 500ms reset, disabled 제외, 현재 항목 이후 순환, 반복 문자 순환을 공유한다. | 여는 방식과 presentation은 각 host가 유지한다. MorphingMenu의 장식 textContent 검색은 제거했다. |
| F3 Native 필드 | custom Field와 TextField/TextArea가 라벨·필수 표시·설명·오류 frame을 공유하고 OTP도 같은 message renderer를 사용한다. GestureSheetInput은 공통 필드 recipe와 provider font scaling을 사용한다. | custom Field의 직접 자식 배치와 기존 style/layoutStyle을 보존한다. 시트의 keyboard-tracking input host도 유지한다. |
| F4 캐러셀 | Web/Native CarouselMotion이 기본 Carousel의 descriptor, 현재/inert 상태, 접근성 이름, finite navigation을 소비한다. | optional composeAccessibleName을 추가했다. 생략하면 기존 slide label을 사용하며 controlled API와 swipe host를 유지한다. autoplay는 제공하지 않는다. |
| F5 공개 범위 | source/package exports에서 생성하는 [공개 API 대응표](../../generated/public-component-map.md)를 추가했다. 카탈로그/companion/alternative/optional/supplemental을 명시한다. | canonical catalog 103개를 늘리지 않는다. Web 121개, Native 106개의 공개 컴포넌트·provider 이름을 재노출 중복 없이 연결한다. |
| F6 내부 복제 | Popover/Tooltip의 shape validator와 ThinkingOrb braid/ribbon의 backing sphere 점 생성 루프를 공통화했다. | component별 오류 문구와 모드별 전경 알고리즘은 유지한다. 기존 golden geometry 테스트가 통과했다. |

공개 API 대응표의 미분류 이름·정의 충돌·생성물 drift 검사를 root check에 연결했다. 검사 삭제 또는 write mode로 변경하면 governance 음성 테스트가 실패한다. JSON에 주석을 둘 수 없으므로 root package.json의 새 검사 연결 근거는 README와 governance checker의 주석에 남겼다.

후속 문서 점검에서 [AGENTS.md](../../../AGENTS.md)와 [기여 지침](../../../CONTRIBUTING.md)에
기존 공개 API 비교, 공통 계약의 소유권, 별도 API 선택 기준, 문서·생성물 동시 갱신을 명시했다.
기여 지침의 모든 공개 API를 catalog 항목처럼 취급하던 설명을 canonical과 companion/optional
분류로 정정하고 검증·릴리스 계약의 검토일과 검사 범위를 갱신했다.
공개 API map 검사는 기능 중복 자체를 판정하지 않으므로 계약 문서의 겹침 검토를 함께 요구한다.

공통 모듈을 추출하면서 해당 import graph에 순수 내부 모듈이 추가됐다. 실제 연결을 확인해 영향받은 graph의 모듈 수만 갱신했고, 압축 결과가 한도를 넘긴 일부 entry에는 수백 byte의 측정 근거를 해당 budget 주석에 적었다. 외부 의존성·optional peer 격리와 forbidden-module 검사는 유지했다. 크기 검사는 repository CI와 같은 Node 24.20.0으로 수행했다.

## 검증 결과

| 범위 | 결과 |
| --- | --- |
| 계약 package | 73개 파일, 895개 테스트 통과. Popover/Tooltip validation 및 ThinkingOrb golden geometry 포함 |
| React Native | 56개 파일, 881개 테스트 통과. 새 field frame 및 기존 custom layout 호환성 포함 |
| Web SSR | 17개 파일, 180개 테스트 통과 |
| Web Chromium | 73개 파일, 957개 테스트 통과. 세 메뉴 검색·표의 두 정렬 정책·모션 캐러셀의 이름/inert/경계 회귀 포함 |
| 전체 package 타입·빌드 | contracts, React, React Native 모두 통과 |
| Native 번들 | Android production Metro bundle 통과. 621개 모듈, raw 1501.0 KiB, gzip 372.4 KiB. native 설치 실행 증거는 아님 |
| Native Showcase | typecheck와 3개 테스트 통과 |
| Web Showcase | typecheck, 20개 테스트, token boundary 통과. production Storybook build와 103개 canonical story 정적 검사 통과 |
| 공통 검사 | 계약 projection·contract bundle·renderer graph 및 플랫폼 경계·workspace sync·evidence sync·public API map·governance 검사 통과 |

핵심 package 회귀 테스트는 중복 재실행을 제외하고 2,913개다. governance 검사는 공개 API gate 삭제와 write mode 전환 거부 사례도 포함한다. 공개 성숙도는 Web 103/103, Native 83/83의 기존 source/evidence 선언을 유지하며 새 기기 검증이나 소비 앱 적용을 주장하지 않는다.

## 적용 범위

변경은 HJM 저장소의 소스·생성 dist·검사·문서와 patch Changeset에 남겼다. 기존 다른 작업의 미커밋 변경은 보존했고 commit/push 또는 버전 게시를 하지 않았다. Device Hub 새 화면 확인, iOS/Android 실제 실행, 소비 앱의 binary/native linking, 제품별 migration은 이번 변경에서 미검증이다.

[개선 전 조사 기록](REPORT.md)과 [당시 source inventory](inventory.json)는 이력으로 유지한다. 해당 파일의 SHA 및 source 행 번호는 개선 전 snapshot이다.
