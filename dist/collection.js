export const collectionValidationDefaults = {
    requireItemLabel: true,
    requireTextValue: true,
    requireSectionName: true,
};
function assertNonEmpty(value, name) {
    if (!value.trim())
        throw new TypeError(`${name} must not be empty`);
}
/**
 * Validates renderer-neutral collection identity before focus or selection state
 * is derived. Item IDs are global across sections because selection APIs expose
 * one key namespace.
 */
export function validateCollection(source, options = collectionValidationDefaults) {
    const resolved = { ...collectionValidationDefaults, ...options };
    const itemIds = new Set();
    const sectionIds = new Set();
    const sections = source.sections;
    const items = sections
        ? sections.flatMap((section) => {
            assertNonEmpty(section.id, "section id");
            if (sectionIds.has(section.id)) {
                throw new TypeError(`duplicate section id: ${section.id}`);
            }
            sectionIds.add(section.id);
            if (resolved.requireSectionName) {
                const name = section.accessibilityLabel?.trim() || section.label;
                if (!name) {
                    throw new TypeError(`section ${section.id} needs an accessible name`);
                }
                assertNonEmpty(name, `section ${section.id} name`);
            }
            return section.items;
        })
        : source.items;
    for (const item of items) {
        assertNonEmpty(item.id, "item id");
        if (itemIds.has(item.id)) {
            throw new TypeError(`duplicate item id: ${item.id}`);
        }
        itemIds.add(item.id);
        if (resolved.requireItemLabel) {
            assertNonEmpty(item.label, `item ${item.id} label`);
        }
        if (resolved.requireTextValue) {
            assertNonEmpty(item.textValue, `item ${item.id} textValue`);
        }
    }
}
export function flattenCollectionItems(source) {
    return source.sections
        ? source.sections.flatMap((section) => section.items)
        : source.items;
}
export function resolveCollectionItem(source, key) {
    if (key == null)
        return null;
    return flattenCollectionItems(source).find((item) => item.id === key) ?? null;
}
export function getCollectionNavigationIntent(key) {
    if (key === "ArrowDown")
        return "next";
    if (key === "ArrowUp")
        return "previous";
    if (key === "Home")
        return "first";
    if (key === "End")
        return "last";
    return undefined;
}
/** Navigation math shared by Menu, Select, Combobox and future listboxes. */
export function getCollectionNavigationTarget(source, currentKey, intent, loop = true) {
    validateCollection(source);
    const enabled = flattenCollectionItems(source).filter((item) => !item.disabled);
    if (enabled.length === 0)
        return undefined;
    if (intent === "first")
        return enabled[0]?.id;
    if (intent === "last")
        return enabled.at(-1)?.id;
    const currentIndex = enabled.findIndex((item) => item.id === currentKey);
    if (currentIndex < 0) {
        return intent === "previous" ? enabled.at(-1)?.id : enabled[0]?.id;
    }
    const nextIndex = currentIndex + (intent === "next" ? 1 : -1);
    if (!loop && (nextIndex < 0 || nextIndex >= enabled.length)) {
        return enabled[currentIndex]?.id;
    }
    return enabled[(nextIndex + enabled.length) % enabled.length]?.id;
}
function collectionTextStartsWith(textValue, query, locale) {
    const candidate = textValue.normalize("NFC").trimStart();
    const normalizedQuery = query.normalize("NFC").trim();
    if (!normalizedQuery)
        return false;
    const collator = new Intl.Collator(locale, {
        usage: "search",
        sensitivity: "base",
    });
    // Collation-equivalent prefixes do not always have the same UTF-16 length
    // (for example German ß and ss), so compare a small prefix window instead
    // of slicing only by query.length.
    const maxPrefixLength = Math.min(candidate.length, normalizedQuery.length + 4);
    for (let length = 1; length <= maxPrefixLength; length += 1) {
        if (collator.compare(candidate.slice(0, length), normalizedQuery) === 0) {
            return true;
        }
    }
    return false;
}
/** Products own buffering; this helper owns matching order and disabled skip. */
export function getCollectionTypeaheadMatch(source, query, options = {}) {
    validateCollection(source);
    if (!query.trim())
        return undefined;
    const enabled = flattenCollectionItems(source).filter((item) => !item.disabled);
    if (enabled.length === 0)
        return undefined;
    const currentIndex = enabled.findIndex((item) => item.id === options.startsAfterKey);
    for (let offset = 1; offset <= enabled.length; offset += 1) {
        const item = enabled[(currentIndex + offset + enabled.length) % enabled.length];
        if (item &&
            collectionTextStartsWith(item.textValue, query, options.locale)) {
            return item.id;
        }
    }
    return undefined;
}
/** Missing keys clear; disabled-but-still-present selections are retained. */
export function reconcileSelectSelection(source, selectedKey, options = {}) {
    validateCollection(source);
    if (options.selectedItem) {
        validateCollection({ items: [options.selectedItem] });
        if (selectedKey == null) {
            throw new RangeError("selectedItem requires a selectedKey");
        }
        if (options.selectedItem.id !== selectedKey) {
            throw new RangeError("selectedItem id must match selectedKey");
        }
    }
    const items = flattenCollectionItems(source);
    if (selectedKey != null && items.some((item) => item.id === selectedKey)) {
        return selectedKey;
    }
    if (selectedKey != null &&
        (options.asyncState?.status === "loading" ||
            options.asyncState?.status === "loadingMore" ||
            options.asyncState?.status === "error")) {
        return selectedKey;
    }
    if (options.disallowEmptySelection) {
        return items.find((item) => !item.disabled)?.id ?? null;
    }
    return null;
}
/** Resolves visible Select copy independently from a transient result page. */
export function resolveSelectSelectedItem(source, selectedKey, selectedItem) {
    validateCollection(source);
    if (selectedItem)
        validateCollection({ items: [selectedItem] });
    if (selectedKey == null) {
        if (selectedItem) {
            throw new RangeError("selectedItem requires a selectedKey");
        }
        return null;
    }
    if (selectedItem && selectedItem.id !== selectedKey) {
        throw new RangeError("selectedItem id must match selectedKey");
    }
    const itemInSource = source.sections
        ? source.sections
            .flatMap((section) => section.items)
            .find((item) => item.id === selectedKey)
        : source.items.find((item) => item.id === selectedKey);
    return selectedItem ?? itemInSource ?? null;
}
export function isComboboxResultCurrent(queryValue, resultQuery) {
    return queryValue === resultQuery;
}
/**
 * External result pages are not the source of truth for a committed value.
 * A product may supply the committed descriptor while a different query is
 */
export function resolveComboboxSelectedItem(source, selectedKey, selectedItem) {
    validateCollection(source);
    if (selectedItem)
        validateCollection({ items: [selectedItem] });
    if (selectedKey == null) {
        if (selectedItem) {
            throw new RangeError("selectedItem requires a selectedKey");
        }
        return null;
    }
    if (selectedItem && selectedItem.id !== selectedKey) {
        throw new RangeError("selectedItem id must match selectedKey");
    }
    // A supplied descriptor is the committed snapshot. Prefer it even if a
    // stale external page happens to contain the same stable key.
    if (selectedItem)
        return selectedItem;
    const itemInResults = source.sections
        ? source.sections
            .flatMap((section) => section.items)
            .find((item) => item.id === selectedKey)
        : source.items.find((item) => item.id === selectedKey);
    if (itemInResults)
        return itemInResults;
    throw new RangeError(`Selected combobox item is unavailable: ${selectedKey}`);
}
//# sourceMappingURL=collection.js.map