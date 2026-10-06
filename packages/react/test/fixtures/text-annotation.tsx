import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HjmProvider } from '../../src/provider.js';
import { TextAnnotation } from '../../src/text-annotation.js';
import { textAnnotationActions } from '@hjmds/design-contracts/text-annotation';
import '../../src/styles.css';

// Renderer diagnostic, not a public Showcase example: the Native counterpart
// and final public API are unfinished. Keep actual surrounding inline text.
function Fixture() {
  const [dark, setDark] = useState(false), [rtl, setRtl] = useState(false);
  const [large, setLarge] = useState(false), [reduced, setReduced] = useState(true);
  const [text, setText] = useState('강조할 긴 문장이 다음 줄로 이어져도 각 줄의 위치를 알아야 합니다');
  return <HjmProvider theme={dark ? 'dark' : 'light'} direction={rtl ? 'rtl' : 'ltr'} reducedMotion={reduced}>
    <main style={{ padding:24, background:'var(--hjm-color-bg)', color:'var(--hjm-color-text-body)', minHeight:'100vh' }}>
      <h1>문장 주석 측정 fixture</h1>
      <p>구현 중인 renderer 검증 화면입니다. 공개 실험이나 게시 완료를 뜻하지 않습니다.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
        <label><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)}/>어두운 테마</label>
        <label><input type="checkbox" checked={rtl} onChange={e=>setRtl(e.target.checked)}/>RTL</label>
        <label><input type="checkbox" checked={large} onChange={e=>setLarge(e.target.checked)}/>큰 글자</label>
        <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>동작 줄이기</label>
      </div>
      <label>강조할 문장 <textarea value={text} onChange={e=>setText(e.target.value)} style={{display:'block',width:'100%',minHeight:64}}/></label>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:24}}>
        {textAnnotationActions.map(action=><section key={action} style={{minWidth:0,padding:12,border:'1px solid var(--hjm-color-border)'}}>
          <h2>{action}</h2>
          <p style={{fontSize:large?32:16,lineHeight:1.8,overflowWrap:'anywhere'}}>{rtl?'قبل ':'앞 문장 '}<TextAnnotation action={action}>{text}</TextAnnotation>{rtl?' بعد':' 뒤 문장'}</p>
        </section>)}
      </div>
    </main>
  </HjmProvider>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
