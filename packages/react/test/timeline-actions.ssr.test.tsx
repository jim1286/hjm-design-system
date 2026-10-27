import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Timeline } from "../src/advanced-display.js";

it("keeps the ordered record and a separate named command without hiding its metadata", () => {
  const html = renderToStaticMarkup(<Timeline items={[{ id: "1", label: "Version 1", description: "Original", timestamp: "Today", dateTime: "2026-10-19T00:00:00Z", emphasized: true }]}
    composeAccessibleName={({ label }) => label}
    renderMetadata={() => <span>Reviewed</span>}
    renderActions={() => <button>Restore version 1</button>} />);
  expect(html).toMatch(/^<ol/u);
  expect(html).toContain('aria-label="Version 1"');
  expect(html).toContain("Reviewed");
  expect(html).toContain('dateTime="2026-10-19T00:00:00Z"');
  expect(html).toContain('data-emphasized="true"');
  expect(html).not.toContain("aria-current");
  expect(html.indexOf("Today")).toBeLessThan(html.indexOf("Original"));
  expect(html).toContain('class="hjm-timeline__actions"><button>Restore version 1</button>');
  expect(html.match(/<button/gu)).toHaveLength(1);
});
