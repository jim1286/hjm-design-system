import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createActionSession } from "@hjmds/design-contracts/action-session";
export function useCompositionAction(disabled = false) {
    const available = useRef(true), disabledRef = useRef(disabled);
    disabledRef.current = disabled;
    const [session] = useState(() => createActionSession(null));
    const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
    // Reset detaches responses after unmount, including a keyed change to another entity.
    useEffect(() => { available.current = true; return () => { available.current = false; session.reset(null); }; }, [session]);
    return { session, pending: state.status === "pending", failed: state.status === "error",
        active: state.status === "pending" ? state.value : null,
        run: (key, task) => {
            if (!available.current || disabledRef.current)
                return Promise.resolve({ status: "ignored" });
            return session.run(async () => { await task(); return null; }, { optimisticValue: key });
        } };
}
//# sourceMappingURL=use-composition-action.js.map