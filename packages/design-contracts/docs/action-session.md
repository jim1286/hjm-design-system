# 공통 실행과 실패 복구

검토일: 2026-10-02 · 상태: 선택적 행동 API, Storybook 배포(2026-10-06 사용자 승인, npm 게시와 별개)

## 문제와 기존 API의 관계

2026-10-02 Atlas 검토와 사용자 요청에서 일반 저장·낙관적 반영의 실패 복구가 앱별로
연결된다는 점을 확인했다. Button은 전달받은 loading 중 실행 차단, AlertDialogSession은
확인창의 비동기 확인·닫기를 이미 소유한다. 이들을 새 버튼·확인창으로 복제하지 않는다.
`createActionSession`은 확인창 밖 작업의 상태만 제공하며 기존 컴포넌트와 합성한다.
AlertDialog.onConfirm에 연결할 때에는 기존 확인창 세션을 우선하고 이중 상태를 만들지 않는다.

## 계약과 기본값

```ts
import { createActionSession } from '@hjmds/design-contracts/action-session';
const save = createActionSession(''); // 제품의 화면 또는 작업 소유자가 한 번 생성
const submitted = draft; // 재시도 중 바뀐 입력을 읽지 않도록 제출 시점의 값을 캡처
await save.run(() => api.save(submitted), { retryable: true });
```

- 상태는 idle → pending → success/error. 서버 어댑터가 resolve하기 전 성공을 표시하지 않는다.
- 같은 세션의 pending 중 새 run/retry는 blocked이며 작업 함수를 호출하지 않는다.
- 실패는 throw 대신 error 결과와 snapshot.error로 전달한다. 오류 문구와 재시도 가능성은 제품이
  정한다. raw exception을 사용자에게 직접 노출하지 않는다.
- retryable 기본값은 false. 재시도가 안전하다고 제품이 명시한 경우에만 실패한 작업 함수를
  다시 호출한다. 서버가 멱등 처리를 지원하면 **동일 제출의 재시도에는 동일 제품 요청 키**를
  캡처해 사용한다. 이 helper의 operationId는 세션 안 응답 순서용 숫자이며 서버 멱등 키가 아니다.
- optimisticValue는 저위험 변경에만 사용한다. 즉시 pending 값으로 보이고, 성공 시 서버가
  반환한 값을 확정한다. 실패하면 직전 확인 값으로 돌아간다. 객체 값은 불변 데이터로 전달한다.
- reset(value)는 세대를 바꿔 이전 응답과 재시도를 무효화한다. 실제 서버 작업을 취소하지 않는다.
  제품은 계정·엔티티 변경 시 필요한 취소/재조회/캐시 무효화를 처리한다. 오래된 작업이 서버에
  반영됐을 가능성이 있으면 이 helper만으로 정합성을 보장하지 않는다.
- 자동 재시도·네트워크·타이머·저장소·전역 싱글턴은 없다. 세션을 엔티티별로 유지한다.
  task 함수를 버리려면 reset을 호출하며 렌더 중 세션을 새로 생성하지 않는다.

## 웹과 앱 연결

React와 React Native 모두 `useSyncExternalStore(session.subscribe, session.getSnapshot,
session.getSnapshot)`로 구독한다. SSR은 요청별 세션을 생성하고 hydration 초기값을 맞춘다.
Button.loading은 pending, 오류 안내는 error에서 제품이 지역화한 문자열로 표시한다.
웹은 status/alert, Native는 플랫폼 접근성 알림을 사용한다. HJM 모션·포커스·busy 처리는
기존 renderer가 계속 맡는다. store는 별도 React 훅·UI 패키지를 요구하지 않는다.

세션을 화면보다 오래 보존해야 하면 제품의 작업 소유자에 둔다. 화면 unmount 시 자동 reset은
진행 중 작업 결과를 버릴 수 있어 기본값으로 넣지 않았다. 서버 캐시나 TanStack Query를 이미
쓰는 앱은 기존 mutation 상태를 유지하고 중복 session을 추가하지 않는다. 이 계약의
중복 방지·오류·복구 원칙을 기존 계층에 연결한다.

## 초안과 실행 취소

초안은 입력 state/제품 저장소의 소유다. 실패 시 지우지 않고 재시도에서는 캡처한 제출 값을
사용한다. 현재보다 오래된 성공 응답으로 사용자가 새로 입력한 초안을 지우지 않는다.
프로세스 종료 복구·로그아웃 정리·암호화·오프라인 outbox는 제품 저장소가 결정한다.

실행 취소는 제품이 제공한 역연산을 run으로 실행해 성공 확인 후 복구한다. 토스트는 액션 진입점,
세션은 진행·실패 상태만 소유한다. 권한·만료·대상 버전·복구 데이터는 제품이 검증한다.
UI를 되돌렸다는 이유로 서버 취소 완료를 선언하거나 금융·영구 삭제에 가짜 Undo를 넣지 않는다.

## 검증 화면과 범위

Web/Native Storybook `배포/구성/피드백과 복구`의 저장과 재시도, 즉시 반영과 복구, 보관과 실행 취소.
각각 기본·어두운 테마·큰 글자 상태. 데모만 350ms 인위 지연과 실패 주입을 제공하며 실제 API나
영속 저장소는 연결하지 않는다. 보관 데모에 자동 만료는 없다. 세 예제는 2026-10-06 사용자 승인으로 `실험/구성/공통 동작`에서 스토리북 배포로 옮겼고, 이는 API 안정화·npm 게시와 별개다.

회귀 검사는 중복 실행 차단, sync throw, 명시적인 재시도 허용, 낙관적 rollback, 새 세대 이후
역순 성공/실패 무시, 구독 해제, 실패한 역연산의 상태 보존을 검증한다. 실기기·소비 앱 채택과는 별개다.

## 패키지 경계와 크기

`./action-session` subpath만 추가하고 root/catalog에 새 컴포넌트를 만들지 않는다. manifest의
새 경로 이유는 위의 일반 작업/확인창 역할 분리다. 초기 ESM 2504 bytes / gzip 889 bytes,
1 module을 측정했고 신규 예산은 2900 / 1050 bytes로 설정했다. 기존 예산은 변경하지 않았다.
