import type { ComponentRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useRef } from "react";
import { Keyboard, TextInput, type ScrollView } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { HjmNativeProvider } from "../src/provider.js";
import { useScrollFocusedInputIntoView } from "../src/keyboard.js";
import { TextArea } from "../src/inputs.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const originalState = Object.getOwnPropertyDescriptor(TextInput, "State");
let tree: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => tree?.unmount()); tree = undefined;
  if (originalState) Object.defineProperty(TextInput, "State", originalState);
  else Reflect.deleteProperty(TextInput, "State");
});

function render(fieldBottom: number, shared = true) {
  const scrollTo = vi.fn();
  type Measure = (x: number, y: number, width: number, height: number) => void;
  const input = { measureInWindow: (read: Measure) => read(0, 320, 200, Math.min(100, fieldBottom - 340)) };
  const viewport = { scrollTo, measureInWindow: (read: Measure) => read(0, 100, 200, 300) };
  function Body() {
    const scroll = useRef(viewport as unknown as ComponentRef<typeof ScrollView>);
    useScrollFocusedInputIntoView(scroll);
    return shared ? <TextArea label="Message" description="0/80" /> : <TextInput />;
  }
  Object.defineProperty(TextInput, "State", { configurable: true, value: { currentlyFocusedInput: () => input } });
  act(() => { tree = create(<HjmNativeProvider reducedMotion>
    <Body />
  </HjmNativeProvider>, { createNodeMock: element => {
    if (element.type === "TextInput") return input;
    return { measureInWindow: (read: Measure) => (element.props as { collapsable?: boolean }).collapsable === false
      ? read(0, 300, 200, fieldBottom - 300) : read(0, 0, 200, 800) };
  } }); });
  act(() => (Keyboard as typeof Keyboard & { __emit(event: string, height: number): void }).__emit("keyboardDidShow", 300));
  return scrollTo;
}

it("scrolls the whole shared field, including the support line, above the footer", () => {
  expect(render(500)).toHaveBeenCalledWith({ y: 116, animated: true });
});
it("leaves a fully visible shared field in place", () => {
  expect(render(380)).not.toHaveBeenCalled();
});
it("still reveals a native input outside an HJM field", () => {
  expect(render(500, false)).toHaveBeenCalledWith({ y: 36, animated: true });
});
