import type { ComponentRef } from "react";
import type { RefObject } from "react";
import type { View } from "react-native";

// Keyboard visibility belongs to the whole field, including its label and support/error line.
// Weak keys follow native input lifetimes without retaining detached editors.
const frames = new WeakMap<object, RefObject<ComponentRef<typeof View> | null>>();
export function setInputVisibilityFrame(input: object, frame: RefObject<ComponentRef<typeof View> | null> | null) {
  if (frame) frames.set(input, frame);
  else frames.delete(input);
}
export function inputVisibilityFrame<Input extends object>(input: Input): ComponentRef<typeof View> | Input {
  return frames.get(input)?.current ?? input;
}
