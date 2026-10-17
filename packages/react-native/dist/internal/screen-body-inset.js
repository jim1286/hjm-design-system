import { createContext } from "react";
/**
 * Inline padding of the nearest ScreenLayout body (0 outside one, with `body-edge`/`none`, and inside overlays).
 * A horizontal rail with `bleed` reaches this far past its box and pads the same amount back inside its scroll
 * content (`listRowScrollRoom(outset)`), so it scrolls to the screen edges while its first and last items sit on the
 * gutter. Products used to drop the whole body gutter (`contentInset="body-edge"`) and re-add 16 per section to get
 * one edge-to-edge carousel (spint home, 2026-10-17). Web reads the same value from `--hjm-screen-body-inline`.
 */
export const ScreenBodyInsetContext = createContext(0);
//# sourceMappingURL=screen-body-inset.js.map