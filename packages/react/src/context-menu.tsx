import {
  resolveContextMenuAnchor,
  type ContextMenuAnchor,
  type ContextMenuItemDescriptor,
  type ContextMenuOpenReason,
} from "@hjmds/design-contracts/components/context-menu";
import { menuRecipe } from "@hjmds/design-contracts/recipes";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { classNames } from "./internal.js";
import { HjmPortal, getModalLayer } from "./modal.js";

export type ContextMenuProps<Key extends string = string> = Readonly<{
  /** The region the menu belongs to; right-click and long-press are bound here. */
  children: ReactNode;
  items: readonly ContextMenuItemDescriptor<Key>[];
  accessibilityLabel: string;
  onAction: (id: Key) => void;
  className?: string;
}>;

const longPressDelay = 500;

export function ContextMenu<Key extends string = string>({
  children,
  items,
  accessibilityLabel,
  onAction,
  className,
}: ContextMenuProps<Key>) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<ContextMenuAnchor | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const longPress = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const typeahead = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enabled = items.filter((item) => !item.disabled);

  const open = useCallback((reason: ContextMenuOpenReason, pointer: ContextMenuAnchor | null) => {
    const rect = hostRef.current?.getBoundingClientRect() ?? null;
    setAnchor(resolveContextMenuAnchor(
      reason,
      pointer,
      rect === null ? null : { left: rect.left, bottom: rect.bottom },
    ));
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (anchor === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAnchor(null);
        // Focus goes back where the menu was opened from, not to the body.
        hostRef.current?.focus();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((previous) => {
          const next = event.key === "ArrowDown" ? previous + 1 : previous - 1;
          return (next + enabled.length) % Math.max(enabled.length, 1);
        });
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? 0 : Math.max(enabled.length - 1, 0));
        return;
      }
      if (event.key.length === 1 && event.key !== " ") {
        // Typeahead matches `textValue`, not the rendered label: a label may hold
        // markup or a formatted number that nobody would type.
        const query = (typeahead.current += event.key.toLowerCase());
        clearTimeout(typeaheadTimer.current);
        typeaheadTimer.current = setTimeout(() => { typeahead.current = ""; }, 700);
        const match = enabled.findIndex((item) => item.textValue.toLowerCase().startsWith(query));
        if (match >= 0) setActiveIndex(match);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const item = enabled[activeIndex];
        if (item) { onAction(item.id as Key); setAnchor(null); hostRef.current?.focus(); }
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !document.querySelector(".hjm-context-menu")?.contains(event.target)) {
        setAnchor(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [anchor, activeIndex, enabled, onAction]);

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      className={classNames("hjm-context-menu-host", className)}
      onContextMenu={(event) => {
        event.preventDefault();
        open("pointer", { x: event.clientX, y: event.clientY });
      }}
      onKeyDown={(event) => {
        // Shift+F10 and the Menu key are how a keyboard opens a context menu;
        // without them the feature does not exist without a pointer.
        if ((event.shiftKey && event.key === "F10") || event.key === "ContextMenu") {
          event.preventDefault();
          open("keyboard", null);
        }
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        longPress.current = setTimeout(() => open("longPress", { x: event.clientX, y: event.clientY }), longPressDelay);
      }}
      onPointerUp={() => { if (longPress.current !== undefined) clearTimeout(longPress.current); }}
      onPointerCancel={() => { if (longPress.current !== undefined) clearTimeout(longPress.current); }}
    >
      {children}
      {anchor !== null ? (
        <HjmPortal>
          <div
            role="menu"
            aria-label={accessibilityLabel}
            className="hjm-context-menu"
            style={{
              insetBlockStart: anchor.y,
              insetInlineStart: anchor.x,
              zIndex: getModalLayer(0),
              minInlineSize: menuRecipe.minWidth,
            } as CSSProperties}
          >
            {items.map((item) => {
              const index = enabled.findIndex((candidate) => candidate.id === item.id);
              return (
                <div
                  key={item.id}
                  role="menuitem"
                  aria-disabled={item.disabled || undefined}
                  data-active={index === activeIndex && !item.disabled ? "" : undefined}
                  data-tone={item.tone}
                  className="hjm-context-menu__item"
                  onMouseEnter={() => { if (index >= 0) setActiveIndex(index); }}
                  onClick={() => {
                    if (item.disabled) return;
                    onAction(item.id as Key);
                    setAnchor(null);
                    hostRef.current?.focus();
                  }}
                >
                  <span>{item.label}</span>
                  {item.shortcut ? <kbd className="hjm-context-menu__shortcut">{item.shortcut}</kbd> : null}
                </div>
              );
            })}
          </div>
        </HjmPortal>
      ) : null}
    </div>
  );
}
