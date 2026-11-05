import { type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{
    kind: ScreenExitKind;
    label: string;
    onPress(): void;
    disabled?: boolean;
}>;
/** Lucide chevron/X so back and close look identical on every platform and font; back mirrors with the reading direction. */
export declare function ScreenExitButton({ kind, label, onPress, disabled }: ScreenExit): import("react").JSX.Element;
//# sourceMappingURL=screen-exit.d.ts.map