import { expect, it } from "vitest";
import { initialMockupScene, parseMockupScene, resolveMockupLayout, serializeMockupScene } from "../../../shared/mockup-scene";
it("keeps rotated frames within scene margins for every preset", () => {
  for (const format of ["portrait", "square", "landscape"] as const) for (const frame of ["phone", "browser"] as const) for (const angle of [-15, 0, 15]) for (const padding of [40,160]) {
    const scene={...initialMockupScene,format,frame,angle,padding}; const box=resolveMockupLayout(scene);const r=Math.abs(angle)*Math.PI/180;
    const w=box.frameWidth*Math.cos(r)+box.frameHeight*Math.sin(r),h=box.frameHeight*Math.cos(r)+box.frameWidth*Math.sin(r);
    expect(box.centerX-w/2).toBeGreaterThanOrEqual(padding-0.001);expect(box.centerX+w/2).toBeLessThanOrEqual(box.width-padding+0.001);
    expect(box.centerY-h/2).toBeGreaterThanOrEqual(padding+300-0.001);expect(box.centerY+h/2).toBeLessThanOrEqual(box.height-padding+0.001);
  }
});
it("round trips attribution and rejects malformed scene inputs", () => {
  const scene={...initialMockupScene,asset:{fileName:"capture.png",source:"내 앱",usage:"제품 소개"}};
  expect(parseMockupScene(serializeMockupScene(scene))).toEqual(scene);
  expect(()=>parseMockupScene('{}')).toThrow();
  expect(()=>parseMockupScene(JSON.stringify({...scene,angle:999}))).toThrow();
});
