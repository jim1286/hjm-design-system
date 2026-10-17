import type{ReactNode}from'react';
import{validateTasks,type TaskItem}from'@hjmds/design-contracts/task-list';
import{Checkbox}from'./inputs.js';import{List}from'./data-display.js';
import{View}from"react-native";import{spacing}from"@hjmds/design-contracts/foundations";
export type TaskListProps=Readonly<{label:string;items:readonly TaskItem[];onCompletedChange:(id:string,completed:boolean)=>void;disabled?:boolean;emptyContent?:ReactNode;
 /** Independent row action beside the checkbox; apply disabled to the supplied control. */
 renderItemAction?:(context:Readonly<{item:TaskItem;disabled:boolean}>)=>ReactNode;
 renderCollection?:(context:Readonly<{items:readonly TaskItem[];renderItem:(item:TaskItem)=>ReactNode}>)=>ReactNode}>;
/** Canonical Checkbox/List own semantics; optional collection composition keeps drag peers out of this entry. */
export function TaskList({label,items,onCompletedChange,disabled=false,emptyContent,renderItemAction,renderCollection}:TaskListProps){validateTasks(items);if(!label.trim())throw new TypeError('TaskList needs a localized label');
 const renderItem=(item:TaskItem)=>{const control=<Checkbox label={item.label} checked={item.completed} disabled={disabled||item.disabled===true} onCheckedChange={completed=>onCompletedChange(item.id,completed)} {...(item.description===undefined?{}:{description:item.description})}/>;const action=renderItemAction?.({item,disabled:disabled||item.disabled===true});
 // Same as Web: the action sits beside Checkbox (never inside its label, so pressing it cannot toggle completion) and
 // long labels wrap inside the checkbox column; a separate action line made each task two to three lines tall.
 return <View style={{alignItems:"center",flexDirection:"row",gap:spacing.sm}}><View style={{flex:1,minWidth:0}}>{control}</View>{action}</View>;};
 if(items.length===0)return <List label={label}>{emptyContent}</List>;
 if(renderCollection)return <>{renderCollection({items,renderItem})}</>;
 return <List label={label} appearance="grouped">{items.map(item=><View key={item.id} style={{padding:spacing.md}}>{renderItem(item)}</View>)}</List>;
}
