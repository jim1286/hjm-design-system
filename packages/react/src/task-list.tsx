import type{ReactNode}from'react';
import{validateTasks,type TaskItem}from'@hjmds/design-contracts/task-list';
import{Checkbox}from'./selection.js';import{List}from'./advanced-display.js';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type TaskListProps=Readonly<{label:string;items:readonly TaskItem[];onCompletedChange:(id:string,completed:boolean)=>void;disabled?:boolean;emptyContent?:ReactNode;
 /** Independent row action beside the checkbox; apply disabled to the supplied control. */
 renderItemAction?:(context:Readonly<{item:TaskItem;disabled:boolean}>)=>ReactNode;
 renderCollection?:(context:Readonly<{items:readonly TaskItem[];renderItem:(item:TaskItem)=>ReactNode}>)=>ReactNode;
 /** Canonical layout-only placement on the List root. With `renderCollection` the product owns the root, so place that instead. */
 layoutStyle?:HjmCompositionStyleProp}>;
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export function TaskList({label,items,onCompletedChange,disabled=false,emptyContent,renderItemAction,renderCollection,layoutStyle}:TaskListProps){validateTasks(items);if(!label.trim())throw new TypeError('TaskList needs a localized label');
 const renderItem=(item:TaskItem)=>{const control=<Checkbox label={item.label} checked={item.completed} disabled={disabled||item.disabled===true} onCheckedChange={completed=>onCompletedChange(item.id,completed)} {...(item.description===undefined?{}:{description:item.description})}/>;const action=renderItemAction?.({item,disabled:disabled||item.disabled===true});
 // The action sits beside Checkbox, never inside its label (pressing it must not toggle completion); long labels wrap
 // inside the checkbox column. A separate action line made each task two to three lines tall (2026-10-17 review).
 return <div style={{display:"grid",gridTemplateColumns:action==null?"minmax(0, 1fr)":"minmax(0, 1fr) auto",alignItems:"center",gap:"var(--hjm-space-sm)"}}>{control}{action}</div>;};
 if(items.length===0)return <List label={label} {...(layoutStyle===undefined?{}:{layoutStyle})}>{emptyContent}</List>;
 if(renderCollection)return <>{renderCollection({items,renderItem})}</>;
 return <List label={label} appearance="grouped" {...(layoutStyle===undefined?{}:{layoutStyle})}>{items.map(item=><div key={item.id} style={{padding:"var(--hjm-space-md)"}}>{renderItem(item)}</div>)}</List>;
}
