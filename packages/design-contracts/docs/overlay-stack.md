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
