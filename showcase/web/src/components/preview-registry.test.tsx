import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { WebDesignSystemProvider } from "../runtime/WebDesignSystemProvider";
import {
  ComponentPreview,
  type WebRendererComponentName,
} from "./preview-registry";

function renderPreview(name: WebRendererComponentName): string {
  return renderToStaticMarkup(
    <WebDesignSystemProvider
      input={{
        theme: "light",
        direction: "ltr",
        textScale: 1,
        reducedMotion: false,
      }}
      systemTheme="light"
    >
      <ComponentPreview name={name} />
    </WebDesignSystemProvider>,
  );
}

describe("official Web renderer previews", () => {
  it("renders supplemental active surfaces through @hjmds/react instead of DOM mocks", () => {
    const icon = renderPreview("Icon");
    expect(icon).toContain('class="hjm-icon"');
    expect(icon).toContain('role="img" aria-label="홈"');
    expect(icon).not.toContain("hjm-icon-grid");

    const radio = renderPreview("Radio");
    expect(radio).toContain('data-kind="radio"');
    expect(radio).toContain('name="showcase-radio"');
    expect(radio).not.toContain("hjm-radio-group");

    const checkboxGroup = renderPreview("CheckboxGroup");
    expect(checkboxGroup).toContain('class="hjm-checkbox-group"');
    expect(checkboxGroup).toContain('data-state="checked"');

    const loadMore = renderPreview("LoadMore");
    expect(loadMore).toContain('class="hjm-load-more"');
    expect(loadMore).toContain('data-state="ready"');
    expect(loadMore).not.toContain("hjm-wide-button");

    const counterBadge = renderPreview("CounterBadge");
    expect(counterBadge).toContain('class="hjm-counter-badge"');
    expect(counterBadge).toContain(">12<");
    expect(counterBadge).not.toContain('class="hjm-counter"');

    const toast = renderPreview("Toast");
    expect(toast).toContain('class="hjm-toast"');
    expect(toast).toContain('data-tone="success"');
    expect(toast).toContain('data-state="visible"');
    expect(toast).toContain('role="group"');
    expect(toast).toContain('role="status"');

    const grid = renderPreview("Grid");
    expect(grid).toContain('class="hjm-grid"');
    expect(grid).toContain('data-window-class="compact"');
    expect(grid).toContain('data-columns="1"');
  });

  it("uses the exact Field and Select public contracts", () => {
    const field = renderPreview("Field");
    expect(field).toContain('class="hjm-field hjm-demo-field"');
    expect(field).toContain('for="showcase-player-name"');
    expect(field).toContain('id="showcase-player-name"');

    const select = renderPreview("Select");
    expect(select).toContain('role="combobox"');
    expect(select).toContain("한국어");
    expect(select).toContain('type="hidden"');
    expect(select).toContain('value="ko"');
  });
});
