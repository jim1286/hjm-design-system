// Adapted from Thinking Orbs de85557 (MIT); see THIRD_PARTY_NOTICES.md.
// Engine-level contracts shared by every mode implementation.

import type { ModeOpts } from './profiles.js';

export type { Dot, Line, OrbFrame } from './core.js';

import type { OrbFrame } from './core.js';

/**
 * Geometry for one instant: pure math over (size, t, opts), no rendering
 * surface and no theme — `dark` only affects ink at paint time.
 *
 * Deliberately closure-free and `Math`-only so the same function can run
 * inside a Reanimated worklet on the React Native UI thread, and so its
 * output can be compared numerically against the Swift port.
 */
export type ModeFrame = (size: number, t: number, opts: ModeOpts) => OrbFrame;


export type OrbState = 'working' | 'searching' | 'solving' | 'listening' | 'connecting' | 'weaving' | 'composing' | 'breathing' | 'shaping';
export type OrbSize = 20 | 64;
