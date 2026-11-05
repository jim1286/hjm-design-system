import { type ScreenExitKind } from "@hjmds/design-contracts/screen-patterns";
/** Leaving a screen: icon-only, fixed at the header's leading edge (ScreenLayout and TopBar `exit`). */
export type ScreenExit = Readonly<{
    kind: ScreenExitKind;
    label: string;
    onClick(): void;
    disabled?: boolean;
}>;
/** Lucide chevron/cross (currentColor); back mirrors in RTL via CSS. */
export declare function ScreenExitButton({ kind, label, onClick, disabled }: ScreenExit): import("react").JSX.Element;
//# sourceMappingURL=screen-exit.d.ts.map