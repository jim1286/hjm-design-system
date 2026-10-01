import {expect,it} from 'vitest';
import {resolveScrollProgress as progress} from '../src/scroll-progress.js';
it('clamps overscroll and distinguishes fitting content from an unmeasured viewport',()=>{
 expect(progress({offset:50,contentSize:200,viewportSize:100})).toBe(.5);
 expect(progress({offset:-20,contentSize:200,viewportSize:100})).toBe(0);
 expect(progress({offset:500,contentSize:200,viewportSize:100})).toBe(1);
 expect(progress({offset:0,contentSize:20,viewportSize:100})).toBe(1);
 expect(progress({offset:0,contentSize:0,viewportSize:0})).toBe(0);
 expect(()=>progress({offset:NaN,contentSize:20,viewportSize:10})).toThrow();
});
