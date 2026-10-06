# QA 리포트 — 이미지 전후 비교와 통합 검사

## 판정·대상

부분 확인. 2026-10-07, Codex. main b89a9c6 위 이미지 fixture·RTL 라벨 수정과 양쪽 회귀 검사.
슬라이더 값만 바뀌는 상태를 이미지 비교 성공으로 오인하지 않고 실제 그림을 확인했다.
승격·npm 게시·Utilverse 채택은 미실행이다.

## 환경

Web IAB localhost:6006, 390×844 dark/RTL/textScale2. Native 기존 iPhone17Pro/iOS26.5,
Expo Go57.0.9/localhost:8084 light. idb·simctl 대체 도구이며 직접 Device Hub 창·실물 Release
검증이 아니다. 브라우저 세부 버전 미확인. 외부 API/계정 없는 자체 생성 이미지 fixture.

## 수정 전후와 재현

### Native 이미지 로딩 실패

기본 실험에서 슬라이더를50→90%로 움직였다. AX 값은 바뀌었지만 캡처에는 실제 그림 대신
오류 기호가 표시됐다. 기본 Native Image host가 기존 SVG data URI를 디코딩하지 못했다.
`generate-comparison-fixtures.py`로 동일640×360 좌표·산·해·색상의 PNG를 생성했다.
양쪽은 동일 fixture를 사용하며 이미지를 잘라서 늘이거나 서로 다른 그림으로 대체하지 않는다.
PNG 적용 후0%의 보정 후 전체 그림,100% 값과50%의 동일 산 윤곽·다른 하늘색을 확인했다.
그림 생성 스크립트는 재사용 도구로 보존한다.

### RTL 캡션과 물리 좌표 불일치

Web dark/RTL/textScale2/390px에서 이미지 before는 물리적 왼쪽인데 위 라벨은 오른쪽에
표시됐다. 양 renderer의 캡션 행을 LTR 물리 순서로 고정하고 Web 각 문구는 dir=auto로
쓰기 방향을 유지했다. 슬라이더의 기존 RTL 조작은 변경하지 않았다.
수정 후50% 화면에서 왼쪽 '보정 전'/오른쪽 '보정 후'와 그림이 일치했다.

## 확인 결과

| 조건 | 결과 |
| --- | --- |
| Native 가로 드래그 |50→90% 값 변화; SVG 시점 그림 실패는 별도 실패로 기록 |
| Native PNG 적용 | 실제 그림 로드,0/100% 제어,50% 경계에서 좌표 일치 |
| Web PNG RTL End |100%, 두 이미지 naturalWidth640/renderedWidth358, 가로 overflow 없음 |
| Web RTL 라벨 수정 |390px dark/큰 글자에서 물리 좌표와 캡션 일치 |
| Web 회귀 | RTL 캡션 좌우 위치·각 문구 쓰기 방향 검사 추가 |
| Native 회귀 | RTL provider에서 캡션 행 LTR 및 기존 크기/slider 계약 유지 |

## 자동 검사

Node24.20.0/pnpm11.18.0. 첫 pnpm ci:check는 exit0으로 완료:
contracts960, Web node278/browser1092, Native1190, Showcase Native18/Web43,
renderer graph·workspace·evidence·docs·governance·API map·usage·storybook,
Web production build와 static103 canonical/13 navigation 통과.
이 실행은 b89a9c6에서 시작했고 PNG fixture 수정은 Showcase 검사 전에 반영됐다.
그 뒤 발견한 RTL runtime 수정까지 포괄하는 결과로 쓰지 않는다.

RTL 수정 집중 검사는 Web6/Native4 통과, 전체 package build 통과.
최종 RTL 수정과 정상 이미지 테스트 fixture의 두 번째 pnpm ci:check도 exit0으로 완료했다.
contracts960, Web node278/browser1093, Native1190, Showcase Native18/Web43 및
전체 정적·번들·빌드 검사를 통과했다. 완료 뒤 IAB에서 Home0%/End100%를 다시 조작했고,
390×844 dark/RTL/textScale2에서 PNG와 왼쪽 보정 전/오른쪽 보정 후 라벨을 확인했다.

## 미확인 범위

두 제품 팔레트, Native RTL/다크/큰 글자·세로 scroll host와 제스처 충돌·VoiceOver,
실제 이미지 서버 지연/실패 조합, Android·실물 성능·전체 상태 모아보기는 남았다.
오류 fallback이 관찰됐다는 사실만으로 실패 안내의 전체 접근성을 통과시키지 않는다.

## 보관

완료된 원시 검사 로그와 수정 전·후 Native 캡처는 위 결과 보존 후 제거했다. 생성기와 PNG data URI,
회귀 검사·공개 계약은 유지한다. 실행 중 로그와 다른 세션 산출물은 보존한다.
