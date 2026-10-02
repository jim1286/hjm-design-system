import{act,create,type ReactTestRenderer}from'react-test-renderer';import{Text,ScrollView}from'react-native';import{expect,it}from'vitest';import{CodeBlock}from'../src/code-block.js';import{HjmNativeProvider}from'../src/provider.js';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it('keeps the exact code selectable and switches between scrolling and wrapping',()=>{let tree!:ReactTestRenderer;const code='const x = 1;\n';try{act(()=>{tree=create(<HjmNativeProvider><CodeBlock code={code} label="Source"/></HjmNativeProvider>);});expect(tree.root.findAllByType(Text).find(n=>n.props.selectable)!.props.accessibilityLabel).toBe(`Source\n${code}`);expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);act(()=>tree.update(<HjmNativeProvider><CodeBlock code={code} label="Source" wrap/></HjmNativeProvider>));expect(tree.root.findAllByType(ScrollView)).toHaveLength(0);}finally{act(()=>tree.unmount());}});

const flatten=(style:any):any=>Array.isArray(style)?Object.assign({},...style.map(flatten)):style??{};
it('scales source and header once while retaining exact selectable tokens',()=>{
 let tree!:ReactTestRenderer;const code='const value = "한글";\n';
 try{
  act(()=>{tree=create(<HjmNativeProvider textScale={2}><CodeBlock code={code} label="Source" language="TS" tokens={[{text:'const',tone:'keyword'},{text:' value = "한글";\n'}]}/></HjmNativeProvider>);});
  const texts=tree.root.findAllByType(Text);const source=texts.find(n=>n.props.selectable)!;
  expect(source.props.allowFontScaling).toBe(false);
  expect(flatten(source.props.style).fontSize).toBe(28);
  expect(flatten(texts.find(n=>n.props.children==='TS')!.props.style).fontSize).toBe(28);
  expect(source.findAllByType(Text).filter(n=>n!==source).map(n=>n.props.children).join('')).toBe(code);
  expect(source.findAllByType(Text).filter(n=>n!==source).every(n=>flatten(n.props.style).fontSize===undefined)).toBe(true);
 }finally{act(()=>tree.unmount());}
});
