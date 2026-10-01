import type { ReactNode } from 'react';
import { type CodeBlockDescriptor } from '@hjmds/design-contracts/code-block';
export type CodeBlockProps = CodeBlockDescriptor & Readonly<{
    copyAction?: ReactNode;
}>;
/** Product supplies its clipboard action; importing this view installs no Expo/native clipboard dependency. */
export declare function CodeBlock({ copyAction, ...descriptor }: CodeBlockProps): import("react").JSX.Element;
//# sourceMappingURL=code-block.d.ts.map