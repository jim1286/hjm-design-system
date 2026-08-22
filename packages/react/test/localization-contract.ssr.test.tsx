import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { TableProps } from "../src/advanced-display.js";
import type { ComboboxProps } from "../src/advanced-forms.js";
import type { SearchFieldProps } from "../src/forms.js";
import type { DialogProps, SheetProps } from "../src/overlays.js";
import type { SelectProps } from "../src/select.js";

type IsRequired<Props, Key extends keyof Props> =
  Record<never, never> extends Pick<Props, Key> ? false : true;

function sourceFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/u.test(entry.name) ? [path] : [];
  });
}

describe("renderer localization ownership", () => {
  it("does not embed Korean product or accessibility copy in renderer source", () => {
    const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "../src");
    const source = sourceFiles(sourceRoot).map((path) => readFileSync(path, "utf8")).join("\n");
    expect(source).not.toMatch(/[\u3131-\uD79D]/u);
  });

  it("keeps every user-visible fallback owned by the consumer type", () => {
    expectTypeOf<IsRequired<SearchFieldProps, "clearLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SelectProps, "placeholder">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SelectProps, "emptySelectionLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "emptyMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "loadingMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "selectionRequiredMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<DialogProps, "closeLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SheetProps, "closeLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<TableProps<unknown>, "emptyState">>().toEqualTypeOf<true>();
  });
});
