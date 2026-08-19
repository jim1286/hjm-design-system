import { describe, expect, it, vi } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { semanticIconNames } from "../src/icon.js";
import {
  computePaginationItems,
  paginationBehaviorScenarios,
  paginationDescriptorDefaults,
  paginationRecipe,
  resolvePaginationDescriptor,
  validatePaginationDescriptor,
  validatePaginationLabels,
  type PaginationDescriptor,
} from "../src/pagination.js";

const labels = { previous: "이전 페이지", next: "다음 페이지" } as const;

function composeAccessibleName({
  page,
  totalPages,
  current,
}: {
  page: number;
  totalPages: number;
  current: boolean;
}): string {
  return current
    ? `${totalPages} 페이지 중 ${page} 페이지, 현재 페이지`
    : `${totalPages} 페이지 중 ${page} 페이지로 이동`;
}

describe("Pagination descriptor validation", () => {
  it("requires exactly one of totalPages or totalCount+pageSize", () => {
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
      } as never),
    ).toThrow(/must not combine/);
    expect(() =>
      validatePaginationDescriptor({ currentPage: 1 } as never),
    ).toThrow(/requires either/);
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalCount: 50,
      } as never),
    ).toThrow(/requires either/);
  });

  it("rejects non-integer or out-of-range totals and current page", () => {
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalPages: 0,
      } as never),
    ).toThrow(/totalPages/);
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalCount: -1,
        pageSize: 10,
      } as never),
    ).toThrow(/totalCount/);
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalCount: 50,
        pageSize: 0,
      } as never),
    ).toThrow(/pageSize/);
    expect(() =>
      validatePaginationDescriptor({ currentPage: 0, totalPages: 5 }),
    ).toThrow(/currentPage/);
    expect(() =>
      validatePaginationDescriptor({ currentPage: 6, totalPages: 5 }),
    ).toThrow(/exceeds totalPages/);
  });

  it("rejects a negative siblingCount/boundaryCount and unknown fields", () => {
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalPages: 5,
        siblingCount: -1,
      }),
    ).toThrow(/siblingCount/);
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalPages: 5,
        boundaryCount: -1,
      }),
    ).toThrow(/boundaryCount/);
    expect(() =>
      validatePaginationDescriptor({
        currentPage: 1,
        totalPages: 5,
        pageSizeChanger: true,
      } as never),
    ).toThrow(/Unsupported Pagination descriptor field/);
  });

  it("accepts both valid discriminated forms", () => {
    const byCount: PaginationDescriptor = {
      currentPage: 3,
      totalCount: 95,
      pageSize: 10,
    };
    const byPages: PaginationDescriptor = { currentPage: 3, totalPages: 10 };
    expect(() => validatePaginationDescriptor(byCount)).not.toThrow();
    expect(() => validatePaginationDescriptor(byPages)).not.toThrow();
  });
});

describe("Pagination labels", () => {
  it("requires non-empty previous/next copy", () => {
    expect(() => validatePaginationLabels(labels)).not.toThrow();
    expect(() =>
      validatePaginationLabels({ previous: " ", next: "다음" }),
    ).toThrow(/labels.previous/);
    expect(() =>
      validatePaginationLabels({ previous: "이전" } as never),
    ).toThrow(/labels.next/);
  });
});

describe("computePaginationItems boundary inputs", () => {
  it("shows a single page with no ellipsis when there is only one page", () => {
    expect(computePaginationItems(1, 1)).toEqual([{ type: "page", page: 1 }]);
  });

  it("shows every page with no ellipsis when there are only two pages", () => {
    expect(computePaginationItems(2, 1)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
    ]);
    expect(computePaginationItems(2, 2)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
    ]);
  });

  it("collapses the tail into one ellipsis when current is the first page", () => {
    expect(computePaginationItems(10, 1)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "ellipsis" },
      { type: "page", page: 10 },
    ]);
  });

  it("collapses the head into one ellipsis when current is the last page", () => {
    expect(computePaginationItems(10, 10)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis" },
      { type: "page", page: 9 },
      { type: "page", page: 10 },
    ]);
  });

  it("uses two ellipses when current sits in the middle with room on both sides", () => {
    expect(computePaginationItems(10, 5)).toEqual([
      { type: "page", page: 1 },
      { type: "ellipsis" },
      { type: "page", page: 4 },
      { type: "page", page: 5 },
      { type: "page", page: 6 },
      { type: "ellipsis" },
      { type: "page", page: 10 },
    ]);
  });

  it("never leaves a lone hidden page behind an ellipsis", () => {
    // boundary=1 covers page 1, sibling window covers 3..5 at current=4:
    // the only hidden page would be page 2, which must be shown instead of
    // collapsed, since collapsing a single page saves no space.
    expect(computePaginationItems(6, 4)).toEqual([
      { type: "page", page: 1 },
      { type: "page", page: 2 },
      { type: "page", page: 3 },
      { type: "page", page: 4 },
      { type: "page", page: 5 },
      { type: "page", page: 6 },
    ]);
  });

  it("rejects malformed totalPages/currentPage/window inputs", () => {
    expect(() => computePaginationItems(0, 1)).toThrow(/totalPages/);
    expect(() => computePaginationItems(5, 0)).toThrow(/currentPage/);
    expect(() => computePaginationItems(5, 6)).toThrow(/currentPage/);
    expect(() =>
      computePaginationItems(5, 1, { siblingCount: -1 }),
    ).toThrow(/siblingCount/);
    expect(() =>
      computePaginationItems(5, 1, { boundaryCount: -1 }),
    ).toThrow(/boundaryCount/);
  });

  it("holds the never-two-consecutive-ellipsis invariant across a spread of sizes", () => {
    for (let totalPages = 1; totalPages <= 14; totalPages += 1) {
      for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
        const items = computePaginationItems(totalPages, currentPage);
        for (let index = 1; index < items.length; index += 1) {
          expect(
            items[index]!.type === "ellipsis" &&
              items[index - 1]!.type === "ellipsis",
          ).toBe(false);
        }
        expect(items[0]).toEqual({ type: "page", page: 1 });
        expect(items.at(-1)).toEqual({ type: "page", page: totalPages });
      }
    }
  });
});

