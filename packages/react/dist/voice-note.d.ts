import type { ReactNode } from "react";
import { type VoiceNoteDescriptor } from "@hjmds/design-contracts/voice-note";
export type VoiceNoteProps = Readonly<{
    descriptor: VoiceNoteDescriptor;
    labels: Readonly<{
        play: string;
        pause: string;
        seek: string;
        loading: string;
        error: string;
        retry: string;
        backward: string;
        forward: string;
    }>;
    /** Localized elapsed/duration text and slider accessible value. */
    formatTime: (seconds: number) => string;
    artwork?: ReactNode;
    onPlayingChange: (playing: boolean) => void;
    onSeek: (seconds: number) => void;
    onRetry?: () => void;
}>;
/** Audio engine, network, file permission and playback lifecycle remain host-owned. */
export declare function VoiceNote({ descriptor, labels, formatTime, artwork, onPlayingChange, onSeek, onRetry }: VoiceNoteProps): import("react").JSX.Element;
//# sourceMappingURL=voice-note.d.ts.map