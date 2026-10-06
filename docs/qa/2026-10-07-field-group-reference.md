# 관련 입력 묶음 구현·검증

검토일: 2026-10-07. [원본 조사와 계약 판단](../plans/field-group-experiment.md).

## 변경

FieldGroup을 contracts/Web/Native의 `field-group` subpath로 제공한다. 루트 export는 늘리지 않았다.
양 Storybook `실험/구성/입력과 작성/관련 입력 묶음`과 사용 지침을 추가했다. 16번째 실험이며 승격은 아니다.
Form 제출 엔진을 중첩하지 않고 기존 TextField를 renderField로 연결한다. 도움말·개별 오류와 그룹 오류를
별도 scope로 유지한다. guardChange는 현재 commit된 잠금·필드 존재를 확인하고 unmount 뒤 차단한다.

## 자동 검사

- Contracts: 기존 그룹 resolver 6개 + package boundaries 4개 통과.
- Web: browser 3개 통과. 두 그룹의 ID 충돌·도움말 연결·오류 하나, 재정렬 중 노드/초점 보존,
  잠금/해제와 오래된 callback, disabled 입력 Tab 제외, 320px/2배 글자 × light/dark × LTR/RTL 검사.
- Native: renderer 2개 + package 2개 통과. 실제 TextInput props의 그룹 이름·복합 hint·개별 비활성,
  잠금·필드 제거·unmount 뒤 callback 차단 검사. 모의 renderer이며 기기 낭독 증거는 아니다.
- 양 renderer 및 양 Showcase typecheck, renderer build, usage/Storybook/API 대응표 생성 완료.
- import graph: Web 1개 로컬 모듈(2,675B raw/1,051B gzip), Native 5개(25,281B/6,913B).
  Native는 Text/primitives·provider·두 style helper만 도달한다. root barrel·optional engine 없음.

## 실제 화면과 흐름

Web IAB: 1280×720 기본 화면에서 예시 주소·도시 입력 → 실패 상태 → 잠금 → 해제 → 재정렬.
값을 유지하고 국가만 계속 비활성인 것을 확인했다. 390×844, dark/RTL/2배 글자에서 빈 입력
실패 안내 한 번·해당 입력 테두리·버튼 줄바꿈·전체 페이지를 확인했다. 넓이 잘림은 관찰하지 않았다.

iPhone 17 Pro / iOS 26.5, 기존 Expo Go·Metro 8084를 사용했다. Device Hub CUA 금지에 따라
idb 접근성/입력과 simctl 캡처로 대체했으며 Device Hub 검증으로 보고하지 않는다.
기본 light/1배에서 빈 입력 확인 → 도로명 `12`·도시 `34` 입력 → 합성 저장 실패 후 초안 유지,
키보드가 열린 채 스크롤하여 잠금 버튼 접근 → 잠금 시 키보드 종료 → 해제 → 재정렬을 확인했다.
AX에 세 입력이 개별 노드로 나타나며 그룹 이름이 각각 포함된다. 화면의 Expo 설정 오버레이가
일부 도움말/첫 입력 왼쪽을 가렸으므로 그 부분의 가독성 판정은 제한된다.

## 남은 검증

Native dark/RTL/큰 글자·Android·VoiceOver/TalkBack 실제 낭독, 서로 다른 제품 팔레트,
TextField 외 Select/Checkbox/custom host 연결, 전체 조합·릴리스 CI·소비 앱 적용이 남았다.
사이트 전수조사 완료나 전체 기능 동등성을 주장하지 않는다. 원시 캡처는 이 기록 후 제거한다.

## 같은 ID 재추가 회귀 수정

2026-10-07 `582badd` 뒤 후속 검증. 수정 전 공통 회귀에서 필드 제거→같은 ID 재추가 후
이전 callback이 실행돼 `['stale', 'current']`가 기록됐다. 기대값은 새 필드의 `['current']`뿐이다.
필드별 identity를 보존하되 제거 commit에서 폐기하고, 새로운 render binding은 commit 전까지
비활성으로 둔다. effect cleanup은 별도 suspend로 차단해 Strict Mode replay를 필드 제거로
오인하지 않는다. 그룹 잠금 해제와 재정렬은 기존 필드 identity를 유지한다.

수정 후 contracts 7개, Web 실제 browser 회귀 4개, Native 모의 renderer 2개 통과.
양 renderer Strict Mode에서 재추가 후 새 host 입력은 실행되고 이전 callback은 차단됐다.
Native는 새 callback도 unmount 뒤 차단됨을 검사했다. 세 package typecheck/build,
문서 링크 566개·usage·renderer graph budget/platform boundary 검사 통과.
이번 회귀 수정은 자동 검사이며 Native 기기 화면·낭독을 새로 검증한 결과가 아니다.
