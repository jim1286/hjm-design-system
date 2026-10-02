const dayMs = 86400000;
function dateValue(date) { if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new TypeError('Use an ISO calendar date'); const time = Date.parse(`${date}T00:00:00Z`); if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date)
    throw new RangeError('Invalid calendar date'); return time; }
export function resolveActivityHeatmap(input) {
    const start = dateValue(input.startDate), end = dateValue(input.endDate), count = (end - start) / dayMs + 1;
    // A year-sized overview stays bounded for Native accessibility and layout; paginate longer histories in the product.
    if (count < 1 || count > 366)
        throw new RangeError('Activity overview must span 1–366 days');
    const thresholds = input.thresholds ?? [1, 3, 7];
    if (thresholds.length !== 3 || thresholds.some((n, i) => !Number.isFinite(n) || n <= 0 || (i > 0 && n <= thresholds[i - 1])))
        throw new RangeError('Thresholds must be positive and increasing');
    const first = input.weekStartsOn ?? 1;
    if (first !== 0 && first !== 1)
        throw new RangeError('Week starts on Sunday or Monday');
    const values = new Map();
    for (const day of input.days) {
        const time = dateValue(day.date);
        if (time < start || time > end || values.has(day.date))
            throw new RangeError('Activity dates must be unique and within range');
        if (!Number.isFinite(day.value) || day.value < 0)
            throw new RangeError('Activity values must be finite and nonnegative');
        values.set(day.date, day.value);
    }
    const offset = (new Date(start).getUTCDay() - first + 7) % 7;
    const days = Array.from({ length: count }, (_, index) => { const date = new Date(start + index * dayMs).toISOString().slice(0, 10); const value = values.get(date) ?? null; const level = value === null || value === 0 ? 0 : 1 + thresholds.filter(n => value > n).length; return { date, value, level, row: (index + offset) % 7, column: Math.floor((index + offset) / 7) }; });
    return { days, columns: Math.ceil((count + offset) / 7) };
}
//# sourceMappingURL=activity-heatmap.js.map