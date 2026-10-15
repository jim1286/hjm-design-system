import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Animated, AppState, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { resolveToggleFeedbackProposal, resolveToggleFeedbackFrame, toggleFeedbackPaths, toggleFeedbackRecipe, type ToggleFeedbackEffect, type ToggleFeedbackState } from "@hjmds/design-contracts/toggle-feedback";
import { Button } from "./actions.js";
import { AnimatedStatistic } from "./statistic-motion.js";
import { Stack, Text } from "./primitives.js";
import { useHjmNativeTheme } from "./provider.js";
import { useCompositionAction } from "./internal/use-composition-action.js";
function FeedbackGlyph({ effect, selected, active, icon }: Readonly<{ effect: ToggleFeedbackEffect; selected: boolean; active: boolean; icon?: ReactNode }>) {
  const glyph = useRef<ComponentRef<typeof View>>(null), circle = useRef<ComponentRef<typeof Circle>>(null), rays = useRef<ComponentRef<typeof Path>>(null), previous = useRef(selected);
  const [value] = useState(() => new Animated.Value(1));
  const theme = useHjmNativeTheme(), reduced = theme.environment.reducedMotion;
  useEffect(() => {
    const entering = selected && !previous.current; previous.current = selected;
    const draw = (p: number) => { const f = resolveToggleFeedbackFrame(effect, p); glyph.current?.setNativeProps?.({ style: { transform: [{ translateY: f.translateY }, { scale: f.scale }] } }); circle.current?.setNativeProps?.({ r: f.radius, opacity: effect === "ripple" ? f.opacity : 0 }); rays.current?.setNativeProps?.({ d: f.rays, opacity: effect === "burst" ? f.opacity : 0 }); };
    const listener = value.addListener(({ value: p }) => draw(p));
    const settle = () => { value.stopAnimation(); value.setValue(1); draw(1); };
    // SVG geometry cannot use the native driver. Only host props change on each frame.
    if (!entering || reduced || !active || AppState.currentState !== "active") settle(); else { value.setValue(0); Animated.timing(value, { toValue: 1, duration: toggleFeedbackRecipe.duration, useNativeDriver: false }).start(); }
    const app = AppState.addEventListener("change", state => { if (state !== "active") settle(); });
    return () => { value.stopAnimation(); value.removeListener(listener); app.remove(); };
  }, [selected, effect, active, reduced, value]);
  const f = resolveToggleFeedbackFrame(effect, 1);
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "relative", width: toggleFeedbackRecipe.glyphSize, height: toggleFeedbackRecipe.glyphSize }}>
    <View ref={glyph}>{icon ?? <Svg width={24} height={24} viewBox="0 0 24 24"><Path d={toggleFeedbackPaths[effect]} fill={selected ? theme.colors.contentBrand : "none"} stroke={theme.colors.contentBrand} strokeWidth={1.7} strokeLinejoin="round" /></Svg>}</View>
    <Svg pointerEvents="none" width={40} height={40} viewBox="0 0 40 40" style={{ position: "absolute", left: -8, top: -8 }} fill="none" stroke={theme.colors.contentBrand} strokeWidth={1.7}><Circle ref={circle} cx={20} cy={20} r={f.radius} opacity={0} /><Path ref={rays} d={f.rays} opacity={0} strokeLinecap="round" /></Svg>
  </View>;
}
export type ToggleFeedbackButtonProps = Readonly<{
  entityId: string; state: ToggleFeedbackState; effect: ToggleFeedbackEffect; locale: string; icon?: ReactNode;
  renderIcon?: (state: Readonly<{ selected: boolean; pending: boolean }>) => ReactNode;
  labels: Readonly<{ select: string; selected: string; pending: string; count: string; error: string }>;
  /** Update confirmed state from the real API snapshot before resolving. */
  onSelectedChange: (selected: boolean) => void | Promise<void>; disabled?: boolean; active?: boolean;
}>;
export function ToggleFeedbackButton(props: ToggleFeedbackButtonProps) {
  if (!props.entityId.trim()) throw new TypeError("Toggle feedback requires a stable entity id");
  return <ToggleFeedbackBody key={props.entityId} {...props} />;
}
function ToggleFeedbackBody(props: ToggleFeedbackButtonProps) {
  resolveToggleFeedbackProposal(props.state, props.state.selected);
  const active = props.active !== false, action = useCompositionAction<ToggleFeedbackState>(props.disabled === true || !active), state = action.active ?? props.state;
  const icon = props.renderIcon ? props.renderIcon({ selected: state.selected, pending: action.pending }) : props.icon;
  return <Stack gap="sm"><Stack axis="inline" gap="md" align="center" wrap>
    <Button tone="secondary" selected={state.selected} loading={action.pending} loadingLabel={props.labels.pending} disabled={props.disabled === true || !active}
      leading={<FeedbackGlyph effect={props.effect} selected={state.selected} active={active} {...(icon === undefined ? {} : { icon })} />}
      onPress={() => { const proposal = resolveToggleFeedbackProposal(props.state, !props.state.selected); void action.run(proposal, () => props.onSelectedChange(proposal.selected)); }}>{state.selected ? props.labels.selected : props.labels.select}</Button>
    <AnimatedStatistic density="compact" descriptor={{ id: "selection-count", label: props.labels.count }} value={state.count} locale={props.locale} animated={active} />
  </Stack>{action.failed ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" tone="danger" align="center">{props.labels.error}</Text> : null}</Stack>;
}
