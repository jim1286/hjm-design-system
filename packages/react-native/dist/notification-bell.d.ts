import { type ReactNode } from "react";
export type NotificationBellProps = Readonly<{
    label: string;
    count: number;
    icon: ReactNode;
    onPress: () => void;
    disabled?: boolean;
    active?: boolean;
}>;
export declare function NotificationBell({ label, count, icon, onPress, disabled, active }: NotificationBellProps): import("react").JSX.Element;
//# sourceMappingURL=notification-bell.d.ts.map