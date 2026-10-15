import { type BezierCoordinates, type Shortcut, type ShortcutCapture } from "@hjmds/design-contracts/authoring-tools";
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
export declare function BezierEditor(props: BezierEditorProps): import("react").JSX.Element;
export type ShortcutRecorderProps = Readonly<{
    value: Shortcut | null;
    onRegister: (shortcut: Shortcut) => void | Promise<void>;
    platform: "mac" | "windows" | "linux";
    conflicts?: readonly string[];
    reserved?: readonly string[];
    disabled?: boolean;
    formatShortcut: (shortcut: Shortcut) => string;
    labels: Readonly<{
        record: string;
        recording: string;
        empty: string;
        register: string;
        cancel: string;
        error: string;
        status: (status: ShortcutCapture["status"]) => string;
    }>;
}>;
export declare function ShortcutRecorder(props: ShortcutRecorderProps): import("react").JSX.Element;
//# sourceMappingURL=authoring-tools.d.ts.map