// Adapted from Thinking Orbs de85557 (MIT); see THIRD_PARTY_NOTICES.md.
// Mode key → geometry builder. Kept separate from the presets so tree
// shaking can in principle drop unused modes in custom builds.

import type { ModeKey } from './presets.js';
import type { ModeFrame } from './types.js';
import { frameBraid } from './braid.js';
import { frameGlobe, frameRubik, frameWave } from './lattice.js';
import { frameMorph } from './morph.js';
import { frameOrbits } from './orbits.js';
import { frameRibbon } from './ribbon.js';
import { frameWeb } from './web.js';

/**
 * The portable surface: pure geometry, no canvas. The React Native port
 * imports exactly these functions, so its output is identical to the web's
 * by construction rather than by re-implementation.
 */
export const MODE_FRAMES: Record<ModeKey, ModeFrame> = {
  orbits: frameOrbits,
  globe: frameGlobe,
  rubik: frameRubik,
  wave: frameWave,
  web: frameWeb,
  braid: frameBraid,
  ribbon: frameRibbon,
  // ring shares ribbon's geometry — the `faceOn` profile flag switches it
  ring: frameRibbon,
  morph: frameMorph
};
