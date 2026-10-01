import { validateItems } from './interaction-adapters.js';
export function validateTasks(items) { validateItems(items); if (items.some(item => typeof item.completed !== 'boolean'))
    throw new TypeError('Task completion must be boolean'); }
//# sourceMappingURL=task-list.js.map