# 1.4 제품 채택 가이드

2026-09-23 소비 감사에서 기존 HJM 대신 같은 설정·로그인·Sheet를 제품마다 조립하는 사례를
확인했다. 새 도메인 컴포넌트를 추가하는 대신 실제 우회를 없앨 수 있는 API와 조합을 보완한다.

## 로그인

`AuthScreenLayout`의 hero/main/footer를 제품의 기존 내용으로 채운다. 로고, 제공자 목록,
심사자 폼 노출 조건, 동의와 정책 링크는 제품 소유다. 제공자 로고를 HJM 패키지로 옮기지 않는다.
Native의 외부 배치는 `layoutStyle`, UI 식별은 `testID`를 사용한다. 키보드가 열린 입력 폼에서도
버튼 터치를 받으며 iOS의 키보드 스크롤 여백을 제공한다. 긴 내용은 축소하지 않고 스크롤한다.
부모도 keyboard avoidance를 한다면 같은 clearance를 중복 적용하지 않도록 소비 화면에서 검증한다.
Web의 상위 앱 셸에 이미 main landmark가 있으면 `as="section"`을 사용한다. 이 옵션은
다에리 WebShell의 main 안에 로그인 레이아웃을 채택할 때 중첩 main을 피하기 위해 추가했다.

## 설정 한 행

`Switch presentation="row"`에 label/description/checked/onCheckedChange를 전달하면 행 전체가
한 개의 switch다. 다른 Pressable이나 button으로 감싸지 않는다. 표시 이름과 설명은 접근성에서도
분리하고, Web의 기존 aria-describedby가 있으면 설명을 함께 연결한다. 공통 large-text 기준(160%)에서는
설명 아래로 track을 내려 좁은 텍스트 열을 만들지 않는다. DOM의 순서 차이는 키보드 tab stop을
추가하지 않는다.

Web의 기본은 기존 inline, Native의 기본은 기존 row다. 제품 간 같은 설정 화면은 presentation을
명시한다. 기존 ListRow의 trailing control만 필요한 경우 `labelVisibility="hidden"`을 유지할 수 있다.
그 경우 ListRow에는 별도 onPress를 두지 않는다.

## 상태 화면

상태를 하나의 error boolean으로 뭉치지 않는다. 아래 조합은 제품 adapter에 두며 데이터 조회나
재시도 로직을 HJM에 넣지 않는다.

| 상태 | 조합 | 제품 책임 |
| --- | --- | --- |
| 최초 로딩 | Skeleton + 기다리는 대상 설명 | 실제 화면 높이/형태, 중복 announcement 방지 |
| 빈 결과 | EmptyState + 다음 행동 | 검색 0건과 데이터 미생성을 구분 |
| 구역 실패 | Notice + 재시도 | 다른 정상 구역은 유지 |
| 이전 데이터 있음 | 기존 콘텐츠 + Notice | stale 배지, 새로고침, 중복 재시도 방지 |
| 전체 흐름 종료 | Result | 다음 목적지와 결과 문구 |

## 호환성과 채택 검증

세 패키지의 exact version, dependency/lock/contract/catalog를 함께 갱신한다. 기존 beta의
status를 자동으로 stable로 바꾸지 않는다. 실제 쓰는 beta는 소비 ADR/evidence에 연결한다.
Native raw style API는 아직 호환 지원이며 [소비 정책](consumer-policy.md)의 다음 major 절차를 따른다.

Sheet 이관은 [입력 화면 계약](sheet.md)을 따른다. 각 제품은 typecheck/build/관련 동작 테스트와
실제 화면 검증을 구별해 기록한다. 패키지 테스트 통과가 소비자·배포·기기 완료를 뜻하지 않는다.
