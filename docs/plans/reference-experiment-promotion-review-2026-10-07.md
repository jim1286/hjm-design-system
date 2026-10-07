# 후속 실험 8개 Storybook 승급 검토팩

날짜: 2026-10-07 · 상태: **검토 준비 / 후속 8개 승급 승인 미확인 / 실험 유지**

## 범위와 승인 근거

[실제 등록부](reference-experiment-registrations-2026-10-07.json)의 이번 조사 등록 7개
(신규 실험 6개 + 기존 테마 실험 개선 1개)와 기존 관련 실험인 목록 화면 골격 1개를 검토한다.
메뉴 8개를 이번 조사의 신규 등록 8개로 계산하지 않는다.
[조사 마감](reference-research-closeout-2026-10-07.md)은 필요한 적용 근거의 마감이며 전수 검토·승급·게시 완료가 아니다.

[Storybook 탐색 규격 §2](../STORYBOOK_NAVIGATION.md#2-승인-기록)는 사용자 원문
“실험에 있는것들 검토후 승급 후 게시 먼저하자”를 **기존 17개** 대상으로 기록했다.
그 기록은 해당 17개의 Storybook 배포와 HJM npm 게시 승인을 포함한다. 이번 후속 8개의 최종 경로는
현재 승인절에 없고, 등록부는 실험 상태를 유지한다. 따라서 이 검토팩이 읽은 자료만으로 후속 8개에 대한
명시적 승급·npm 게시 권한까지 입증하지 않는다. 과거 17개의 승인을 이번 8개로 자동 확장하지 않는다.

구현·등록 요청, 검사 통과, 조사 마감, 계속 진행, 응답 없음은
[규격 §1.11](../STORYBOOK_NAVIGATION.md#111-신규--실험--사용자-승인--배포)에 따른 승급 승인이 아니다.
승인이 확인되면 날짜·대상 8개 또는 승인된 부분집합·최종 경로를 승인절에 기록한다.
그 전에는 양 Storybook과 usage의 첫 마디·상태를 `실험`으로 유지한다.
Storybook 배포, 공개 API 제공, npm 게시, 소비 앱 반영, Utilverse 스토어 출시는 각각 별도 상태다.

이 문서는 이전 계획의 포괄적인 “검증 후 승급·게시 권한 포함” 문장이 기존 17개와 후속 8개를
구분하지 못한 점을 바로잡기 위한 검토 자료다. 사용자 승인 자체를 새로 기록하거나 추정하지 않는다.

## 경로와 ID 호환

아래 최종 경로는 **승인 후 옮길 목표**이며 현재 등록 경로는 첫 마디가 `실험/`이다.
단계·고정 분류·항목 이름을 바꾸지 않는다. Web의 명시 meta ID와 각 export 기반 story URL은 보존한다.

| 승인 후 목표 경로 | 보존할 Web meta ID | Native |
| --- | --- | --- |
| 배포/구성/비교와 검증/내용 전환 비교 | `composition-comparison-content-transitions` | 동일 제목으로 첫 마디만 변경, 제목 기반 파생 ID 변경 |
| 배포/구성/선택과 필터/날짜와 시각 선택 | `composition-selection-date-time` | 동일 |
| 배포/구성/정보 표시/명령 기록 표시 | `composition-information-command-records` | 동일 |
| 배포/구성/비교와 검증/테마 조합 | `design-profile-comparison` | 동일 |
| 배포/구성/직접 조작과 모션/카드 상세 연결 | `collection-detail` | 동일 |
| 배포/토큰/색과 글자/표시·읽기·기술 글자 | `font-roles` | 동일 |
| 배포/구성/비교와 검증/종이 줄무늬 비교 | `paper-surface` | 동일 |
| 배포/컴포넌트/레이아웃/목록 화면 골격 | `design-profile-overview` | 동일, 독립 Native Story 선택 검토 완료 |

현재 Native 8개 metadata에는 명시 `id`가 없다. Native 10.4.4의 제목 기반 ID는 제목 변경에 따라 달라지므로
이전 Native deep link와 선택 상태를 Web의 고정 ID처럼 보존한다고 안내하지 않는다.
Native에 Web ID를 복사해 새 명시 ID를 추가하지 않는다. 생성된 story requires와 메뉴의 새 경로를
제목 변경 후 대조한다. Native에는 `includeStories`를 새로 넣지 않는다.
Web의 기존 `includeStories`와 export 이름은 그대로 유지한다.

## 항목별 검증 근거와 경계

이 표는 이미 저장된 QA를 대조한 결과다. 이 검토팩 작성 중 테스트·기기·새 사이트 조사는 실행하지 않았다.
초기 QA의 “Native 미확인”을 전부 완료로 바꾸지 않고, 뒤의 항목별 선택 iOS 검수만 보완 근거로 사용한다.
공통 iOS 환경은 기존 iPhone 17 Pro · iOS 26.5 · 설치된 개발 호스트이며 실물/Release 환경이 아니다.

| 항목 | 실제 Web 근거 | 선택 iOS 근거 | 남은 경계 / 검토 상태 |
| --- | --- | --- | --- |
| 내용 전환 비교 | [전환 QA](../qa/2026-10-07-content-transition-comparison.md): 수동 탭 활성화, 초안·단일 panel, 단계 실패/재시도/완료와 복귀. 과거 선택 10테마·6표현 기록 보존 | [Native §8](../qa/2026-10-07-native-reference-validation.md#8-내용-전환날짜시각명령-기록-후속-검수): 6표현·10테마 초안 유지. 도달 불가 footer를 바깥 ScrollView로 수정한 뒤 이전/다음·실패·재시도·완료·재시작 재확인 | 정상 모션 곡선/시간·높이 전환 성능과 실제 AT 미측정. 외부 원제품 null Close는 채택하지 않음. 선택 제공 행동 검토 근거 있음 |
| 날짜와 시각 선택 | [날짜 QA](../qa/2026-10-07-date-time-selection.md): 달력/시/분, 선택값과 표시 달 분리, pending 잠금, 실패 입력 유지/재시도/초기화, RTL 표시 정정 | [Native §8](../qa/2026-10-07-native-reference-validation.md#8-내용-전환날짜시각명령-기록-후속-검수): 월 이동/취소/선택, 09:05 실패·재시도 보존, pending touch 잠금, 초기화와 선택 disabled/dark/RTL | 모든 달/범위/키/테마의 열림 조합·AT 미검수. timezone/DST/예약 서버는 제품 소유. 선택 제공 행동 검토 근거 있음 |
| 명령 기록 표시 | [명령 QA](../qa/2026-10-07-command-records.md): 탭/줄바꿈/가로 보기, 갱신 실패 원문 보존과 재시도, 복사 lifecycle 회귀. IAB clipboard readback은 성공 증거가 아님 | [Native §8](../qa/2026-10-07-native-reference-validation.md#8-내용-전환날짜시각명령-기록-후속-검수): 실제 가로 touch·10테마 원문·실패/복구. 실제 iOS 시스템 Copy 결과가 마지막 줄바꿈까지 fixture bytes와 일치 | Native CopyFailed는 표시 fixture이며 OS 권한 거부 재현 아님. 명령 실행/서버 스트림/성능 미제공. 선택 제공 행동 검토 근거 있음 |
| 테마 조합 | [앱 테마 QA](../qa/2026-10-07-product-theme-propagation.md): 3설정×10테마 30조합, 같은 DOM·초안/기간·실패 복구·portal, 선택 좁은 dark/RTL/reduced. [테마 후속 QA](../qa/2026-10-07-design-profile-research.md): FAB 그림자 수정과 Web 20조합 | [Native §4](../qa/2026-10-07-native-reference-validation.md#4-확인-결과발견한-문제재현과-수정): ProductNotes/ProductReading, 편집 초안의 앱 설정·forest 전환 유지. [테마 후속 QA](../qa/2026-10-07-design-profile-research.md): FloatingAction 선택 10테마 행동 유지 | 모든 비교 tile/공개 컴포넌트의 토큰 소비·Android/AT/성능 전수 아님. 실제 앱 설정 저장·자산·브랜드는 제품 소유. 선택 제공 행동 검토 근거 있음 |
| 카드 상세 연결 | [카드 QA](../qa/2026-10-07-collection-detail.md): Web 10 light+10 dark/RTL/reduced, 폭/끝/처음·focus reveal·독립 카드/상세 초안·모달 복귀·empty. 실제 scroll 응답과 목적지 분리 수정 | [Native §4](../qa/2026-10-07-native-reference-validation.md#4-확인-결과발견한-문제재현과-수정): LTR/RTL touch와 끝/비활성, 카드 초안·별도 상세 초안의 테마 전환/닫기, 선택 dark/empty | VoiceOver·Android·실물/Release 성능 미확인. 후기/미디어·대량 가상화·loop/autoplay/shared-element는 제공 범위 아님. 선택 제공 행동 검토 근거 있음 |
| 표시·읽기·기술 글자 | [글자 QA](../qa/2026-10-07-font-roles.md): Web 10테마×상속/분리×두 환경 40조합, display/reading/ui/code·portal·같은 초안/초점·terminal 상속 | [Native §4](../qa/2026-10-07-native-reference-validation.md#4-확인-결과발견한-문제재현과-수정): 표시 역할 차이·10 light 상세 초안·선택 dark/RTL/terminal 상속 | CSS stack/외관은 모든 glyph의 실제 named font 식별이 아님. 제품 font 권리/로딩/전체 glyph, tracking/small-caps/OpenType 미확인 또는 미제공. 선택 제공 역할 검토 근거 있음 |
| 종이 줄무늬 비교 | [종이 QA](../qa/2026-10-07-ruled-paper.md): Web 10테마×상속/평면/명시×두 환경 60조합, 정적 간격/초안/상세 복귀 | [Native §4](../qa/2026-10-07-native-reference-validation.md#4-확인-결과발견한-문제재현과-수정): 접힌 preview·보이지 않는 선 수정 후 입력/확인/상세, 10 light 상속·10 dark ruled40, light24/40/plain 래스터 | 임의 강도의 전역 대비·실물 성능·Android/AT 미확인. 테이프·찢어진/타공/물결/회전 경계 미제공. 선택 제공 행동 검토 근거 있음 |
| 목록 화면 골격 | [기존 테마 QA](../qa/2026-10-07-design-profile-research.md): OverviewScreen 공개 subpath·Grid/Surface/Collapsible 재사용 및 Native host 화면 회귀. 테마/종이의 공개 화면 합성 흐름은 위 QA에 있음 | [Native §9](../qa/2026-10-07-native-reference-validation.md#9-목록-화면-골격-독립-story-검수): 독립 Default/Dark 진입·편집/기간 선택·도구 접기/복귀·실패 입력 유지/재시도 성공·마지막 카드 scroll 도달·고정 CTA 확인 | 관련 실험 내부 OverviewScreen 통과를 독립 Story 영수증으로 합산하지 않음. 기존 관련 실험이며 이번 신규 등록 수에 더하지 않음 |

공통 미확인은 Android, 실제 VoiceOver/TalkBack 순회, 실물·Release 성능, 모든 테마/상태/플랫폼 조합,
제품 font·asset·서버·영구 저장 및 소비 앱 채택이다. 위 선택 흐름의 통과를 이 범위로 확대하지 않는다.
이 경계를 모두 새 승급 차단 체크리스트로 만들지는 않는다. 실제 제공 계약의 미해결 결함과
목록 화면 골격의 선택 검토 범위를 구분해서 판단한다.

## 정적 대조와 승급 시 후속

현재 소스·등록부·사용 지침을 읽어 다음을 대조했다.

- 등록 7개와 기존 OverviewScreen 1개의 Web/Native Story 파일·4마디 제목·usage 경로/상태 일치.
- Web의 명시 meta ID 8개와 Native의 명시 ID 없음 확인.
- [승인절](../STORYBOOK_NAVIGATION.md#2-승인-기록)에 이번 8개 목표 경로가 없음을 확인.
- 등록부의 Native validation은 선택 iOS 개발 흐름이며 전체 플랫폼/AT/성능·게시·소비 채택을 주장하지 않음.
- 과거 QA의 로컬 회귀·타입·사용 지침/Storybook 규격·public API/문서 링크 통과는 해당 source snapshot 기록.
  이 문서 작성으로 현재 전체 검사나 원격 CI가 새로 통과했다고 표시하지 않음.

후속 순서는 다음과 같다.

1. 목록 화면 골격의 독립 Native Story 선택 검토를 완료했고 결과·환경·미확인을 Native QA §9에 기록했다.
2. 이 검토팩과 미확인 경계를 기준으로 현재 8개 또는 부분집합의 명시적 승급 승인 범위를 확인한다.
3. 승인된 항목만 양 Storybook 첫 마디를 `배포`로 바꾸고 Web ID/export는 보존한다.
   Native 제목 기반 ID/생성 메뉴와 새 경로를 대조한다.
4. 같은 변경에서 담당 usage의 상태·스토리북 경로와 승인절 날짜·대상·최종 경로를 갱신한다.
   실험 승급을 npm 게시/성숙도/소비 앱 적용 완료로 표현하지 않는다.
5. 제목·사용 지침·링크·ID 호환의 필요한 정적 검사를 root가 변경 후 실행한다.
   원격 CI는 실제 버전 상승 단계의 기존 정책을 따른다. 이 문서 작성에 테스트/CI를 새로 실행하지 않았다.

OS 최대 접근성 글자와 최대값을 모사한 확대 조건은 설계·추가 테스트·검증·후속·완료·릴리스 차단에서
완전히 제외한다. 기존 LargeText 등록과 과거 수행 기록은 보존하지만 이번 승급 검토의 실행 의무나
차단 조건으로 사용하지 않는다. 미독해 외부 페이지와 미지원 참고 표현도 현재 완료·릴리스 차단으로 추가하지 않는다.

## 관련 문서

- [등록부](reference-experiment-registrations-2026-10-07.json)
- [조사 마감과 적용 판단](reference-research-closeout-2026-10-07.md)
- [기존 17개 승급·게시 QA](../qa/2026-10-07-experiment-promotion-release.md)
- [실제 선택 iOS 검수](../qa/2026-10-07-native-reference-validation.md)
- [상위 적용·릴리스 계획](reference-release-utilverse-2026-10-07.md)
