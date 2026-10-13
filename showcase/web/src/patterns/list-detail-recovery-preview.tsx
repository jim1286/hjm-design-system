import { useEffect, useState } from "react";
import { ListDetailScreen } from "@hjmds/react/screen-flows";
import { Button } from "@hjmds/react/actions";
import { TextField } from "@hjmds/react/forms";
import { ListRow } from "@hjmds/react/display";
import { Stack, Text } from "@hjmds/react/layout";
import { useDemoAction } from "./action-recovery-previews";

/** The list owns its filter; detail requests never replace that mounted pane. */
export function ListDetailRecoveryPreview() {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const { session, state, request, failureArmed, toggleFailure } = useDemoAction("");
  useEffect(() => () => session.reset(""), [session]);
  const load = () => { setOpen(true); void session.run(() => request("상세 내용을 불러왔어요."), { retryable: true }); };
  const close = () => { session.reset(""); setOpen(false); };
  return <ListDetailScreen title="목록을 유지하는 상세 복구"
    notice={<Text>실제 서버 없이 지연과 실패를 재현해요. 목록에 입력한 값은 상세에서 돌아와도 남아요.</Text>}
    list={<Stack gap="md">
      <TextField label="목록 메모" value={filter} onValueChange={setFilter}/>
      <Button tone="secondary" selected={failureArmed} onClick={toggleFailure}>다음 상세 조회 실패시키기</Button>
      <ListRow title="산책 기록" description="상세를 열어 보세요" onClick={load}/>
    </Stack>}
    back={{ label: "목록으로", onAction: close }}
    {...(open ? { detail: {
      title: "산책 기록",
      state: state.status === "error" ? { kind: "error" as const, title: "상세를 불러오지 못했어요" }
        : state.status === "pending" ? { kind: "loading" as const, title: "상세를 불러오는 중" } : { kind: "ready" as const },
      stateAction: state.status === "error" ? <Button tone="secondary" onClick={() => { void session.retry(); }}>상세 다시 불러오기</Button> : null,
      content: <Text>{state.value}</Text>,
    } } : {})}
  />;
}
