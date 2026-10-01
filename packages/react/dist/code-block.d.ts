import type { ReactNode } from 'react';
import { type CodeBlockDescriptor } from '@hjmds/design-contracts/code-block';
export type CodeBlockProps = CodeBlockDescriptor & Readonly<{
    copyAction?: ReactNode;
}>;
/** Token text is rendered as React text, never executable HTML. */
export declare function CodeBlock({ copyAction, ...descriptor }: CodeBlockProps): import("react").JSX.Element;
//# sourceMappingURL=code-block.d.ts.map