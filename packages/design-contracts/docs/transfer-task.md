# 실제 전송 진행과 취소

검토일: 2026-10-15 · Storybook 배포 · Web/Native · npm 1.21.0

Lucian 004·083의 시간 기반 진행 시연을 실제 전송량·작업 종료·취소 신호와 연결하기 위해 기존 Button/Progress를 합성한다.
단순 외부 controlled 진행 표시만 필요하면 Progress를 직접 쓴다. TransferTask는 시작 요청·중복 방지·AbortSignal·실패 재시도가 함께 필요할 때 쓴다.
공개 진입점은 `@hjmds/{react,react-native}/transfer-task`, 계약은 `@hjmds/design-contracts/transfer-task`다.

## 실제 상태

onTransfer는 `{signal,report}`를 받는 실제 비동기 작업이며 실제 작업이 끝날 때 resolve해야 한다.
처음에는 응답 대기(미정 진행)다. report({completed,total:null})은 실제 완료량을 유지하고 전체 크기가 미정임을 표현한다.
전체량을 알게 되면 같은 Progress host에서 determinate로 바꾼다. 전체량을 얻었다고 completed를 늘리지 않는다.
completed는 유한한 비음수이고 한 작업 안에서 줄어들 수 없다. total은 null 또는 양의 유한 값이며 completed 이상이어야 한다.
전송량이 total과 같더라도 Promise가 끝나기 전에는 성공이라고 표시하지 않는다. 업로드 수신·서버 확정 등 제품의 실제 완료 조건을 기다린다.
성공·실패 뒤 늦게 들어온 report와 unmount 뒤 report는 무시한다. 실패 시 마지막 실제 전송량을 보존한다.

## 취소와 실패

취소 버튼은 AbortController를 요청하고 취소 확인 중으로 표시한다. 실제 adapter가 AbortError를 reject해야 취소됨으로 확정한다.
취소 요청과 경합한 실제 resolve는 완료로 표시한다. 요청만으로 취소 성공을 꾸미지 않는다.
onTransfer가 abort를 무시하면 계속 확인 중이다. 제품은 실제 네트워크/작업의 취소를 구현해야 한다.
취소/실패 뒤 새 시작은 새 신호·새 카운터로 진행한다. 재실행의 멱등성·부분 파일/서버 데이터 처리는 제품 소유다.
숨긴/교체한 host는 key로 수명을 끝내며 unmount 때 실제 signal을 abort한다. 다른 작업의 상태를 이 컴포넌트에 재사용하지 않는다.

## 소유권과 검증 경계

문구와 실제 byte/item 등 단위 formatter는 제품에서 공급한다. 컴포넌트는 네트워킹·저장·재시도 타이머를 내장하지 않는다.
Progress의 기존 접근성·로딩 크기 유지 Button 계약을 재사용한다. 실패/취소/완료 문구는 구성 내부 중앙에 배치한다.
Showcase는 기존 영상 asset의 실제 응답 body를 읽는다. Web fetch, Native 기존 Expo의 expo/fetch streaming adapter를 사용한다.
Content-Length가 압축된 크기이면 decoded stream의 분모로 쓰지 않는다. fixture도 가짜 퍼센트·시간 증가를 사용하지 않는다.
응답 byte 수신과 OS 파일 저장·공유·서버 확정은 별개다. Showcase는 파일 저장/제출을 수행했다고 주장하지 않는다.
Native 기기 네트워크 실행과 소비 제품 연결은 별도 확인 대상이다.
