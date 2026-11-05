import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { DataTable } from "../src/data-table.js";

it("renders a hidden header as visually hidden text that still names the column", () => {
  const markup = renderToStaticMarkup(<DataTable columns={[{ id: "name", header: "Player", headerVisibility: "hidden" }, { id: "avg", header: "AVG" }]}
    rows={[{ id: "a" }]} labels={{ table: "Batting", selectAll: "Select all", selectRow: id => `Select ${id}`, sortColumn: header => header }} renderCell={(_, column) => column === "name" ? "Kim" : ".300"} />);
  expect(markup).toContain('<span class="hjm-visually-hidden">Player</span>');
  expect(markup).toMatch(/<th[^>]*>AVG<\/th>/u);
});
