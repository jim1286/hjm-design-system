import { type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{
    kind: ScreenExitKind;
    label: string;
    onPress(): void;
    disabled?: boolean;
}>;
/** Drawn chevron/cross so back and close look identical on every platform and font. */
export declare function ScreenExitButton({ kind, label, onPress, disabled }: ScreenExit): import("react").JSX.Element;
//# sourceMappingURL=screen-exit.d.ts.map