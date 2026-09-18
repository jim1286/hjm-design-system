import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Dialog, type DialogProps } from "./overlays.js";
import { Sheet, type SheetProps } from "./overlays.js";

/*
  Imperative Dialog and Sheet. `useToast` already has this shape, and the gap
  beside it is why each product rewired "open state + mount point + completion
  signal" by hand (BurnTok's AppModal built its own `onDismiss` for exactly this).

  This layer only transfers ownership: the provider holds the open state and the
  mount point, and the call site knows just "open it" and "it closed". Dismiss
  judgement, focus and isolation stay in the Dialog/Sheet contracts — none of it
  is reimplemented here.

  One overlay at a time. Stacking needs rules (which one is on top, is the one
  behind inert) that the modal stack already owns; an imperative API that
  bypassed it would fork those rules and produce "closed it and the one below
  never came back". Opening a follow-up surface after `closed` resolves is the
  contracted order.
*/

type DialogRequest = Omit<DialogProps, "open" | "defaultOpen" | "onOpenChange" | "trigger"> &
  Readonly<{ children?: ReactNode }>;
type SheetRequest = Omit<SheetProps, "open" | "defaultOpen" | "onOpenChange" | "trigger"> &
  Readonly<{ children?: ReactNode }>;

export type OverlayHandle = Readonly<{
  /** Resolves once the overlay is gone and focus has been restored. */
  closed: Promise<void>;
  close(): void;
}>;

export type OverlayStackApi = Readonly<{
  openDialog(request: DialogRequest): OverlayHandle;
  openSheet(request: SheetRequest): OverlayHandle;
}>;

type Entry =
  | Readonly<{ kind: "dialog"; id: number; request: DialogRequest; settle: () => void }>
  | Readonly<{ kind: "sheet"; id: number; request: SheetRequest; settle: () => void }>;

const OverlayStackContext = createContext<OverlayStackApi | null>(null);

export function useOverlayStack(): OverlayStackApi {
  const value = useContext(OverlayStackContext);
  if (value === null) throw new Error("useOverlayStack must be used inside OverlayStackProvider");
  return value;
}

/** Convenience wrappers so a call site reads as the thing it opens. */
export function useDialog(): OverlayStackApi["openDialog"] {
  return useOverlayStack().openDialog;
}

export function useSheet(): OverlayStackApi["openSheet"] {
  return useOverlayStack().openSheet;
}

export type OverlayStackProviderProps = Readonly<{ children: ReactNode }>;

export function OverlayStackProvider({ children }: OverlayStackProviderProps): ReactElement {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [open, setOpen] = useState(false);
  const nextId = useRef(0);

  const openEntry = useCallback((kind: Entry["kind"], request: DialogRequest | SheetRequest): OverlayHandle => {
    const id = (nextId.current += 1);
    let settle: () => void = () => undefined;
    const closed = new Promise<void>((resolve) => { settle = resolve; });
    setEntry({ kind, id, request, settle } as Entry);
    setOpen(true);
    return {
      closed,
      close: () => setOpen(false),
    };
  }, []);

  const api = useMemo<OverlayStackApi>(() => ({
    openDialog: (request) => openEntry("dialog", request),
    openSheet: (request) => openEntry("sheet", request),
  }), [openEntry]);

  // The promise resolves from the renderer's own completion signal, not from a
  // timer: that is the whole reason this layer exists.
  const complete = () => {
    entry?.settle();
    setEntry(null);
  };

  return (
    <OverlayStackContext.Provider value={api}>
      {children}
      {entry?.kind === "dialog" ? (
        <Dialog
          {...entry.request}
          key={entry.id}
          open={open}
          onOpenChange={(next) => setOpen(next)}
          onDismissComplete={() => complete()}
        />
      ) : null}
      {entry?.kind === "sheet" ? (
        <Sheet
          {...entry.request}
          key={entry.id}
          open={open}
          onOpenChange={(next) => setOpen(next)}
          onDismissComplete={() => complete()}
        />
      ) : null}
    </OverlayStackContext.Provider>
  );
}
