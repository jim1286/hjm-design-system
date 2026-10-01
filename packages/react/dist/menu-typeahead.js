// The base Menu used 500ms; alternate presentations drifted to 600/700ms and
// searched DOM decorations. Share the base policy instead of changing each host.
const menuSearchResetMs = 500;
export function resolveMenuTypeahead(items, currentIndex, key, previous, now) {
    const prefix = now - previous.time < menuSearchResetMs ? previous.value : "";
    const value = `${prefix}${key}`.toLocaleLowerCase();
    const query = new Set(value).size === 1 ? key.toLocaleLowerCase() : value;
    for (let offset = 1; offset <= items.length; offset += 1) {
        const index = (currentIndex + offset + items.length) % items.length;
        const item = items[index];
        if (item && !item.disabled && item.textValue.toLocaleLowerCase().startsWith(query)) {
            return { state: { value, time: now }, index };
        }
    }
    return { state: { value, time: now }, index: undefined };
}
//# sourceMappingURL=menu-typeahead.js.map