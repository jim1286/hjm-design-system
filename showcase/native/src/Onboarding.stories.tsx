import { PatternStatus } from "./pattern-status";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-native";
import { Stack, Surface, Text } from "@hjmds/react-native/primitives";
import { Button } from "@hjmds/react-native/actions";
import { Steps } from "@hjmds/react-native/steps";
import { ContentTransition } from "@hjmds/react-native/content-transition";
import { Notice } from "@hjmds/react-native/feedback";
import { onboardingCopy as copy, onboardingStepName, toggleOnboardingTopic, onboardingSummary } from "../../shared/onboarding-pattern";
import { ScrollView } from "react-native";
import { spacing } from "@hjmds/design-contracts/foundations";
function Onboarding(){
 const[step,setStep]=useState(0);const[selected,setSelected]=useState<readonly string[]>([]);const[complete,setComplete]=useState(false);
 const panel=copy.panels[step]!;
 const restart=()=>{setStep(0);setSelected([]);setComplete(false);};
 return <ScrollView contentContainerStyle={{padding:spacing.lg}}><Stack gap="xl"><Text tone="muted">{copy.eyebrow}</Text>
 {complete?null:<Steps descriptor={{steps:copy.steps,currentStepId:copy.steps[step]!.id}} statusLabels={copy.statusLabels} composeAccessibleName={onboardingStepName}/>}
 <PatternStatus>{complete?copy.done:`${step+1} / 3 · ${panel.title}`}</PatternStatus>
 <ContentTransition stateKey={complete?"done":String(step)} preset="slide"><Surface padding="lg"><Stack gap="lg">
 <Text variant="heading" accessibilityRole="header">{complete?copy.done:panel.title}</Text><Text>{complete?copy.doneBody:panel.body}</Text>
 {!complete&&step===1?<Stack axis="inline" wrap gap="sm">{copy.topics.map(topic=><Button key={topic.id} selected={selected.includes(topic.id)} tone="ghost" onPress={()=>setSelected(current=>toggleOnboardingTopic(current,topic.id))}>{topic.label}</Button>)}</Stack>:null}
 {complete||step===2?<Notice title={onboardingSummary(selected)} tone={complete?"success":"info"}/>:null}
 </Stack></Surface></ContentTransition>
 {/* Keep navigation mounted outside the transition so keyboard focus survives a step change. */}
 <Stack axis="inline" wrap gap="sm"><Button tone="ghost" disabled={complete||step===0} onPress={()=>setStep(current=>Math.max(0,current-1))}>{copy.back}</Button><Button onPress={()=>{if(complete)restart();else if(step===2)setComplete(true);else setStep(current=>current+1);}}>{complete?copy.restart:step===2?copy.finish:copy.next}</Button>{!complete&&step===1?<Button tone="ghost" onPress={()=>{setSelected([]);setStep(2);}}>{copy.skip}</Button>:null}</Stack>
 <Text tone="muted">{copy.scope}</Text>
 </Stack></ScrollView>;
}
const meta={title: "배포/화면/온보딩",component:Onboarding} satisfies Meta<typeof Onboarding>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