describe("resolvePaginationDescriptor", () => {
  it("derives totalPages from totalCount/pageSize and composes per-page accessible names", () => {
    const compose = vi.fn(composeAccessibleName);
    const resolved = resolvePaginationDescriptor(
      { currentPage: 3, totalCount: 95, pageSize: 10 },
      { labels, composeAccessibleName: compose },
    );
    expect(resolved.totalPages).toBe(10);
    expect(resolved.hasPrevious).toBe(true);
    expect(resolved.hasNext).toBe(true);
    expect(resolved.labels).toBe(labels);

    const currentItem = resolved.items.find(
      (item) => item.type === "page" && item.current,
    );
    expect(currentItem).toMatchObject({ page: 3, current: true });
    expect((currentItem as { accessibleName: string }).accessibleName).toBe(
      "10 페이지 중 3 페이지, 현재 페이지",
    );
    expect(compose).toHaveBeenCalledWith({
      page: 3,
      totalPages: 10,
      current: true,
    });

    for (const item of resolved.items) {
      if (item.type === "ellipsis") {
        expect(item).not.toHaveProperty("accessibleName");
      }
    }
  });

  it("disables previous on the first page and next on the last page", () => {
    const first = resolvePaginationDescriptor(
      { currentPage: 1, totalPages: 5 },
      { labels, composeAccessibleName },
    );
    expect(first.hasPrevious).toBe(false);
    expect(first.hasNext).toBe(true);

    const last = resolvePaginationDescriptor(
      { currentPage: 5, totalPages: 5 },
      { labels, composeAccessibleName },
    );
    expect(last.hasPrevious).toBe(true);
    expect(last.hasNext).toBe(false);
  });

  it("still shows a single, non-actionable page 1 for an empty result set", () => {
    const resolved = resolvePaginationDescriptor(
      { currentPage: 1, totalCount: 0, pageSize: 10 },
      { labels, composeAccessibleName },
    );
    expect(resolved.totalPages).toBe(1);
    expect(resolved.hasPrevious).toBe(false);
    expect(resolved.hasNext).toBe(false);
    expect(resolved.items).toEqual([
      {
        type: "page",
        page: 1,
        current: true,
        accessibleName: "1 페이지 중 1 페이지, 현재 페이지",
      },
    ]);
  });

  it("rejects a composer that returns empty copy", () => {
    expect(() =>
      resolvePaginationDescriptor(
        { currentPage: 1, totalPages: 3 },
        { labels, composeAccessibleName: () => "  " },
      ),
    ).toThrow(/composeAccessibleName must return a non-empty string/);
  });
});

describe("Pagination visual recipe", () => {
  it("only points at semantic icon names that exist in the shared icon registry", () => {
    expect(semanticIconNames).toContain(paginationRecipe.navIcon.previous);
    expect(semanticIconNames).toContain(paginationRecipe.navIcon.next);
    expect(semanticIconNames).toContain(paginationRecipe.ellipsis.icon);
  });

  it("keeps sensible defaults for the page window", () => {
    expect(paginationDescriptorDefaults).toEqual({
      siblingCount: 1,
      boundaryCount: 1,
    });
  });

  it("keeps a self-contained, non-empty behavior scenario list for the lead to wire", () => {
    expect(paginationBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(paginationBehaviorScenarios).size).toBe(
      paginationBehaviorScenarios.length,
    );
  });
});

describe("Pagination catalog and crosswalk stay untouched", () => {
  it("still reserves Pagination as planned/web/navigation", () => {
    const entry = componentCatalog.find((item) => item.name === "Pagination");
    expect(entry).toMatchObject({
      category: "navigation",
      platform: "web",
      status: "planned",
    });
  });

  it("keeps the antd Pagination crosswalk pointed at the same target", () => {
    const entry = antDesignReferenceComponents.find(
      (item) => item.name === "Pagination",
    );
    expect(entry).toMatchObject({
      targets: ["pagination"],
      relationship: "direct",
    });
  });
});
