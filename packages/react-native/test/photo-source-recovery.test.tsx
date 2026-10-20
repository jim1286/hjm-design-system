import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { ListRow } from "../src/data-display.js";
import { Sheet } from "../src/overlays.js";
import { PhotoSourceSheet } from "../src/screen-flows.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
const labels = { title: "Choose a photo", library: "Library", camera: "Camera", cancel: "Cancel" };
it("cancels a queued picker when a controlled sheet rejects closure and the user dismisses it later", () => {
  const select = vi.fn(), change = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><PhotoSourceSheet open onOpenChange={change} onSelect={select} labels={labels}/></HjmNativeProvider>); });
  act(() => tree.root.findAllByType(ListRow).find(button => button.props.title === "Camera")!.props.onPress());
  expect(change).toHaveBeenCalledWith(false);
  expect(select).not.toHaveBeenCalled();
  // The controlled owner kept it open; a later close action is cancellation.
  act(() => tree.root.findByType(Sheet).props.onOpenChange(false, { reason: "close-action" }));
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "close-action" }));
  expect(select).not.toHaveBeenCalled();
});
it("does not launch a queued camera after the host removes camera availability", () => {
  const select = vi.fn();
  const view = (available: boolean) => <HjmNativeProvider><PhotoSourceSheet open onOpenChange={()=>{}} onSelect={select} labels={labels} cameraAvailable={available}/></HjmNativeProvider>;
  act(() => { tree = create(view(true)); });
  act(() => tree.root.findAllByType(ListRow).find(button => button.props.title === "Camera")!.props.onPress());
  act(() => tree.update(view(false)));
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "programmatic" }));
  expect(select).not.toHaveBeenCalled();
});
it.each(["Camera", "Library"])("delivers a valid %s choice once after dismissal", label => {
  const select = vi.fn();
  act(() => { tree = create(<HjmNativeProvider><PhotoSourceSheet open onOpenChange={()=>{}} onSelect={select} labels={labels}/></HjmNativeProvider>); });
  act(() => tree.root.findAllByType(ListRow).find(button => button.props.title === label)!.props.onPress());
  expect(select).not.toHaveBeenCalled();
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "programmatic" }));
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "programmatic" }));
  expect(select).toHaveBeenCalledExactlyOnceWith(label.toLowerCase());
});
