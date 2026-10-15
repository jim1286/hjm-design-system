import { type BezierCoordinates } from "@hjmds/design-contracts/authoring-tools";
export type BezierEditorProps = Readonly<{
    value: BezierCoordinates;
    onValueChange: (value: BezierCoordinates) => void;
    disabled?: boolean;
    active?: boolean;
    duration?: number;
    yRange?: readonly [number, number];
    labels: Readonly<{
        coordinates: readonly [string, string, string, string];
        preview: string;
        curve: string;
        decrement: string;
        increment: string;
    }>;
    formatCoordinate: (value: number) => string;
}>;
/** ShortcutRecorder is Web-only: Native has no portable browser keyboard registration surface. */
export declare const authoringToolsCapabilities: Readonly<{
    bezierEditor: true;
    shortcutRecorder: false;
}>;
export declare function BezierEditor(props: BezierEditorProps): import("react").JSX.Element;
//# sourceMappingURL=authoring-tools.d.ts.map