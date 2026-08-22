import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type Ref,
  type SetStateAction,
} from "react";

export function classNames(
  ...values: readonly (string | false | null | undefined)[]
): string | undefined {
  const result = values.filter(Boolean).join(" ");
  return result.length > 0 ? result : undefined;
}

export function assignRef<Element>(ref: Ref<Element> | undefined, value: Element | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export function composeRefs<Element>(
  ...refs: readonly (Ref<Element> | undefined)[]
): (value: Element | null) => void {
  return (value) => {
    for (const ref of refs) assignRef(ref, value);
  };
}

type ControllableStateOptions<Value> = Readonly<{
  value?: Value;
  defaultValue: Value;
  onChange?: (value: Value) => void;
}>;

export function useControllableState<Value>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<Value>): readonly [
  Value,
  Dispatch<SetStateAction<Value>>,
] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const setValue: Dispatch<SetStateAction<Value>> = useCallback(
    (next) => {
      const resolved = typeof next === "function"
        ? (next as (previous: Value) => Value)(currentValue)
        : next;
      if (!controlled) setInternalValue(resolved);
      if (!Object.is(resolved, currentValue)) onChange?.(resolved);
    },
    [controlled, currentValue, onChange],
  );

  return [currentValue, setValue] as const;
}

function subscribeWindowResize(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getWindowWidth(): number {
  return window.innerWidth;
}

function getServerWindowWidth(): number {
  return 0;
}

export function useWindowWidth(): number {
  return useSyncExternalStore(
    subscribeWindowResize,
    getWindowWidth,
    getServerWindowWidth,
  );
}

export function useElementWidth<Element extends HTMLElement>(
  externalRef?: Ref<Element>,
): readonly [number | undefined, (node: Element | null) => void] {
  const [node, setNode] = useState<Element | null>(null);
  const [width, setWidth] = useState<number>();
  const ref = useCallback(
    (nextNode: Element | null) => {
      setNode(nextNode);
      assignRef(externalRef, nextNode);
    },
    [externalRef],
  );

  useEffect(() => {
    if (!node) return;
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

  return [width, ref] as const;
}
