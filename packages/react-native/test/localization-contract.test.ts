import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { FormProps, SelectProps, ComboboxProps } from "../src/forms.js";
import type { SearchFieldProps } from "../src/inputs.js";
import type { MenuProps } from "../src/navigation.js";
import type { DialogProps, SheetProps } from "../src/overlays.js";

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
    expectTypeOf<IsRequired<FormProps<unknown>, "fallbackErrorMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SearchFieldProps, "clearLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SearchFieldProps, "busyLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SelectProps, "placeholder">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SelectProps, "dismissLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "emptyMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "loadingMessage">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "clearLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<ComboboxProps, "dismissLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<MenuProps, "dismissLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<DialogProps, "closeLabel">>().toEqualTypeOf<true>();
    expectTypeOf<IsRequired<SheetProps, "closeLabel">>().toEqualTypeOf<true>();
  });
});
