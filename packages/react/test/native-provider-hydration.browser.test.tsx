import { resolveDesignSystemProviderValue } from "@hjmds/design-contracts/components/design-system-provider";
import { act, useState, type ReactNode } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HjmNativeProvider, useHjmNativeTheme } from "../../react-native/src/provider.js";

import { appearance } from "./native-provider-platform.mock.js";

let container: HTMLDivElement;
let root: Root | undefined;

function Surface({ id }: { id: string }): ReactNode {
  const { colors, environment } = useHjmNativeTheme();
  return <div data-testid={id} data-theme={environment.theme} style={{ backgroundColor: colors.surface }} />;
}

function Screen(): ReactNode {
  const [open, setOpen] = useState(false);
  return <>
    <Surface id="existing" />
    <button onClick={() => setOpen(true)}>Open</button>
    {open ? <Surface id="newly-mounted" /> : null}
  </>;
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true;
  appearance.colorScheme = "light";
  appearance.listeners.clear();
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  container.remove();
  vi.restoreAllMocks();
});

describe("native provider on statically rendered web", () => {
  it.each(["light", "dark"] as const)("preserves an explicit %s theme through hydration and nested inheritance", async (theme) => {
    const tree = <HjmNativeProvider theme={theme}><HjmNativeProvider><Surface id="existing" /></HjmNativeProvider></HjmNativeProvider>;
    container.innerHTML = renderToString(tree);
    const existing = container.querySelector<HTMLElement>('[data-testid="existing"]')!;
    expect(existing.dataset.theme).toBe(theme);
    const serverColor = existing.style.backgroundColor;
    appearance.colorScheme = "dark";
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await act(async () => { root = hydrateRoot(container, tree); });
    expect(existing.dataset.theme).toBe(theme);
    expect(existing.style.backgroundColor).toBe(serverColor);
    expect(errors).not.toHaveBeenCalled();
  });

  it("keeps a supplied provider value authoritative during hydration", async () => {
    const value = resolveDesignSystemProviderValue({ theme: "dark" }, { systemTheme: "light" });
    const tree = <HjmNativeProvider value={value}><Surface id="existing" /></HjmNativeProvider>;
    container.innerHTML = renderToString(tree);
    const existing = container.querySelector<HTMLElement>('[data-testid="existing"]')!;
    const serverColor = existing.style.backgroundColor;
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await act(async () => { root = hydrateRoot(container, tree); });
    expect(existing.dataset.theme).toBe("dark");
    expect(existing.style.backgroundColor).toBe(serverColor);
    expect(errors).not.toHaveBeenCalled();
  });

  it("uses the system theme immediately for a client-only root", async () => {
    appearance.colorScheme = "dark";
    await act(async () => {
      root = createRoot(container);
      root.render(<HjmNativeProvider><Surface id="existing" /></HjmNativeProvider>);
    });
    expect(container.querySelector<HTMLElement>('[data-testid="existing"]')!.dataset.theme).toBe("dark");
  });

  it("hydrates light server HTML into a consistent dark screen and newly mounted modal", async () => {
    const tree = <HjmNativeProvider><Screen /></HjmNativeProvider>;
    container.innerHTML = renderToString(tree);
    const existing = container.querySelector<HTMLElement>('[data-testid="existing"]')!;
    expect(existing.dataset.theme).toBe("light");
    const serverColor = existing.style.backgroundColor;
    appearance.colorScheme = "dark";
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await act(async () => { root = hydrateRoot(container, tree); });
    await act(async () => container.querySelector("button")!.click());
    const mounted = container.querySelector<HTMLElement>('[data-testid="newly-mounted"]')!;
    expect(mounted.dataset.theme).toBe("dark");
    expect(existing.dataset.theme).toBe("dark");
    expect(existing.style.backgroundColor).not.toBe(serverColor);
    expect(existing.style.backgroundColor).toBe(mounted.style.backgroundColor);
    expect(errors).not.toHaveBeenCalled();

    await act(async () => {
      appearance.colorScheme = "light";
      for (const listener of appearance.listeners) listener("light");
    });
    expect(existing.dataset.theme).toBe("light");
    expect(mounted.dataset.theme).toBe("light");
    expect(existing.style.backgroundColor).toBe(serverColor);
    expect(mounted.style.backgroundColor).toBe(serverColor);
  });
});
