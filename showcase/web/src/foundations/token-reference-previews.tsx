import {foundationGroups, foundationRows, type FoundationGroup} from "../../../shared/token-reference";
import * as tokens from "@hjmds/design-contracts/tokens";
import { createTokenReference, type DimensionKind } from "../../../shared/token-reference";
const {tokenSections} = createTokenReference(tokens);
export function DimensionTokens({kind}: {kind: DimensionKind}) {
 const section=tokenSections[kind];
 return <main className="hjm-page"><h1 className="hjm-title">{section.title}</h1><p>{section.description}</p><p>Web에서는 CSS px로 사용합니다.</p><FoundationValues group={kind}/><div className="hjm-showcase-card">{Object.entries(section.values).map(([name,value])=><div className="hjm-token-row" key={name}><strong>{name}</strong><div aria-hidden="true" style={{background:"var(--hjm-color-primary)",width:kind === "radius" ? "var(--hjm-space-xxxl)" : value,height:kind === "spacing" ? "var(--hjm-space-xs)" : kind === "radius" ? "var(--hjm-space-xxxl)" : value,borderRadius:kind === "radius" ? value : undefined}}/><span>{value}</span></div>)}</div></main>;
}
export function MotionTokens(){return <FoundationValues group="motion"/>;}
export function FoundationValues({group}:{group:FoundationGroup}) {return <section className="hjm-page"><h1 className="hjm-title">{foundationGroups[group].title}</h1>{foundationRows(tokens,group).map(row=><p key={row.name} style={{overflowWrap:"anywhere"}}><strong>{row.name}</strong><br/>{row.value}</p>)}</section>;}
