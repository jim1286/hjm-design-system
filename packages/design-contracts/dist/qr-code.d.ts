export type QRErrorCorrection = "L" | "M" | "Q" | "H";
/** Pure encoding: hosts render the same matrix without image/network dependencies. */
export type QREncoder = (type: 0, level: QRErrorCorrection) => {
    addData(value: string, mode: "Byte"): void;
    make(): void;
    getModuleCount(): number;
    isDark(row: number, column: number): boolean;
};
export declare function createQRMatrix(value: string, encode: QREncoder, level?: QRErrorCorrection): {
    count: number;
    cells: boolean[][];
    quietZone: 4;
};
export declare function qrPath(matrix: ReturnType<typeof createQRMatrix>): string;
export { qrCodeRecipe } from "./qr-code-recipe.js";
//# sourceMappingURL=qr-code.d.ts.map