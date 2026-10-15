import { assertDistinctIds } from "./collection-editing.js";

export type WorkflowField = Readonly<{ id: string; label: string; required?: boolean }>;
export type ImportMapping = Readonly<Record<string, string | null>>;
export function resolveImportMapping(sources: readonly WorkflowField[], targets: readonly WorkflowField[], mapping: ImportMapping) {
  assertDistinctIds(sources); assertDistinctIds(targets);
  const sourceIds = new Set(sources.map(field => field.id)), targetIds = new Set(targets.map(field => field.id));
  if (Object.keys(mapping).some(id => !sourceIds.has(id))) throw new TypeError("Mapping references an unknown source");
  const assigned = new Map<string, string[]>();
  for (const source of sources) {
    const target = mapping[source.id] ?? null;
    if (target === null) continue;
    if (!targetIds.has(target)) throw new TypeError("Mapping references an unknown target");
    assigned.set(target, [...(assigned.get(target) ?? []), source.id]);
  }
  const duplicateTargets = [...assigned].filter(([, ids]) => ids.length > 1).map(([id]) => id);
  const missingTargets = targets.filter(field => field.required && !assigned.has(field.id)).map(field => field.id);
  let skipKey = "__hjm_skip__";
  while (targetIds.has(skipKey)) skipKey += "_";
  return { valid: assigned.size > 0 && !duplicateTargets.length && !missingTargets.length, duplicateTargets, missingTargets, skipKey,
    // Snapshot source ids too: a pending import must not acquire new columns or edits.
    mapping: Object.freeze(Object.fromEntries(sources.map(source => [source.id, mapping[source.id] ?? null]))) as ImportMapping };
}

export type FunnelStage = Readonly<{ id: string; label: string; count: number; reason?: string }>;
export function resolveFunnel(stages: readonly FunnelStage[]) {
  assertDistinctIds(stages);
  return stages.map((stage, index) => {
    const previous = stages[index - 1]?.count, first = stages[0]!.count;
    if (!Number.isSafeInteger(stage.count) || stage.count < 0 || (previous !== undefined && stage.count > previous)) {
      throw new RangeError("Sequential funnel counts must be nonnegative integers that never increase");
    }
    return { ...stage, conversion: first === 0 ? null : stage.count / first,
      previousConversion: previous === undefined || previous === 0 ? null : stage.count / previous,
      lost: previous === undefined ? null : previous - stage.count };
  });
}

export type Cohort = Readonly<{ id: string; label: string; size: number; retained: readonly (number | null)[] }>;
export function resolveCohorts(rows: readonly Cohort[], periodCount: number) {
  assertDistinctIds(rows);
  if (!Number.isSafeInteger(periodCount) || periodCount < 1) throw new RangeError("Cohorts require a positive period count");
  return rows.map(row => {
    if (!Number.isSafeInteger(row.size) || row.size < 0 || row.retained.length > periodCount) throw new RangeError("Invalid cohort denominator or period count");
    const retained = Array.from({ length: periodCount }, (_, index) => row.retained[index] ?? null);
    if (retained.some(value => value !== null && (!Number.isSafeInteger(value) || value < 0 || value > row.size))) {
      throw new RangeError("Retained count must be observed, nonnegative and no larger than cohort size");
    }
    return { ...row, retained, rates: retained.map(count => count === null || row.size === 0 ? null : count / row.size) };
  });
}

export type CorrelationData = Readonly<{ variables: readonly WorkflowField[]; values: readonly (readonly (number | null)[])[] }>;
export function validateCorrelation({ variables, values }: CorrelationData): void {
  assertDistinctIds(variables);
  if (values.length !== variables.length || values.some(row => row.length !== variables.length)) throw new RangeError("Correlation matrix must be square");
  for (let row = 0; row < values.length; row++) for (let column = 0; column < values.length; column++) {
    const value = values[row]![column]!;
    if (value !== null && (!Number.isFinite(value) || value < -1 || value > 1)) throw new RangeError("Correlation must be null or between -1 and 1");
    const mirror = values[column]![row]!;
    if ((value === null) !== (mirror === null) || (value !== null && mirror !== null && Math.abs(value - mirror) > 1e-10)) throw new RangeError("Correlation matrix must be symmetric");
    if (row === column && value !== null && value !== 1) throw new RangeError("Observed self correlation must be one");
  }
}

export function resolveTarget(actual: number, target: number) {
  if (![actual, target].every(value => Number.isFinite(value) && value >= 0)) throw new RangeError("Actual and target must be finite and nonnegative");
  // A zero target has no percentage denominator. Never manufacture 100% completion.
  return { actual, target, difference: actual - target, ratio: target === 0 ? null : actual / target,
    progress: target === 0 ? null : Math.min(1, actual / target) };
}

export type HistogramBin = Readonly<{ id: string; lower: number; upper: number; includesUpper: boolean; count: number }>;
export function binHistogram(samples: readonly (number | null)[], binCount: number, domain?: readonly [number, number]) {
  if (!Number.isSafeInteger(binCount) || binCount < 1 || binCount > 100) throw new RangeError("Histogram bin count must be between 1 and 100");
  const observed = samples.filter((value): value is number => value !== null);
  if (observed.some(value => !Number.isFinite(value))) throw new RangeError("Histogram samples must be finite or null");
  let lower = domain?.[0] ?? (observed.length ? observed.reduce((low, value) => Math.min(low, value), Infinity) : 0);
  let upper = domain?.[1] ?? (observed.length ? observed.reduce((high, value) => Math.max(high, value), -Infinity) : 1);
  if (!domain && upper === lower) { const padding = Math.max(Math.abs(lower) * .01, .5); lower -= padding; upper += padding; }
  if (![lower, upper].every(Number.isFinite) || upper <= lower || !Number.isFinite(upper - lower)) throw new RangeError("Histogram domain must have a positive finite span");
  const width = (upper - lower) / binCount;
  if (width <= 0) throw new RangeError("Histogram bins are below numeric precision");
  const bins = Array.from({ length: binCount }, (_, index) => ({ id: `bin-${index}`, lower: lower + index * width, upper: lower + (index + 1) * width, includesUpper: index === binCount - 1, count: 0 }));
  let underflow = 0, overflow = 0;
  for (const value of observed) {
    if (value < lower) { underflow++; continue; }
    if (value > upper) { overflow++; continue; }
    bins[Math.min(binCount - 1, Math.floor((value - lower) / width))]!.count++;
  }
  return { bins: bins as readonly HistogramBin[], domain: [lower, upper] as const, underflow, overflow,
    observed: observed.length, missing: samples.length - observed.length, maxCount: Math.max(1, ...bins.map(bin => bin.count)) };
}
