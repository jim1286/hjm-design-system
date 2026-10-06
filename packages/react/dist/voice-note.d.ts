import type { ReactNode } from "react";
import { type VoiceNoteDescriptor } from "@hjmds/design-contracts/voice-note";
import type { HjmCompositionStyleProp } from "./composition-style.js";
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
    /** Canonical layout-only placement on the root element. Controlled visual keys are excluded. */
    layoutStyle?: HjmCompositionStyleProp;
}>;
/** Audio engine, network, file permission and playback lifecycle remain host-owned. */
export declare function VoiceNote({ descriptor, labels, formatTime, artwork, onPlayingChange, onSeek, onRetry, layoutStyle }: VoiceNoteProps): import("react").JSX.Element;
//# sourceMappingURL=voice-note.d.ts.map