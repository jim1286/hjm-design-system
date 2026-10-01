import { expect, it } from "vitest";
import { initialMockupScene, parseMockupScene, resolveMockupLayout } from "../../../shared/mockup-scene";
import { initialSceneTimeline, sampleSceneTimeline, validateSceneTimeline } from "../../../shared/scene-timeline";
it("fits all sampled frames inside the still scene's output bounds", () => {
 for (const format of ["portrait","square","landscape"] as const) for (const frame of ["phone","browser"] as const) for(const angle of [-15,15]) for(const padding of [40,160]) for(const preset of ["float","arrive"] as const){
  const scene={...initialMockupScene,format,frame,angle,padding};const box=resolveMockupLayout(scene);
  for(let frameIndex=0;frameIndex<=90;frameIndex++){
   const motion=sampleSceneTimeline({...initialSceneTimeline,preset},frameIndex,17);const radians=(angle+motion.angle)*Math.PI/180;
   const halfWidth=(box.frameWidth*Math.abs(Math.cos(radians))+box.frameHeight*Math.abs(Math.sin(radians)))*motion.scale/2;
   const halfHeight=(box.frameHeight*Math.abs(Math.cos(radians))+box.frameWidth*Math.abs(Math.sin(radians)))*motion.scale/2;
   expect(box.centerX-halfWidth).toBeGreaterThan(0);expect(box.centerX+halfWidth).toBeLessThan(box.width);
   expect(box.centerY+motion.lift-halfHeight).toBeGreaterThan(padding+250);expect(box.centerY+motion.lift+halfHeight).toBeLessThan(box.height);
  }
 }
});
it("restores old still scenes and rejects invalid timeline metadata",()=>{
 const {timeline,...old}=initialMockupScene;expect(parseMockupScene(JSON.stringify(old)).timeline).toEqual(initialSceneTimeline);
 expect(()=>validateSceneTimeline({...timeline,posterFrame:10000})).toThrow();
 expect(sampleSceneTimeline(timeline,-5,17)).toEqual(sampleSceneTimeline(timeline,0,17));
 expect(sampleSceneTimeline(timeline,900,17)).toEqual(sampleSceneTimeline(timeline,90,17));
});
