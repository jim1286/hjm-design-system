import type { ReactNode } from "react";
import type { DataTableSortDirection } from "@hjmds/design-contracts/components/data-table";
export declare function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }: Readonly<{
    header: ReactNode;
    direction?: DataTableSortDirection | null;
    glyphs: Readonly<{
        ascending: string;
        descending: string;
        none: string;
    }>;
    className: string;
    accessibleName?: string;
    onSort: () => void;
}>): import("react").JSX.Element;
//# sourceMappingURL=table-sort-button.d.ts.map