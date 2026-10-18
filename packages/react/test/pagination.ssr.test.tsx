import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HjmProvider, Pagination } from "../src/index.js";

const labels = { previous: "Previous results", next: "Next results" } as const;

describe("Web Pagination without a known total", () => {
  it("renders previous, the composed current page label and next", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Pagination
          label="Search results pages"
          labels={labels}
          descriptor={{ currentPage: 3, hasNext: true }}
          composeCurrentPageLabel={({ page }) => `Page ${page}`}
          onPageChange={() => undefined}
        />
      </HjmProvider>,
    );
    expect(markup).toContain('aria-label="Search results pages"');
    expect(markup).toContain('<span class="hjm-pagination__page-label" aria-current="page">Page 3</span>');
    expect(markup).not.toMatch(/aria-label="Previous results" aria-disabled/u);
    expect(markup).not.toMatch(/aria-label="Next results" aria-disabled/u);
    // No numbered window: pages past the next one are not addressable.
    expect(markup).not.toContain('data-state="current"');
  });

  it("marks both steps unavailable on a single first page", () => {
    const markup = renderToStaticMarkup(
      <HjmProvider systemTheme="light">
        <Pagination
          label="Search results pages"
          labels={labels}
          descriptor={{ currentPage: 1, hasNext: false }}
          composeCurrentPageLabel={({ page }) => `Page ${page}`}
          onPageChange={() => undefined}
        />
      </HjmProvider>,
    );
    expect(markup.match(/aria-disabled="true"/gu)).toHaveLength(2);
  });

  it("fails loudly when the composer does not match the descriptor", () => {
    expect(() =>
      renderToStaticMarkup(
        <Pagination
          label="Search results pages"
          labels={labels}
          descriptor={{ currentPage: 1, hasNext: true } as never}
          composeAccessibleName={() => "Page 1"}
          onPageChange={() => undefined}
        />,
      ),
    ).toThrow("composeCurrentPageLabel must be a function");
  });
});
