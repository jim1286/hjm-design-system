import {
  createElement,
  forwardRef,
  type ReactNode,
} from "react";

type HostProps = Readonly<Record<string, unknown>> &
  Readonly<{ children?: ReactNode; style?: unknown; visible?: boolean }>;

function host(name: string) {
  return forwardRef<unknown, HostProps>(function Host({ children, style, ...props }, ref) {
    const resolvedStyle =
      typeof style === "function"
        ? (style as (state: { pressed: boolean; focused: boolean; hovered: boolean }) => unknown)({
            pressed: false,
            focused: false,
            hovered: false,
          })
        : style;
    return createElement(name, { ...props, ref, style: resolvedStyle }, children as ReactNode);
  });
}

export const View = host("View");
export const Text = host("Text");
export const TextInput = host("TextInput");
export const Pressable = host("Pressable");
export const Switch = host("Switch");
export const ActivityIndicator = host("ActivityIndicator");
export const ScrollView = host("ScrollView");
export const Image = host("Image");
class AnimatedValue {
  current: number;

  constructor(value: number) {
    this.current = value;
  }

  setValue(value: number) {
    this.current = value;
  }

  stopAnimation() {}

  interpolate(configuration: Readonly<Record<string, unknown>>) {
    return { __animatedValue: this, configuration };
  }
}
export const Animated = {
  Value: AnimatedValue,
  View: host("AnimatedView"),
  timing: (value: AnimatedValue, configuration: Readonly<{ toValue: number }>) => ({
    start: (callback?: (result: Readonly<{ finished: boolean }>) => void) => {
      value.setValue(configuration.toValue);
      callback?.({ finished: true });
    },
    stop: () => undefined,
  }),
};
export const Easing = {
  bezier: (..._coordinates: readonly number[]) => (value: number) => value,
};
export const StyleSheet = {
  create: <Styles extends Readonly<Record<string, unknown>>>(styles: Styles) => styles,
  flatten: (style: unknown) => style,
};

export const PanResponder = {
  create: (callbacks: Readonly<Record<string, unknown>>) => ({
    panHandlers: {
      onMoveShouldSetResponder: callbacks.onMoveShouldSetPanResponder,
      onResponderGrant: callbacks.onPanResponderGrant,
      onResponderMove: callbacks.onPanResponderMove,
      onResponderRelease: callbacks.onPanResponderRelease,
      onResponderTerminate: callbacks.onPanResponderTerminate,
      onResponderTerminationRequest: callbacks.onPanResponderTerminationRequest,
      onStartShouldSetResponder: callbacks.onStartShouldSetPanResponder,
    },
  }),
};

export const Modal = forwardRef<unknown, HostProps>(function Modal(
  { children, visible, ...props },
  ref,
) {
  return visible
    ? createElement("Modal", { ...props, ref, visible }, children as ReactNode)
    : null;
});

let windowDimensions = { width: 800, height: 600, scale: 2, fontScale: 1 };

export function __setWindowDimensions(next: typeof windowDimensions): void {
  windowDimensions = next;
}

export function useWindowDimensions() {
  return windowDimensions;
}

export function useColorScheme() {
  return "light" as const;
}

export const I18nManager = { isRTL: false };
export const PixelRatio = { getFontScale: () => windowDimensions.fontScale };
export const AccessibilityInfo = {
  isReduceMotionEnabled: async () => false,
  addEventListener: () => ({ remove: () => undefined }),
  announceForAccessibilityWithOptions: (
    _announcement: string,
    _options?: Readonly<{ queue?: boolean }>,
  ) => undefined,
  setAccessibilityFocus: (_nativeHandle: number) => undefined,
};
export const AppState = {
  currentState: "active",
  addEventListener: (_event: string, _listener: (state: string) => void) => ({
    remove: () => undefined,
  }),
};
export const Platform = {
  OS: "android",
  select: <Value,>(options: Readonly<Record<string, Value>> & { default?: Value }) =>
    options.android ?? options.default,
};
export const InteractionManager = {
  runAfterInteractions: (callback: () => void) => {
    const timer = setTimeout(callback, 0);
    return {
      cancel: () => clearTimeout(timer),
    };
  },
};
type KeyboardEventName = "keyboardDidShow" | "keyboardDidHide";
type MockKeyboardEvent = Readonly<{ endCoordinates: Readonly<{ height: number }> }>;
const keyboardListeners = new Map<
  KeyboardEventName,
  Set<(event: MockKeyboardEvent) => void>
>();
let keyboardVisible = false;
export const Keyboard = {
  isVisible: () => keyboardVisible,
  addListener: (event: KeyboardEventName, listener: (event: MockKeyboardEvent) => void) => {
    const listeners = keyboardListeners.get(event) ?? new Set<(event: MockKeyboardEvent) => void>();
    listeners.add(listener);
    keyboardListeners.set(event, listeners);
    return { remove: () => listeners.delete(listener) };
  },
  __emit(event: KeyboardEventName, height = 0) {
    keyboardVisible = event === "keyboardDidShow";
    for (const listener of keyboardListeners.get(event) ?? []) {
      listener({ endCoordinates: { height } });
    }
  },
};
export const findNodeHandle = (_target: unknown) => 1;

// Type-only compatibility placeholders used by Vitest's aliased production modules.
export type StyleProp<Value> = Value | readonly StyleProp<Value>[] | null | undefined | false;
export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type ViewProps = HostProps;
export type TextProps = HostProps;
export type TextInputProps = HostProps;
export type PressableProps = HostProps & Readonly<{ onPress?: () => void }>;
export type SwitchProps = HostProps;
export type ModalProps = HostProps;
export type ImageProps = HostProps & Readonly<{ source?: unknown; onError?: (event: unknown) => void }>;
export type ImageSourcePropType = unknown;
export type ImageStyle = Record<string, unknown>;
export type Insets = Readonly<{ top: number; right: number; bottom: number; left: number }>;
export type GestureResponderEvent = Readonly<{
  nativeEvent: Readonly<{ locationX: number }>;
}>;
export type LayoutChangeEvent = Readonly<{
  nativeEvent: Readonly<{ layout: Readonly<{ width: number }> }>;
}>;
