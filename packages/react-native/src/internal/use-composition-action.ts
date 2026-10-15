import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";

export function useCompositionAction(disabled = false) {
  const available = useRef(true), disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const [session] = useState(() => createActionSession<string | null>(null));
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => { available.current = true; return () => { available.current = false; session.reset(null); }; }, [session]);
  return { session, pending: state.status === "pending", failed: state.status === "error",
    active: state.status === "pending" ? state.value : null,
    run: (key: string, task: () => void | Promise<void>) => {
      if (!available.current || disabledRef.current) return Promise.resolve({ status: "ignored" as const });
      return session.run(async () => { await task(); return null; }, { optimisticValue: key });
    } };
}
