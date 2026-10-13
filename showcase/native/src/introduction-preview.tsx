import { LandingPreview } from "./landing-preview";
import { ServiceIntroduction } from "./reference-flow-previews";

// 2026-10-06: 랜딩 화면 and the experimental 서비스 소개 (제품 체험 중심·설명과 사례 중심) are one introduction item.
// The landing page stays the default; the other two are variants of the same purpose (FINAL_MAPPING §2).
export type IntroductionVariant = "landing" | "product" | "editorial";
export function IntroductionPreview({ variant = "landing" }: { variant?: IntroductionVariant }) {
 if (variant === "landing") return <LandingPreview />;
 return <ServiceIntroduction editorial={variant === "editorial"} />;
}
