import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button, IconButton } from "../src/actions.js";
import { ListRow } from "../src/data-display.js";
import { Sheet } from "../src/overlays.js";
import { ImageViewer, PhotoAttachmentField, type PhotoAttachmentFieldProps } from "../src/image-viewer.js";
import { ImageViewerTrigger } from "../src/internal/image-viewer-trigger.js";

vi.mock("react-native-reanimated", () => import("./reanimated.stub.js"));
vi.mock("react-native-gesture-handler", () => ({ GestureHandlerRootView: "GestureRoot", Gesture: {}, GestureDetector: "GestureDetector" }));
vi.mock("react-native-zoom-toolkit", () => ({
  Gallery: (props: { data: unknown[]; renderItem: (item: unknown) => ReactNode; initialIndex: number }) =>
    createElement("Gallery", props, props.renderItem(props.data[props.initialIndex])),
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });
const labels: PhotoAttachmentFieldProps["labels"] = {
  add: "Photo", remove: "Remove photo", preview: "View photo",
  source: { title: "Choose a photo", library: "Library", camera: "Camera", cancel: "Cancel" },
};
const viewerLabels = { closeLabel: "Close", previousLabel: "Previous", nextLabel: "Next", loadingLabel: "Loading", errorLabel: "Failed", retryLabel: "Retry" };
const photo = { uri: "file:///photo.jpg", width: 1200, height: 900 };
const render = (props: Partial<PhotoAttachmentFieldProps> = {}) => <HjmNativeProvider>
  <PhotoAttachmentField photo={null} labels={labels} onSelectSource={() => {}} onRemove={() => {}}
    viewerLabels={viewerLabels} safeAreaInsets={{ top: 0, bottom: 0 }} {...props} /></HjmNativeProvider>;
const buttons = (label: string) => tree.root.findAllByType(Button).filter(node => node.props.children === label);
const remove = () => tree.root.findAllByType(IconButton).find(node => node.props.label === "Remove photo");

it("opens the source sheet from the small choose action and hands the source over after it closes", () => {
  const select = vi.fn();
  act(() => { tree = create(render({ onSelectSource: select })); });
  expect(remove()).toBeUndefined();
  act(() => buttons("Photo")[0]!.props.onPress());
  expect(tree.root.findByType(Sheet).props.open).toBe(true);
  act(() => tree.root.findAllByType(ListRow).find(row => row.props.title === "Library")!.props.onPress());
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "programmatic" }));
  expect(select).toHaveBeenCalledExactlyOnceWith("library");
});

it("replaces the choose action with the preview and a corner remove button", () => {
  const onRemove = vi.fn();
  act(() => { tree = create(render({ photo, onRemove })); });
  expect(buttons("Photo")).toHaveLength(0);
  act(() => tree.root.findByType(ImageViewerTrigger).props.onPress());
  expect(tree.root.findByType(ImageViewer).props.open).toBe(true);
  act(() => remove()!.props.onPress());
  expect(onRemove).toHaveBeenCalledOnce();
});

it("locks remove while the host submits and choose while picking", () => {
  act(() => { tree = create(render({ photo, disabled: true })); });
  expect(remove()!.props.disabled).toBe(true);
  act(() => tree.update(render({ picking: true })));
  expect([buttons("Photo")[0]!.props.disabled, buttons("Photo")[0]!.props.loading]).toEqual([true, true]);
});
