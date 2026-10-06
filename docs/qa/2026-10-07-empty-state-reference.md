# 빈 상태 사례와 복구 검증

검토일: 2026-10-07 · 구현 시작점: 0197ca7.

## 조사와 판단

[Component Gallery](https://component.gallery/components/empty-state/)는 16개 원본을 나열한다.
[Primer 지침](https://primer.style/product/components/blankslate/guidelines/)에서 목적 설명·주 행동·
보조 안내 링크·좁은 영역·그래픽의 의미 전달 기준을 읽었다.
[PatternFly 지침](https://www.patternfly.org/components/empty-state/design-guidelines/)은 첫 사용,
검색 0건, 설정 필요, 권한, 서버 실패, 성공 등을 넓게 empty state로 분류한다.
이 원본들은 문서 검토이며 16개 실제 UI를 전수 검증하지 않았다.

HJM에는 EmptyState·Notice·Result·PermissionScreen·SearchScreen과 ContentState 계약이 있다.
원본 이름을 따라 상태 컴포넌트를 새로 만들지 않는다. 첫 사용·0건은 EmptyState, 부분 실패는
Notice, 종료된 결과는 Result, 기기 권한 흐름은 PermissionScreen을 대조한다. 서비스 권한과 기기
권한은 다르므로 접근 거부를 기기 설정 열기로 일괄 연결하지 않는다. SearchScreen은 이미 0건 복구를 소유한다.

## 발견한 문제와 수정

양 EmptyState 기본 예제의 생성 버튼이 Web에서는 handler 없이, Native에서는 noop으로 남아 있었다.
기존 공개 API를 사용해 메모리 예시 생성 → 검색 0건 → 지우고 목록 복구 → 초기화를 연결했다.
작은 로컬 목록이므로 SearchScreen의 확정/제안/필터 시트를 새로 조립하지 않았다.
생성·지우기·초기화로 버튼이 사라져도 검색 입력에 초점을 유지한다. 초기 빈 상태는 조용히,
검색 0건은 polite로 알린다(Web 기본 status, Native announcement=polite).

브라우저 화면 검증에서 type=search의 기본 cancel과 HJM clear가 함께 보여 ×가 두 개였다.
SearchField 범위의 `::-webkit-search-cancel-button`을 숨겼다. 타입은 search로 유지하고,
HJM의 현지화 이름·onClear·초점 복귀 경로를 사용한다. 일반 input에는 적용하지 않는다.

## 확인

- Web IAB 1280×720: 예시 생성 → 없는 검색어 → 0건 → 모두 보기로 query가 빈 문자열이 되고 목록 복구.
  DOM activeElement가 검색 input인 것을 확인했다. 수정 전 두 ×, 수정 후 한 ×를 화면으로 대조했다.
- 기존 iPhone 17 Pro / iOS 26.5 / Expo Go·Metro 8084: 예시 생성 → 검색어 `999` → 0건 안내 →
  키보드가 열린 상태에서 모두 보기 → query 비움·예시 초안 복구를 확인했다. Device Hub CUA 금지에 따라
  idb와 simctl로 대체했다. Expo 설정 오버레이가 설명 왼쪽 일부를 가려 그 부분 가독성 판정은 제한된다.
- 양 Showcase typecheck 통과. Web build 및 검색/입력 관련 기존 browser 2파일·8검사 통과.
  기존 act 경고가 있었으며 테스트 실패는 없었다. 경고가 없었다고 보고하지 않는다.

## 미확인

16개 원본 전수 UI, 이 예제의 모든 팔레트·큰 글자·RTL·Android, 실제 VoiceOver/TalkBack,
Safari/Firefox 실측은 남았다. 이번 작업은 기존 API/예제 개선으로 실험 수 16개를 늘리지 않는다.
승격·npm 릴리스·Utilverse 적용은 아직 하지 않았다. 원시 기기 캡처는 기록 후 제거한다.
