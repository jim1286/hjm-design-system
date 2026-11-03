import { createElement, type ReactNode } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { Button } from "../src/actions.js";
import { ListRow } from "../src/data-display.js";
import { Sheet } from "../src/overlays.js";
import { UploadItem } from "../src/upload-item.js";
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
  add: "Add photo", replace: "Replace photo", remove: "Remove photo", preview: "View photo",
  source: { title: "Choose a photo", library: "Library", camera: "Camera", cancel: "Cancel" },
  upload: { pending: "Waiting", uploading: "Uploading", success: "Uploaded", cancel: "Cancel upload", retry: "Retry upload" },
};
const viewerLabels = { closeLabel: "Close", previousLabel: "Previous", nextLabel: "Next", loadingLabel: "Loading", errorLabel: "Failed", retryLabel: "Retry" };
const photo = { uri: "file:///photo.jpg", width: 1200, height: 900 };
const render = (props: Partial<PhotoAttachmentFieldProps> = {}) => <HjmNativeProvider>
  <PhotoAttachmentField photo={null} labels={labels} onSelectSource={() => {}} onRemove={() => {}}
    viewerLabels={viewerLabels} safeAreaInsets={{ top: 0, bottom: 0 }} {...props} /></HjmNativeProvider>;
const button = (label: string) => tree.root.findAllByType(Button).find(node => node.props.children === label)!;

it("opens the source sheet and hands the chosen source over after it closes", () => {
  const select = vi.fn();
  act(() => { tree = create(render({ onSelectSource: select })); });
  act(() => button("Add photo").props.onPress());
  expect(tree.root.findByType(Sheet).props.open).toBe(true);
  act(() => tree.root.findAllByType(ListRow).find(row => row.props.title === "Library")!.props.onPress());
  act(() => tree.root.findByType(Sheet).props.onDismissComplete({ reason: "programmatic" }));
  expect(select).toHaveBeenCalledExactlyOnceWith("library");
});

it("shows replace, remove and a preview that opens the viewer", () => {
  const remove = vi.fn();
  act(() => { tree = create(render({ photo, onRemove: remove })); });
  expect(button("Replace photo")).toBeDefined();
  act(() => tree.root.findByType(ImageViewerTrigger).props.onPress());
  expect(tree.root.findByType(ImageViewer).props.open).toBe(true);
  act(() => button("Remove photo").props.onPress());
  expect(remove).toHaveBeenCalledOnce();
});

it("locks choose and remove during an upload and offers retry after it fails", () => {
  const retry = vi.fn();
  act(() => { tree = create(render({ photo, upload: { status: "uploading", progress: 0.4 }, onCancelUpload: () => {} })); });
  expect([button("Replace photo").props.disabled, button("Remove photo").props.disabled]).toEqual([true, true]);
  act(() => tree.update(render({ photo, upload: { status: "error", message: "Upload failed" }, onRetryUpload: retry })));
  expect([button("Replace photo").props.disabled, button("Remove photo").props.disabled]).toEqual([false, false]);
  act(() => tree.root.findByType(UploadItem).props.onRetry("x"));
  expect(retry).toHaveBeenCalledOnce();
});
