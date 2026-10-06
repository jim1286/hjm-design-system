# 문서·파일 구성 실험 계획

검토일: 2026-10-07. 상태: 후보, 공개 API·Storybook 미구현. 현재 16개 실험 집계에 포함하지 않는다.
근거는 [원본 대조](../qa/2026-10-07-file-reference.md). 단순 다운로드 링크부터 큰 미리보기와
독립 행동까지 역할이 달라 기존 UploadItem의 성공 상태로 표시하는 대응을 폐기했다.

## 공통화할 범위

- 문서 이름과 제품이 포맷한 형식·크기·설명. URL 확장자로 형식이나 파일명을 추측하지 않는다.
- 선택적 미리보기 host: 없음/불러오는 중/표시됨/실패를 구분. 그림 실패가 문서 저장을 막는다는
  정책은 기본으로 넣지 않는다. 외부 문서 내용이나 파일 path를 HJM이 읽지 않는다.
- 미리보기 열기, 다운로드/저장, 더 보기의 독립 대상. 카드 전체 버튼 안에 다른 버튼을 중첩하지 않는다.
- pending·실패·재시도 표시와 접근성 이름/초점 유지. 영수증·권한·파일 읽기·전송·공유는 제품 host.
- 긴 파일명, 형식/크기/설명의 줄바꿈, 축소 폭과 큰 글자, 서로 다른 제품 팔레트를 양 플랫폼에 제공.

## 기존 API와의 경계

| 기존 API | 재사용 | 추가 검토 |
| --- | --- | --- |
| Card | media/title/description/actions 슬롯과 레이아웃 | 파일명을 heading으로 만드는 것이 목록 문맥에 맞는지 확인 |
| Link | Web href/download, Native onNavigate | 저장 성공·native 공유 완료로 해석하지 않음 |
| Button/IconButton | 독립 실행·pending·이름·최소 대상 | 같은 문서의 동시 요청과 새 파일로 바뀐 뒤 이전 callback 무효화 |
| Asset | 선택적 미리보기 프레임 | 문서 metadata나 저장 엔진으로 사용하지 않음 |
| Notice | 실패 설명과 재시도 | preview 오류와 save 오류의 메시지/대상을 혼합하지 않음 |
| UploadItem | 업로드가 필요한 별도 흐름에서만 사용 | 완성된 문서를 uploaded라고 표시하지 않음 |

기존 공개 슬롯을 합성한 구성으로 먼저 설계한다. 새 wrapper가 필요한 이유는 파일 metadata와
독립 행동/상태 배치의 반복을 없애기 위해서며 별도 네트워크/다운로드 엔진을 만들지 않는다.
descriptor의 asset identity, 상태, callback 수명은 기존 action-session 계약과 대조한 후 정한다.

## 구현·승격 확인 조건

1. contracts/Web/Native 타입과 subpath, 사용 지침, 양 Storybook 실험을 같은 변경에서 제공한다.
2. 기본/다크/큰 글자, 미리보기 없음·로딩·실패·재시도, 저장 실패·재시도·취소를 실제 동작으로 구성한다.
3. 자체 fixture로 Web 실제 다운로드를 확인한다. anchor 시작과 파일 저장 완료의 증거를 구분한다.
4. Native 저장/공유는 기존 개발 앱의 사용 가능한 host로 검증한다. 합성 Promise 통과를 OS 저장으로 세지 않는다.
5. 문서 A→B 뒤 A 완료가 B의 상태·초점을 바꾸지 않는 회귀, 중복 누름, unmount, 실패 후 다시 실행을 확인한다.
6. 긴 파일명/RTL/키보드/스크린리더와 제품 palette·모션 감소를 검증하고 보고서에 범위와 남은 항목을 남긴다.

외부 원본의 no-op 메뉴나 placeholder # 링크는 HJM 실험에서 그대로 흉내 내지 않는다.
Brighton 두 원본이 현재 열리지 않는다는 사실은 전체 원본 조사 완료나 이 후보의 검증 면제를 뜻하지 않는다.

## 내부 계약 구현

2026-10-07 `b680b19` 이후 `src/document-resource.ts`에 순수 resolver를 추가했다.
공개 subpath/renderer/스토리는 아직 없다. preview none/loading/ready/error와 save
idle/pending/started/saved/cancelled/error를 분리한다. 오류 retryable은 명시해야 하며
일반 저장 버튼으로 retryable=false를 우회하지 않는다. metadata는 제품 문자열을 보존한다.

수명 제어는 기존 createActionSession의 run/reset을 재사용하며 새 비동기 엔진은 만들지 않는다.
파일 교체·unmount에서 reset으로 이전 결과를 분리하고, OS 작업의 실제 취소 여부는 host가 소유한다.
재실행 가능 여부·결과 확인은 제품 정책이다. renderer는 action session의 success만 보고 저장
성공을 표시하면 안 되며 host 결과의 started/saved/cancelled 구분을 사용해야 한다.

신규 resolver/수명 대조 8개와 기존 action-session 9개, contracts typecheck/build 통과.
양 renderer·실제 다운로드/native 저장·UI 검증은 남아 있다. 실험 수는 16개로 유지한다.

## 내부 renderer 연결

2026-10-07 후속: contracts의 `document-resource` subpath를 열고 양 renderer 내부 후보를 추가했다.
공개 렌더러 export와 스토리는 아직 없다. Surface/Stack/Text/Button을 합성하며 파일 이름은
자동 heading으로 만들지 않는다. 버튼은 세로로 배치해 긴 문구가 다른 행동을 밀어내지 않도록 한다.
미리보기·저장·메뉴는 독립 대상이고 저장 버튼은 pending/error 전환에도 같은 위치에 유지한다.

제품은 descriptor와 action callbacks를 공급한다. pending은 외부 action-session 상태에 연결해야
하며 컴포넌트가 네트워크를 호출하거나 단순 callback 반환을 저장 receipt로 추론하지 않는다.
오류 재시도를 표시하려면 callback도 있어야 한다. labels와 callback 유효성은 공통 resolver가 검사한다.
계약 subpath는 한 모듈·I/O 없음으로 budget에 등록했고 root export는 추가하지 않았다.

다음 단계는 양 renderer 공개 props/진입점·사용 지침·실제 action-session host 예제와 Storybook이다.
Native iOS 상태 알림, 오류 복구 초점, 전체 theme/큰 글자 실기기·OS 저장 검증도 남는다.
