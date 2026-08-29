import { type UploadItemDescriptor, type UploadItemLabels } from "@hjmds/design-contracts/components/upload-item";
import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
export type UploadItemProps = Readonly<{
    descriptor: UploadItemDescriptor;
    labels: UploadItemLabels;
    onCancel?: (id: string) => void;
    onRetry?: (id: string) => void;
    leading?: ReactNode;
    style?: StyleProp<ViewStyle>;
}>;
export declare function UploadItem({ descriptor, labels, onCancel, onRetry, leading, style }: UploadItemProps): import("react").JSX.Element;
//# sourceMappingURL=upload-item.d.ts.map