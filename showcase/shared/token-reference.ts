// Shared showcase data receives each host's public tokens; this directory is not a package
// and must not resolve dependencies through either host's node_modules.
export function createTokenReference({spacing, radius, glyph, motionPreset, typography}: {
 spacing: Readonly<Record<string,number>>; radius: Readonly<Record<string,number>>; glyph: Readonly<Record<string,number>>;
 motionPreset: Readonly<Record<string,{duration:number;easing:string;reducedMotion:string}>>;
 typography: Readonly<Record<string,{fontSize:number;lineHeight:number;fontWeight:string}>>;
}) {
const tokenSections = {
 spacing: { title: "간격", description: "요소 사이의 여백과 내부 여백에 사용하는 값입니다.", values: spacing },
 size: { title: "크기", description: "아이콘·아바타에 사용하는 크기입니다. 모든 버튼의 너비나 높이를 뜻하지 않습니다.", values: glyph },
 radius: { title: "둥글기", description: "모서리 반경입니다. full은 원형·캡슐 모양에 사용합니다.", values: radius },
} as const;

const motionRows = Object.entries(motionPreset).map(([name, value]) => ({ name, value: `${value.duration}ms · ${value.easing} · 효과 줄이기: ${value.reducedMotion}` }));
const typographyRows = Object.entries(typography).map(([name, value]) => ({ name, value: `글자 ${value.fontSize} · 줄 높이 ${value.lineHeight} · 굵기 ${value.fontWeight}` }));

return {tokenSections,motionRows,typographyRows};
}
export type DimensionKind = "spacing" | "size" | "radius";

// Every public foundation belongs to a visible reference section. Keeping this shared
// prevents Web-only documentation from being mistaken for Native coverage again.
export const foundationGroups = {
 spacing: {title:"간격", keys:["spacing"]},
 size: {title:"크기", keys:["glyph","control"]},
 radius: {title:"둥글기", keys:["radius"]},
 motion: {title:"모션", keys:["motion","easing","motionPreset","spring"]},
 typography: {title:"타이포그래피", keys:["fontFamily","fontWeight","letterSpacing","numeric","typography","heading","largeTextThreshold"]},
 layout: {title:"화면 여백과 너비", keys:["layout","breakpoint"]},
 stroke: {title:"테두리", keys:["stroke"]},
 effects: {title:"그림자와 투명도", keys:["shadow","opacity","stateLayer","overlay","backdrop","scrim"]},
 layers: {title:"겹침 순서", keys:["layer"]},
} as const;
export type FoundationGroup = keyof typeof foundationGroups;
export function foundationRows(tokens: Readonly<Record<string,unknown>>, group: FoundationGroup): {name:string;value:string}[] {
 const flatten=(name:string,value:unknown):{name:string;value:string}[] => value !== null && typeof value === "object" && !Array.isArray(value)
  ? Object.entries(value).flatMap(([key,item])=>flatten(`${name}.${key}`,item))
  : [{name,value:Array.isArray(value)?value.join(" · "):String(value)}];
 return foundationGroups[group].keys.flatMap(key=>flatten(key,tokens[key]));
}
