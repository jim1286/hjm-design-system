import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { BottomCTA } from "../src/bottom-cta.js";
import { HjmProvider } from "../src/provider.js";
import "../src/styles.css";

it("preserves external form validation, Enter submission, reset and busy action guards", async () => {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host), submitted = vi.fn();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const frame = (busy = false) => <HjmProvider>
    <form id="footer-form" onSubmit={event => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget).get("title"), (event.nativeEvent as SubmitEvent).submitter);
    }}><input name="title" aria-label="Title" required /></form>
    <BottomCTA primaryAction={{ label: "Save", type: "submit", form: "footer-form", loading: busy }}
      secondaryAction={{ label: "Reset", type: "reset", form: "footer-form", disabled: busy }} />
  </HjmProvider>;
  try {
    await act(async () => root.render(frame()));
    const input = host.querySelector("input")!, save = host.querySelector<HTMLButtonElement>('[type="submit"]')!;
    const reset = host.querySelector<HTMLButtonElement>('[type="reset"]')!;
    expect(save.form).toBe(host.querySelector("form"));
    await act(async () => save.click());
    expect(submitted).not.toHaveBeenCalled();
    input.focus();
    await act(async () => userEvent.keyboard("Memo{Enter}"));
    expect(submitted).toHaveBeenCalledWith("Memo", save);
    expect(submitted).toHaveBeenCalledOnce();
    await act(async () => reset.click());
    expect(input.value).toBe("");
    input.focus();
    await act(async () => userEvent.keyboard("Retained"));
    await act(async () => root.render(frame(true)));
    await act(async () => { save.click(); reset.click(); });
    expect(input.value).toBe("Retained");
    expect(submitted).toHaveBeenCalledOnce();
    await act(async () => root.render(frame()));
    await act(async () => save.click());
    expect(submitted).toHaveBeenLastCalledWith("Retained", save);
    expect(submitted).toHaveBeenCalledTimes(2);
  } finally { await act(async () => root.unmount()); host.remove(); }
});
