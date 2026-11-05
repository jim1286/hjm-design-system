import type { ReactNode } from "react";
import type { DataTableSortDirection } from "@hjmds/design-contracts/components/data-table";
import type { IconNode } from "lucide";
export declare function TableSortButton({ header, direction, glyphs, className, accessibleName, onSort }: Readonly<{
    header: ReactNode;
    direction?: DataTableSortDirection | null;
    glyphs: Readonly<{
        ascending: IconNode;
        descending: IconNode;
        none: IconNode;
    }>;
    className: string;
    accessibleName?: string;
    onSort: () => void;
}>): import("react").JSX.Element;
//# sourceMappingURL=table-sort-button.d.ts.map