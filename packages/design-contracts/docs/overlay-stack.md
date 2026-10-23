# 명령형 오버레이 (useDialog · useSheet)

`useToast`가 이미 갖고 있던 모양의 나머지 절반이다. 그 옆이 비어 있어서 제품마다 "열림
상태 + 마운트 지점 + 닫힘 완료 신호"를 다시 배선했다 — BurnTok `AppModal`이 `onDismiss`를
직접 만든 이유가 그것이다.

**이 층이 하는 일은 소유권 이전뿐이다.** 열림 상태와 마운트 지점을 provider가 갖고,
호출부는 "열어 줘"와 "닫혔다"만 안다. dismiss 판정·초점·격리는 여전히 Dialog/Sheet
계약이 갖는다 — 여기서 다시 구현하지 않는다.

```tsx
const openDialog = useDialog();
const handle = openDialog({ title: "지울까요", closeLabel: "닫기", children: <p>…</p> });
await handle.closed;   // portal이 사라지고 초점이 복구된 뒤
openSheet({ … });      // 그 다음에 다음 표면을 연다
```

**한 번에 하나만 연다.** 겹쳐 여는 화면은 스택 규칙(어느 것이 위인가, 뒤의 것은 inert인가)이
필요한데 그 판정은 이미 모달 스택이 갖고 있다. 명령형 API가 우회해 두 벌을 만들면
"닫았는데 아래 것이 안 살아난다"가 생긴다. 후속 오버레이는 `closed` 뒤에 여는 것이
계약된 순서다.

**타이머가 사라진다.** `closed`는 Dialog/Sheet의 `onDismissComplete`에서 resolve되므로
제품이 0ms 타이머로 정리 시점을 추측할 필요가 없다.

## 결과를 돌려주는 확인 대기열 — `AlertDialogQueueProvider` (2026-10-23, 개발 소스·미게시)

번뚝 웹 `components/ui/AppDialog.tsx`(321줄)와 앱 `AppDialog.tsx`(293줄)가 AlertDialog 둘레에 같은 것을 각자 만들었다.
결과 Promise, async confirm(처리 중 유지·실패 시 열린 채 오류), FIFO 대기열, 포커스 복귀, route scope, blocking 우선순위다.
위의 `useDialog`/`useSheet`는 Dialog·Sheet만 받고 두 번째 열기를 거부하며 RN에는 이 층이 없었다. 확인 질문은 다른 확인이 떠 있을 때
도착하는 것이 정상이므로 "한 번에 하나"를 거부가 아니라 **순서 대기**로 지키는 별도 공급자를 둔다.

| 소유 | 위치 |
| --- | --- |
| 순서·결과 1회 확정·scope 정리 | contracts `createAlertDialogQueue`(`components/alert-dialog`). `enqueue → Promise<AlertDialogResult>`, `settle`은 맨 앞 항목만, `retainScope`가 다른 scope 항목을 `interrupted`로, `setActive(false)`가 전부와 이후 요청을 `interrupted`로 끝낸다 |
| 한 대화상자의 확인·처리 중·실패 | 기존 `createAlertDialogSession`(AlertDialog). `request.onConfirm`이 Promise면 처리 중 닫힘을 막고, 거부되면 열린 채 오류를 보이며 Promise는 성공할 때까지 기다린다 |
| 화면 표시 | Web·Native `AlertDialogQueueProvider` + `useAlertDialogQueue().open(request, options?)` (`/alert-dialog-queue`) |

- **결과:** Web은 AlertDialog `onOpenChange(false, reason)`의 사유로(`confirm` → confirmed, 나머지 → cancelled 사유), Native는 native 닫힘 뒤 `onResult`로 확정한다.
  그래서 Native는 앞 대화상자가 사라진 뒤에 다음 대화상자를 띄운다.
- **scope:** 공급자 `scope`(보통 route)가 바뀌면 다른 scope의 질문은 화면에서 내려가고 `interrupted`가 된다. `open`은 호출 컴포넌트가 렌더된 scope에 묶이므로
  떠난 화면의 늦은 콜백도 다음 화면에 질문을 띄우지 못한다. 공급자가 사라지면 남은 질문과 이후 요청이 모두 `interrupted`다.
- **포커스(Web):** 질문 묶음이 시작될 때 초점이 있던 요소를 기억해 묶음의 모든 대화상자가 그곳으로 돌려준다. 두 번째 대화상자가 지워진 첫 대화상자의 버튼으로 돌아가지 않는다.
  결과는 renderer 갱신보다 먼저 resolve되므로 `await open()` 바로 뒤에 다시 켠 trigger에 초점이 돌아간다. 대화상자가 떠 있는 동안 배경은 이미 inert이므로
  호출부가 trigger를 따로 disabled로 두지 않는다(번뚝은 disabled trigger 때문에 0ms 뒤 초점 재시도를 붙였다). 작업까지 기다릴 때는 `request.onConfirm`에 둔다.
- **우선순위(Web):** 공급자 `modalPriority`(기본 0)로 대기열 대화상자의 층을 정한다. 필수 gate는 더 높은 `modalPriority`의 모달로 두면 위에서 입력을 받고,
  대기열 대화상자는 그 아래에서 inert로 기다린다. 제품 DOM 감시로 대기열을 멈추지 않는다. Native AlertDialog에는 우선순위 축이 없어 제공하지 않는다.
- **StrictMode(Web AlertDialog 수정):** 열린 채 마운트한 AlertDialog는 StrictMode의 모의 unmount가 render 중 만든 세션을 interrupt해 확인·취소가 되지 않았다.
  재마운트 때 interrupt된 세션을 새로 만든다. 번뚝은 이를 피하려고 열기를 한 task 미뤘다.
- 아이콘(Web `icon`)·크기(`size`)는 요청별 `options`, Native 초점 복귀는 `options.returnFocusRef`로 넘긴다. 문구·행동은 `AlertDialogRequest`가 그대로 소유한다.

