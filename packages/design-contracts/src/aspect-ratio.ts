export type AspectRatioPreset = "square" | "portrait" | "landscape" | "wide";
export type AspectRatioValue = AspectRatioPreset | number;

export type AspectRatioDescriptor = Readonly<{
  ratio?: AspectRatioValue;
}>;

export type ResolvedAspectRatioDescriptor = Readonly<{
  ratio: number;
  source: AspectRatioPreset | "custom";
}>;

export const aspectRatioDefaults = {
  ratio: "wide",
} as const satisfies Required<AspectRatioDescriptor>;

export const aspectRatioRecipe = {
  slots: ["root", "content"] as const,
  defaults: aspectRatioDefaults,
  ratios: {
    square: 1,
    portrait: 3 / 4,
    landscape: 4 / 3,
    wide: 16 / 9,
  },
  sizing: {
    inline: "fill",
    block: "derive-from-ratio",
  },
} as const;

const presets = new Set<AspectRatioPreset>([
  "square",
  "portrait",
  "landscape",
  "wide",
]);

export function validateAspectRatioValue(value: AspectRatioValue): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError("AspectRatio ratio must be a positive finite number");
    }
    return;
  }
  if (!presets.has(value)) {
    throw new TypeError(`Unsupported AspectRatio preset: ${String(value)}`);
  }
}

export function resolveAspectRatioDescriptor(
  descriptor: AspectRatioDescriptor = {},
): ResolvedAspectRatioDescriptor {
  const value = descriptor.ratio ?? aspectRatioDefaults.ratio;
  validateAspectRatioValue(value);
  if (typeof value === "number") return { ratio: value, source: "custom" };
  return { ratio: aspectRatioRecipe.ratios[value], source: value };
}
