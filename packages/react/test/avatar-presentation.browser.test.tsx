import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { avatarRecipe } from "@hjmds/design-contracts/recipes";
import { Avatar, type AvatarImageRenderProps } from "../src/advanced-display.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
const render = (node: React.ReactNode) => act(async () => root.render(<HjmProvider systemTheme="light" reducedMotion>{node}</HjmProvider>));
const avatar = () => host.querySelector<HTMLElement>(".hjm-avatar")!;

it("sizes every recipe step including the small 22 and 28 steps and the 44 touch step", async () => {
  for (const [step, px] of Object.entries(avatarRecipe.sizes)) {
    await render(<Avatar name="Kim Min" size={step as keyof typeof avatarRecipe.sizes} />);
    expect(avatar().getBoundingClientRect().width).toBe(px);
    expect(avatar().getBoundingClientRect().height).toBe(px);
  }
});

it("hides a decorative avatar and lets it omit the name", async () => {
  await render(<Avatar decorative size="xxsmall" />);
  expect(avatar().getAttribute("aria-hidden")).toBe("true");
  expect(avatar().textContent).toBe("");
  await render(<Avatar decorative name="Kim" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />);
  expect(host.querySelector("img")!.getAttribute("alt")).toBe("");
  expect(() => act(() => root.render(<Avatar name="  " />))).toThrow(TypeError);
});

it("hands the image to a product host and falls back when that host reports a failure", async () => {
  let props!: AvatarImageRenderProps;
  const renderImage = vi.fn((next: AvatarImageRenderProps) => { props = next; return <img data-product-image="" src={next.src} alt={next.alt} className={next.className} />; });
  await render(<Avatar name="Kim Min" size="touch" src="/a.png" renderImage={renderImage} />);
  expect(props).toMatchObject({ src: "/a.png", alt: "Kim Min", size: 44, className: "hjm-avatar__image" });
  const stale = props.onError;
  await render(<Avatar name="Kim Min" size="touch" src="/b.png" renderImage={renderImage} />);
  await act(async () => stale());
  expect(host.querySelector("[data-product-image]")).not.toBeNull();
  await act(async () => props.onError());
  expect(host.querySelector("[data-product-image]")).toBeNull();
  expect(avatar().textContent).toBe("KM");
  expect(() => act(() => root.render(<Avatar name="Kim" src="/a.png" renderImage={renderImage} imageProps={{ loading: "lazy" }} />))).toThrow(TypeError);
});

it("draws the rounded shape, the recipe frames and an unclipped corner accessory", async () => {
  await render(<Avatar name="Kim" shape="rounded" frame="none" accessory={<span data-mark="" style={{ display: "block", width: 12, height: 12 }} />} accessoryPlacement="bottom-end" />);
  const style = getComputedStyle(avatar());
  expect(style.borderTopWidth).toBe("0px");
  expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(Number.parseFloat(style.borderTopLeftRadius)).toBeLessThan(20);
  const box = avatar().getBoundingClientRect();
  const mark = host.querySelector("[data-mark]")!.getBoundingClientRect();
  expect(mark.right).toBe(box.right + avatarRecipe.accessory.offset);
  expect(mark.bottom).toBe(box.bottom + avatarRecipe.accessory.offset);
  await render(<Avatar name="Kim" accessory={<span data-mark="" style={{ display: "block", width: 12, height: 12 }} />} accessoryPlacement="top-end" />);
  expect(host.querySelector("[data-mark]")!.getBoundingClientRect().top).toBe(avatar().getBoundingClientRect().top);
  expect(getComputedStyle(avatar()).borderTopWidth).toBe("1px");
  await render(<Avatar name="Kim" frame="surface" />);
  expect(getComputedStyle(avatar()).borderTopWidth).toBe("0px");
});

it("contains the entire square picture inside the circle without rounding its corners again", async () => {
  await render(<Avatar name="Drawing" size="xlarge" imageFit="contain" src={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="navy"/></svg>')}`} />);
  const image = host.querySelector("img")!;
  await act(async () => { await image.decode(); });
  const picture = image.getBoundingClientRect();
  const frame = avatar().getBoundingClientRect();
  expect(Math.hypot(picture.width, picture.height)).toBeCloseTo(frame.width - 2, 0);
  expect(picture.x + picture.width / 2).toBeCloseTo(frame.x + frame.width / 2);
  expect(picture.y + picture.height / 2).toBeCloseTo(frame.y + frame.height / 2);
  expect(getComputedStyle(image).objectFit).toBe("contain");
  expect(getComputedStyle(image).borderTopLeftRadius).toBe("0px");
});
