import {readFileSync,existsSync} from "node:fs";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {expect,it} from "vitest";
import {toggleOnboardingTopic,onboardingSummary,onboardingCopy} from "../../../shared/onboarding-pattern";
import {OnboardingFlowPreview} from "./screen-flow-previews";
it("toggles topics immutably and derives one stable summary",()=>{
 const first=toggleOnboardingTopic([],"daily");const second=toggleOnboardingTopic(first,"travel");
 expect(first).toEqual(["daily"]);expect(onboardingSummary(second)).toBe("일상 · 여행");
 expect(toggleOnboardingTopic(second,"daily")).toEqual(["travel"]);
 expect(onboardingSummary([])).toBe(onboardingCopy.empty);
 expect(()=>toggleOnboardingTopic([],"unknown")).toThrow();
});

// 2026-10-06 regression: the Topics story opened a hand-assembled Web screen while Native opened OnboardingScreen with a
// single-choice RadioGroup, and both drew save failure as Text tone="danger" instead of an announced Notice.
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
it("opens the topic step on OnboardingScreen with multi-select chips on Web",()=>{
 const html=renderToStaticMarkup(createElement(OnboardingFlowPreview,{initialStep:1}));
 expect(html).toContain('role="group"');
 expect(html.match(/role="checkbox"/g)).toHaveLength(onboardingCopy.topics.length);
 expect(html).not.toContain('role="radiogroup"');
 expect(html).toContain("2 / 3");
});
it("keeps both platforms on the same OnboardingScreen story and Notice failure",()=>{
 expect(existsSync(new URL("./Onboarding.previews.tsx",import.meta.url))).toBe(false);
 for(const story of [read("./Onboarding.stories.tsx"),read("../../../native/src/Onboarding.stories.tsx")]){
  expect(story).toMatch(/Topics: Story = \{ name: "관심 주제 고르기", args: \{ initialStep: 1 \} \}/);
 }
 const web=read("./screen-flow-previews.tsx"),native=read("../../../native/src/screen-flow-previews.tsx");
 for(const source of [web,native]){
  expect(source).toContain('selectionMode="multiple"');
  expect(source).not.toContain("RadioGroup");
  expect(source).not.toContain('<Text tone="danger">');
  expect(source).toMatch(/<Notice tone="danger"/);
 }
 // Native Notice defaults to announcement="none"; a save failure must interrupt the screen reader.
 expect(native.match(/<Notice tone="danger"[^>]*announcement="assertive"/g)?.length).toBeGreaterThanOrEqual(2);
});
