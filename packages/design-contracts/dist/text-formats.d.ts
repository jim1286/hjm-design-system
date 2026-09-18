/**
 * `Text` 하나로는 만들 수 없는 **의미 있는 글자 조각들**이다 — 단축키, 코드, 인용.
 * 도움말·개발자 문서·약관 본문이 반복해서 필요로 하고, 지금까지는 제품이 `<kbd>`에
 * 직접 CSS를 붙여 만들었다.
 *
 * 왜 `Text`의 variant가 아닌가: 이들은 **크기가 아니라 요소**다. `<kbd>`, `<code>`,
 * `<blockquote>`는 각자 의미를 가진 HTML 요소이고 보조기기가 다르게 읽는다. variant로
 * 두면 `<span>`에 코드처럼 보이는 스타일만 입히게 되고, 그 차이가 사라진다.
 */
export type TextFormatKind = "kbd" | "code" | "quote";
export declare const textFormatRecipe: {
    readonly slots: readonly ["root"];
    readonly kbd: {
        readonly fontFamily: readonly ["ui-monospace", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"];
        readonly textVariant: "label";
        readonly paddingHorizontal: 4;
        readonly radius: 8;
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
    };
    readonly code: {
        readonly fontFamily: readonly ["ui-monospace", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"];
        readonly textVariant: "body";
        readonly paddingHorizontal: 4;
        readonly radius: 8;
        readonly background: Readonly<{
            source: "theme";
            key: "surfaceAlt";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "text";
            alpha?: number;
        }>;
    };
    readonly quote: {
        readonly textVariant: "body";
        readonly paddingInlineStart: 16;
        readonly borderWidth: 2;
        readonly border: Readonly<{
            source: "theme";
            key: "border";
            alpha?: number;
        }>;
        readonly color: Readonly<{
            source: "theme";
            key: "textBody";
            alpha?: number;
        }>;
    };
};
export declare const textFormatBehavior: {
    readonly controlled: readonly [];
    readonly inputs: readonly ["kind"];
    readonly configuration: {
        readonly kind: readonly ["kbd", "code", "quote"];
    };
    readonly stateAxes: {};
    readonly web: {
        readonly roles: readonly [];
        readonly keyboard: readonly [];
        readonly focus: "none";
    };
    readonly native: {
        readonly roles: readonly [];
        readonly states: readonly [];
        readonly actions: readonly [];
    };
    readonly scenarios: readonly ["each-kind-emits-its-own-html-element-so-assistive-technology-reads-it-as-what-it-is", "these-are-elements-not-text-sizes-which-is-why-they-are-not-a-text-variant", "a-key-name-is-product-copy-because-the-same-key-is-called-different-things-per-platform"];
};
//# sourceMappingURL=text-formats.d.ts.map