import { type ComponentProps } from "react";
import type { Animated, GestureResponderHandlers } from "react-native";
/**
 * A Sheet whose body is not itself scrollable lends its pull-to-dismiss scroll wiring to the one scroller nested in
 * its body (an embedded SearchScreen). The sheet then reads that scroller's offset: a scrolled list scrolls back up
 * instead of dragging the sheet, and only a pull that starts at the list's top moves the sheet.
 *
 * 2026-10-30: Spint's city sheet nested SearchScreen's own ScrollView inside a plain Sheet body. The body responder
 * could not see the list offset, so pulling a scrolled list back up moved the list and the sheet together
 * (reproduced on the iOS 27 simulator).
 */
export type SheetBodyScroll = Readonly<{
    /** Spread on the nested `Animated.ScrollView`. */
    scrollProps: Pick<ComponentProps<typeof Animated.ScrollView>, "onLayout" | "onScroll" | "scrollEventThrottle" | "scrollEnabled" | "onScrollBeginDrag" | "onScrollEndDrag">;
    /** Pins the scroller's content to the sheet while an iOS top overscroll moves the sheet. */
    contentStyle: ComponentProps<typeof Animated.View>["style"];
    /** Spread on a View wrapping the scroller: marks its touches and carries Android's pull responder. */
    wrapperProps: GestureResponderHandlers & Readonly<{
        onTouchStart: () => void;
    }>;
}>;
export declare const SheetBodyScrollContext: import("react").Context<Readonly<{
    /** Spread on the nested `Animated.ScrollView`. */
    scrollProps: Pick<ComponentProps<typeof Animated.ScrollView>, "onLayout" | "onScroll" | "scrollEventThrottle" | "scrollEnabled" | "onScrollBeginDrag" | "onScrollEndDrag">;
    /** Pins the scroller's content to the sheet while an iOS top overscroll moves the sheet. */
    contentStyle: ComponentProps<typeof Animated.View>["style"];
    /** Spread on a View wrapping the scroller: marks its touches and carries Android's pull responder. */
    wrapperProps: GestureResponderHandlers & Readonly<{
        onTouchStart: () => void;
    }>;
}> | null>;
export declare function useSheetBodyScroll(): SheetBodyScroll | null;
//# sourceMappingURL=sheet-body-scroll.d.ts.map