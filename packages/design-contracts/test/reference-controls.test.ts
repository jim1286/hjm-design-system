import { expect, it } from "vitest";
import { resolveRating, resolveImageComparison } from "../src/reference-controls.js";
it("distinguishes unrated input from fractional and zero read-only averages",()=>{
  expect(resolveRating({label:"평가",value:null}).fractions).toEqual([0,0,0,0,0]);
  expect(resolveRating({label:"평균",value:3.5,readOnly:true}).fractions).toEqual([1,1,1,.5,0]);
  expect(resolveRating({label:"평균",value:0,readOnly:true}).value).toBe(0);
  for(const value of [0,3.5,NaN,Infinity,-1,6]) expect(()=>resolveRating({label:"평가",value})).toThrow();
  for(const max of [0,1.5,11]) expect(()=>resolveRating({label:"평가",value:null,max})).toThrow();
});
it("refuses mismatched image geometry and non-finite positions",()=>{
  const image={src:"/photo.jpg",width:640,height:360,label:"장면"};
  expect(resolveImageComparison({label:"비교",before:image,after:{...image,width:1280,height:720},value:50})).toEqual({aspectRatio:640/360,fraction:.5});
  expect(()=>resolveImageComparison({label:"비교",before:image,after:{...image,height:640},value:50})).toThrow();
  for(const value of [NaN,Infinity,-1,101]) expect(()=>resolveImageComparison({label:"비교",before:image,after:image,value})).toThrow();
  expect(()=>resolveImageComparison({label:"비교",before:{...image,label:""},after:image,value:50})).toThrow();
});
