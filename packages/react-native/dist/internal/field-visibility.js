// Keyboard visibility belongs to the whole field, including its label and support/error line.
// Weak keys follow native input lifetimes without retaining detached editors.
const frames = new WeakMap();
export function setInputVisibilityFrame(input, frame) {
    if (frame)
        frames.set(input, frame);
    else
        frames.delete(input);
}
export function inputVisibilityFrame(input) {
    return frames.get(input)?.current ?? input;
}
//# sourceMappingURL=field-visibility.js.map