import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Surface, Text } from "@hjmds/react/layout";
import { Button } from "@hjmds/react/actions";
import { Steps } from "@hjmds/react/steps";
import { ContentTransition } from "@hjmds/react/content-transition";
import { Notice } from "@hjmds/react/feedback";
import { onboardingCopy as copy, onboardingStepName, toggleOnboardingTopic, onboardingSummary } from "../../../shared/onboarding-pattern";

function Onboarding(){
 const[step,setStep]=useState(0);const[selected,setSelected]=useState<readonly string[]>([]);const[complete,setComplete]=useState(false);
 const panel=copy.panels[step]!;
 const restart=()=>{setStep(0);setSelected([]);setComplete(false);};
 return <main><Stack gap="xl"><Text tone="muted">{copy.eyebrow}</Text>
 {complete?null:<Steps descriptor={{steps:copy.steps,currentStepId:copy.steps[step]!.id}} statusLabels={copy.statusLabels} composeAccessibleName={onboardingStepName}/>}
 <Text role="status">{complete?copy.done:`${step+1} / 3 · ${panel.title}`}</Text>
 <ContentTransition stateKey={complete?"done":String(step)} preset="slide"><Surface padding="lg"><Stack gap="lg">
 <Text variant="heading" role="heading" aria-level={1}>{complete?copy.done:panel.title}</Text><Text>{complete?copy.doneBody:panel.body}</Text>
 {!complete&&step===1?<Stack axis="inline" wrap gap="sm">{copy.topics.map(topic=><Button key={topic.id} selected={selected.includes(topic.id)} tone="ghost" onClick={()=>setSelected(current=>toggleOnboardingTopic(current,topic.id))}>{topic.label}</Button>)}</Stack>:null}
 {complete||step===2?<Notice title={onboardingSummary(selected)} tone={complete?"success":"info"}/>:null}
 </Stack></Surface></ContentTransition>
 {/* Keep navigation mounted outside the transition so keyboard focus survives a step change. */}
 <Stack axis="inline" wrap gap="sm"><Button tone="ghost" disabled={complete||step===0} onClick={()=>setStep(current=>Math.max(0,current-1))}>{copy.back}</Button><Button onClick={()=>{if(complete)restart();else if(step===2)setComplete(true);else setStep(current=>current+1);}}>{complete?copy.restart:step===2?copy.finish:copy.next}</Button>{!complete&&step===1?<Button tone="ghost" onClick={()=>{setSelected([]);setStep(2);}}>{copy.skip}</Button>:null}</Stack>
 <Text tone="muted">{copy.scope}</Text>
 </Stack></main>;
}
const meta={ includeStories: ["Default","Dark","LargeText"],id: "patterns-onboarding", title: "배포/화면/온보딩",component:Onboarding} satisfies Meta<typeof Onboarding>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default: Story = { name: "기본",};
export const Dark: Story = { name: "어두운 테마",globals:{theme:"dark"}};
export const LargeText: Story = { name: "큰 글자",globals:{textScale:"2"}};
