import { type ReactNode } from "react";
import { type FollowProfileState, type AttendanceChoice, type EventAttendanceState } from "@hjmds/design-contracts/social-compositions";
type Person = Readonly<{
    id: string;
    name: string;
    avatar?: ReactNode;
    avatarAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
}>;
export type FollowProfileCardProps = Readonly<{
    /** Changing entities remounts the action scope and detaches old responses. */
    profileId: string;
    name: string;
    description?: ReactNode;
    avatar?: ReactNode;
    avatarAction?: Readonly<{
        label: string;
        onPress(): void;
        disabled?: boolean;
    }>;
    state: FollowProfileState;
    locale: string;
    labels: Readonly<{
        follow: string;
        following: string;
        pending: string;
        count: string;
        error: string;
    }>;
    /** Resolve only after the real mutation; update state with the server's confirmed snapshot. */
    onFollowChange: (following: boolean) => void | Promise<void>;
    disabled?: boolean;
}>;
export declare function FollowProfileCard(props: FollowProfileCardProps): import("react").JSX.Element;
export type EventAttendanceCardProps = Readonly<{
    eventId: string;
    title: string;
    description?: ReactNode;
    dateLabel: string;
    state: EventAttendanceState;
    choices: readonly AttendanceChoice[];
    participants: readonly Person[];
    locale: string;
    labels: Readonly<{
        response: string;
        pending: string;
        count: string;
        calendar: string;
        calendarAdded: string;
        error: string;
    }>;
    onResponseChange: (responseId: string) => void | Promise<void>;
    /** Actual calendar adapter, including platform permissions; rejection stays retryable. */
    onAddToCalendar: () => void | Promise<void>;
    disabled?: boolean;
}>;
export declare function EventAttendanceCard(props: EventAttendanceCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=social-compositions.d.ts.map