import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { validateActions } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
/** Desktop exposes the same actions directly; no hidden swipe-only functionality. */
export function SwipeActions({ children, label, actions, busy, onAction, onError, layoutStyle }) {
    validateActions(actions);
    const pending = useRef(false);
    async function run(action) {
        if (busy || pending.current || action.disabled)
            return;
        pending.current = true;
        try {
            await onAction(action.id);
        }
        catch (error) {
            onError(error);
        }
        finally {
            pending.current = false;
        }
    }
    return _jsxs("div", { role: "group", "aria-label": label, "aria-busy": busy, style: layoutStyle, children: [children, _jsx("div", { style: { display: "flex", gap: "var(--hjm-space-xs)", flexWrap: "wrap" }, children: actions.map(action => _jsx(Button, { tone: action.intent === "danger" ? "danger" : "ghost", disabled: Boolean(busy || action.disabled), onClick: () => void run(action), children: action.label }, action.id)) })] });
}
//# sourceMappingURL=swipe-actions.js.map