import { layout, spacing } from "./foundations.js";

export type ContainerSize = "reading" | "content" | "full";
export type ContainerGutter = "none" | "compact" | "regular" | "spacious";

export type ContainerDescriptor = Readonly<{
  /** Reading measure, general product content, or an intentionally fluid region. */
  size?: ContainerSize;
  /** Logical inline padding; never a physical left/right value. */
  gutter?: ContainerGutter;
}>;

export type ResolvedContainerDescriptor = Readonly<{
  size: ContainerSize;
  gutter: ContainerGutter;
  maxWidth: number | null;
  paddingInline: number;
}>;

export const containerDefaults = {
  size: "content",
  gutter: "regular",
} as const satisfies Required<ContainerDescriptor>;

export const containerRecipe = {
  slots: ["root"] as const,
  defaults: containerDefaults,
  maxWidths: {
    reading: layout.readingMaxWidth,
    content: layout.contentMaxWidth,
    full: null,
  },
  gutters: {
    none: 0,
    compact: spacing.md,
    regular: spacing.lg,
    spacious: spacing.xl,
  },
  alignment: "inline-center",
} as const;

const sizes = new Set<ContainerSize>(["reading", "content", "full"]);
const gutters = new Set<ContainerGutter>(["none", "compact", "regular", "spacious"]);

export function validateContainerDescriptor(descriptor: ContainerDescriptor): void {
  if (descriptor.size !== undefined && !sizes.has(descriptor.size)) {
    throw new TypeError(`Unsupported Container size: ${String(descriptor.size)}`);
  }
  if (descriptor.gutter !== undefined && !gutters.has(descriptor.gutter)) {
    throw new TypeError(`Unsupported Container gutter: ${String(descriptor.gutter)}`);
  }
}

export function resolveContainerDescriptor(
  descriptor: ContainerDescriptor = {},
): ResolvedContainerDescriptor {
  validateContainerDescriptor(descriptor);
  const size = descriptor.size ?? containerDefaults.size;
  const gutter = descriptor.gutter ?? containerDefaults.gutter;
  return {
    size,
    gutter,
    maxWidth: containerRecipe.maxWidths[size],
    paddingInline: containerRecipe.gutters[gutter],
  };
}
