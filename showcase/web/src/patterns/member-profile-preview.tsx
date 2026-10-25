import type { ReactNode } from "react";
import { ScreenLayout } from "@hjmds/react/screens";
import { ProfileSummary } from "@hjmds/react/screen-flows";
import { Text } from "@hjmds/react/layout";

// Story navigation uses the selected member identity; consumers supply their actual member route.
export function MemberProfilePreview({ name, avatar, onBack, backLabel = "뒤로" }: { name: string; avatar: ReactNode; onBack(): void; backLabel?: string }) {
  return <ScreenLayout title={name} titleVisibility="hidden" exit={{kind:"back",label:backLabel,onClick:onBack}}>
    <ProfileSummary headingLevel={1} name={name} avatar={avatar}><Text>산책하며 일상을 나누고 있어요.</Text></ProfileSummary>
  </ScreenLayout>;
}
