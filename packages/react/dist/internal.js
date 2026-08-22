import { useCallback, useEffect, useState, useSyncExternalStore, } from "react";
export function classNames(...values) {
    const result = values.filter(Boolean).join(" ");
    return result.length > 0 ? result : undefined;
}
export function assignRef(ref, value) {
    if (typeof ref === "function")
        ref(value);
    else if (ref)
        ref.current = value;
}
export function composeRefs(...refs) {
    return (value) => {
        for (const ref of refs)
            assignRef(ref, value);
    };
}
export function useControllableState({ value, defaultValue, onChange, }) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;
    const setValue = useCallback((next) => {
        const resolved = typeof next === "function"
            ? next(currentValue)
            : next;
        if (!controlled)
            setInternalValue(resolved);
        if (!Object.is(resolved, currentValue))
            onChange?.(resolved);
    }, [controlled, currentValue, onChange]);
    return [currentValue, setValue];
}
function subscribeWindowResize(callback) {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
}
function getWindowWidth() {
    return window.innerWidth;
}
function getServerWindowWidth() {
    return 0;
}
export function useWindowWidth() {
    return useSyncExternalStore(subscribeWindowResize, getWindowWidth, getServerWindowWidth);
}
export function useElementWidth(externalRef) {
    const [node, setNode] = useState(null);
    const [width, setWidth] = useState();
    const ref = useCallback((nextNode) => {
        setNode(nextNode);
        assignRef(externalRef, nextNode);
    }, [externalRef]);
    useEffect(() => {
        if (!node)
            return;
        const update = () => setWidth(node.getBoundingClientRect().width);
        update();
        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", update);
            return () => window.removeEventListener("resize", update);
        }
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
    }, [node]);
    return [width, ref];
}
//# sourceMappingURL=internal.js.map