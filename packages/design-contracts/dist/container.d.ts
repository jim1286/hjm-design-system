export type ContainerSize = "reading" | "content" | "full";
export type ContainerGutter = "none" | "compact" | "regular" | "spacious";
export type ContainerDescriptor = Readonly<{
    /** Reading measure, general product content, or an intentionally fluid region. */
    size?: ContainerSize;
    /** Logical inline padding; never a physical left/right value. */
    gutter?: ContainerGutter;
}>;
export type ResolvedContainerDescriptor = Readonly<{
    size: ContainerSize;
    gutter: ContainerGutter;
    maxWidth: number | null;
    paddingInline: number;
}>;
export declare const containerDefaults: {
    readonly size: "content";
    readonly gutter: "regular";
};
export declare const containerRecipe: {
    readonly slots: readonly ["root"];
    readonly defaults: {
        readonly size: "content";
        readonly gutter: "regular";
    };
    readonly maxWidths: {
        readonly reading: 720;
        readonly content: 1200;
        readonly full: null;
    };
    readonly gutters: {
        readonly none: 0;
        readonly compact: 16;
        readonly regular: 20;
        readonly spacious: 24;
    };
    readonly alignment: "inline-center";
};
export declare function validateContainerDescriptor(descriptor: ContainerDescriptor): void;
export declare function resolveContainerDescriptor(descriptor?: ContainerDescriptor): ResolvedContainerDescriptor;
//# sourceMappingURL=container.d.ts.map