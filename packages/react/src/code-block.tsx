import type {ReactNode} from 'react';
import {resolveCodeBlock,type CodeBlockDescriptor} from '@hjmds/design-contracts/code-block';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CodeBlockProps=CodeBlockDescriptor & Readonly<{
  copyAction?:ReactNode;
  /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
  layoutStyle?: HjmCompositionStyleProp;
}>;
const colors={plain:'var(--hjm-color-text)',keyword:'var(--hjm-color-content-brand)',string:'var(--hjm-color-text)',comment:'var(--hjm-color-text-muted)',number:'var(--hjm-color-content-brand)'};
/** Token text is rendered as React text, never executable HTML. */
export function CodeBlock({copyAction,layoutStyle,...descriptor}:CodeBlockProps){const spec=resolveCodeBlock(descriptor);return <section aria-label={spec.label} style={{minWidth:0,borderRadius:'var(--hjm-radius-lg)',background:'var(--hjm-color-surface-alt)',color:'var(--hjm-color-text)',overflow:'hidden',...layoutStyle}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--hjm-space-sm)',padding:'var(--hjm-space-md)'}}><span>{spec.language??spec.label}</span>{copyAction}</div><pre tabIndex={0} aria-label={spec.label} style={{margin:0,padding:'var(--hjm-space-md)',overflowX:'auto',whiteSpace:spec.wrap?'pre-wrap':'pre',overflowWrap:spec.wrap?'anywhere':undefined}}><code>{spec.tokens.map((token,index)=><span key={index} style={{color:colors[token.tone??'plain']}}>{token.text}</span>)}</code></pre></section>;}
