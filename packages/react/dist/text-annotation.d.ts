import { type TextAnnotationAction } from '@hjmds/design-contracts/text-annotation';
/** Internal renderer while Native range measurement and the public API are
 * being developed. Kept out of package exports until both paths are reviewable.
 */
export type TextAnnotationProps = Readonly<{
    children: string;
    action?: TextAnnotationAction;
}>;
export declare function TextAnnotation({ children, action }: TextAnnotationProps): import("react").JSX.Element;
//# sourceMappingURL=text-annotation.d.ts.map