import '../src/styles.css';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { HjmProvider } from '../src/provider.js';
import { Avatar } from '../src/advanced-display.js';
import { Card, ListRow } from '../src/display.js';
import { NotificationRow } from '../src/screens.js';
import { CommentThreadRow } from '../src/screen-flows.js';
import { ConversationRow } from '../src/conversation-row.js';
import { InstagramCommentsPreview } from '../../../showcase/web/src/patterns/instagram-comments-preview.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
const host=document.createElement('div');document.body.append(host);let root=createRoot(host);
afterEach(async()=>{await act(async()=>root.unmount());host.innerHTML='';root=createRoot(host);});
const mount=async(node:React.ReactNode)=>act(async()=>root.render(<HjmProvider>{node}</HjmProvider>));
const control=(label:string)=>host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const press=async(label:string)=>act(async()=>control(label).click());

it('keeps profile targets accessible after an avatar image failure and supports keyboard activation',async()=>{
 const open=vi.fn();await mount(<Avatar decorative name="민수" src="data:image/png;base64,invalid" action={{label:'민수 프로필',onPress:open}}/>);
 const image=host.querySelector('img');if(image)await act(async()=>image.dispatchEvent(new Event('error')));
 expect(control('민수 프로필').closest('[aria-hidden="true"]')).toBeNull();
 await act(async()=>{control('민수 프로필').focus();await userEvent.keyboard('{Enter}');});expect(open).toHaveBeenCalledTimes(1);
});

it('separates member navigation from list, comment, notification and conversation commands',async()=>{
 const profile=vi.fn(),content=vi.fn(),like=vi.fn(),reply=vi.fn();
 const avatar=<Avatar decorative name="민수" size="small"/>;
 await mount(<>
  <Card title="카드" leading={avatar} leadingAction={{label:"카드 작성자",onPress:profile}} onActivate={content} aria-label="카드 열기"/>
  <ListRow title="글" href="/article" leading={avatar} leadingAction={{label:'목록 작성자',onPress:profile}} trailingAction={<button>별도</button>}/>
  <CommentThreadRow item={{id:'c',parentId:null,author:'민수',body:'댓글',timeLabel:'지금',likeCountLabel:'0',avatar,avatarAction:{label:'댓글 작성자',onPress:profile},likeIcon:null,likeLabel:'좋아요'}} onLike={like} onReply={reply} replyLabel="답글"/>
  <NotificationRow preview="댓글 알림" metadata="지금" avatar={avatar} avatarAction={{label:'알림 발신자',onPress:profile}} action={{label:'알림 열기',onActivate:content}}/>
  <ConversationRow title="민수" preview="안녕" metadata="지금" avatar={avatar} avatarAction={{label:'대화 상대',onPress:profile}} renderBody={body=><a href="/conversation" aria-label="대화 열기">{body}</a>}/>
 </>);
 for(const label of ['카드 작성자','목록 작성자','댓글 작성자','알림 발신자','대화 상대']){
  const button=control(label);expect(button).not.toBeNull();expect(button.closest('a')).toBeNull();expect(button.parentElement?.closest('button')).toBeNull();expect(button.closest('[aria-hidden="true"]')).toBeNull();
  await press(label);
 }
 expect(profile).toHaveBeenCalledTimes(5);expect(content).not.toHaveBeenCalled();expect(like).not.toHaveBeenCalled();expect(reply).not.toHaveBeenCalled();
 await press('알림 열기');expect(content).toHaveBeenCalledTimes(1);
 expect(host.querySelector('a[href="/article"]')).not.toBeNull();expect(host.querySelector('a[href="/conversation"]')).not.toBeNull();
});

it('opens a comment author profile and returns to the same comment thread',async()=>{
 await mount(<InstagramCommentsPreview/>);await press('seoyeon 프로필 보기');expect(host.querySelector('h1')?.textContent).toBe('seoyeon');await press('뒤로');expect(host.textContent).toContain('여기 분위기 너무 좋다');
});

it('keeps a locked profile control named and prevents navigation',async()=>{
 const open=vi.fn();await mount(<Avatar decorative name="민수" action={{label:'전송 중 프로필',onPress:open,disabled:true}}/>);
 expect(control('전송 중 프로필').disabled).toBe(true);await press('전송 중 프로필');expect(open).not.toHaveBeenCalled();
});
