import { expect, it } from 'vitest';
import { nextReaction, validateReactions } from '../src/reactions.js';
it('toggles one reaction without mutating product counts and preserves disabled selection',()=>{
 const options=Object.freeze([Object.freeze({id:'like',emoji:'👍',label:'Like',count:4}),{id:'off',emoji:'✨',label:'Unavailable',disabled:true}]);
 expect(nextReaction(options,null,'like')).toBe('like');expect(nextReaction(options,'like','like')).toBeNull();expect(nextReaction(options,'like','off')).toBe('like');expect(options[0]).toMatchObject({count:4});
 expect(()=>validateReactions([...options,options[0]!],null)).toThrow();expect(()=>validateReactions(options,'missing')).toThrow();expect(()=>validateReactions([{id:'bad',emoji:'x',label:'Bad',count:-1}],null)).toThrow();
});
