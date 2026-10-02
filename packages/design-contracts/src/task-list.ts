import{validateItems,type SortableItem}from'./interaction-adapters.js';
export type TaskItem=SortableItem & Readonly<{completed:boolean;description?:string}>;
export function validateTasks(items:readonly TaskItem[]):void{validateItems(items);if(items.some(item=>typeof item.completed!=='boolean'))throw new TypeError('Task completion must be boolean');}
