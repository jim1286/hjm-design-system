import { type MediaPlaybackState } from "@hjmds/design-contracts/media-transport";
export type MediaTransportProps = Readonly<{
    state: MediaPlaybackState;
    onPlay: () => void | Promise<void>;
    onPause: () => void | Promise<void>;
    /** Resolve after the adapter confirms the actual seek; rejecting keeps the observed position. */
    onSeek: (seconds: number) => void | Promise<void>;
    labels: Readonly<{
        play: string;
        pause: string;
        seek: string;
        decrement: string;
        increment: string;
        unknownDuration: string;
        error: string;
    }>;
    formatTime: (seconds: number) => string;
    disabled?: boolean;
    active?: boolean;
}>;
export declare function MediaTransport(props: MediaTransportProps): import("react").JSX.Element;
//# sourceMappingURL=media-transport.d.ts.map