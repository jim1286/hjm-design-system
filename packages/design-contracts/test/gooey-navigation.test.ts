import { expect, it } from "vitest";
import { resolveGooeyIndicator } from "../src/gooey-navigation.js";
it("bridges measured edges in either direction without overshooting", () => {
  expect(resolveGooeyIndicator({x:10,width:30},{x:80,width:50})).toMatchObject({x:[10,10,80],width:[30,120,50]});
  expect(resolveGooeyIndicator({x:80,width:50},{x:10,width:30})).toMatchObject({x:[80,10,10],width:[50,120,30]});
  expect(() => resolveGooeyIndicator({x:NaN,width:30},{x:0,width:40})).toThrow(RangeError);
});
