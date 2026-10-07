import { profileOptions } from "./design-profile";

export const productDesignOptions = [
  { id: "reference", label: "참고 테마" },
  { id: "field-notes", label: "산책 노트" },
  { id: "reading-room", label: "문장 모음" },
] as const;
export type PreviewProductDesign = typeof productDesignOptions[number]["id"];
export type ReferenceDesignPreset = typeof profileOptions[number]["id"];

// Fixture brands reuse forest/editorial ink roles, not a real product's assets.
// Each light/dark combination is checked by the injected public profile helper;
// a theme's remaining surfaces, material and type hierarchy still inherit.
const productDesignOverrides = {
  "field-notes": {
    palette: { light: { primary: "#285c35", contentBrand: "#23512d" }, dark: { primary: "#477c54", contentBrand: "#a8d994" } },
    compositions: { collection: "cards", toolbar: "collapsible" },
    screens: { overview: "landscape" },
    interactions: { selectionMotion: "slide", contentTransition: "rise" },
  },
  "reading-room": {
    palette: { light: { primary: "#59435f", contentBrand: "#513a57" }, dark: { primary: "#846b8e", contentBrand: "#ead0f2" } },
    // Quiet reading uses a linear collection and stationary selection, without
    // replacing the inherited texture or the existing business state engine.
    compositions: { collection: "rows", toolbar: "inline" },
    screens: { overview: "editorial" },
    interactions: { selectionMotion: "none", contentTransition: "fade" },
  },
} as const;

function productDesignInput(preset: ReferenceDesignPreset, product: Exclude<PreviewProductDesign, "reference">) {
  return { extends: preset, id: `${product}-${preset}`, ...productDesignOverrides[product] };
}

// Shared fixture files have no renderer/package dependency installation. Inject
// the real public helper from each consuming workspace rather than adding root
// peers or TypeScript path aliases (see docs/design-profile.md).
export function createPreviewProductResolver<Profile>(
  reference: (preset: ReferenceDesignPreset) => Profile,
  define: (input: ReturnType<typeof productDesignInput>) => Profile,
) {
  const products = new Map(profileOptions.map(({ id: preset }) => [preset, {
    "field-notes": define(productDesignInput(preset, "field-notes")),
    "reading-room": define(productDesignInput(preset, "reading-room")),
  }] as const));
  return (preset: ReferenceDesignPreset, product: PreviewProductDesign): Profile => {
    if (product === "reference") return reference(preset);
    const profiles = products.get(preset);
    if (!profiles) throw new TypeError("Unknown reference preset for product preview");
    return profiles[product];
  };
}
