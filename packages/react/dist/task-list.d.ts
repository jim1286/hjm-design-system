import type { ReactNode } from 'react';
import { type TaskItem } from '@hjmds/design-contracts/task-list';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TaskListProps = Readonly<{
    label: string;
    items: readonly TaskItem[];
    onCompletedChange: (id: string, completed: boolean) => void;
    disabled?: boolean;
    emptyContent?: ReactNode;
    renderCollection?: (context: Readonly<{
        items: readonly TaskItem[];
        renderItem: (item: TaskItem) => ReactNode;
    }>) => ReactNode;
    /** Canonical layout-only placement on the List root. With `renderCollection` the product owns the root, so place that instead. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export declare function TaskList({ label, items, onCompletedChange, disabled, emptyContent, renderCollection, layoutStyle }: TaskListProps): import("react").JSX.Element;
//# sourceMappingURL=task-list.d.ts.map