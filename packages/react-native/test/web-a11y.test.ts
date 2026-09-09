import { describe, expect, it, vi } from "vitest";

import {
  webChoiceProps,
  webDisclosureProps,
  webOnly,
  webTabProps,
} from "../src/internal/web-a11y.js";

type KeyEvent = Record<string, unknown> & { preventDefault: () => void };

function keyEvent(key: string, overrides: Record<string, unknown> = {}): KeyEvent {
  const target = overrides.currentTarget ?? {};
  return {
    key,
    repeat: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    defaultPrevented: false,
    target,
    currentTarget: target,
    preventDefault: vi.fn(),
    ...overrides,
  } as KeyEvent;
}

function radioGroup(options: readonly Record<string, unknown>[]): Record<string, unknown> {
  const group: Record<string, unknown> = {
    closest: (selector: string) => (selector === '[role="radiogroup"]' ? group : null),
    querySelectorAll: () => options,
  };
  for (const option of options) {
    option.closest = (selector: string) => (selector === '[role="radiogroup"]' ? group : null);
    option.getClientRects = () => ({ length: 1 });
  }
  return group;
}

function radioOption(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    getAttribute: () => null,
    focus: vi.fn(),
    click: vi.fn(),
    ...overrides,
  };
}

describe("web accessibility props", () => {
  it("drops every prop on a native platform", () => {
    // The test renderer mocks Platform.OS as "android".
    expect(webOnly({ "aria-checked": true })).toEqual({});
  });

  it("reports disclosure state that accessibilityState does not reach the DOM", () => {
    expect(webDisclosureProps(true, false)).toEqual({
      "aria-expanded": true,
      "aria-disabled": false,
    });
  });

  it("activates a choice row on Space and ignores a held key", () => {
    const onActivate = vi.fn();
    const props = webChoiceProps({
      kind: "checkbox",
      checked: false,
      disabled: false,
      readOnly: false,
      onActivate,
    });
    const handler = props.onKeyDown as (event: KeyEvent) => void;

    const space = keyEvent(" ");
    handler(space);
    expect(space.preventDefault).toHaveBeenCalled();
    expect(onActivate).toHaveBeenCalledTimes(1);

    handler(keyEvent(" ", { repeat: true }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("refuses activation when disabled, read-only, modified, or bubbled", () => {
    const onActivate = vi.fn();
    const readOnly = webChoiceProps({
      kind: "checkbox", checked: false, disabled: false, readOnly: true, onActivate,
    }).onKeyDown as (event: KeyEvent) => void;
    readOnly(keyEvent(" "));

    const enabled = webChoiceProps({
      kind: "checkbox", checked: false, disabled: false, readOnly: false, onActivate,
    }).onKeyDown as (event: KeyEvent) => void;
    enabled(keyEvent(" ", { metaKey: true }));
    enabled(keyEvent(" ", { target: {} , currentTarget: {} }));
    enabled(keyEvent(" ", { defaultPrevented: true }));

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("moves focus and selection together across a radio group and wraps", () => {
    const first = radioOption();
    const second = radioOption();
    const third = radioOption();
    radioGroup([first, second, third]);

    const arrow = (from: Record<string, unknown>, key: string) => {
      const props = webChoiceProps({
        kind: "radio", checked: false, disabled: false, readOnly: false,
        onActivate: () => undefined,
      });
      (props.onKeyDown as (event: KeyEvent) => void)(keyEvent(key, { currentTarget: from }));
    };

    arrow(first, "ArrowDown");
    expect(second.focus).toHaveBeenCalledTimes(1);
    expect(second.click).toHaveBeenCalledTimes(1);

    arrow(first, "ArrowUp");
    expect(third.focus).toHaveBeenCalledTimes(1);
  });

  it("skips disabled and hidden options, and leaves a toolbar group alone", () => {
    const first = radioOption();
    const disabled = radioOption({ getAttribute: () => "true" });
    const hidden = radioOption({ getClientRects: () => ({ length: 0 }) });
    const last = radioOption();
    radioGroup([first, disabled, hidden, last]);
    hidden.getClientRects = () => ({ length: 0 });

    const props = webChoiceProps({
      kind: "radio", checked: false, disabled: false, readOnly: false,
      onActivate: () => undefined,
    });
    (props.onKeyDown as (event: KeyEvent) => void)(keyEvent("ArrowRight", { currentTarget: first }));
    expect(last.focus).toHaveBeenCalledTimes(1);
    expect(disabled.focus).not.toHaveBeenCalled();
    expect(hidden.focus).not.toHaveBeenCalled();

    const toolbarOption = radioOption();
    const toolbar: Record<string, unknown> = {};
    const group: Record<string, unknown> = {
      closest: (selector: string) => (selector === '[role="toolbar"]' ? toolbar : group),
      querySelectorAll: () => [toolbarOption],
    };
    toolbarOption.closest = () => group;
    toolbarOption.getClientRects = () => ({ length: 1 });
    (webChoiceProps({
      kind: "radio", checked: false, disabled: false, readOnly: false,
      onActivate: () => undefined,
    }).onKeyDown as (event: KeyEvent) => void)(
      keyEvent("ArrowRight", { currentTarget: toolbarOption }),
    );
    expect(toolbarOption.focus).not.toHaveBeenCalled();
  });

  it("gives a tab the roving tabindex and the orientation-aware arrow contract", () => {
    const onActivate = vi.fn();
    const onMoveFocus = vi.fn();
    const build = (orientation: "horizontal" | "vertical", direction: "ltr" | "rtl") =>
      webTabProps({
        selected: true, disabled: false, controls: "tabs-panel-a", focused: true,
        orientation, direction, onActivate, onMoveFocus,
      });

    const horizontal = build("horizontal", "ltr");
    expect(horizontal).toMatchObject({
      "aria-selected": true,
      "aria-disabled": false,
      "aria-controls": "tabs-panel-a",
      tabIndex: 0,
    });
    const press = horizontal.onKeyDown as (event: KeyEvent) => void;
    press(keyEvent("Enter"));
    expect(onActivate).toHaveBeenCalledTimes(1);
    press(keyEvent("ArrowRight"));
    expect(onMoveFocus).toHaveBeenLastCalledWith("next");
    press(keyEvent("End"));
    expect(onMoveFocus).toHaveBeenLastCalledWith("last");

    // An RTL tab list moves with the reading order, not against it.
    (build("horizontal", "rtl").onKeyDown as (event: KeyEvent) => void)(keyEvent("ArrowLeft"));
    expect(onMoveFocus).toHaveBeenLastCalledWith("next");
    (build("vertical", "ltr").onKeyDown as (event: KeyEvent) => void)(keyEvent("ArrowUp"));
    expect(onMoveFocus).toHaveBeenLastCalledWith("previous");
  });

  it("omits aria-controls and the tab stop when there is no panel or focus", () => {
    expect(
      webTabProps({
        selected: false, disabled: true, controls: undefined, focused: false,
        orientation: "horizontal", direction: "ltr",
        onActivate: () => undefined, onMoveFocus: () => undefined,
      }),
    ).toMatchObject({ tabIndex: -1 });
    expect(
      "aria-controls" in webTabProps({
        selected: false, disabled: false, controls: undefined, focused: false,
        orientation: "horizontal", direction: "ltr",
        onActivate: () => undefined, onMoveFocus: () => undefined,
      }),
    ).toBe(false);
  });
});
