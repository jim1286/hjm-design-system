import { LandingPreview } from "./landing-preview.js";
import { ServiceIntroduction } from "./reference-flow-previews.js";

// 2026-10-06 decision: 랜딩 화면 and 서비스 소개 (제품 체험 중심 · 설명과 사례 중심) answer the same "introduce the
// service" need, so they are one item whose variants are stories. `variant` picks the first section; the default stays
// the deployed landing so the old patterns-landing--default URL shows the same screen.
export type ServiceIntroductionVariant = "landing" | "product" | "editorial";
export function ServiceIntroductionPreview({ variant = "landing" }: { variant?: ServiceIntroductionVariant }) {
  if (variant === "landing") return <LandingPreview />;
  return <ServiceIntroduction editorial={variant === "editorial"} />;
}
