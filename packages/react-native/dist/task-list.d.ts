import type { ReactNode } from 'react';
import { type TaskItem } from '@hjmds/design-contracts/task-list';
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
}>;
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export declare function TaskList({ label, items, onCompletedChange, disabled, emptyContent, renderCollection }: TaskListProps): import("react").JSX.Element;
//# sourceMappingURL=task-list.d.ts.map