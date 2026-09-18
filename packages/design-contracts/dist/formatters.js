function assertLocale(locale) {
    const values = typeof locale === "string" ? [locale] : locale;
    if (values.length === 0 || values.some((value) => typeof value !== "string" || value.trim().length === 0)) {
        throw new TypeError("Formatter locale must be a non-empty BCP 47 tag");
    }
}
function assertFinite(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${field} must be a finite number`);
    }
}
export function formatNumber(value, options) {
    assertFinite(value, "formatNumber value");
    assertLocale(options.locale);
    return new Intl.NumberFormat(options.locale, {
        ...(options.minimumFractionDigits === undefined ? {} : { minimumFractionDigits: options.minimumFractionDigits }),
        ...(options.maximumFractionDigits === undefined ? {} : { maximumFractionDigits: options.maximumFractionDigits }),
        ...(options.compact === true ? { notation: "compact" } : {}),
        ...(options.signDisplay === undefined ? {} : { signDisplay: options.signDisplay }),
    }).format(value);
}
export function formatCurrency(value, options) {
    assertFinite(value, "formatCurrency value");
    assertLocale(options.locale);
    if (typeof options.currency !== "string" || !/^[A-Z]{3}$/u.test(options.currency)) {
        throw new TypeError(`formatCurrency currency must be an ISO 4217 code: ${String(options.currency)}`);
    }
    return new Intl.NumberFormat(options.locale, {
        style: "currency",
        currency: options.currency,
        currencyDisplay: options.display ?? "symbol",
        ...(options.minimumFractionDigits === undefined ? {} : { minimumFractionDigits: options.minimumFractionDigits }),
        ...(options.maximumFractionDigits === undefined ? {} : { maximumFractionDigits: options.maximumFractionDigits }),
        ...(options.compact === true ? { notation: "compact" } : {}),
    }).format(value);
}
/** 0.35 → "35%". 값은 **비율**이지 이미 곱해진 숫자가 아니다. */
export function formatPercent(ratio, options) {
    assertFinite(ratio, "formatPercent ratio");
    assertLocale(options.locale);
    return new Intl.NumberFormat(options.locale, {
        style: "percent",
        ...(options.minimumFractionDigits === undefined ? {} : { minimumFractionDigits: options.minimumFractionDigits }),
        ...(options.maximumFractionDigits === undefined ? {} : { maximumFractionDigits: options.maximumFractionDigits }),
    }).format(ratio);
}
/**
 * 파일 크기. `Intl`에 바이트 단위가 없어 계산은 여기서 하고 **숫자 표기만** 로케일에
 * 맡긴다. 1000 기준(KB)을 쓰는 이유는 OS 파일 관리자와 스토어가 그렇게 보여 주기 때문이다.
 */
export function formatBytes(bytes, options) {
    assertFinite(bytes, "formatBytes bytes");
    if (bytes < 0)
        throw new RangeError("formatBytes bytes must not be negative");
    assertLocale(options.locale);
    const units = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;
    let value = bytes;
    while (value >= 1000 && index < units.length - 1) {
        value /= 1000;
        index += 1;
    }
    const formatted = formatNumber(value, {
        ...options,
        maximumFractionDigits: options.maximumFractionDigits ?? (index === 0 ? 0 : 1),
    });
    return `${formatted} ${units[index]}`;
}
//# sourceMappingURL=formatters.js.map