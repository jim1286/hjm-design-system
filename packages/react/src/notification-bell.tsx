import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "./actions.js";
import { CounterBadge } from "./supplemental-display.js";
import { useHjmTheme } from "./provider.js";
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type NotificationBellProps = Readonly<{ label: string; count: number; icon: ReactNode; onPress: () => void; disabled?: boolean; active?: boolean;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. `width` is ignored: the badge is anchored to the icon's edge. */
  layoutStyle?: HjmCompositionStyleProp }>;
export function NotificationBell({ label, count, icon, onPress, disabled = false, active = true, layoutStyle }: NotificationBellProps) {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError("Unread count must be a nonnegative integer");
  const { environment } = useHjmTheme();
  const art = useRef<HTMLSpanElement>(null);
  const previous = useRef(count);
  useEffect(() => {
    const increased = count > previous.current; previous.current = count;
    if (!increased || !active || environment.reducedMotion || document.hidden || !art.current?.animate) return;
    // One bounded pulse for new unread items; never ring continuously or on mount.
    const animation = art.current.animate([{transform:'rotate(0deg)'},{transform:'rotate(12deg)'},{transform:'rotate(-12deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0deg)'}],{duration:400,easing:'ease-out'});
    const stop=()=>{if(document.hidden)animation.cancel();};document.addEventListener('visibilitychange',stop);
    return ()=>{animation.cancel();document.removeEventListener('visibilitychange',stop);};
  },[count,active,environment.reducedMotion]);
  // Keep the badge anchored to the icon even in a stretching Stack or grid. layoutStyle comes
  // after the defaults (alignSelf included) except `width`: the floating badge sits on the root's
  // inline-end edge, so a wider root would detach it from the icon. Use margins or alignSelf to place.
  return <span style={{alignSelf:'flex-start',position:'relative',display:'inline-flex',...layoutStyle,width:'max-content'}}><IconButton label={label} disabled={disabled} onClick={onPress}><span ref={art} aria-hidden="true" style={{display:'inline-flex',transformOrigin:'top center'}}>{icon}</span></IconButton><span aria-hidden="true" style={{position:'absolute',insetInlineEnd:0,top:0,pointerEvents:'none'}}><CounterBadge count={count} variant="floating"/></span></span>;
}
