import {act} from "react";
import {createRoot} from "react-dom/client";
import {it,expect} from "vitest";
import {ConversationRow} from "../src/conversation-row.js";
import "../src/styles.css";
it("preserves the sole router target, timestamp and unread state",async()=>{
 (globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
 const host=document.createElement("div"); document.body.append(host); const root=createRoot(host);
 try {
 await act(async()=>root.render(<a href="/peer" aria-label="Peer. hello. now. 2 unread"><ConversationRow title="Peer" preview="hello" metadata="now" avatar={<span>avatar</span>} unread/></a>));
 expect(host.querySelectorAll("a").length).toBe(1);
 expect(host.querySelector("[data-hjm-unread-dot]")).not.toBeNull();
 expect(host.textContent).toContain(" · now");
 expect(host.querySelector("[data-hjm-conversation-row]")?.getAttribute("aria-hidden")).toBe("true");
 await act(async()=>root.render(<a href="/peer" aria-label="Peer. hello. now"><ConversationRow title="Peer" preview="hello" metadata="now" avatar={null}/></a>));
 expect(host.querySelector("[data-hjm-unread-dot]")).toBeNull();
 } finally {await act(async()=>root.unmount());host.remove();}
});

import {SegmentedControl} from "../src/selection.js";
import {ListRow} from "../src/display.js";
it("retains radio selection for text navigation and keeps row actions outside links",async()=>{
 const host=document.createElement("div");document.body.append(host);const root=createRoot(host);let selected="";let followed=0;
 try {
 await act(async()=>root.render(<><SegmentedControl label="Feed" presentation="text" items={[{value:"new",label:"New"},{value:"following",label:"Following"}]} onValueChange={value=>{selected=value;}}/>
 <ListRow title="Person" href="/person" renderLink={props=><a {...props} data-router="true"/>} trailingAction={<button onClick={()=>followed++}>Follow</button>}/></>));
 const radio=host.querySelector<HTMLInputElement>('input[value="following"]')!;
 await act(async()=>radio.click()); expect(selected).toBe("following");expect(radio.checked).toBe(true);
 const group=host.querySelector('[role="radiogroup"]')!;expect(group).not.toBeNull();
 const link=host.querySelector('a[data-router]')!;const action=host.querySelector('button')!;
 expect(link.contains(action)).toBe(false);await act(async()=>action.click());expect(followed).toBe(1);
 } finally {await act(async()=>root.unmount());host.remove();}
});
