import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { Avatar } from "../src/advanced-display.js";
import { createBlobatarFallback } from "../src/avatar-blobatar.js";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("uses deterministic local artwork, hides its seed, and retries a replacement photo", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const renderFallback = createBlobatarFallback({ seed: "public-id-24" });
  try {
    await act(() => root.render(<Avatar name="지민" renderFallback={renderFallback} />));
    const uri = host.querySelector("img")!.src;
    expect(uri.startsWith("data:image/svg+xml")).toBe(true);
    expect(host.querySelector('[role="img"]')!.getAttribute("aria-label")).toBe("지민");
    expect(host.querySelector("img")!.getAttribute("aria-hidden")).toBe("true");
    await act(() => root.render(<Avatar name="바뀐 이름" renderFallback={renderFallback} />));
    expect(host.querySelector("img")!.src).toBe(uri);
    await act(() => root.render(<Avatar name="지민" src="data:image/png,broken" renderFallback={renderFallback} />));
    await act(() => host.querySelector("img")!.dispatchEvent(new Event("error")));
    expect(host.querySelector("img")!.src).toBe(uri);
    const photo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    await act(() => root.render(<Avatar name="지민" src={photo} renderFallback={renderFallback} />));
    expect(host.querySelector("img")!.getAttribute("alt")).toBe("지민");
    expect(host.querySelector("img")!.getAttribute("src")).toBe(photo);
    await act(() => root.render(<Avatar name="지민" fallback="기존" renderFallback={() => null} />));
    expect(host.textContent).toBe("기존");
  } finally { await act(() => root.unmount()); host.remove(); }
});
