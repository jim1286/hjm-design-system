# AppProvider — 새 컴포넌트를 만들지 않는다

## 문제로 제기된 것

antd `App`은 `message`/`notification`/`Modal`을 **명령형 훅**(`App.useApp()`)으로
어디서든 부를 수 있게 context를 심어 주는 컴포넌트다 — 정적 `Modal.confirm()` 같은
호출이 실제로는 테마·locale context에 접근할 수 있도록 antd가 마련한 배선이다.

## 판정: 런타임을 걷어내면 아무것도 남지 않는다

`App`이 명령형으로 여는 세 가지는 이미 전부 다른 HJM 계약에 배정돼 있다.

| antd `App`이 여는 것 | HJM 대응 | 상태 |
| --- | --- | --- |
| `message` | `Toast` | 이미 계약, `beta` |
| `notification` | `Toast`(`docs/notification.md`가 이미 alias로 흡수) | 이미 계약 |
| `Modal.confirm`/`Modal.info` 등 | `Dialog`/`AlertDialog`(`decomposed`, crosswalk 확정) | 이미 계약 |

즉 `message`/`notification`/`modal`이 **무엇을 보여주는지**는 이미 다 계약돼 있다.
`App`이 실제로 더하는 것은 오직 하나 — "이미 계약된 그 표면을, 컴포넌트 트리 아무 곳에서나
`useApp()`으로 명령형 호출할 수 있게 context에 인스턴스를 심어 둔다"는 **배선**이다. 그건
정의상 React Context + 특정 프레임워크의 훅 API이고, 이 패키지는 React도 RN도 import하지
않는다(`docs/architecture.md`). 새로운 상태 축도, 새로운 접근성 개념도, 새로운 시각
recipe도 없다 — Toast/Dialog/AlertDialog가 이미 가진 것 이상으로 계약할 것이 없다.

`DesignSystemProvider`(`docs/design-system-provider.md`)와 비교하면 차이가 분명하다:
그쪽은 런타임을 걷어내도 "테마·방향·배율·모션 선호"라는 **값 타입**이 남았다. `App`은
걷어내면 **값 타입조차 남지 않는다** — 남는 셋(Toast/Dialog/AlertDialog)이 이미 각자의
파일에서 완결된 계약이기 때문이다.

## 결론

`src/app-provider.ts`, `test/app-provider.test.ts`는 만들지 않는다. 제품이 "어디서든
Toast/AlertDialog를 부르고 싶다"는 요구를 실제로 갖게 되면, 그건 새 HJM 계약이 아니라
**각 제품 renderer가 자기 프레임워크(React Context, RN 동등물)로 만드는 명령형 wrapper**
다 — Toast의 `createToastStore`/`createToastSession`이 이미 큐·타이머·중복 처리를
소유하고 있으므로 renderer는 그 세션에 접근하는 hook만 얹으면 된다.

## 판정이 뒤집힐 조건

Toast/Dialog/AlertDialog 중 무엇으로도 표현할 수 없는 넷째 표면이 `App`에 새로 필요하다는
것이 확인되면(예: 화면 밖 push나 시스템 알림함처럼 `docs/notification.md`가 이미 배제
조건으로 남긴 것), 그때는 그 표면부터 별도로 계약하고 `App`의 배선 문제는 그 이후에
다시 본다.

## 배선 명세 (리드 참고)

catalog의 `{ name: "AppProvider", category: "provider", platform: "adaptive", status:
"planned", aliases: ["App"] }`(`src/catalog.ts:124`)는 그대로 둔다 — recipe/behavior가
없었고 지금도 없다. crosswalk의 `App → AppProvider`(`adapted`)도 바꿀 필요 없다.
