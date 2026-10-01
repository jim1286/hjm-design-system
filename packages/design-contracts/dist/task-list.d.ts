import { type SortableItem } from './interaction-adapters.js';
export type TaskItem = SortableItem & Readonly<{
    completed: boolean;
    description?: string;
}>;
export declare function validateTasks(items: readonly TaskItem[]): void;
//# sourceMappingURL=task-list.d.ts.map