export type CodeToken = Readonly<{text:string; tone?:'plain'|'keyword'|'string'|'comment'|'number'}>;
export type CodeBlockDescriptor = Readonly<{code:string;label:string;language?:string;tokens?:readonly CodeToken[];wrap?:boolean}>;
/** Highlighting is presentation only: it must not change selectable/copied source. */
export function resolveCodeBlock(input:CodeBlockDescriptor){
 if(typeof input.code!=='string'||!input.label.trim())throw new TypeError('Code and a localized accessible label are required');
 const tokens=input.tokens??[{text:input.code}];
 if(tokens.map(token=>token.text).join('')!==input.code)throw new TypeError('Code tokens must preserve the exact source');
 for(const token of tokens)if(token.tone!==undefined&&!['plain','keyword','string','comment','number'].includes(token.tone))throw new TypeError('Unknown code token tone');
 return {...input,tokens,wrap:input.wrap??false};
}
