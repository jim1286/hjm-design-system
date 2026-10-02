import type{ReactNode}from'react';
import{validateTasks,type TaskItem}from'@hjmds/design-contracts/task-list';
import{Checkbox}from'./selection.js';import{List}from'./advanced-display.js';
export type TaskListProps=Readonly<{label:string;items:readonly TaskItem[];onCompletedChange:(id:string,completed:boolean)=>void;disabled?:boolean;emptyContent?:ReactNode;renderCollection?:(context:Readonly<{items:readonly TaskItem[];renderItem:(item:TaskItem)=>ReactNode}>)=>ReactNode}>;
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export function TaskList({label,items,onCompletedChange,disabled=false,emptyContent,renderCollection}:TaskListProps){validateTasks(items);if(!label.trim())throw new TypeError('TaskList needs a localized label');
 const renderItem=(item:TaskItem)=>{const control=<Checkbox label={item.label} checked={item.completed} disabled={disabled||item.disabled===true} onCheckedChange={completed=>onCompletedChange(item.id,completed)} {...(item.description===undefined?{}:{description:item.description})}/>;return <div style={{padding:"var(--hjm-space-md)"}}>{control}</div>;};
 if(items.length===0)return <List label={label}>{emptyContent}</List>;
 if(renderCollection)return <>{renderCollection({items,renderItem})}</>;
 return <List label={label} appearance="grouped">{items.map(item=><div key={item.id}>{renderItem(item)}</div>)}</List>;
}
