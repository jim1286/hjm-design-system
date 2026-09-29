import { act, create } from "react-test-renderer";
import { beforeEach, expect, it, vi } from "vitest";
import executedScenarioRegistry from "./executed-scenarios.json" with { type: "json" };
import { FilePicker, HjmNativeProvider } from "../src/index.js";

export const filePickerNativeActionCases = [{ componentId: "file-picker" }] as const;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

it("invokes the injected picker from its named native action and resolves the batch", async () => {
  expect(executedScenarioRegistry.executions.find(({ proofFile }) => proofFile === "test/file-picker-host-action.test.tsx")?.scenarios.map(({ id }) => id)).toContain("native-actions");
  const onPick = vi.fn(async () => [
    { id: "photo", name: "photo.png", mimeType: "image/png", sizeBytes: 10 },
    { id: "notes", name: "notes.txt", mimeType: "text/plain", sizeBytes: 4 },
  ]);
  const onPickError = vi.fn();
  const onSelect = vi.fn();
  let renderer: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      <HjmNativeProvider>
        <FilePicker
          buttonLabel="Choose image"
          descriptor={{ accept: ["image/*"] }}
          label="Attachments"
          onPick={onPick}
          onPickError={onPickError}
          onSelect={onSelect}
        />
      </HjmNativeProvider>,
    );
  });

  const trigger = () => renderer!.root.find((node) => node.props.accessibilityLabel === "Choose image");
  expect(trigger().props.accessibilityRole).toBe("button");
  expect(trigger().props.accessibilityState).toMatchObject({ busy: false, disabled: false });
  await act(async () => trigger().props.onPress());

  expect(onPick).toHaveBeenCalledOnce();
  expect(onPickError).not.toHaveBeenCalled();
  expect(onSelect).toHaveBeenCalledWith({
    accepted: [{ id: "photo", name: "photo.png", mimeType: "image/png", sizeBytes: 10 }],
    rejected: [{
      file: { id: "notes", name: "notes.txt", mimeType: "text/plain", sizeBytes: 4 },
      reason: "unsupported-type",
      accept: ["image/*"],
    }],
  });
  expect(trigger().props.accessibilityState).toMatchObject({ busy: false, disabled: false });
});
