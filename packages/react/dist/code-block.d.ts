import type { ReactNode } from 'react';
import { type CodeBlockDescriptor } from '@hjmds/design-contracts/code-block';
import type { HjmCompositionStyleProp } from "./composition-style.js";
export type CodeBlockProps = CodeBlockDescriptor & Readonly<{
    copyAction?: ReactNode;
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Token text is rendered as React text, never executable HTML. */
export declare function CodeBlock({ copyAction, layoutStyle, ...descriptor }: CodeBlockProps): import("react").JSX.Element;
//# sourceMappingURL=code-block.d.ts.map