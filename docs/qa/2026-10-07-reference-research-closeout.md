# 필요한 레퍼런스 조사 마무리

날짜: 2026-10-07 · 저장소: HJM Design System main · 범위: 조사 판단·실제 Web 테마 선택

## 요청과 변경 전후

사용자가 “이제 조사 마무리해”, “필요한것만 조사해”라고 범위를 줄였다. 이전에는 모든 소개문,
수집 URL, 원제품과 환경 검토를 이어가는 계획이었다. 이번 변경은 추가 전수 수집/독해를 멈추고
후보마다 재사용·개선·신규 검토·보류를 확정한 뒤 필요한 적용으로 넘어가는 계획이다.
전수 미완료 flag와 기존 원장을 보존하며 조사 마무리를 전수 검증 완료로 바꾸지 않았다.

## 보존한 결과

| 작업 | 최종 후보 처분 | 실제 독해/관찰 범위 |
| --- | --- | --- |
| A | 39: 재사용25·개선5·신규3·보류6 | CTA/Minimal/DesignBookmark 소개·기본 화면과 연결 원본 source. 정확한 층별 수는 [A 원장](2026-10-07-reference-parallel-a-index.json) |
| B | 68: 재사용47·개선9·신규3·보류9 | Magic main257/Manual77, Aceternity main501/Manual112/설치4와 선택 화면11·흐름5; 21st 본문53/shell10/내용 없음8 및 공식 연결 구현4 URL·5파일 |
| C | 42: 재사용24·개선10·신규4·보류4 | Refero 본문369/1,394(일반52+style317), 남은1,025는 원장 보존. 이 마무리 batch의 새 시각/원제품 흐름0 |
| root | 149 후보 기록 취합, 8개 요구 중복 통합 | 필요한 원제품 테마 선택 흐름 1페이지. 신규 public API·실험 추가·승급·npm 게시 없음 |

수집 metadata를 본문/제공 코드/실제 상태 검토 수로 가산하지 않는다. 위 표의 root 행은 최초
조사 마감 시점의 작업 범위다. 이후 [실제 등록부](../plans/reference-experiment-registrations-2026-10-07.json)에
새 실험 6개와 기존 테마 실험 개선 1개가 연결됐고, 항목별 Web·선택 iOS 개발 검수 근거도 남겼다.
최초 보고서의 ‘추가 실험 3개 적용 예정’ 문구가 현재 상태와 달라 이를 정정한다. 등록·검수를
승급·게시·소비 앱 채택으로 합산하지 않으며, 후속 상태는 [완료 감사](2026-10-07-reference-completion-audit.md)를 따른다.
필요한 조사와 후보 판단은 마감 상태를 유지한다. 새 제품 요구로 기존 API의 부족함이 확인될 때만
해당 동작의 근거를 추가 확인하며, 남은 페이지의 일괄 수집·독해는 재개하지 않는다.

모든 후보의 source pointer, 기존 API, 처분 이유, 필수 확인, 실제 등록 연결과 source index SHA는
[적용 판단 원장](../plans/reference-adoption-decisions-2026-10-07.json)에 있다. 제목 일치만으로
제안 변형을 이미 구현했다고 표시하지 않는다. 공개 API 미확인 명칭의 정정은 C의 최종 판단을 따른다.

## 실제 Web 흐름

MCP Playwright의 root 전용 신규 tab1에서 8bitcn Theme Selector를 열었다. 기존 tab0 blank는 보존했다.
CUA에서 browser가 없고 child Playwright 서버가 공유 profile 충돌을 반환한 상태를 실제 관찰했으며,
프로필 process/lock을 종료·삭제하지 않고 root 서버에서 성공한 탭으로 필요한 한 흐름만 검토했다.

