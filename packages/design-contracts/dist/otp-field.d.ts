/**
 * Numeric-only, matching the domain the brief describes (인증번호). An
 * alphanumeric OTP is out of scope until a real product needs one — adding
 * a configurable character set now would mean guessing at a pattern nobody
 * has validated. See docs/otp-field.md.
 */
export type OtpFieldDescriptor = Readonly<{
    /** Number of visible slots. At least two — a single slot is not the multi-slot problem this component solves (Steps applies the same floor to its own step count for the same reason). */
    length: number;
    /** The one logical value, always dense — index i is filled iff i < value.length. Never sparse; see docs/otp-field.md. */
    value: string;
}>;
export declare function validateOtpFieldDescriptor(descriptor: OtpFieldDescriptor): void;
/** One entry per slot: the digit at that position, or "" for an unfilled slot. Always dense — no gaps. */
export declare function getOtpFieldSlotValues(descriptor: OtpFieldDescriptor): readonly string[];
export type ResolvedOtpFieldDescriptor = OtpFieldDescriptor & Readonly<{
    slots: readonly string[];
    complete: boolean;
}>;
export declare function resolveOtpFieldDescriptor(descriptor: OtpFieldDescriptor): ResolvedOtpFieldDescriptor;
/**
 * The single hard accessibility judgment this contract makes: OtpField is
 * ONE focusable, one accessible-name-and-value text control, not N separate
 * focusable slots. N separate real inputs is the well-documented
 * accessibility anti-pattern the brief names directly — a screen reader
 * announcing "slot 3 of 6" tells the user nothing about what they are
 * entering. The N visible boxes are a decorative rendering of one control's
 * characters (`getOtpFieldSlotValues`), the same way a styled `<input>` with
 * letter-spacing can look segmented while remaining one field. See
 * docs/otp-field.md.
 *
 * Because there is one real control, typing, backspacing, and pasting
 * (anywhere, including mid-string) are the platform's own native text
 * editing — insertion, deletion, and paste-over-a-selection are not
 * reimplemented here. The only judgment HJM owns is what happens to the
 * resulting raw string: keep digits only, never exceed `length`. This is
 * intentionally the one function this module needs for every edit path.
 */
export declare function resolveOtpFieldValue(length: number, rawText: string): string;
export type OtpFieldSize = "medium" | "large";
/**
 * The `slot` boxes reuse Field's own border/focus/invalid colors
 * (`fieldFrameContract`) instead of inventing a new palette — each is a
 * small Field-frame look-alike, not a new visual language.
 */
export declare const otpFieldRecipe: {
    readonly slots: readonly ["root", "input", "slot", "description", "error"];
    readonly defaults: {
        readonly size: "medium";
    };
    readonly support: {
        readonly label: {
            readonly color: Readonly<{
                source: "theme";
                key: "textBody";
                alpha?: number;
            }>;
            readonly textVariant: "body";
            readonly fontWeight: "600";
        };
        readonly hint: {
            readonly color: Readonly<{
                source: "theme";
                key: "textMuted";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly error: {
            readonly color: Readonly<{
                source: "theme";
                key: "danger";
                alpha?: number;
            }>;
            readonly textVariant: "label";
        };
        readonly gap: 8;
    };
    readonly sizes: {
        readonly medium: {
            readonly slotSize: 44;
            readonly gap: 8;
            readonly textVariant: "title";
        };
        readonly large: {
            readonly slotSize: 52;
            readonly gap: 12;
            readonly textVariant: "titleLarge";
        };
    };
    readonly slot: {
        readonly border: Readonly<{
            source: "theme";
            key: "textMuted";
            alpha?: number;
        }>;
        readonly focusBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly invalidBorder: Readonly<{
            source: "theme";
            key: "danger";
            alpha?: number;
        }>;
        readonly filledBorder: Readonly<{
            source: "theme";
            key: "contentBrand";
            alpha?: number;
        }>;
        readonly radius: "md";
        readonly borderWidth: 1;
        readonly content: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    readonly states: {
        readonly focus: {
            readonly color: Readonly<{
                source: "theme";
                key: "contentBrand";
                alpha?: number;
            }>;
            readonly width: 2;
            readonly offset: 2;
        };
        readonly disabledOpacity: 0.5;
    };
};
export declare const otpFieldBehavior: {
    readonly controlled: readonly ["value", "defaultValue", "onValueChange"];
    readonly stateAxes: {
        readonly availability: readonly ["enabled", "disabled", "readOnly", "busy"];
        readonly value: readonly ["empty", "filled"];
        readonly validation: readonly ["valid", "invalid"];
    };
    readonly web: {
        readonly roles: readonly ["textbox"];
        readonly keyboard: readonly ["Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
        readonly focus: "native";
    };
    readonly native: {
        readonly roles: readonly ["text"];
        readonly states: readonly ["disabled", "busy"];
        readonly actions: readonly ["focus", "setText"];
    };
    readonly scenarios: readonly ["one-accessible-name-and-value-for-the-whole-field-never-per-slot-announcement", "one-tab-stop-native-text-editing-owns-typing-backspacing-and-paste", "paste-anywhere-in-the-value-is-sanitized-to-digits-and-clamped-to-length", "non-digit-characters-are-stripped-not-rejected-outright", "resolveOtpFieldValue-truncates-typed-or-pasted-overflow-instead-of-throwing", "a-too-long-committed-descriptor-still-throws-as-malformed-state", "alphanumeric-otp-is-out-of-scope-until-a-real-product-need-exists"];
};
//# sourceMappingURL=otp-field.d.ts.map