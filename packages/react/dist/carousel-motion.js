import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { validateCarousel } from "@hjmds/design-contracts/components/interaction-adapters";
import { Button } from "./actions.js";
import { useHjmTheme } from "./provider.js";
export function CarouselMotion(props) {
    const index = validateCarousel(props.slides, props.currentKey);
    const { environment } = useHjmTheme();
    // Embla deep-compares options and reInits on change; a live startIndex restarted the engine at the target on
    // every selection, so navigation snapped instead of animating (2026-09-30 review). Only the first index seeds it.
    const [startIndex] = useState(index);
    const [viewport, api] = useEmblaCarousel({ loop: false, direction: environment.direction, startIndex,
        // HJM owns selection; upstream focus scrolling must not independently change slides.
        // Embla's default 25 is a physics duration factor, not an HJM millisecond token.
        watchFocus: false, duration: environment.reducedMotion ? 0 : 25 });
    const latest = useRef(props);
    latest.current = props;
    const syncing = useRef(false);
    useEffect(() => {
        if (!api)
            return;
        const select = () => {
            const current = latest.current;
            const item = current.slides[api.selectedScrollSnap()];
            if (!syncing.current && item && item.id !== current.currentKey)
                current.onCurrentKeyChange(item.id);
        };
        api.on("select", select);
        return () => { api.off("select", select); };
    }, [api]);
    useEffect(() => { syncing.current = true; api?.scrollTo(index, environment.reducedMotion); syncing.current = false; }, [api, index, environment.reducedMotion]);
    return _jsxs("section", { "aria-label": props.label, "aria-roledescription": "carousel", children: [_jsx("div", { ref: viewport, style: { overflow: "hidden" }, children: _jsx("div", { style: { display: "flex", touchAction: "pan-y pinch-zoom" }, children: props.slides.map((slide, i) => _jsx("div", { role: "group", "aria-roledescription": "slide", "aria-label": slide.label, "aria-hidden": i !== index, inert: i !== index, style: { flex: "0 0 100%", minWidth: 0 }, children: props.renderSlide(slide) }, slide.id)) }) }), _jsx(Button, { tone: "ghost", disabled: index === 0, onClick: () => props.onCurrentKeyChange(props.slides[index - 1].id), children: props.previousLabel }), _jsx(Button, { tone: "ghost", disabled: index === props.slides.length - 1, onClick: () => props.onCurrentKeyChange(props.slides[index + 1].id), children: props.nextLabel })] });
}
//# sourceMappingURL=carousel-motion.js.map