ArrowDown→Enter로 Sega 선택, 두 combobox 값 일치, 선택 후 trigger 초점 복귀, 관찰한 query URL을
새 문서로 열었을 때 선택 유지, dark 전환 후 선택 유지, Escape 취소 후 listbox 제거·trigger 초점
유지를 확인했다. CSS 값/URL/초점 상세는 [마무리 판단](../plans/reference-research-closeout-2026-10-07.md#마지막-필요한-원제품-확인--테마-선택)에 보존했다.

이는 Web DOM/접근성/선택 경로 검사이며 픽셀 전수·모바일·모든 테마·OS 저장/계정 동기화·Native
동등 동작 검증은 아니다. HJM의 Provider와 기존 선택 API에 흡수하고 URL/저장은 제품 소유로 둔다.
게임 브랜드 팔레트·외부 전역 CSS·별도 Provider를 새 공통 엔진으로 복제하지 않는다.

## 검증과 미확인

- A/B/C 작업의 완료 상태와 안정된 파일을 확인한 뒤 root 원장에 각 source index SHA를 연결했다.
- 149 고유 후보 ID·149 기록 경로, 허용 처분, 출처 양방향, 8개 통합의 멤버, 실제 등록 파일/사용 지침/증거 대조 PASS.
- metadata 취합 과정에서 기존 배포 항목의 `proposedPath=null`, 아직 없는 편집 도구의 `existingApis=[]`,
  Storybook 내용 데이터의 비탐색 `title`을 허용하도록 정정했다. 빈 값을 가짜 API/실험으로 채우지 않았다.
- 문서 링크 검사 PASS(589 Markdown); source SHA/전체 후보 coverage·실제 등록 변형 대조 PASS. 공백 검사 PASS. 변경은 문서/metadata이므로 renderer 회귀를 다시 실행하지 않는다.
- OS 최대 글자·최대값 모사 확대는 이번 판단/검증과 이후 완료·릴리스 차단에서 제외했다.
- 원격 CI/dispatch, 버전 상승·npm 게시·소비 dependency/lock 변경은 이번 조사 마무리에 수행하지 않았다.

## 산출물과 런타임 정리

현재 등록 상태 정정 시 실제 등록부 7개 항목의 양쪽 Storybook·사용 지침·QA 파일 존재를 다시
대조했다. 사용 지침(토큰13/컴포넌트139/구성59/화면22), Storybook433파일/Web id970개,
문서 링크599개와 공백 검사가 통과했다. 이는 정적 연결 검사이며 새로운 렌더·기기 검수는 아니다.
이번 정정은 문서 한 파일만 바꿨으며 원격 CI·버전 상승·게시·제품 dependency 변경은 수행하지 않았다.

root가 만든 Web tab1만 닫은 뒤 tab0 blank만 남았음을 다시 확인했다. 에이전트 연구 원장과
원본 metadata/proof는 재사용 증거라 보존한다. 이번 root 흐름은 별도 이미지/영상/다운로드를 생성하지 않았다.
공유 `.playwright-mcp`의 기존 QA 출력은 삭제하지 않는다. 도구가 반환한 본인 snapshot 파일은 실제
저장 위치를 확인할 수 있을 때만 이름·hash·크기를 보존하고 제거하며, 찾지 못한 파일을 제거했다고 보고하지 않는다.

본인 snapshot 6개(총 125582 bytes)를 실제 위치에서 확인했다. 아래 이름·크기·SHA와 관찰 결과를 보존한 뒤 이 6개만 제거했다.

| 파일 (`/Users/jimin/Developer/app-portfolio/.playwright-mcp/`) | bytes | SHA-256 |
| --- | --- | --- |
| `page-2026-10-07T08-52-03-885Z.yml` | 15722 | `a75217fc1986066fe2c425e3216ce59d004fe1550ad89f9fcdbd4dfc4f7e57a8` |
| `page-2026-10-07T08-52-49-172Z.yml` | 25674 | `bc547216d4d1f9731d29402d656d7edc213888e7bad2f30fe42374a19dcafddb` |
| `page-2026-10-07T08-52-54-460Z.yml` | 20777 | `875090cac560f7a330e810fdd32bc516c855d8995e4a7d79996122951f1821bf` |
| `page-2026-10-07T08-53-01-790Z.yml` | 16238 | `ed2fe5cedd3e701417f617b0ddedf4c3b2032249c8712d7d11ccb3a5ffe217af` |
| `page-2026-10-07T08-53-11-445Z.yml` | 21462 | `85fb22ae69eecae676a2a1e909d3d0af9900b9d21959a46a4ab2aa1f308db8a9` |
| `page-2026-10-07T08-53-27-144Z.yml` | 25709 | `c1f428e785f0833abb473c7bb4fb1cf40209071a2e2c3a430fe57f1424701c36` |
