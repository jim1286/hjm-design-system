/** Product-confirmed counts. No network, authentication or persistence lives here. */
export type FollowProfileState = Readonly<{
    following: boolean;
    count: number;
}>;
export type AttendanceChoice = Readonly<{
    id: string;
    label: string;
    attending: boolean;
    disabled?: boolean;
}>;
export type EventAttendanceState = Readonly<{
    responseId: string | null;
    count: number;
}>;
export declare function resolveFollowProposal(state: FollowProfileState, following: boolean): FollowProfileState;
export declare function resolveAttendanceChoice(choices: readonly AttendanceChoice[], id: string | null): AttendanceChoice | undefined;
export declare function resolveAttendanceProposal(state: EventAttendanceState, choices: readonly AttendanceChoice[], responseId: string | null): EventAttendanceState;
//# sourceMappingURL=social-compositions.d.ts.map