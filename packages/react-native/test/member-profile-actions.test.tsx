import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import { afterEach, expect, it, vi } from 'vitest';
import { HjmNativeProvider } from '../src/provider.js';
import { Avatar, Card, ListRow } from '../src/data-display.js';
import { NotificationRow } from '../src/screens.js';
import { CommentThreadRow } from '../src/screen-flows.js';
import { ConversationRow } from '../src/conversation-row.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer;
afterEach(()=>act(()=>tree?.unmount()));
it('keeps all member controls outside content pressables and accessibility-hidden artwork',()=>{
 const profile=vi.fn(),content=vi.fn(),like=vi.fn(),reply=vi.fn();const avatar=<Avatar decorative name="민수" size="small"/>;
 act(()=>{tree=create(<HjmNativeProvider>
  <Avatar decorative name="민수" action={{label:'회원 사진',onPress:profile}}/>
  <Card title="카드" leading={avatar} leadingAction={{label:"카드 작성자",onPress:profile}} onActivate={content} accessibilityLabel="카드 열기"/>
  <ListRow title="글" onPress={content} leading={avatar} leadingAction={{label:'목록 작성자',onPress:profile}}/>
  <CommentThreadRow item={{id:'c',parentId:null,author:'민수',body:<Text>댓글</Text>,timeLabel:'지금',likeCountLabel:'0',avatar,avatarAction:{label:'댓글 작성자',onPress:profile},likeIcon:<Text>♥</Text>,likeLabel:'좋아요'}} onLike={like} onReply={reply} replyLabel="답글"/>
  <NotificationRow preview="댓글 알림" metadata="지금" avatar={avatar} avatarAction={{label:'알림 발신자',onPress:profile}} action={{label:'알림 열기',onActivate:content}}/>
  <ConversationRow title="민수" preview="안녕" metadata="지금" avatar={avatar} avatarAction={{label:'대화 상대',onPress:profile}} renderBody={body=><Pressable accessibilityLabel="대화 열기" onPress={content}>{body}</Pressable>}/>
 </HjmNativeProvider>);});
 const controls=tree.root.findAllByType(Pressable).filter(node=>['회원 사진','카드 작성자','목록 작성자','댓글 작성자','알림 발신자','대화 상대'].includes(node.props.accessibilityLabel));
 expect(controls).toHaveLength(6);
 for(const control of controls){for(let parent=control.parent;parent;parent=parent.parent){expect(parent.type).not.toBe(Pressable);expect(parent.props.accessibilityElementsHidden).not.toBe(true);expect(parent.props.importantForAccessibility).not.toBe('no-hide-descendants');}act(()=>control.props.onPress({stopPropagation(){}}));}
 expect(profile).toHaveBeenCalledTimes(6);expect(content).not.toHaveBeenCalled();expect(like).not.toHaveBeenCalled();expect(reply).not.toHaveBeenCalled();
});

it('keeps a locked profile control named and prevents navigation',()=>{
 const open=vi.fn();act(()=>{tree=create(<HjmNativeProvider><Avatar decorative name="민수" action={{label:'전송 중 프로필',onPress:open,disabled:true}}/></HjmNativeProvider>);});
 const target=tree.root.findAllByType(Pressable).find(node=>node.props.accessibilityLabel==='전송 중 프로필')!;
 expect(target.props.disabled).toBe(true);expect(target.props.accessibilityState.disabled).toBe(true);
 act(()=>target.props.onPress({stopPropagation(){}}));expect(open).not.toHaveBeenCalled();
});
