import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Animated, AppState, type AppStateStatus } from "react-native";
import { afterEach, expect, it, vi } from "vitest";
import { GravityLetters } from "../src/gravity-letters.js";
import { GridReveal } from "../src/grid-reveal.js";
import { HjmNativeProvider } from "../src/provider.js";
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
let tree:ReactTestRenderer|undefined;
afterEach(()=>{act(()=>tree?.unmount());tree=undefined;vi.restoreAllMocks();AppState.currentState='active';});
it.each(['letters','grid'])('cleans %s timing after partial host failure',kind=>{
 const stop=vi.fn();let calls=0;vi.spyOn(Animated,'timing').mockImplementation(()=>{if(++calls===2)throw new Error('Timing unavailable');return{start:vi.fn(),stop,reset:vi.fn()};});
 act(()=>{tree=create(<HjmNativeProvider reducedMotion={false}>{kind==='letters'?<GravityLetters glyphs={['A','B']} active/>:<GridReveal ready>Content</GridReveal>}</HjmNativeProvider>);});expect(stop).toHaveBeenCalledOnce();
});
it.each(['letters','grid'])('stops %s in background and removes its subscription',kind=>{
 const listeners=new Set<(state:AppStateStatus)=>void>();vi.spyOn(AppState,'addEventListener').mockImplementation((_event,listener)=>{listeners.add(listener);return{remove(){listeners.delete(listener);}};});const stops:ReturnType<typeof vi.fn>[]=[];vi.spyOn(Animated,'timing').mockImplementation(()=>{const stop=vi.fn();stops.push(stop);return{start:vi.fn(),stop,reset:vi.fn()};});
 act(()=>{tree=create(<HjmNativeProvider reducedMotion={false}>{kind==='letters'?<GravityLetters glyphs={['A','B']} active/>:<GridReveal ready>Content</GridReveal>}</HjmNativeProvider>);});expect(stops.length).toBeGreaterThan(0);act(()=>listeners.forEach(listener=>listener('background')));expect(stops.every(stop=>stop.mock.calls.length===1)).toBe(true);act(()=>tree!.unmount());tree=undefined;expect(listeners.size).toBe(0);
});
