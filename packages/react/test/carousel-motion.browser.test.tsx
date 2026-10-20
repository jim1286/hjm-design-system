import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { CarouselMotion } from "../src/carousel-motion.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("aligns the controlled photo after its initially hidden viewport is measured", async () => {
  const host = document.createElement("div");
  host.style.width = "0px";
  document.body.append(host);
  const root = createRoot(host);
  const changed: string[] = [];
  try {
    await act(async () => root.render(<HjmProvider reducedMotion>
      <CarouselMotion label="Photos" previousLabel="Previous" nextLabel="Next" navigation="counter"
        slides={[{ id: "a", label: "First" }, { id: "b", label: "Second" }]} currentKey="b"
        onCurrentKeyChange={key => changed.push(key)} renderSlide={item => <div style={{ height: 60 }}>{item.label}</div>} />
    </HjmProvider>));
    const slide = () => host.querySelector<HTMLElement>('[aria-roledescription="slide"][aria-hidden="false"]')!;
    const track = () => slide().parentElement!;
    await expect.poll(() => track().style.transform).toContain("translate3d");
    host.style.width = "320px";
    await expect.poll(() => Math.abs(slide().getBoundingClientRect().left - track().parentElement!.getBoundingClientRect().left)).toBeLessThan(1);
    expect(slide().textContent).toBe("Second");
    expect(changed).toEqual([]);
    host.style.width = "280px";
    await expect.poll(() => Math.abs(slide().getBoundingClientRect().left - track().parentElement!.getBoundingClientRect().left)).toBeLessThan(1);
    expect(changed).toEqual([]);
  } finally {
    await act(async () => root.unmount()); host.remove();
  }
});
