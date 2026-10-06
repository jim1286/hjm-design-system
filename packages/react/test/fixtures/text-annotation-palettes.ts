// Product snapshots for annotation contrast/visual QA, 2026-10-07.
// Utilverse: apps/mobile/src/lib/brand-palette.ts; BurnTok:
// packages/design-system/src/index.ts PRODUCT_SURFACES/PRODUCT_BOUNDARIES.
// Keep fixtures local: UI tests must not import another checkout or mutate its theme.
export const annotationPalettes = {
  default: undefined,
  utilverse: {
    light: { primary: '#5B5BD6', contentBrand: '#4A47C2', borderControl: '#6B6B99', surfaceAccent: '#EEEDFB', onPrimary: '#FFFFFF' },
    dark: { primary: '#8C8CF2', contentBrand: '#A9A8F7', borderControl: '#9999C9', surfaceAccent: '#26264A', onPrimary: '#11112B' },
  },
  burntok: {
    light: { surface: '#f7fbfe', surfaceAlt: '#eaf5fb', border: '#c5cdd8', borderControl: '#9aa5b4' },
    dark: { surface: '#121e28', surfaceAlt: '#192d3c', border: '#48515d', borderControl: '#596473' },
  },
} as const;
