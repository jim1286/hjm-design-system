import { describe, expect, it } from "vitest";

import { componentCatalog } from "../src/catalog.js";
import { antDesignReferenceComponents } from "../src/component-references.js";
import { floatingSurfaceContract } from "../src/component-contracts.js";
import {
  resolveTourAdvance,
  resolveTourDescriptor,
  tourBehaviorDefaults,
  tourBehaviorScenarios,
  tourRecipe,
  validateTourDescriptor,
  validateTourOpenState,
  validateTourStepDescriptor,
  type TourDescriptor,
} from "../src/tour.js";

const labels = {
  next: "다음",
  previous: "이전",
  skip: "건너뛰기",
  done: "완료",
} as const;

const descriptor: TourDescriptor = {
  accessibilityLabel: "홈 화면 안내",
  steps: [
    { id: "search", anchorId: "home.search", title: "검색", description: "선수를 검색하세요." },
    { id: "favorite", anchorId: "home.favorite", title: "즐겨찾기", description: "관심 팀을 등록하세요." },
    { id: "profile", anchorId: "home.profile", title: "프로필", description: "설정을 바꿀 수 있어요." },
  ],
  currentStepId: "favorite",
  labels,
};

const firstStep = descriptor.steps[0]!;

const composeAnnouncement = ({ position, total, title, description }: {
  position: number;
  total: number;
  title: string;
  description: string;
}) => `${total}단계 중 ${position}단계, ${title}. ${description}`;

describe("Tour step descriptor", () => {
  it("rejects empty copy but allows two steps to share an anchor", () => {
    expect(() =>
      validateTourStepDescriptor({ ...firstStep, title: "" }),
    ).toThrow(/title/);
    expect(() =>
      validateTourStepDescriptor({ ...firstStep, anchorId: " " }),
    ).toThrow(/anchorId/);
    expect(() =>
      validateTourDescriptor({
        ...descriptor,
        steps: [
          { id: "a", anchorId: "shared", title: "탭하세요", description: "먼저 탭합니다." },
          { id: "b", anchorId: "shared", title: "꾹 누르세요", description: "이제 꾹 눌러 순서를 바꿉니다." },
        ],
        currentStepId: "a",
      }),
    ).not.toThrow();
  });

  it("rejects an unsupported placement or align", () => {
    expect(() =>
      validateTourStepDescriptor({ ...firstStep, placement: "left" as never }),
    ).toThrow(/placement/);
    expect(() =>
      validateTourStepDescriptor({ ...firstStep, align: "middle" as never }),
    ).toThrow(/align/);
  });
});

describe("Tour descriptor", () => {
  it("requires at least one step and rejects duplicate step ids", () => {
    expect(() =>
      validateTourDescriptor({ ...descriptor, steps: [] }),
    ).toThrow(RangeError);
    expect(() =>
      validateTourDescriptor({
        ...descriptor,
        steps: [...descriptor.steps, { ...firstStep }],
      }),
    ).toThrow(/Duplicate/);
  });

  it("requires currentStepId to match an existing step", () => {
    expect(() =>
      validateTourDescriptor({ ...descriptor, currentStepId: "missing" }),
    ).toThrow(RangeError);
  });

  it("requires every label to be non-empty visible copy", () => {
    expect(() =>
      validateTourDescriptor({ ...descriptor, labels: { ...labels, skip: " " } }),
    ).toThrow(/labels.skip/);
  });
});

describe("Tour open state", () => {
  it("rejects a controlled/uncontrolled mix and missing onOpenChange", () => {
    expect(() =>
      validateTourOpenState({ open: true, defaultOpen: true } as never),
    ).toThrow(/defaultOpen/);
    expect(() => validateTourOpenState({ open: true } as never)).toThrow(
      /onOpenChange/,
    );
  });

  it("accepts a valid controlled and uncontrolled state", () => {
    expect(() =>
      validateTourOpenState({ open: true, onOpenChange: () => {} }),
    ).not.toThrow();
    expect(() => validateTourOpenState({})).not.toThrow();
  });
});

describe("Tour resolution", () => {
  it("attaches order-preserving position/total and a non-empty announcement", () => {
    const resolved = resolveTourDescriptor(descriptor, { composeAnnouncement });
    expect(resolved.steps.map((step) => step.position)).toEqual([1, 2, 3]);
    expect(resolved.currentStep.id).toBe("favorite");
    expect(resolved.isFirstStep).toBe(false);
    expect(resolved.isLastStep).toBe(false);
    expect(resolved.currentStep.announcement).toContain("즐겨찾기");
  });

  it("flags the first and last step so a renderer can swap next/done and hide previous", () => {
    const first = resolveTourDescriptor(
      { ...descriptor, currentStepId: "search" },
      { composeAnnouncement },
    );
    expect(first.isFirstStep).toBe(true);
    const last = resolveTourDescriptor(
      { ...descriptor, currentStepId: "profile" },
      { composeAnnouncement },
    );
    expect(last.isLastStep).toBe(true);
  });

  it("throws when the composer returns an empty announcement", () => {
    expect(() =>
      resolveTourDescriptor(descriptor, { composeAnnouncement: () => "  " }),
    ).toThrow(/composeAnnouncement/);
  });
});

describe("Tour advance", () => {
  it("steps forward and backward relative to the cursor", () => {
    expect(resolveTourAdvance(descriptor, "next")).toEqual({
      type: "step",
      stepId: "profile",
    });
    expect(resolveTourAdvance(descriptor, "previous")).toEqual({
      type: "step",
      stepId: "search",
    });
  });

  it("closes with reason complete on next from the last step", () => {
    expect(
      resolveTourAdvance({ ...descriptor, currentStepId: "profile" }, "next"),
    ).toEqual({ type: "close", reason: "complete" });
  });

  it("is a no-op on previous from the first step", () => {
    expect(
      resolveTourAdvance({ ...descriptor, currentStepId: "search" }, "previous"),
    ).toEqual({ type: "no-op" });
  });
});

describe("Tour visual recipe and defaults", () => {
  it("reuses the shared floating surface instead of declaring new chrome", () => {
    expect(tourRecipe.card).toBe(floatingSurfaceContract);
  });

  it("never allows outside dismiss", () => {
    expect(tourBehaviorDefaults.outsideDismiss).toBe(false);
  });

  it("keeps a self-contained, non-empty behavior scenario list for the lead to wire", () => {
    expect(tourBehaviorScenarios.length).toBeGreaterThan(0);
    expect(new Set(tourBehaviorScenarios).size).toBe(tourBehaviorScenarios.length);
  });
});

describe("Tour catalog and crosswalk stay untouched", () => {
  it("still reserves Tour as planned/web/overlay", () => {
    const entry = componentCatalog.find((item) => item.name === "Tour");
    expect(entry).toMatchObject({
      category: "overlay",
      platform: "web",
      status: "planned",
    });
  });

  it("keeps the antd Tour crosswalk pointed at the same target", () => {
    const entry = antDesignReferenceComponents.find((item) => item.name === "Tour");
    expect(entry).toMatchObject({ targets: ["tour"], relationship: "direct" });
  });
});
