import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { defineHjmDesignProfile, hjmDesignPresets } from "@hjmds/design-contracts/design-profile";
import { HjmProvider } from "../src/provider.js";
import { Heading } from "../src/heading.js";
import { Text } from "../src/layout.js";
import { TextField } from "../src/forms.js";
import { Button } from "../src/actions.js";
import { Card } from "../src/display.js";
import { Dialog } from "../src/overlays.js";
import "../src/styles.css";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const split = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Arial"], display: ["Georgia"], reading: ["Palatino"], code: ["monospace"] } } });

it("translates family roles through titles, card bodies, controls and the portal without changing semantics", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  try {
    await act(() => root.render(<HjmProvider designProfile={split}><Heading level="level2" semanticLevel={4}>Title</Heading>
      <Text as="p" variant="bodyLarge" data-testid="reading">Body</Text><Text variant="caption" data-testid="caption">Caption</Text>
      <Text fontRole="code" data-testid="code">const value = 1;</Text><Text fontRole="ui" data-testid="ui">Action hint</Text>
      <Text as="div" fontRole="reading"><Card title="Card title" description="Card body"><TextField label="Draft" defaultValue="retained" /><Button>Action</Button></Card></Text>
      <Dialog open onOpenChange={() => {}} title="Dialog title" closeLabel="Close"><Text>Dialog body</Text></Dialog>
      <HjmProvider designProfile={hjmDesignPresets.neutral}><Text data-testid="reset">Reset</Text></HjmProvider>
    </HjmProvider>));
    const family = (selector: string) => getComputedStyle(document.querySelector(selector)!).fontFamily;
    expect(host.querySelector(".hjm-heading")!.tagName).toBe("H4");
    expect(family(".hjm-heading")).toBe("Georgia");
    expect(family('[data-testid="reading"]')).toBe("Palatino");
    expect(family('[data-testid="caption"]')).toBe("Arial");
    expect(family('[data-testid="ui"]')).toBe("Arial");
    expect(family('[data-testid="code"]')).toBe("monospace");
    expect(family(".hjm-card__title")).toBe("Georgia");
    expect(family(".hjm-card__description")).toBe("Palatino");
    expect(family('input[aria-label="Draft"], input')).toBe("Arial");
    expect(family(".hjm-button")).toBe("Arial");
    expect(family(".hjm-dialog__title")).toBe("Georgia");
    expect(family(".hjm-dialog .hjm-text")).toBe("Palatino");
    expect(family('[data-testid="reset"]')).toContain("Inter");
  } finally { await act(() => root.unmount()); host.remove(); }
});

it("updates families in place and restores ui-only fallback without replacing the focused draft", async () => {
  const host = document.createElement("div"); document.body.append(host); const root = createRoot(host);
  const legacy = defineHjmDesignProfile({ tokens: { fontFamily: { ui: ["Verdana"] } } });
  const render = (profile: typeof split) => act(() => root.render(<HjmProvider designProfile={profile}>
    <Heading level="level3">Title</Heading><Text>Body</Text><TextField label="Draft" defaultValue="initial" />
  </HjmProvider>));
  try {
    await render(split); const input = host.querySelector("input")!; await act(() => { input.value = "kept"; input.focus(); });
    await render(legacy);
    expect(host.querySelector("input")).toBe(input); expect(input.value).toBe("kept"); expect(document.activeElement).toBe(input);
    expect(getComputedStyle(host.querySelector(".hjm-heading")!).fontFamily).toBe("Verdana");
    expect(getComputedStyle(host.querySelector(".hjm-text")!).fontFamily).toBe("Verdana");
  } finally { await act(() => root.unmount()); host.remove(); }
});
