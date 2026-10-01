export type MenuSearchState = Readonly<{
    value: string;
    time: number;
}>;
export type MenuSearchItem = Readonly<{
    textValue: string;
    disabled?: boolean;
}>;
export declare function resolveMenuTypeahead(items: readonly MenuSearchItem[], currentIndex: number, key: string, previous: MenuSearchState, now: number): Readonly<{
    state: MenuSearchState;
    index: number | undefined;
}>;
//# sourceMappingURL=menu-typeahead.d.ts.map