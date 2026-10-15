export type ComposerLengthFeedback = Readonly<{ label: string; formatCount: (used: number, max: number) => string; threshold?: number }>;
/** Match the controlled text/maxLength UTF-16 unit; do not silently trim a user's draft. */
export function resolveComposerLimit(value: string, max: number, threshold = .8) {
 if(!Number.isSafeInteger(max)||max<=0||!Number.isFinite(threshold)||threshold<0||threshold>1)throw new RangeError("Composer limit must be positive and threshold in [0,1]");
 return { used:value.length,max,near:value.length/max>=threshold,exceeded:value.length>max };
}
export type ReplyTarget = Readonly<{ id: string; author: string; excerpt: string }>;
export function validateReplyTarget(target: ReplyTarget|null):void {
 if(target!==null&&!target.id.trim())throw new TypeError("Reply target requires the actual message ID");
}
export type SearchResponse<T> = Readonly<{ result: T; suggestions: readonly Readonly<{query: string;match?:Readonly<{start:number;end:number}>}>[] }>;
