# Notification — 별도 컴포넌트를 만들지 않는다

**문제로 제기된 것.** Ant Design은 `message`(Toast)와 `notification`을 지속 시간과
정보량으로 가릅니다 — `message`는 한 줄, 짧게, 화면 중앙; `notification`은 제목+본문
두 층, 모서리에 여러 개 쌓임, 기본적으로 더 오래 남거나 닫을 때까지 유지됩니다.

**판정: 이 구분은 HJM에서 성립하지 않는다.** `src/toast.ts`와 `docs/toast.md`를 정독한
결과, antd가 두 컴포넌트로 나눈 모든 축이 이미 `Toast` 하나의 **설정 값**으로 존재합니다.
새 상태 축도, 새 접근성 개념도 필요하지 않습니다.

| antd가 가르는 축 | antd `message` | antd `notification` | HJM `Toast`의 같은 축 |
| --- | --- | --- | --- |
| 정보 층 | 한 줄 | 제목 + 본문 | `ToastDescriptor.title?` + `description`(이미 두 층) |
| 지속 시간 | 짧음, 자동 닫힘 | 길거나 수동 닫힘 | `durationMs: number \| null` — `null`이 이미 수동 닫힘 |
| 동시 개수 | 보통 1개 | 여러 개 모서리에 쌓임 | `ToastStoreOptions.maxVisible` — 1보다 크게 설정하면 여러 개 |
| 위치 | 화면 상/하단 중앙 | 모서리(우상단 등) | `docs/toast.md`의 `top-start\|top-end\|bottom-start\|bottom-end` placement |
| 긴급도 | 낮음 | 상대적으로 높음 | `priority: normal \| high` |

즉 "notification처럼 보이는 Toast"는 `createToastStore({ maxVisible: 3, ... })` +
`durationMs: null` + 모서리 placement + `priority: "high"` 조합이며, 이는 **제품이
Toast를 구성하는 방식**이지 새로운 platform-neutral 계약이 아닙니다. 이 저장소는
`Radio`(`selectionControlRecipe`), `TextArea`(`fieldRecipe`)처럼 antd 목록의 한 항목이
이미 있는 recipe/behavior를 재사용하고 새 recipe를 얻지 못하는 사례를 이미 갖고
있습니다 — Notification도 같은 자리입니다.

**성립하지 않는다고 판단한 근거.**

1. 새 상태 축이 없습니다. `idle→visible→closing→closed`, pause reason, exact-once
   dismiss 중 어느 것도 "notification이라서 다르게" 필요하지 않습니다.
2. 새 접근성 개념이 없습니다. `normal`/`high` announcement priority가 이미 긴급도
   차이를 담습니다.
3. 측정된 제품 요구가 없습니다. 로드맵 어디에도 "Toast로는 안 되고 별도 알림이
   필요했다"는 vertical slice 기록이 없습니다. 이 저장소는 측정되지 않은 표면을
   미리 만들지 않습니다(로드맵 「무엇을 흡수하는가」 원칙).

**만들지 않은 것.** `src/notification.ts`, `test/notification.test.ts`는 없습니다. 새
계약이 없는데 파일만 만들면 다음 사람이 "Toast와 뭐가 다른가"를 또 물어야 하는 빈
추상화가 됩니다.

## catalog 배선 명세 (리드 적용)

crosswalk(`component-references.ts:117`, `Notification → direct`)는 antd 범위 추적용
그대로 둡니다. catalog 항목은 새 recipe를 만들지 않고 기존 Toast 계약을 가리키는 쪽을
권합니다.

```ts
{ name: "Notification", category: "feedback", platform: "adaptive", status: "planned", recipe: "toastRecipe", behavior: "toast" }
```

`planned → beta` 승격은 이 recipe/behavior 재사용을 그대로 유지한 채, 실제 제품이
`maxVisible > 1` + 모서리 placement + persistent duration 조합을 notification 용도로
쓰는 vertical slice가 나온 뒤 결정합니다. 만약 그 슬라이스에서 Toast로 표현할 수 없는
요구(예: 화면 밖 push 발표, 별도 알림함 이력)가 나오면 그때는 이 문서를 갱신하고 새
계약을 여는 것이 맞습니다 — 지금은 그 증거가 없습니다.
