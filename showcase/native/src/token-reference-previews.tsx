import {foundationGroups, foundationRows, type FoundationGroup} from "../../shared/token-reference";
import * as tokens from "@hjmds/design-contracts/tokens";
import { ScrollView, View } from "react-native";
import { Stack, Text } from "@hjmds/react-native/primitives";
import { THEMES, spacing } from "@hjmds/design-contracts/tokens";
import { createTokenReference, type DimensionKind } from "../../shared/token-reference";
const {tokenSections} = createTokenReference(tokens);
export function DimensionTokens({kind}: {kind: DimensionKind}) {
 const section = tokenSections[kind];
 return <ScrollView contentContainerStyle={{padding:spacing.lg}}><Stack gap="lg"><Text variant="heading">{section.title}</Text><Text>{section.description}</Text><Text>앱에서는 화면 밀도와 독립적인 논리 단위로 사용합니다.</Text>
 <TokenRowContent title="전체 값" rows={foundationRows(tokens,kind)}/>{Object.entries(section.values).map(([name,value])=><Stack key={name} gap="sm"><Text>{`${name} · ${value}`}</Text><View accessible={false} style={{backgroundColor:THEMES.light.primary,width:kind === "radius" ? spacing.xxxl : value,height:kind === "spacing" ? spacing.xs : kind === "radius" ? spacing.xxxl : value,borderRadius:kind === "radius" ? value : 0}}/></Stack>)}
 </Stack></ScrollView>;
}
export function MotionTokens(){return <FoundationValues group="motion"/>;}
export function TypographyTokens(){return <FoundationValues group="typography"/>;}
function TokenRowContent({title,rows}:{title:string;rows:readonly {name:string;value:string}[]}){return <Stack gap="lg"><Text variant="heading">{title}</Text>{rows.map(row=><Stack gap="xs" key={row.name}><Text emphasis="strong">{row.name}</Text><Text>{row.value}</Text></Stack>)}</Stack>;}
export function ColorTokens(){return <ScrollView contentContainerStyle={{padding:spacing.lg}}><Stack gap="lg"><Text variant="heading">색상</Text>{(["light","dark"] as const).map(theme=><Stack gap="md" key={theme}><Text variant="title">{theme === "light" ? "밝은 테마" : "어두운 테마"}</Text>{Object.entries(THEMES[theme]).map(([name,value])=><Stack gap="xs" key={name}><Text>{`${name} · ${value}`}</Text><View accessible={false} style={{height:spacing.xl,backgroundColor:value,borderWidth:1,borderColor:THEMES[theme].border}}/></Stack>)}</Stack>)}</Stack></ScrollView>;}

export function FoundationValues({group}:{group:FoundationGroup}) { return <ScrollView contentContainerStyle={{padding:spacing.lg}}><TokenRowContent title={foundationGroups[group].title} rows={foundationRows(tokens,group)}/></ScrollView>; }
