import { act, create } from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { HjmNativeProvider, TextField, ToastRegion, useToastRegion } from "../src/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * 1.5.0 aligns Native names with Web: TextField takes `description` (Web's
 * name; `supportText` stays as a deprecated alias) and the toast controller
 * gains `publish` (Web and the contract store; `show` stays deprecated).
 */
describe("Native API aligned with Web", () => {
  it("renders TextField description and still accepts supportText", () => {
    for (const props of [{ description: "Visible to everyone" }, { supportText: "Visible to everyone" }]) {
      let renderer: ReturnType<typeof create> | undefined;
      act(() => {
        renderer = create(<HjmNativeProvider theme="light"><TextField label="Name" {...props} /></HjmNativeProvider>);
      });
      expect(JSON.stringify(renderer!.toJSON())).toContain("Visible to everyone");
      act(() => { renderer!.unmount(); });
    }
  });

  it("publishes a toast through the Web-aligned name", () => {
    let controller: ReturnType<typeof useToastRegion> | undefined;
    function Capture() {
      controller = useToastRegion();
      return null;
    }
    let renderer: ReturnType<typeof create> | undefined;
    act(() => {
      renderer = create(<HjmNativeProvider theme="light"><ToastRegion><Capture /></ToastRegion></HjmNativeProvider>);
    });
    act(() => { controller!.publish({ id: "saved", description: "Saved", closeLabel: "Close", durationMs: null }); });
    expect(JSON.stringify(renderer!.toJSON())).toContain("Saved");
    expect(controller!.show).toBe(controller!.publish);
    act(() => { renderer!.unmount(); });
  });
});
