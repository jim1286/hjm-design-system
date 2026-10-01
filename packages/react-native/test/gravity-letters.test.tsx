import{act,create,type ReactTestRenderer}from"react-test-renderer";import{expect,it}from"vitest";import{GravityLetters}from"../src/gravity-letters.js";import{HjmNativeProvider}from"../src/provider.js";import{startedAnimatedTimings}from"./react-native.mock.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
it("keeps motion bounded and bypasses decorative animation for reduced motion and inactive hosts",()=>{
 let tree!:ReactTestRenderer;const element=(ready:boolean,reduced=false,active=true)=><HjmNativeProvider reducedMotion={reduced}><GravityLetters glyphs={["한", "✨"]} active={ready && active}/></HjmNativeProvider>;
 try{startedAnimatedTimings.length=0;act(()=>{tree=create(element(false));});expect(startedAnimatedTimings).toHaveLength(0);act(()=>tree.update(element(true)));expect(startedAnimatedTimings).toHaveLength(2);startedAnimatedTimings.length=0;act(()=>tree.update(element(true,true)));act(()=>tree.update(element(true,false,false)));expect(startedAnimatedTimings).toHaveLength(0);expect(tree.root.findAll(node=>node.props.importantForAccessibility==="no-hide-descendants").length).toBeGreaterThan(0);}finally{act(()=>tree.unmount());}
});
