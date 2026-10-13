import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { AccessibilityInfo, ScrollView } from 'react-native';
import { Button } from '@hjmds/react-native/actions';
import { Dialog } from '@hjmds/react-native/overlays';
import { TextField } from '@hjmds/react-native/inputs';
import { CollectionDetailPreview } from '../../../showcase/native/src/collection-detail-preview';
import { collectionCopy as copy } from '../../../showcase/shared/collection-detail';
import { profileCopy } from '../../../showcase/shared/design-profile';
vi.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;afterEach(()=>{if(tree)act(()=>tree.unmount());vi.restoreAllMocks();});
const render=()=>act(()=>{tree=create(<CollectionDetailPreview/>,{createNodeMock:()=>({scrollTo:vi.fn()})});});
const button=(label:string)=>tree.root.findAllByType(Button).find(n=>n.props.children===label||Array.isArray(n.props.children)&&n.props.children.join('')===label)!;
const press=(label:string)=>act(()=>button(label).props.onPress());
const input=(label:string)=>tree.root.findAllByType(TextField).find(n=>n.props.label===label)!;
const fill=(label:string,value:string)=>act(()=>input(label).props.onValueChange(value));
const dialog=(label:string)=>tree.root.findAllByType(Dialog).find(n=>n.props.title===label)!;
const close=(label:string)=>act(()=>dialog(label).props.onOpenChange(false));
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,260));});
it('keeps native independent card and detail drafts across theme changes and reopening',async()=>{
 render();fill('산책 '+copy.note,'카드 초안');fill('독서 '+copy.note,'다른 초안');press('산책 '+copy.open);fill('산책 '+copy.detailNote,'상세 초안');const current=dialog('산책');act(()=>current.findAllByType(Button).find(n=>n.props.children===profileCopy.nextTheme)!.props.onPress());expect(dialog('산책').props.open).toBe(true);expect(input('산책 '+copy.detailNote).props.value).toBe('상세 초안');close('산책');await settle();expect(input('산책 '+copy.note).props.value).toBe('카드 초안');expect(input('독서 '+copy.note).props.value).toBe('다른 초안');press('산책 '+copy.open);expect(input('산책 '+copy.detailNote).props.value).toBe('상세 초안');
});
it('uses the invoking native action as return target and keeps other details independent',async()=>{
 const focus=vi.spyOn(AccessibilityInfo,'setAccessibilityFocus');render();press('독서 '+copy.open);const target=dialog('독서').props.returnFocusRef.current;expect(target).not.toBeNull();fill('독서 '+copy.detailNote,'독서 상세');close('독서');await settle();expect(focus).toHaveBeenCalled();press('휴식 '+copy.open);expect(dialog('휴식').props.returnFocusRef.current).not.toBe(target);expect(input('휴식 '+copy.detailNote).props.value).toBe(copy.initial);
});
it('keeps native drafts while the rail receives layout and observed scrolling',()=>{
 render();fill('독서 '+copy.note,'유지할 초안');const rail=tree.root.findAllByType(ScrollView).find(n=>n.props.horizontal)!;act(()=>rail.props.onLayout({nativeEvent:{layout:{width:390}}}));act(()=>rail.props.onScroll({nativeEvent:{contentOffset:{x:380}}}));press(profileCopy.nextTheme);expect(input('독서 '+copy.note).props.value).toBe('유지할 초안');
});
it('drops an open native detail when records are removed without reopening it on restoration',async()=>{
 render();press('산책 '+copy.open);act(()=>tree.update(<CollectionDetailPreview empty/>));await settle();expect(tree.root.findAllByType(Dialog)).toHaveLength(0);expect(button(copy.next).props.disabled).toBe(true);act(()=>tree.update(<CollectionDetailPreview/>));expect(dialog('산책').props.open).toBe(false);
});
