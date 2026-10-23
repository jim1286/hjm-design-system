import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ImageViewerTrigger } from "../src/image-viewer.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });

it("names the media button, opens on click and shows the zoom cursor and focus ring", async () => {
  const open = vi.fn();
  await act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>
    <ImageViewerTrigger label="사진 크게 보기" onClick={open} layoutStyle={{ width: 120 }}>
      <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" style={{ width: "100%", height: 80 }} />
    </ImageViewerTrigger>
  </HjmProvider>));
  const button = host.querySelector("button")!;
  expect(button.type).toBe("button");
  expect(button.getAttribute("aria-label")).toBe("사진 크게 보기");
  expect(button.getAttribute("aria-haspopup")).toBe("dialog");
  expect(getComputedStyle(button).cursor).toBe("zoom-in");
  expect(button.getBoundingClientRect().width).toBe(120);
  expect(getComputedStyle(button).paddingTop).toBe("0px");
  button.click();
  expect(open).toHaveBeenCalledTimes(1);
  expect(() => act(() => root.render(<ImageViewerTrigger label=" "><img alt="" /></ImageViewerTrigger>))).toThrow(TypeError);
});
