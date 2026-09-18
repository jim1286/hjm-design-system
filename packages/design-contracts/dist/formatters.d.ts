/**
 * 숫자·통화·용량을 화면에 쓰는 형식으로 바꾼다. 컴포넌트가 아니라 **판정 helper**다.
 *
 * 왜 계약에 있나: `Statistic`, `DataTable`, `Slider`의 `valueText`, `Progress`의 발표
 * 문구가 전부 "이 숫자를 어떻게 읽나"를 제품에 떠넘기고 있었다. 각 제품이 `Intl`을 다시
 * 감싸면서 로케일 전달을 빠뜨리거나(브라우저 기본값으로 새어 나감) 통화 소수 자리를
 * 임의로 정했다. 형식 자체는 플랫폼이 이미 알고 있으므로 HJM은 **로케일을 반드시 받게
 * 하는 얇은 층**만 둔다.
 *
 * 문구 조립("3개 중 2개")은 여전히 제품 몫이다 — 어순이 언어마다 다르다.
 */
export type NumberFormatOptions = Readonly<{
    /** 필수다. 생략 가능하게 두면 환경 기본값으로 조용히 새어 나간다. */
    locale: string | readonly string[];
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    /** 1,234 → "1.2천"처럼 짧게. 지원 여부는 플랫폼이 정한다. */
    compact?: boolean;
    signDisplay?: "auto" | "always" | "never";
}>;
export declare function formatNumber(value: number, options: NumberFormatOptions): string;
export type CurrencyFormatOptions = NumberFormatOptions & Readonly<{
    /** ISO 4217 코드. 통화 기호의 자리·소수 자리는 로케일과 코드가 함께 정한다. */
    currency: string;
    /** 기호 대신 코드로 표기. 같은 기호를 쓰는 통화가 섞인 화면에서 쓴다. */
    display?: "symbol" | "code" | "name";
}>;
export declare function formatCurrency(value: number, options: CurrencyFormatOptions): string;
export type PercentFormatOptions = NumberFormatOptions;
/** 0.35 → "35%". 값은 **비율**이지 이미 곱해진 숫자가 아니다. */
export declare function formatPercent(ratio: number, options: PercentFormatOptions): string;
/**
 * 파일 크기. `Intl`에 바이트 단위가 없어 계산은 여기서 하고 **숫자 표기만** 로케일에
 * 맡긴다. 1000 기준(KB)을 쓰는 이유는 OS 파일 관리자와 스토어가 그렇게 보여 주기 때문이다.
 */
export declare function formatBytes(bytes: number, options: NumberFormatOptions): string;
//# sourceMappingURL=formatters.d.ts.map