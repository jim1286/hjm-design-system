import { iconButtonRecipe } from "@hjmds/design-contracts/recipes";
import type { HjmCompositionStyleProp } from "../composition-style.js";
import type { CSSProperties, ReactNode } from "react";

// Interactive identity marks reserve the standard control target; navigation stays outside bubble gestures.
export function IdentityAction({ action, children, layoutStyle }: Readonly<{ action: Readonly<{ label: string; onPress(): void; disabled?: boolean }>; children: ReactNode; layoutStyle?: HjmCompositionStyleProp }>) {
  if (!action.label.trim()) throw new TypeError("Member profile action requires a localized label");
  return <button type="button" className="hjm-identity-action" style={{...layoutStyle,minInlineSize:iconButtonRecipe.sizes.medium.diameter,minBlockSize:iconButtonRecipe.sizes.medium.diameter,opacity:action.disabled?iconButtonRecipe.states.disabledOpacity:undefined,"--hjm-identity-pressed-opacity":iconButtonRecipe.states.pressedOpacity,"--hjm-identity-target":`${iconButtonRecipe.sizes.medium.diameter}px`} as CSSProperties} disabled={action.disabled} aria-label={action.label} title={action.label} onClick={event => { event.stopPropagation(); if(!action.disabled)action.onPress(); }}><span aria-hidden="true">{children}</span></button>;
}

