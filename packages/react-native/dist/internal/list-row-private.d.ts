/**
 * Renderer-private ListRow input. It is not part of the public `ListRowProps`, so products keep
 * using `density`/`selected` and cannot restyle the title. NotificationItem needs a read/unread
 * weight; routing it through the deprecated public `titleStyle` warned in every consuming app
 * (2026-10-06 review), and a new public prop was rejected because no other caller needs the axis.
 */
export type ListRowPrivateProps = Readonly<{
    hjmTitleEmphasis?: "regular" | "strong";
}>;
//# sourceMappingURL=list-row-private.d.ts.map