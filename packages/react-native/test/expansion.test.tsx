import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

import { FilePicker, HjmNativeProvider, Steps, UploadItem } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(node: React.ReactNode): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<HjmNativeProvider reducedMotion theme="light">{node}</HjmNativeProvider>, { createNodeMock: () => ({}) });
  });
  return renderer!;
}

function byLabel(renderer: ReactTestRenderer, label: string) {
  return renderer.root.find((node) => node.props.accessibilityLabel === label);
}

describe("Native expansion renderers", () => {
  it("invokes the injected picker and resolves accepted candidates", async () => {
    const onSelect = vi.fn();
    const renderer = render(
      <FilePicker buttonLabel="Choose image" descriptor={{ accept: ["image/*"] }} label="Files" onPick={async () => [{ id: "photo", name: "photo.png", mimeType: "image/png", sizeBytes: 10 }]} onPickError={() => undefined} onSelect={onSelect} />,
    );
    await act(async () => byLabel(renderer, "Choose image").props.onPress());
    expect(onSelect.mock.calls[0]?.[0].accepted).toEqual([{ id: "photo", name: "photo.png", mimeType: "image/png", sizeBytes: 10 }]);
  });

  it("routes picker adapter failures through the explicit error callback", async () => {
    const failure = new Error("picker unavailable");
    const onPickError = vi.fn();
    const renderer = render(
      <FilePicker buttonLabel="Choose image" descriptor={{ accept: ["image/*"] }} label="Files" onPick={async () => { throw failure; }} onPickError={onPickError} onSelect={() => undefined} />,
    );
    await act(async () => byLabel(renderer, "Choose image").props.onPress());
    expect(onPickError).toHaveBeenCalledWith(failure);
    expect(byLabel(renderer, "Choose image").props.accessibilityState.busy).toBe(false);
  });

  it("exposes derived step hints and only the uploading cancel action", () => {
    const onCancel = vi.fn();
    const renderer = render(
      <>
        <Steps composeAccessibleName={({ position, total, label }) => `${position}/${total} ${label}`} descriptor={{ steps: [{ id: "a", label: "A" }, { id: "b", label: "B" }], currentStepId: "b" }} statusLabels={{ pending: "Pending", current: "Current", complete: "Complete", error: "Error" }} />
        <UploadItem descriptor={{ id: "photo", name: "photo.png", state: { status: "uploading", progress: 0.5 } }} labels={{ pending: "Pending", uploading: "Uploading", success: "Complete", cancel: "Cancel", retry: "Retry" }} onCancel={onCancel} />
      </>,
    );
    expect(byLabel(renderer, "1/2 A").props.accessibilityHint).toBe("Complete");
    act(() => byLabel(renderer, "Cancel").props.onPress());
    expect(onCancel).toHaveBeenCalledWith("photo");
    expect(renderer.root.findAll((node) => node.props.accessibilityLabel === "Retry")).toHaveLength(0);
  });
});
