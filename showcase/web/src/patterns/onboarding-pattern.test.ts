import {expect,it} from "vitest";
import {toggleOnboardingTopic,onboardingSummary,onboardingCopy} from "../../../shared/onboarding-pattern";
it("toggles topics immutably and derives one stable summary",()=>{
 const first=toggleOnboardingTopic([],"daily");const second=toggleOnboardingTopic(first,"travel");
 expect(first).toEqual(["daily"]);expect(onboardingSummary(second)).toBe("일상 · 여행");
 expect(toggleOnboardingTopic(second,"daily")).toEqual(["travel"]);
 expect(onboardingSummary([])).toBe(onboardingCopy.empty);
 expect(()=>toggleOnboardingTopic([],"unknown")).toThrow();
});
